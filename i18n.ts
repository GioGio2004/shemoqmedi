import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define your locales here
const locales = ['en', 'ka'];

export default getRequestConfig(async ({ requestLocale }) => {
  // Validate that the incoming `locale` parameter is valid
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale)) {
    notFound();
  }

  return {
    locale,
    // Fix: Path goes up one level (..) to root, then into messages
    messages: (await import(`./messages/${locale}.json`)).default
  };
});