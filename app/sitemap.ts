import { MetadataRoute } from 'next';

const locales = ['en', 'ka'];
const baseUrl = 'https://shemoqmedi.space'; // Production URL

// Detailed list of all pages/templates
const routes = [
  '', // Landing
  '/coffee',
  '/coffee-2', 
  '/coffee-3',
  '/coffee-4',
  '/auto-1',
  '/auto-shop',
  '/beauty',
  '/construction',
  '/shop', // ecommerce
  '/modern', // fashion/clothes-modern
  '/acoustic-shop',
  '/regular', 
  '/modern-restaurant',
  '/shoes',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  routes.forEach((route) => {
    locales.forEach((locale) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      });
    });
  });

  return sitemapEntries;
}
