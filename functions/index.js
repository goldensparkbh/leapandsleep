const { createHash, randomUUID } = require('crypto');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { logger } = require('firebase-functions');
const { setGlobalOptions } = require('firebase-functions/v2');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { HttpsError, onCall } = require('firebase-functions/v2/https');
const { GoogleGenAI } = require('@google/genai');

admin.initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const db = admin.firestore();

const POST_BLUEPRINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'slug',
    'summary',
    'seoTitle',
    'metaDescription',
    'tags',
    'featuredImagePrompt',
    'introParagraphs',
    'sections',
    'conclusionParagraphs',
    'inlineImages',
    'youtubeSuggestions',
    'affiliateSuggestions',
    'faqs',
  ],
  properties: {
    title: { type: 'string' },
    slug: { type: 'string' },
    summary: { type: 'string' },
    seoTitle: { type: 'string' },
    metaDescription: { type: 'string' },
    tags: {
      type: 'array',
      minItems: 4,
      maxItems: 10,
      items: { type: 'string' },
    },
    featuredImagePrompt: { type: 'string' },
    introParagraphs: {
      type: 'array',
      minItems: 2,
      maxItems: 3,
      items: { type: 'string' },
    },
    sections: {
      type: 'array',
      minItems: 4,
      maxItems: 7,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['heading', 'paragraphs', 'bulletPoints', 'numberedPoints', 'quote'],
        properties: {
          heading: { type: 'string' },
          paragraphs: {
            type: 'array',
            minItems: 2,
            maxItems: 4,
            items: { type: 'string' },
          },
          bulletPoints: {
            type: 'array',
            maxItems: 6,
            items: { type: 'string' },
          },
          numberedPoints: {
            type: 'array',
            maxItems: 6,
            items: { type: 'string' },
          },
          quote: { type: 'string' },
        },
      },
    },
    conclusionParagraphs: {
      type: 'array',
      minItems: 1,
      maxItems: 2,
      items: { type: 'string' },
    },
    inlineImages: {
      type: 'array',
      maxItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['placementHeading', 'prompt', 'alt', 'caption'],
        properties: {
          placementHeading: { type: 'string' },
          prompt: { type: 'string' },
          alt: { type: 'string' },
          caption: { type: 'string' },
        },
      },
    },
    youtubeSuggestions: {
      type: 'array',
      maxItems: 2,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['placementHeading', 'title', 'query', 'reason'],
        properties: {
          placementHeading: { type: 'string' },
          title: { type: 'string' },
          query: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    affiliateSuggestions: {
      type: 'array',
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['placementHeading', 'name', 'anchorText', 'reason'],
        properties: {
          placementHeading: { type: 'string' },
          name: { type: 'string' },
          anchorText: { type: 'string' },
          reason: { type: 'string' },
        },
      },
    },
    faqs: {
      type: 'array',
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'answer'],
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
      },
    },
  },
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new HttpsError(
      'failed-precondition',
      'Missing GEMINI_API_KEY in functions environment.'
    );
  }

  return new GoogleGenAI({ apiKey });
}

function getErrorMessage(error) {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message) return error.message;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function mapGeminiError(error, fallbackMessage) {
  const message = getErrorMessage(error);
  const lowerMessage = message.toLowerCase();
  const status = Number(error && error.status ? error.status : 0);

  if (lowerMessage.includes('reported as leaked')) {
    return new HttpsError(
      'failed-precondition',
      'Gemini API key is blocked as leaked. Create a new Gemini key, update functions/.env, and redeploy Functions.'
    );
  }

  if (lowerMessage.includes('tool use with a response mime type')) {
    return new HttpsError(
      'failed-precondition',
      'The selected Gemini model rejected the current search-plus-JSON request format.'
    );
  }

  if (status === 401 || status === 403) {
    return new HttpsError(
      'permission-denied',
      fallbackMessage || 'Gemini rejected the request.'
    );
  }

  if (status === 400) {
    return new HttpsError(
      'failed-precondition',
      fallbackMessage || 'Gemini rejected the request configuration.'
    );
  }

  return new HttpsError('internal', fallbackMessage || 'Gemini request failed.');
}

function getConfiguredImageModel() {
  return String(process.env.GEMINI_IMAGE_MODEL || 'imagen-4.0-generate-001').trim();
}

function isGeminiNativeImageModel(model) {
  return model.startsWith('gemini-');
}

function getImageFileExtension(mimeType) {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/webp':
      return 'webp';
    case 'image/png':
    default:
      return 'png';
  }
}

