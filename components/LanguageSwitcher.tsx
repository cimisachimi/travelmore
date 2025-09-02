"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const onSelectChange = (newLocale: string) => {
    // remove the current locale from the pathname
    const newPath = pathname.startsWith(`/${locale}`) ? pathname.substring(locale.length + 1) : pathname;

    startTransition(() => {
      router.replace(`/${newLocale}${newPath}`);
    });
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <button
        onClick={() => onSelectChange('en')}
        className={`${locale === 'en' ? 'font-bold text-black' : 'text-gray-500'} hover:text-black transition-colors`}
        disabled={isPending}
      >
        EN
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => onSelectChange('id')}
        className={`${locale === 'id' ? 'font-bold text-black' : 'text-gray-500'} hover:text-black transition-colors`}
        disabled={isPending}
      >
        ID
      </button>
    </div>
  );
}