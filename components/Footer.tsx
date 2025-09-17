// components/Footer.tsx
"use client"; // Required to use hooks

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./ThemeProvider"; // Import the useTheme hook

const Footer: React.FC = () => {
  const { theme } = useTheme(); // Get the current theme

  // Conditionally select the logo based on the theme
  const logoSrc = theme === 'regular' ? '/logo-Big.webp' : '/logo-dark.webp';

  return (
    <footer className="bg-gray-800 dark:bg-black text-white py-8">
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-8 px-4">
        {/* Logo + Description */}
        <div className="flex flex-col">
          <Link href="/">
            <Image
              key={logoSrc} // Add a key to ensure React re-renders the image on src change
              src={logoSrc} // Use the dynamic logo source
              alt="Logo TravelMore"
              width={140}
              height={40}
              className="mb-2"
            />
          </Link>
          <p className="mt-2 max-w-xs text-sm text-gray-400">
            Partner terpercaya Anda untuk perjalanan tak terlupakan dan sewa mobil yang andal. Jelajahi dunia dengan mudah dan nyaman!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-2 font-semibold">Tautan Cepat</h3>
          <ul className="space-y-1 text-gray-300">
            <li>
              <Link href="/destinations" className="hover:text-primary transition-colors">
                Destinasi
              </Link>
            </li>
            <li>
              <Link href="/car-rental" className="hover:text-primary transition-colors">
                Sewa Mobil
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">
                Kontak
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="mb-2 font-semibold">Hubungi Kami</h3>
          <p className="text-sm text-gray-300">
            Jl. Magelang - Yogyakarta No.71,
            <br />
            Sleman, Daerah Istimewa Yogyakarta 55285
            <br />
            Telepon:{" "}
            <a href="tel:+6281234567890" className="hover:text-primary transition-colors">
              +62 812 3456 7890
            </a>
            <br />
            Email:{" "}
            <a href="mailto:info@travelmore.com" className="hover:text-primary transition-colors">
              info@travelmore.com
            </a>
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 dark:border-gray-800 mt-8 text-center py-4 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} travelmore.travel Hak cipta dilindungi.
      </div>
    </footer>
  );
};

export default Footer;