function extractInlineImagePart(response) {
  const candidates = Array.isArray(response && response.candidates) ? response.candidates : [];

  for (const candidate of candidates) {
    const parts =
      candidate &&
      candidate.content &&
      Array.isArray(candidate.content.parts)
        ? candidate.content.parts
        : [];

    for (const part of parts) {
      if (part && part.inlineData && part.inlineData.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    }
  }

  return null;
}

function getImageGenerationWarning(kind, error) {
  const message = getErrorMessage(error).toLowerCase();
  const imageModel = getConfiguredImageModel();
  const label = kind === 'inline' ? 'Inline image' : 'Featured image';

  if (message.includes('only available on paid plans')) {
    return `${label} could not be generated because ${imageModel} requires a paid Google AI plan. Upgrade the plan or switch GEMINI_IMAGE_MODEL to a supported image model.`;
  }

  if (
    message.includes('quota exceeded') &&
    (message.includes('free_tier') || message.includes('limit: 0'))
  ) {
    return `${label} could not be generated because this project is still on Gemini API free-tier quota for ${imageModel}. A linked billing account is not enough by itself; the project must be upgraded to the Gemini API paid tier in AI Studio.`;
  }

  if (message.includes('reported as leaked')) {
    return `${label} could not be generated because the Gemini API key is blocked. Update GEMINI_API_KEY and redeploy Functions.`;
  }

  return kind === 'inline'
    ? 'Inline image generation failed. The draft was created without the inline image.'
    : 'Featured image generation failed. Review the post image before publishing.';
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeName(value) {
  return slugify(value).replace(/-/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function normalizeCommentText(value, maxLength = 4000) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .trim()
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, maxLength);
}

function normalizeOptionalText(value, maxLength = 5000) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeUrlPath(value) {
  const trimmedValue = normalizeOptionalText(value, 2000);
  if (!trimmedValue) return '';

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return trimmedValue.startsWith('/') ? trimmedValue : `/${trimmedValue}`;
}

function normalizeSiteUrl(value) {
  const fallbackProject = process.env.GCLOUD_PROJECT || 'leapandsleep0';
  const trimmedValue = normalizeOptionalText(value, 2000);
  const baseValue = trimmedValue || `https://${fallbackProject}.web.app`;

  if (/^https?:\/\//i.test(baseValue)) {
    return baseValue.replace(/\/+$/, '');
  }

  return `https://${baseValue.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

function normalizeIpAddress(value) {
  const trimmedValue = String(value || '').trim();
  if (!trimmedValue) return '';

  const firstHop = trimmedValue.split(',')[0].trim();
  return firstHop.startsWith('::ffff:') ? firstHop.slice(7) : firstHop;
}

function getClientIpAddress(rawRequest) {
  const forwardedHeader = rawRequest && rawRequest.headers
    ? rawRequest.headers['x-forwarded-for']
    : '';
  const forwardedValue = Array.isArray(forwardedHeader)
    ? forwardedHeader[0]
    : forwardedHeader;

  return (
    normalizeIpAddress(forwardedValue) ||
    normalizeIpAddress(rawRequest && rawRequest.ip) ||
    normalizeIpAddress(rawRequest && rawRequest.socket && rawRequest.socket.remoteAddress) ||
    'unknown'
  );
}

function hashIpAddress(ipAddress) {
  return createHash('sha256').update(String(ipAddress || 'unknown')).digest('hex');
}

function toDate(value) {
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }

  return value instanceof Date ? value : null;
}

function buildAbsoluteUrl(siteUrl, pathOrUrl) {
  const normalizedPath = normalizeUrlPath(pathOrUrl);
  if (!normalizedPath) return '';
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  return `${normalizedSiteUrl}${normalizedPath}`;
}

function renderEmailBrandMarkup(logoUrl, siteName, width) {
  if (logoUrl) {
    return `<img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(siteName)}" width="${width}" style="display:block;width:${width}px;max-width:100%;height:auto;margin:0 auto;" />`;
  }

  return `<div style="font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:#0B0D10;text-align:center;">${escapeHtml(siteName)}</div>`;
}

