// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "./ThemeProvider"; // Import the theme context

// Theme toggle component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center p-1 rounded-full bg-gray-200 dark:bg-gray-700">
      <button
        onClick={() => setTheme("regular")}
        className={`px-3 py-1 text-sm font-bold rounded-full transition-colors duration-300 ${theme === "regular"
          ? "bg-white text-black"
          : "text-gray-500"
          }`}
      >
        Regular
      </button>
      <button
        onClick={() => setTheme("exclusive")}
        className={`px-3 py-1 text-sm font-bold rounded-full transition-colors duration-300 ${theme === "exclusive"
          ? "bg-premium-secondary text-premium-primary"
          : "text-gray-500"
          }`}
      >
        Exclusive
      </button>
    </div>
  );
};

// NavLink helper
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="relative inline-block group">
      {children}
      <span
        className="
          absolute left-0 -bottom-1 h-[2px] w-full
          origin-left scale-x-0 transform
          transition-transform duration-300
          group-hover:scale-x-100
        "
        aria-hidden
      />
    </Link>
  );
}

// DropdownLink component
function DropdownLink({ title, items }: { title: string; items: { name: string; href: string }[] }) {
  return (
    <div className="relative group">
      <button className="inline-flex items-center space-x-1">
        <span>{title}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 transition-transform duration-300 group-hover:rotate-180"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div
        className="
          absolute left-0 mt-2 w-48 origin-top-left rounded-md shadow-lg
          transform scale-95 opacity-0 invisible
          transition-all duration-200 ease-in-out
          group-hover:scale-100 group-hover:opacity-100 group-hover:visible
        "
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-2 text-sm hover:bg-gray-100"
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



  const pageLinks = [
    { name: "Gallery", href: "/gallery" },
    { name: "Our Team", href: "/team" },
    { name: "FAQ", href: "/faq" },
  ];

  // Decide colors based on theme
  const isExclusive = theme === "exclusive";
  const bgClass = isExclusive ? "bg-premium-primary text-premium-secondary" : "bg-white text-black";

  return (
    <nav className={`${bgClass} shadow-md sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="TravelMore Logo"
                width={128}
                height={36}
                priority
              />
            </Link>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>

            <NavLink href="/services">Services</NavLink>
            <NavLink href="/planner">Trip Planner</NavLink>
            <DropdownLink title="Pages" items={pageLinks} />
            <NavLink href="/about">About</NavLink>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 pr-4">
            <ThemeToggle />

          </div>
        </div>
      </div>
    </nav>
  );
}