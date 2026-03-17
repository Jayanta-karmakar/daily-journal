import { useEffect } from 'react';
import { APP_INFO } from '@/config/constants';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  robots?: string;
  image?: string;
  lang?: string;
}

const SEO = ({ 
  title, 
  description = APP_INFO.description, 
  keywords,
  canonical,
  robots = "index, follow",
  image = "https://journal.codebyjayanta.in/og-image.png",
  lang = "en"
}: SEOProps) => {
  useEffect(() => {
    // Update Title
    const fullTitle = title ? `${title} | ${APP_INFO.name}` : `${APP_INFO.name} | Your Private Journal & Ledger`;
    document.title = fullTitle;

    // Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update Meta Keywords
    if (keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywords);
      }
    }

    // Update Meta Robots
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (metaRobots) {
      metaRobots.setAttribute('content', robots);
    }

    // Update Canonical Link
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image);

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', image);

    // Update HTML Lang
    document.documentElement.setAttribute('lang', lang);

    // Update OG Locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute('content', lang === 'en' ? 'en_US' : lang);
    } else {
      const metaLocale = document.createElement('meta');
      metaLocale.setAttribute('property', 'og:locale');
      metaLocale.setAttribute('content', lang === 'en' ? 'en_US' : lang);
      document.head.appendChild(metaLocale);
    }

  }, [title, description, keywords, canonical, robots, image, lang]);

  return null;
};

export default SEO;