function renderEmailShell({
  siteSettings,
  title,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  previewText,
  unsubscribeUrl,
  footerNote,
  heroImageUrl,
}) {
  const siteName = normalizeOptionalText(siteSettings.siteName, 120) || 'LeapAndSleep';
  const siteUrl = normalizeSiteUrl(siteSettings.siteUrl);
  const logoUrl = buildAbsoluteUrl(siteUrl, siteSettings.logo || siteSettings.favicon);
  const accentColor = normalizeOptionalText(siteSettings.accentColor, 40) || '#B8B1F5';
  const primaryColor = normalizeOptionalText(siteSettings.primaryColor, 40) || '#0B0D10';
  const tagline =
    normalizeOptionalText(siteSettings.tagline, 180) || 'Take the leap. Earn while you sleep.';
  const footerText = normalizeOptionalText(siteSettings.footerContent, 280) || tagline;
  const safeFooterNote = normalizeOptionalText(footerNote, 320);
  const safeTitle = escapeHtml(title);
  const safePreviewText = escapeHtml(previewText || safeTitle);
  const safeCtaLabel = escapeHtml(ctaLabel || 'Read more');
  const safeCtaUrl = buildAbsoluteUrl(siteUrl, ctaUrl);
  const safeUnsubscribeUrl = buildAbsoluteUrl(siteUrl, unsubscribeUrl);
  const safeHeroImageUrl = buildAbsoluteUrl(siteUrl, heroImageUrl);

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#F6F7F9;color:#0B0D10;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreviewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F6F7F9;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;">
            <tr>
              <td style="padding-bottom:24px;text-align:center;">
                <a href="${escapeHtml(siteUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                  ${renderEmailBrandMarkup(logoUrl, siteName, 176)}
                </a>
              </td>
            </tr>
            <tr>
              <td style="background:#FFFFFF;border:1px solid rgba(11,13,16,0.08);border-radius:28px;padding:32px;box-shadow:0 8px 30px rgba(11,13,16,0.04);">
                ${safeHeroImageUrl ? `<img src="${escapeHtml(safeHeroImageUrl)}" alt="${safeTitle}" style="display:block;width:100%;height:auto;border-radius:20px;margin:0 0 24px;" />` : ''}
                <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${escapeHtml(accentColor)};">${escapeHtml(tagline)}</p>
                <h1 style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:32px;line-height:1.2;color:${escapeHtml(primaryColor)};">${safeTitle}</h1>
                <div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.7;color:#3D434B;">
                  ${bodyHtml}
                </div>
                ${
                  safeCtaUrl
                    ? `<div style="margin-top:28px;">
                        <a href="${escapeHtml(safeCtaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:${escapeHtml(primaryColor)};color:#FFFFFF;text-decoration:none;padding:14px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;">${safeCtaLabel}</a>
                      </div>`
                    : ''
                }
              </td>
            </tr>
            <tr>
              <td style="padding:24px 16px 0;text-align:center;">
                <div style="margin:0 auto 12px;max-width:480px;">
                  <a href="${escapeHtml(siteUrl)}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;">
                    ${renderEmailBrandMarkup(logoUrl, siteName, 88)}
                  </a>
                </div>
                <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#6D727A;">${escapeHtml(footerText)}</p>
                ${
                  safeFooterNote
                    ? `<p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#6D727A;">${escapeHtml(safeFooterNote)}</p>`
                    : ''
                }
                ${
                  safeUnsubscribeUrl
                    ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#6D727A;">
                        <a href="${escapeHtml(safeUnsubscribeUrl)}" target="_blank" rel="noopener noreferrer" style="color:${escapeHtml(primaryColor)};">Unsubscribe</a>
                      </p>`
                    : ''
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function loadSiteSettings() {
  const snapshot = await db.collection('settings').doc('site').get();
  const data = snapshot.data() || {};

  return {
    siteName: normalizeOptionalText(data.siteName, 120) || 'LeapAndSleep',
    siteUrl: normalizeSiteUrl(data.siteUrl),
    tagline:
      normalizeOptionalText(data.tagline, 180) || 'Take the leap. Earn while you sleep.',
    logo: normalizeOptionalText(data.logo, 500),
    favicon: normalizeOptionalText(data.favicon, 500),
    primaryColor: normalizeOptionalText(data.primaryColor, 40) || '#0B0D10',
    accentColor: normalizeOptionalText(data.accentColor, 40) || '#B8B1F5',
    footerContent:
      normalizeOptionalText(data.footerContent, 280) ||
      'Take the leap. Earn while you sleep.',
  };
}

async function loadEmailSettings() {
  const snapshot = await db.collection('settings').doc('email').get();
  const data = snapshot.data() || {};

  return {
    fromName: normalizeOptionalText(data.fromName, 120),
    fromEmail: normalizeOptionalText(data.fromEmail, 240),
    replyTo: normalizeOptionalText(data.replyTo, 240),
    smtpHost: normalizeOptionalText(data.smtpHost, 240),
    smtpPort:
      typeof data.smtpPort === 'number' && Number.isFinite(data.smtpPort)
        ? data.smtpPort
        : 587,
    smtpUsername: normalizeOptionalText(data.smtpUsername, 240),
    smtpPassword: normalizeOptionalText(data.smtpPassword, 500),
    smtpSecure: Boolean(data.smtpSecure),
    welcomeSubject: normalizeOptionalText(data.welcomeSubject, 240),
    newPostSubjectTemplate: normalizeOptionalText(data.newPostSubjectTemplate, 240),
  };
}

function hasSmtpSettings(emailSettings) {
  return Boolean(
    emailSettings.smtpHost &&
      emailSettings.smtpPort &&
      emailSettings.smtpUsername &&
      emailSettings.smtpPassword &&
      emailSettings.fromEmail
  );
}

function createSmtpTransport(emailSettings) {
  return nodemailer.createTransport({
    host: emailSettings.smtpHost,
    port: emailSettings.smtpPort,
    secure: Boolean(emailSettings.smtpSecure),
    auth: {
      user: emailSettings.smtpUsername,
      pass: emailSettings.smtpPassword,
    },
  });
}

function buildSubjectFromTemplate(template, replacements) {
  const safeTemplate = normalizeOptionalText(template, 240);
  if (!safeTemplate) {
    return `New on ${replacements.siteName}: ${replacements.postTitle}`;
  }

  return safeTemplate.replace(/\{(siteName|postTitle)\}/g, (match, token) => {
    const replacement = replacements[token];
    return replacement ? String(replacement) : match;
  });
}

async function sendSmtpMail(transport, emailSettings, payload) {
  return transport.sendMail({
    from: `"${emailSettings.fromName || 'LeapAndSleep'}" <${emailSettings.fromEmail}>`,
    to: payload.to,
    replyTo: emailSettings.replyTo || undefined,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

async function sendWelcomeEmail(transport, subscriber, siteSettings, emailSettings) {
  const unsubscribeUrl = `/unsubscribe?token=${encodeURIComponent(
    subscriber.unsubscribeToken
  )}`;
  const ctaUrl = '/blog';
  const title = `You're subscribed to ${siteSettings.siteName}`;
  const bodyHtml = [
    `<p style="margin:0 0 16px;">Thanks for subscribing. You'll now get new posts, practical guides, and tool recommendations from ${escapeHtml(siteSettings.siteName)}.</p>`,
    `<p style="margin:0;">You can unsubscribe at any time using the link in the footer of every email.</p>`,
  ].join('');
  const html = renderEmailShell({
    siteSettings,
    title,
    bodyHtml,
    ctaLabel: 'Read the latest posts',
    ctaUrl,
    previewText: `Welcome to ${siteSettings.siteName}`,
    unsubscribeUrl,
    footerNote: 'You received this because you subscribed on the website.',
  });

  await sendSmtpMail(transport, emailSettings, {
    to: subscriber.email,
    subject: emailSettings.welcomeSubject || `Welcome to ${siteSettings.siteName}`,
    text: `Thanks for subscribing to ${siteSettings.siteName}. Read the latest posts here: ${buildAbsoluteUrl(
      siteSettings.siteUrl,
      ctaUrl
    )}\n\nUnsubscribe: ${buildAbsoluteUrl(siteSettings.siteUrl, unsubscribeUrl)}`,
    html,
  });
}

async function sendNewPostEmail(transport, subscriber, post, siteSettings, emailSettings) {
  const postUrl = `/blog/${post.slug}`;
  const unsubscribeUrl = `/unsubscribe?token=${encodeURIComponent(
    subscriber.unsubscribeToken
  )}`;
  const subject = buildSubjectFromTemplate(emailSettings.newPostSubjectTemplate, {
    siteName: siteSettings.siteName,
    postTitle: post.title,
  });
  const summary =
    normalizeOptionalText(post.summary, 600) ||
    'A new article is live now. Read the full post on the site.';
  const bodyHtml = [
    `<p style="margin:0 0 16px;">A new post just went live on ${escapeHtml(siteSettings.siteName)}.</p>`,
    `<p style="margin:0 0 16px;">${escapeHtml(summary)}</p>`,
    `<p style="margin:0;">Open the full article for the complete guide.</p>`,
  ].join('');
  const html = renderEmailShell({
    siteSettings,
    title: post.title,
    bodyHtml,
    ctaLabel: 'Read the full post',
    ctaUrl: postUrl,
    previewText: post.summary || post.title,
    unsubscribeUrl,
    footerNote: 'You are receiving this because you are subscribed to new posts.',
    heroImageUrl: post.featuredImage || '',
  });

  await sendSmtpMail(transport, emailSettings, {
    to: subscriber.email,
    subject,
    text: `${post.title}\n\n${summary}\n\nRead now: ${buildAbsoluteUrl(
      siteSettings.siteUrl,
      postUrl
    )}\n\nUnsubscribe: ${buildAbsoluteUrl(siteSettings.siteUrl, unsubscribeUrl)}`,
    html,
  });
}

function renderParagraphs(paragraphs) {
  return (paragraphs || [])
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('\n');
}

function renderList(items, ordered = false) {
  const safeItems = (items || []).filter(Boolean);
  if (safeItems.length === 0) return '';

  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${safeItems
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</${tag}>`;
}

function buildYoutubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function buildResearchPrompt(title, section) {
  return [
    'Research the article topic and return concise editorial notes.',
    'Focus on evergreen, factual guidance and avoid speculation.',
    'Do not produce the final article yet.',
    'Return short bullet points covering:',
    '- what the topic means',
    '- key beginner mistakes',
    '- practical steps',
    '- important tool/product considerations',
    '- caveats or fact-check items',
    '',
    `Title: ${title}`,
    `Section: ${section}`,
  ].join('\n');
}

function buildDraftPrompt(title, section, affiliateContext, researchNotes) {
  return [
    'Create a comprehensive affiliate-ready blog post draft from the supplied title.',
    'Use the research notes when they are provided.',
    'Only suggest affiliate links for names that appear in the existing affiliate-links list.',
    'If a useful tool is missing from the list, include it in affiliateSuggestions without inventing a URL.',
    'For YouTube, provide search queries instead of fabricated video URLs.',
    'Write in a practical editorial tone and avoid fabricated claims, stats, case studies, or quotes.',
    '',
    `Title: ${title}`,
    `Section: ${section}`,
    '',
    'Existing affiliate links:',
    JSON.stringify(affiliateContext, null, 2),
    '',
    'Research notes:',
    researchNotes || 'No grounded research notes were available. Keep the article evergreen and avoid unverifiable claims.',
  ].join('\n');
}

function getBucketName() {
  return (
    process.env.APP_STORAGE_BUCKET ||
    process.env.STORAGE_BUCKET ||
    (process.env.GCLOUD_PROJECT ? `${process.env.GCLOUD_PROJECT}.appspot.com` : '')
  );
}

function getStorageBucket() {
  const bucketName = getBucketName();
  if (!bucketName) {
    throw new HttpsError(
      'failed-precondition',
      'Missing Firebase Storage bucket configuration for AI image generation.'
    );
  }

  return admin.storage().bucket(bucketName);
}

function buildStorageDownloadUrl(bucketName, path, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(
    path
  )}?alt=media&token=${token}`;
}

async function loadAffiliateLinks() {
  const snapshot = await db.collection('affiliateLinks').get();
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data() || {};
    return {
      id: docSnapshot.id,
      name: data.name || '',
      destinationUrl: data.destinationUrl || '',
      campaignLabel: data.campaignLabel || '',
      notes: data.notes || '',
      isActive: Boolean(data.isActive),
      clickCount: Number(data.clickCount || 0),
    };
  });
}

