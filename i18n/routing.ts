// i18n/routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['id', 'de', 'en'],
  defaultLocale: 'id',
  localePrefix: 'as-needed'
});