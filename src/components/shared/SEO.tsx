import { Helmet } from 'react-helmet-async';
import { useData } from '@/contexts/DataContext';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  schema?: Record<string, unknown>;
  type?: 'website' | 'article';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export function SEO({
  title,
  description,
  image,
  canonicalUrl,
  noIndex = false,
  schema,
  type = 'website',
  author,
  publishedDate,
  modifiedDate,
}: SEOProps) {
  const { siteSettings } = useData();
  
  const fullTitle = title.includes(siteSettings.siteName) 
    ? title 
    : `${title} | ${siteSettings.siteName}`;
  
  const metaDescription = description || siteSettings.seoDefaults.defaultDescription;
  const ogImage = image || siteSettings.seoDefaults.defaultOgImage;
  const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebSite',
    name: fullTitle,
    description: metaDescription,
    url: canonical,
    image: ogImage,
    ...(type === 'article' && {
      author: { '@type': 'Person', name: author || siteSettings.siteName },
      datePublished: publishedDate,
      dateModified: modifiedDate || publishedDate,
      publisher: {
        '@type': 'Organization',
        name: siteSettings.siteName,
        logo: { '@type': 'ImageObject', url: siteSettings.logo },
      },
    }),
  };

  const finalSchema = schema || defaultSchema;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteSettings.siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical */}
      <link rel="canonical" href={canonical} />
      
      {/* No Index */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
}