async function getRecentCommentByIpHash(ipHash) {
  const snapshot = await db
    .collection('commentModeration')
    .where('guestIpHash', '==', ipHash)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  return snapshot.empty ? null : snapshot.docs[0].data();
}

function findMatchingAffiliateLink(affiliateLinks, suggestionName) {
  const normalizedSuggestion = normalizeName(suggestionName);
  return (
    affiliateLinks.find((link) => normalizeName(link.name) === normalizedSuggestion) ||
    affiliateLinks.find((link) => normalizedSuggestion.includes(normalizeName(link.name))) ||
    affiliateLinks.find((link) => normalizeName(link.name).includes(normalizedSuggestion)) ||
    null
  );
}

async function ensureAffiliateLinkSuggestion(affiliateLinks, suggestion, postTitle) {
  const existing = findMatchingAffiliateLink(affiliateLinks, suggestion.name);
  if (existing) {
    return { ...existing, wasCreated: false };
  }

  const docRef = await db.collection('affiliateLinks').add({
    name: suggestion.name,
    destinationUrl: '',
    cloakedPath: '',
    campaignLabel: 'ai-draft',
    notes: `AI suggested this link for "${postTitle}". Add the real affiliate destination before activating. Suggested anchor: ${suggestion.anchorText}. Reason: ${suggestion.reason}`,
    isActive: false,
    clickCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    id: docRef.id,
    name: suggestion.name,
    destinationUrl: '',
    campaignLabel: 'ai-draft',
    notes: `AI suggested this link for "${postTitle}".`,
    isActive: false,
    clickCount: 0,
    wasCreated: true,
  };
}

async function generateImageAsset(gemini, prompt, slug, prefix) {
  if (!prompt) return null;

  const bucket = getStorageBucket();
  const imageModel = getConfiguredImageModel();
  let imageData = null;
  let mimeType = 'image/png';

  if (isGeminiNativeImageModel(imageModel)) {
    const imageResponse = await gemini.models.generateContent({
      model: imageModel,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    const inlineImage = extractInlineImagePart(imageResponse);
    if (!inlineImage) {
      return null;
    }

    imageData = inlineImage.data;
    mimeType = inlineImage.mimeType;
  } else {
    const imageResponse = await gemini.models.generateImages({
      model: imageModel,
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        includeRaiReason: true,
      },
    });

    imageData =
      imageResponse.generatedImages &&
      imageResponse.generatedImages[0] &&
      imageResponse.generatedImages[0].image &&
      imageResponse.generatedImages[0].image.imageBytes;
  }

  if (!imageData) {
    return null;
  }

  const fileExtension = getImageFileExtension(mimeType);
  const buffer = Buffer.from(imageData, 'base64');
  const token = randomUUID();
  const storagePath = `public/posts/ai/${slug}/${prefix}-${Date.now()}.${fileExtension}`;

  await bucket.file(storagePath).save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  });

  return {
    path: storagePath,
    url: buildStorageDownloadUrl(bucket.name, storagePath, token),
  };
}

