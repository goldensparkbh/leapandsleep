import type { PostSection } from '@/types';

export const SECTION_CONFIG: Record<
  PostSection,
  { label: string; description: string }
> = {
  'start-the-leap': {
    label: 'Start the Leap',
    description: 'Foundations, first steps, and guided paths to get moving.',
  },
  'build-the-flow': {
    label: 'Build the Flow',
    description: 'Tools, systems, and workflows that turn effort into repeatable output.',
  },
  'scale-in-sleep': {
    label: 'Scale in Sleep',
    description: 'Automation, leverage, and assets that compound while you are offline.',
  },
};

export const SITE_SECTIONS = Object.keys(SECTION_CONFIG) as PostSection[];

export const LEGACY_SECTION_REDIRECTS: Record<string, PostSection> = {
  'learn-earn': 'start-the-leap',
  'guide-ride': 'start-the-leap',
  'tools-rules': 'build-the-flow',
  'click-pick': 'build-the-flow',
  'build-yield': 'scale-in-sleep',
};

export function isPostSection(value: string): value is PostSection {
  return value in SECTION_CONFIG;
}

export function getCanonicalSection(value: string): PostSection | null {
  if (isPostSection(value)) {
    return value;
  }

  return LEGACY_SECTION_REDIRECTS[value] ?? null;
}
