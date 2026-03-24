import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { defaultEmailSettings, defaultSiteSettings } from '@/data/sampleData';
import type { EmailSettings, SiteSettings } from '@/types';

export interface SiteSettingsUpsertInput {
  siteName: string;
  siteUrl: string;
  tagline: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  accentColor: string;
  socialLinks: SiteSettings['socialLinks'];
  seoDefaults: SiteSettings['seoDefaults'];
  analyticsIds: SiteSettings['analyticsIds'];
  affiliateDisclaimer: string;
  footerContent: string;
  homepageFeatured: SiteSettings['homepageFeatured'];
}

export interface EmailSettingsUpsertInput {
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  welcomeSubject: string;
  newPostSubjectTemplate: string;
}

interface FirestoreSiteSettings extends Partial<SiteSettingsUpsertInput> {}

interface FirestoreEmailSettings extends Partial<EmailSettingsUpsertInput> {}

const siteSettingsDoc = doc(db, 'settings', 'site');
const emailSettingsDoc = doc(db, 'settings', 'email');

function normalizeText(value?: string | null) {
  return String(value || '').trim();
}

function buildDefaultSiteSettings(): SiteSettings {
  return {
    ...defaultSiteSettings,
    socialLinks: { ...defaultSiteSettings.socialLinks },
    seoDefaults: { ...defaultSiteSettings.seoDefaults },
    analyticsIds: { ...defaultSiteSettings.analyticsIds },
    homepageFeatured: {
      featuredPosts: [...defaultSiteSettings.homepageFeatured.featuredPosts],
      featuredTools: [...defaultSiteSettings.homepageFeatured.featuredTools],
      featuredComparisons: [...defaultSiteSettings.homepageFeatured.featuredComparisons],
    },
  };
}

function buildDefaultEmailSettings(): EmailSettings {
  return {
    ...defaultEmailSettings,
  };
}

function snapshotToSiteSettings(snapshot: DocumentSnapshot<DocumentData, DocumentData>): SiteSettings {
  const defaults = buildDefaultSiteSettings();
  const data = (snapshot.data() || {}) as FirestoreSiteSettings;

  return {
    ...defaults,
    id: snapshot.id,
    siteName: normalizeText(data.siteName) || defaults.siteName,
    siteUrl: normalizeText(data.siteUrl) || defaults.siteUrl,
    tagline: normalizeText(data.tagline) || defaults.tagline,
    logo: normalizeText(data.logo) || defaults.logo,
    favicon: normalizeText(data.favicon) || defaults.favicon,
    primaryColor: normalizeText(data.primaryColor) || defaults.primaryColor,
    accentColor: normalizeText(data.accentColor) || defaults.accentColor,
    socialLinks: {
      ...defaults.socialLinks,
      ...(data.socialLinks || {}),
    },
    seoDefaults: {
      ...defaults.seoDefaults,
      ...(data.seoDefaults || {}),
    },
    analyticsIds: {
      ...defaults.analyticsIds,
      ...(data.analyticsIds || {}),
    },
    affiliateDisclaimer:
      normalizeText(data.affiliateDisclaimer) || defaults.affiliateDisclaimer,
    footerContent: normalizeText(data.footerContent) || defaults.footerContent,
    homepageFeatured: {
      featuredPosts:
        Array.isArray(data.homepageFeatured?.featuredPosts)
          ? data.homepageFeatured?.featuredPosts.filter(Boolean)
          : defaults.homepageFeatured.featuredPosts,
      featuredTools:
        Array.isArray(data.homepageFeatured?.featuredTools)
          ? data.homepageFeatured?.featuredTools.filter(Boolean)
          : defaults.homepageFeatured.featuredTools,
      featuredComparisons:
        Array.isArray(data.homepageFeatured?.featuredComparisons)
          ? data.homepageFeatured?.featuredComparisons.filter(Boolean)
          : defaults.homepageFeatured.featuredComparisons,
    },
  };
}

