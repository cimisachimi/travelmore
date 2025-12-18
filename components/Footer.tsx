// components/Footer.tsx
"use client";

import React from "react";
// PENTING: Gunakan Link dari konfigurasi i18n, bukan next/link biasa
import { Link } from "@/i18n/navigation"; 
import Image from "next/image";
import { useTheme } from "./ThemeProvider";
import { useTranslations } from "next-intl";

const Footer: React.FC = () => {
  const { theme } = useTheme();
  const t = useTranslations("footer");

  // Pastikan nama file gambar ini sesuai dengan yang ada di folder public Anda
  const logoSrc = theme === "regular" ? "/logo-Big.webp" : "/logo-dark.webp";

  return (
    <footer className="bg-gray-800 dark:bg-black text-white py-12 transition-colors duration-300 border-t border-gray-700 dark:border-gray-900">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-10 px-6">
        
        {/* 1. Logo & Deskripsi */}
        <div className="flex flex-col max-w-sm">
          <Link href="/">
            <Image
              key={logoSrc} // Key ini memaksa gambar refresh instan saat ganti tema
              src={logoSrc}
              alt="Logo TravelMore"
              width={160}
              height={50}
              className="mb-4 object-contain"
            />
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* 2. Quick Links */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">{t("quickLinks.title")}</h3>
          <ul className="space-y-3 text-gray-400">
            <li>
              <Link href="/destinations" className="hover:text-primary transition-colors hover:pl-1 duration-200">
                {t("quickLinks.destinations")}
              </Link>
            </li>
            <li>
              <Link href="/car-rental" className="hover:text-primary transition-colors hover:pl-1 duration-200">
                {t("quickLinks.carRental")}
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors hover:pl-1 duration-200">
                {t("quickLinks.about")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors hover:pl-1 duration-200">
                {t("quickLinks.contact")}
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Contact Info */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-white">{t("contact.title")}</h3>
          <div className="space-y-4 text-sm text-gray-400">
            <p className="leading-relaxed max-w-xs">
              {t("contact.address")}
            </p>
            
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-500 text-xs uppercase">{t("contact.phone")}</span>
              <a
                href="tel:+6281234567890"
                className="hover:text-primary transition-colors text-white text-base font-medium"
              >
                +62 812 3456 7890
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-500 text-xs uppercase">{t("contact.email")}</span>
              <a
                href="mailto:info@travelmore.com"
                className="hover:text-primary transition-colors text-white text-base font-medium"
              >
                info@travelmore.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700/50 mt-12 pt-8 text-center px-4">
        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} travelmore.travel. {t("copyright")}
        </p>
      </div>
    </footer>
  );
};

export default Footer;