function buildAffiliateCardHtml(link, suggestion) {
  const safeTitle = escapeHtml(suggestion.name);
  const safeAnchor = escapeHtml(suggestion.anchorText || `Explore ${suggestion.name}`);
  const safeReason = escapeHtml(suggestion.reason);

  if (link.destinationUrl) {
    return `
      <div class="affiliate-card">
        <p class="affiliate-card__eyebrow">Recommended tool</p>
        <p class="affiliate-card__title">${safeTitle}</p>
        <p class="affiliate-card__body">${safeReason}</p>
        <p><a href="${escapeHtml(link.destinationUrl)}" target="_blank" rel="noopener noreferrer nofollow sponsored">${safeAnchor}</a></p>
      </div>
    `;
  }

  return `
    <div class="affiliate-card affiliate-card--pending">
      <p class="affiliate-card__eyebrow">Affiliate slot suggested</p>
      <p class="affiliate-card__title">${safeTitle}</p>
      <p class="affiliate-card__body">A matching affiliate URL was not available yet. Review this suggestion in the affiliate links admin section before publishing.</p>
    </div>
  `;
}

function buildYoutubeCardHtml(suggestion) {
  const title = escapeHtml(suggestion.title);
  const reason = escapeHtml(suggestion.reason);
  const url = buildYoutubeSearchUrl(suggestion.query);

  return `
    <div class="video-suggestion-card">
      <p class="video-suggestion-card__eyebrow">Suggested YouTube follow-up</p>
      <p class="video-suggestion-card__title">${title}</p>
      <p class="video-suggestion-card__body">${reason}</p>
      <p><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Search on YouTube</a></p>
    </div>
  `;
}

function buildInlineImageHtml(image) {
  if (!image || !image.url) return '';

  return `
    <figure>
      <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt)}" />
      <figcaption>${escapeHtml(image.caption)}</figcaption>
    </figure>
  `;
}

function buildFaqHtml(faqs) {
  const safeFaqs = (faqs || []).filter((faq) => faq.question && faq.answer);
  if (safeFaqs.length === 0) return '';

  return `
    <h2>Frequently asked questions</h2>
    ${safeFaqs
      .map(
        (faq) => `
          <h3>${escapeHtml(faq.question)}</h3>
          <p>${escapeHtml(faq.answer)}</p>
        `
      )
      .join('\n')}
  `;
}

async function generateResearchNotes(gemini, title, section) {
  const response = await gemini.models.generateContent({
    model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
    contents: buildResearchPrompt(title, section),
    config: {
      temperature: 0.2,
      tools: [{ googleSearch: {} }],
    },
  });

  return response.text || '';
}

function buildContentHtml(blueprint, affiliateSuggestions, youtubeSuggestions, inlineImage) {
  const htmlParts = [];
  const inlineImagePlacement = inlineImage ? inlineImage.placementHeading : null;

  htmlParts.push(renderParagraphs(blueprint.introParagraphs));

  (blueprint.sections || []).forEach((section) => {
    htmlParts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    htmlParts.push(renderParagraphs(section.paragraphs));
    htmlParts.push(renderList(section.bulletPoints, false));
    htmlParts.push(renderList(section.numberedPoints, true));

    if (section.quote) {
      htmlParts.push(`<blockquote><p>${escapeHtml(section.quote)}</p></blockquote>`);
    }

    if (inlineImage && section.heading === inlineImagePlacement) {
      htmlParts.push(buildInlineImageHtml(inlineImage));
    }

    affiliateSuggestions
      .filter((suggestion) => suggestion.placementHeading === section.heading)
      .forEach((suggestion) => {
        htmlParts.push(buildAffiliateCardHtml(suggestion.link, suggestion));
      });

    youtubeSuggestions
      .filter((suggestion) => suggestion.placementHeading === section.heading)
      .forEach((suggestion) => {
        htmlParts.push(buildYoutubeCardHtml(suggestion));
      });
  });

  if (inlineImage && inlineImagePlacement && !blueprint.sections.some((section) => section.heading === inlineImagePlacement)) {
    htmlParts.push(buildInlineImageHtml(inlineImage));
  }

  htmlParts.push(renderParagraphs(blueprint.conclusionParagraphs));
  htmlParts.push(buildFaqHtml(blueprint.faqs));

  return htmlParts.filter(Boolean).join('\n');
}

