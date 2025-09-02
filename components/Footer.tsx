// components/Footer.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer: React.FC = () => (
  // ✨ Changed background to black
  <footer className="bg-gray-700 text-white py-8">
    <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-start gap-8 px-4">
      {/* Logo + Description */}
      <div className="flex flex-col">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="TravelMore Logo"
            width={140}
            height={40}
            className="mb-2" // Add some margin below the logo
          />
        </Link>
        <p className="mt-2 max-w-xs text-sm text-gray-400">
          Your trusted partner for unforgettable journeys and reliable car
          rentals. Explore the world with ease and comfort!
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-2 font-semibold">Quick Links</h3>
        <ul className="space-y-1 text-gray-300">
          <li>
            {/* ✨ Updated link styling */}
            <a href="/destinations" className="hover:text-primary transition-colors">
              Destinations
            </a>
          </li>
          <li>
            <a href="/car-rental" className="hover:text-primary transition-colors">
              Car Rental
            </a>
          </li>
          <li>
            <a href="/about" className="hover:text-primary transition-colors">
              About Us
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:text-primary transition-colors">
              Contact
            </a>
          </li>
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="mb-2 font-semibold">Contact Us</h3>
        <p className="text-sm text-gray-300">
          Jl. Magelang - Yogyakarta No.71,
          <br />
          Mulungan Wetan, Sendangadi, Kec. Mlati,
          <br />
          Kabupaten Sleman, Daerah Istimewa Yogyakarta 55285
          <br />
          Phone:{" "}
          <a href="tel:+1234567890" className="hover:text-primary transition-colors">
            +1 (234) 567-890
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
    <div className="border-t border-gray-700 mt-8 text-center py-4 text-sm text-gray-500">
      &copy; {new Date().getFullYear()} travelmore.travel All rights reserved.
    </div>
  </footer>
);

export default Footer;