function snapshotToEmailSettings(
  snapshot: DocumentSnapshot<DocumentData, DocumentData>
): EmailSettings {
  const defaults = buildDefaultEmailSettings();
  const data = (snapshot.data() || {}) as FirestoreEmailSettings;

  return {
    ...defaults,
    id: snapshot.id,
    fromName: normalizeText(data.fromName) || defaults.fromName,
    fromEmail: normalizeText(data.fromEmail),
    replyTo: normalizeText(data.replyTo),
    smtpHost: normalizeText(data.smtpHost),
    smtpPort:
      typeof data.smtpPort === 'number' && Number.isFinite(data.smtpPort)
        ? data.smtpPort
        : defaults.smtpPort,
    smtpUsername: normalizeText(data.smtpUsername),
    smtpPassword: normalizeText(data.smtpPassword),
    smtpSecure: Boolean(data.smtpSecure),
    welcomeSubject: normalizeText(data.welcomeSubject) || defaults.welcomeSubject,
    newPostSubjectTemplate:
      normalizeText(data.newPostSubjectTemplate) || defaults.newPostSubjectTemplate,
  };
}

export function subscribeToSiteSettings(
  onSettings: (settings: SiteSettings) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    siteSettingsDoc,
    (snapshot) => onSettings(snapshotToSiteSettings(snapshot)),
    (error) => onError(error)
  );
}

export function subscribeToEmailSettings(
  onSettings: (settings: EmailSettings) => void,
  onError: (error: Error) => void
) {
  return onSnapshot(
    emailSettingsDoc,
    (snapshot) => onSettings(snapshotToEmailSettings(snapshot)),
    (error) => onError(error)
  );
}

export async function updateSiteSettings(input: SiteSettingsUpsertInput) {
  await setDoc(
    siteSettingsDoc,
    {
      siteName: normalizeText(input.siteName),
      siteUrl: normalizeText(input.siteUrl),
      tagline: normalizeText(input.tagline),
      logo: normalizeText(input.logo),
      favicon: normalizeText(input.favicon),
      primaryColor: normalizeText(input.primaryColor),
      accentColor: normalizeText(input.accentColor),
      socialLinks: {
        twitter: normalizeText(input.socialLinks.twitter),
        facebook: normalizeText(input.socialLinks.facebook),
        instagram: normalizeText(input.socialLinks.instagram),
        youtube: normalizeText(input.socialLinks.youtube),
        linkedin: normalizeText(input.socialLinks.linkedin),
      },
      seoDefaults: {
        titleTemplate: normalizeText(input.seoDefaults.titleTemplate),
        defaultDescription: normalizeText(input.seoDefaults.defaultDescription),
        defaultOgImage: normalizeText(input.seoDefaults.defaultOgImage),
      },
      analyticsIds: {
        googleAnalytics: normalizeText(input.analyticsIds.googleAnalytics),
        facebookPixel: normalizeText(input.analyticsIds.facebookPixel),
      },
      affiliateDisclaimer: normalizeText(input.affiliateDisclaimer),
      footerContent: normalizeText(input.footerContent),
      homepageFeatured: {
        featuredPosts: input.homepageFeatured.featuredPosts.filter(Boolean),
        featuredTools: input.homepageFeatured.featuredTools.filter(Boolean),
        featuredComparisons: input.homepageFeatured.featuredComparisons.filter(Boolean),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateEmailSettings(input: EmailSettingsUpsertInput) {
  await setDoc(
    emailSettingsDoc,
    {
      fromName: normalizeText(input.fromName),
      fromEmail: normalizeText(input.fromEmail),
      replyTo: normalizeText(input.replyTo),
      smtpHost: normalizeText(input.smtpHost),
      smtpPort:
        Number.isFinite(input.smtpPort) && input.smtpPort > 0
          ? Math.round(input.smtpPort)
          : defaultEmailSettings.smtpPort,
      smtpUsername: normalizeText(input.smtpUsername),
      smtpPassword: normalizeText(input.smtpPassword),
      smtpSecure: Boolean(input.smtpSecure),
      welcomeSubject: normalizeText(input.welcomeSubject),
      newPostSubjectTemplate: normalizeText(input.newPostSubjectTemplate),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
