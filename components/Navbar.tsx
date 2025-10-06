"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";


const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-700">
      <button
        onClick={() => setTheme("regular")}
        className={`px-3 py-1 text-sm font-bold rounded-full transition-colors duration-300 ${
          theme === "regular" ? "bg-white text-black" : "text-gray-500"
        }`}
      >
        Regular
      </button>
      <button
        onClick={() => setTheme("exclusive")}
        className={`px-3 py-1 text-sm font-bold rounded-full transition-colors duration-300 ${
          theme === "exclusive" ? "bg-primary text-black" : "text-gray-500"
        }`}
      >
        Exclusive
      </button>
    </div>
  );
};


function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative inline-block group text-foreground font-medium hover:text-primary transition-colors"
    >
      {children}
      <span
        className="
          absolute left-0 -bottom-1 h-[2px] w-full bg-primary
          origin-left scale-x-0 transform
          transition-transform duration-300
          group-hover:scale-x-100
        "
        aria-hidden
      />
    </Link>
  );
}


function DropdownLink({ title, items }: { title: string; items: { name: string; href: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative group md:cursor-pointer"
      onClick={() => setIsOpen(!isOpen)} // toggle di mobile
      onMouseEnter={() => setIsOpen(true)} // hover di desktop
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="inline-flex items-center space-x-1 text-foreground font-medium">
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-5 w-5 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div
        className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border 
        md:transition-all md:duration-200
        ${isOpen ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"}
        md:origin-top-left md:group-hover:opacity-100 md:group-hover:visible md:group-hover:scale-100`}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-2 text-sm text-foreground hover:bg-card transition-colors"
              role="menuitem"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function Navbar() {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  // hanya galeri & tentang kami di dropdown
  const pageLinks = [
    { name: "Galeri", href: "/gallery" },
    { name: "Tentang Kami", href: "/about" },
  ];

  const logoSrc = theme === "regular" ? "/logo-regular.png" : "/logo-exclusive.png";

  return (
    <nav className="bg-background/80 dark:bg-card/80 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-border transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-24 gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              key={logoSrc}
              src={logoSrc}
              alt="TravelMore Logo"
              width={200}
              height={60}
              priority
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/">Beranda</NavLink>
            <NavLink href="/planner">Trip Planner</NavLink>
            <NavLink href="/packages">Paket Wisata</NavLink>
            <NavLink href="/car-rental">City Tour</NavLink>
            <NavLink href="/daily-activities">Aktivitas Harian</NavLink>
            <DropdownLink title="Lainnya" items={pageLinks} />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-6">
            <ThemeToggle />
            {/* Hamburger for mobile */}
            <button
              className="md:hidden focus:outline-none"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-4 pb-4 animate-fadeIn">
            <NavLink href="/">Beranda</NavLink>
            <NavLink href="/planner">Trip Planner</NavLink>
            <NavLink href="/packages">Paket Wisata</NavLink>
            <NavLink href="/car-rental">City Tour</NavLink>
            <NavLink href="/daily-activities">Aktivitas Harian</NavLink>
            <DropdownLink title="Lainnya" items={pageLinks} />
          </div>
        )}
      </div>
    </nav>
  );
}
