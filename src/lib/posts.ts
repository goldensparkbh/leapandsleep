import type { ContentBlock } from '@/types';
import { generateId } from '@/utils/helpers';

const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const LIST_PATTERN = /^[-*]\s+(.+)$/;
const QUOTE_PATTERN = /^>\s+(.+)$/;
const CALLOUT_PATTERN = /^!(info|warning|success|tip):\s*(.+)$/i;

function normalizeLines(value: string) {
  return value.replace(/\r\n/g, '\n').split('\n');
}

function isBlockBoundary(line: string) {
  return (
    line.trim() === '' ||
    HEADING_PATTERN.test(line) ||
    LIST_PATTERN.test(line) ||
    QUOTE_PATTERN.test(line) ||
    CALLOUT_PATTERN.test(line)
  );
}

export function blocksToEditorContent(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return `${'#'.repeat(block.level || 2)} ${block.content || ''}`.trim();
        case 'list':
          return (block.items || []).map((item) => `- ${item}`).join('\n');
        case 'quote':
          return `> ${block.content || ''}`.trim();
        case 'callout':
          return `!${(block.style || 'info').toUpperCase()}: ${block.content || ''}`.trim();
        case 'paragraph':
          return block.content || '';
        default:
          return block.content || '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}

export function editorContentToBlocks(value: string): ContentBlock[] {
  const lines = normalizeLines(value);
  const blocks: ContentBlock[] = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      blocks.push({
        id: generateId(),
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const calloutMatch = line.match(CALLOUT_PATTERN);
    if (calloutMatch) {
      blocks.push({
        id: generateId(),
        type: 'callout',
        style: calloutMatch[1].toLowerCase() as ContentBlock['style'],
        content: calloutMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    if (LIST_PATTERN.test(line)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(LIST_PATTERN);
        if (!match) break;
        items.push(match[1].trim());
        index += 1;
      }
      if (items.length > 0) {
        blocks.push({
          id: generateId(),
          type: 'list',
          items,
        });
      }
      continue;
    }

    if (QUOTE_PATTERN.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(QUOTE_PATTERN);
        if (!match) break;
        quoteLines.push(match[1].trim());
        index += 1;
      }
      blocks.push({
        id: generateId(),
        type: 'quote',
        content: quoteLines.join(' '),
      });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isBlockBoundary(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    if (paragraphLines.length > 0) {
      blocks.push({
        id: generateId(),
        type: 'paragraph',
        content: paragraphLines.join(' '),
      });
      continue;
    }

    index += 1;
  }

  return blocks;
}

export function getPlainTextFromBlocks(blocks: ContentBlock[]): string {
  return blocks
    .flatMap((block) => {
      if (block.type === 'list') {
        return block.items || [];
      }
      return block.content || '';
    })
    .join(' ')
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function blocksToHtml(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const level = Math.min(Math.max(block.level || 2, 1), 6);
          return `<h${level}>${escapeHtml(block.content || '')}</h${level}>`;
        }
        case 'paragraph':
          return `<p>${escapeHtml(block.content || '')}</p>`;
        case 'list':
          return `<ul>${(block.items || [])
            .map((item) => `<li>${escapeHtml(item)}</li>`)
            .join('')}</ul>`;
        case 'quote':
          return `<blockquote><p>${escapeHtml(block.content || '')}</p></blockquote>`;
        case 'callout':
          return `<div class="ai-callout ai-callout--${block.style || 'info'}"><p>${escapeHtml(
            block.content || ''
          )}</p></div>`;
        case 'image':
          return `
            <figure>
              <img src="${escapeHtml(block.imageUrl || '')}" alt="${escapeHtml(block.alt || '')}" />
              ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
            </figure>
          `;
        default:
          return block.content ? `<p>${escapeHtml(block.content)}</p>` : '';
      }
    })
    .filter(Boolean)
    .join('\n');
}

export function htmlToPlainText(value: string): string {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