exports.submitPostComment = onCall({ invoker: 'public' }, async (request) => {
  const postId = String(request.data && request.data.postId ? request.data.postId : '').trim();
  const authorName = normalizeCommentText(
    request.data && request.data.authorName ? request.data.authorName : '',
    80,
  );
  const authorEmail = normalizeCommentText(
    request.data && request.data.authorEmail ? request.data.authorEmail : '',
    160,
  );
  const content = normalizeCommentText(
    request.data && request.data.content ? request.data.content : '',
    4000,
  );

  if (!postId) {
    throw new HttpsError('invalid-argument', 'A post id is required.');
  }

  if (!authorName || authorName.length < 2) {
    throw new HttpsError('invalid-argument', 'Your name is required.');
  }

  if (authorEmail && !isValidEmail(authorEmail)) {
    throw new HttpsError('invalid-argument', 'Email must be valid or left empty.');
  }

  if (!content || content.length < 8) {
    throw new HttpsError('invalid-argument', 'Comment must be at least 8 characters.');
  }

  const postSnapshot = await db.collection('posts').doc(postId).get();
  if (!postSnapshot.exists) {
    throw new HttpsError('not-found', 'This post no longer exists.');
  }

  const postData = postSnapshot.data() || {};
  if (postData.status !== 'published') {
    throw new HttpsError('failed-precondition', 'Comments are only available on published posts.');
  }

  if (postData.allowComments === false) {
    throw new HttpsError('failed-precondition', 'Comments are disabled for this post.');
  }

  const rawRequest = request.rawRequest;
  const guestIp = getClientIpAddress(rawRequest);
  const guestIpHash = hashIpAddress(guestIp);
  const blockedIpSnapshot = await db.collection('blockedCommentIps').doc(guestIpHash).get();

  if (blockedIpSnapshot.exists) {
    throw new HttpsError(
      'permission-denied',
      'Comments from this network are blocked. Contact the site admin if this is a mistake.',
    );
  }

  const recentComment = await getRecentCommentByIpHash(guestIpHash);
  if (recentComment && recentComment.createdAt && typeof recentComment.createdAt.toDate === 'function') {
    const lastCommentAt = recentComment.createdAt.toDate().getTime();
    if (Date.now() - lastCommentAt < 60 * 1000) {
      throw new HttpsError(
        'resource-exhausted',
        'Please wait about a minute before posting another comment.',
      );
    }
  }

  const commentRef = db.collection('comments').doc();
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  const batch = db.batch();
  batch.set(commentRef, {
    postId,
    postSlug: String(postData.slug || '').trim(),
    postTitle: String(postData.title || '').trim(),
    authorName,
    content,
    status: 'visible',
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  batch.set(db.collection('commentModeration').doc(commentRef.id), {
    commentId: commentRef.id,
    authorEmail: authorEmail || null,
    guestIp,
    guestIpHash,
    userAgent: normalizeCommentText(
      rawRequest && rawRequest.headers && rawRequest.headers['user-agent']
        ? rawRequest.headers['user-agent']
        : '',
      500,
    ) || null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await batch.commit();

  logger.info('Guest comment submitted', {
    commentId: commentRef.id,
    postId,
    postSlug: String(postData.slug || '').trim(),
    guestIpHash,
  });

  return {
    commentId: commentRef.id,
    status: 'visible',
  };
});

exports.recordPostView = onCall({ invoker: 'public' }, async (request) => {
  if (request.auth) {
    return { counted: false, reason: 'authenticated-user' };
  }

  const postId = normalizeOptionalText(request.data && request.data.postId, 120);
  if (!postId) {
    throw new HttpsError('invalid-argument', 'A post id is required.');
  }

  const postRef = db.collection('posts').doc(postId);
  const postSnapshot = await postRef.get();
  if (!postSnapshot.exists) {
    throw new HttpsError('not-found', 'This post no longer exists.');
  }

  const postData = postSnapshot.data() || {};
  if (postData.status !== 'published') {
    return { counted: false, reason: 'not-published' };
  }

  await postRef.set(
    {
      viewCount: admin.firestore.FieldValue.increment(1),
    },
    { merge: true }
  );

  return { counted: true };
});

exports.generateBlogPostDraft = onCall({ invoker: 'public' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in to generate AI drafts.');
  }

  const title = String(request.data && request.data.title ? request.data.title : '').trim();
  const section = String(request.data && request.data.section ? request.data.section : 'start-the-leap').trim();

  if (!title) {
    throw new HttpsError('invalid-argument', 'A post title is required.');
  }

  const gemini = getGeminiClient();
  const affiliateLinks = await loadAffiliateLinks();
  const affiliateContext = affiliateLinks.slice(0, 50).map((link) => ({
    name: link.name,
    destinationUrl: link.destinationUrl,
    isActive: link.isActive,
    notes: link.notes,
  }));

  logger.info('Generating AI post draft', { title, section, affiliateLinkCount: affiliateContext.length });

  const warnings = [];
  let researchNotes = '';

  try {
    researchNotes = await generateResearchNotes(gemini, title, section);
  } catch (error) {
    const message = getErrorMessage(error).toLowerCase();
    if (message.includes('reported as leaked')) {
      logger.error('Gemini research step failed because the API key is blocked', error);
      throw mapGeminiError(
        error,
        'Gemini API access failed before draft generation could start.'
      );
    }

    logger.warn('Gemini research step failed; continuing without search grounding', {
      title,
      section,
      error: getErrorMessage(error),
    });
    warnings.push(
      'Google Search grounding was unavailable for this draft. Fact-check the output before publishing.'
    );
  }

  let completion;
  try {
    completion = await gemini.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash',
      contents: buildDraftPrompt(title, section, affiliateContext, researchNotes),
      config: {
        temperature: 0.7,
        systemInstruction: [
          'You are an editorial assistant for an affiliate content site.',
          'Write a comprehensive evergreen article draft from only the supplied title.',
          'Avoid fabricated statistics, fake case studies, fake quotes, and claims that need real-time verification.',
          'When tools or products are useful, suggest them in a practical, editorial tone.',
          'Only suggest actual affiliate links for names provided in the existing affiliate-links list.',
          'For missing affiliate opportunities, return them in affiliateSuggestions but do not invent URLs.',
          'For video recommendations, provide YouTube search queries instead of fabricated video URLs.',
          'Return valid JSON matching the requested schema exactly.',
        ].join(' '),
        responseMimeType: 'application/json',
        responseJsonSchema: POST_BLUEPRINT_SCHEMA,
      },
    });
  } catch (error) {
    logger.error('Gemini content generation failed', error);
    throw mapGeminiError(error, 'Gemini could not generate the blog draft.');
  }

  const rawContent = completion.text;

  if (!rawContent) {
    throw new HttpsError('internal', 'Gemini returned an empty draft.');
  }

  let blueprint;
  try {
    blueprint = JSON.parse(rawContent);
  } catch (error) {
    logger.error('Failed to parse Gemini JSON response', { rawContent, error });
    throw new HttpsError('internal', 'Could not parse AI draft output.');
  }

  const finalSlug = slugify(blueprint.slug || title);
  let featuredImage = null;
  try {
    featuredImage = await generateImageAsset(
      gemini,
      blueprint.featuredImagePrompt,
      finalSlug,
      'featured'
    );
  } catch (error) {
    logger.error('Featured image generation failed', error);
    warnings.push(getImageGenerationWarning('featured', error));
  }

  let inlineImage = null;
  const inlineImageRequest = Array.isArray(blueprint.inlineImages) ? blueprint.inlineImages[0] : null;
  if (inlineImageRequest) {
    try {
      const generatedInlineImage = await generateImageAsset(
        gemini,
        inlineImageRequest.prompt,
        finalSlug,
        'inline'
      );

      if (generatedInlineImage) {
        inlineImage = {
          ...generatedInlineImage,
          alt: inlineImageRequest.alt,
          caption: inlineImageRequest.caption,
          placementHeading: inlineImageRequest.placementHeading,
        };
      }
    } catch (error) {
      logger.error('Inline image generation failed', error);
      warnings.push(getImageGenerationWarning('inline', error));
    }
  }

  const affiliateSuggestions = [];
  for (const suggestion of blueprint.affiliateSuggestions || []) {
    const link = await ensureAffiliateLinkSuggestion(affiliateLinks, suggestion, blueprint.title || title);
    affiliateSuggestions.push({
      ...suggestion,
      link,
    });
    if (link.wasCreated) {
      affiliateLinks.push(link);
    }
  }

  const contentHtml = buildContentHtml(
    blueprint,
    affiliateSuggestions,
    blueprint.youtubeSuggestions || [],
    inlineImage
  );

  return {
    title: blueprint.title || title,
    slug: finalSlug,
    summary: blueprint.summary || '',
    seoTitle: blueprint.seoTitle || blueprint.title || title,
    metaDescription: blueprint.metaDescription || blueprint.summary || '',
    tags: Array.isArray(blueprint.tags) ? blueprint.tags : [],
    section,
    featuredImageUrl: featuredImage ? featuredImage.url : '',
    featuredImagePrompt: blueprint.featuredImagePrompt || '',
    contentHtml,
    youtubeSuggestions: blueprint.youtubeSuggestions || [],
    affiliateSuggestions: affiliateSuggestions.map((suggestion) => ({
      id: suggestion.link.id,
      name: suggestion.name,
      destinationUrl: suggestion.link.destinationUrl,
      isActive: suggestion.link.isActive,
      placementHeading: suggestion.placementHeading,
      anchorText: suggestion.anchorText,
      reason: suggestion.reason,
      createdAsDraft: suggestion.link.wasCreated,
    })),
    faqs: blueprint.faqs || [],
    warnings,
  };
});

exports.subscribeToNewsletter = onCall({ invoker: 'public' }, async (request) => {
  const email = normalizeOptionalText(request.data && request.data.email, 240).toLowerCase();
  const firstName = normalizeOptionalText(request.data && request.data.firstName, 120);
  const source = normalizeOptionalText(request.data && request.data.source, 120) || 'newsletter';
  const pageUrl = normalizeUrlPath(request.data && request.data.pageUrl);

  if (!isValidEmail(email)) {
    throw new HttpsError('invalid-argument', 'A valid email address is required.');
  }

  const subscriberRef = db.collection('subscribers').doc(email);
  const subscriberSnapshot = await subscriberRef.get();
  const existingData = subscriberSnapshot.exists ? subscriberSnapshot.data() || {} : {};
  const wasActive = existingData.isActive !== false && subscriberSnapshot.exists;
  const unsubscribeToken =
    normalizeOptionalText(existingData.unsubscribeToken, 240) || randomUUID();
  const normalizedTags = Array.from(
    new Set(
      ['newsletter', source]
        .concat(Array.isArray(existingData.tags) ? existingData.tags : [])
        .map((tag) => normalizeOptionalText(tag, 80).toLowerCase())
        .filter(Boolean)
    )
  );
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const status = subscriberSnapshot.exists
    ? wasActive
      ? 'already-subscribed'
      : 'reactivated'
    : 'subscribed';
  const subscribedAtValue =
    status === 'already-subscribed' && existingData.subscribedAt
      ? existingData.subscribedAt
      : timestamp;

  await subscriberRef.set(
    {
      email,
      emailLower: email,
      firstName: firstName || normalizeOptionalText(existingData.firstName, 120) || null,
      source,
      pageUrl: pageUrl || null,
      isActive: true,
      tags: normalizedTags,
      unsubscribeToken,
      subscribedAt: subscribedAtValue,
      unsubscribedAt: admin.firestore.FieldValue.delete(),
      updatedAt: timestamp,
    },
    { merge: true }
  );

  let emailSent = false;

  if (status !== 'already-subscribed') {
    try {
      const [siteSettings, emailSettings] = await Promise.all([
        loadSiteSettings(),
        loadEmailSettings(),
      ]);

      if (hasSmtpSettings(emailSettings)) {
        const transport = createSmtpTransport(emailSettings);
        try {
          await sendWelcomeEmail(
            transport,
            {
              email,
              unsubscribeToken,
            },
            siteSettings,
            emailSettings
          );
          emailSent = true;
        } finally {
          if (typeof transport.close === 'function') {
            transport.close();
          }
        }
      }
    } catch (error) {
      logger.warn('Welcome email could not be sent after subscription', {
        email,
        error: getErrorMessage(error),
      });
    }
  }

  return {
    status,
    emailSent,
  };
});

exports.unsubscribeNewsletter = onCall({ invoker: 'public' }, async (request) => {
  const token = normalizeOptionalText(request.data && request.data.token, 240);

  if (!token) {
    throw new HttpsError('invalid-argument', 'An unsubscribe token is required.');
  }

  const snapshot = await db
    .collection('subscribers')
    .where('unsubscribeToken', '==', token)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new HttpsError('not-found', 'This unsubscribe link is invalid.');
  }

  const subscriberRef = snapshot.docs[0].ref;
  const subscriberData = snapshot.docs[0].data() || {};

  if (subscriberData.isActive === false) {
    return { status: 'already-unsubscribed' };
  }

  await subscriberRef.set(
    {
      isActive: false,
      unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  return { status: 'unsubscribed' };
});

exports.sendPublishedPostEmail = onDocumentWritten('posts/{postId}', async (event) => {
  const change = event.data;
  const before = change && change.before && change.before.exists ? change.before.data() || {} : null;
  const after = change && change.after && change.after.exists ? change.after.data() || {} : null;

  if (!after) {
    return;
  }

  if (after.status !== 'published') {
    return;
  }

  if (after.newsletterEmailSentAt) {
    return;
  }

  if (before && before.status === 'published') {
    return;
  }

  const postTitle = normalizeOptionalText(after.title, 240);
  const postSlug = normalizeOptionalText(after.slug, 240);
  if (!postTitle || !postSlug) {
    logger.warn('Skipping published post email because title or slug is missing', {
      postId: event.params.postId,
    });
    return;
  }

  const emailSettings = await loadEmailSettings();
  if (!hasSmtpSettings(emailSettings)) {
    logger.warn('Skipping published post email because SMTP is not configured', {
      postId: event.params.postId,
    });
    return;
  }

  const activeSubscribersSnapshot = await db
    .collection('subscribers')
    .where('isActive', '==', true)
    .get();

  if (activeSubscribersSnapshot.empty) {
    await change.after.ref.set(
      {
        newsletterEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        newsletterEmailRecipientCount: 0,
        newsletterEmailFailureCount: 0,
      },
      { merge: true }
    );
    return;
  }

  const subscribers = activeSubscribersSnapshot.docs
    .map((subscriberSnapshot) => {
      const subscriber = subscriberSnapshot.data() || {};
      const email = normalizeOptionalText(subscriber.email, 240).toLowerCase();
      const unsubscribeToken = normalizeOptionalText(subscriber.unsubscribeToken, 240);

      if (!isValidEmail(email) || !unsubscribeToken) {
        return null;
      }

      return {
        email,
        unsubscribeToken,
      };
    })
    .filter(Boolean);

  if (subscribers.length === 0) {
    await change.after.ref.set(
      {
        newsletterEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        newsletterEmailRecipientCount: 0,
        newsletterEmailFailureCount: 0,
      },
      { merge: true }
    );
    return;
  }

  const siteSettings = await loadSiteSettings();
  const transport = createSmtpTransport(emailSettings);

  try {
    await transport.verify();
  } catch (error) {
    logger.error('SMTP verification failed before sending published post email', {
      postId: event.params.postId,
      error: getErrorMessage(error),
    });

    if (typeof transport.close === 'function') {
      transport.close();
    }
    return;
  }

  let sentCount = 0;
  let failedCount = 0;
  for (const subscriber of subscribers) {
    try {
      await sendNewPostEmail(
        transport,
        subscriber,
        {
          title: postTitle,
          slug: postSlug,
          summary: normalizeOptionalText(after.summary, 1200),
          featuredImage: normalizeOptionalText(after.featuredImage, 2000),
          publishDate: toDate(after.publishDate),
        },
        siteSettings,
        emailSettings
      );
      sentCount += 1;
    } catch (error) {
      failedCount += 1;
      logger.warn('Failed sending new-post email to subscriber', {
        postId: event.params.postId,
        email: subscriber.email,
        error: getErrorMessage(error),
      });
    }
  }

  if (typeof transport.close === 'function') {
    transport.close();
  }

  await change.after.ref.set(
    {
      newsletterEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      newsletterEmailRecipientCount: sentCount,
      newsletterEmailFailureCount: failedCount,
    },
    { merge: true }
  );

  logger.info('Finished sending published post emails', {
    postId: event.params.postId,
    sentCount,
    failedCount,
  });
});
