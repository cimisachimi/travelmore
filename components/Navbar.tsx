// components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

// Helper component for a standard navigation link
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="relative inline-block group text-black"
    >
      {children}
      {/* The animated underline */}
      <span
        className="
          absolute left-0 -bottom-1 h-[2px] w-full
          origin-left scale-x-0 transform bg-black
          transition-transform duration-300
          group-hover:scale-x-100
        "
        aria-hidden
      />
    </Link>
  );
}

// Component for dropdown links with spinning arrow
function DropdownLink({ title, items }: { title: string; items: { name: string; href: string }[] }) {
  return (
    <div className="relative group">
      {/* The main link with the title and arrow */}
      <button className="inline-flex items-center space-x-1 text-black">
        <span>{title}</span>
        {/* The SVG arrow icon */}
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

      {/* The dropdown menu */}
      <div className="
        absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg
        transform scale-95 opacity-0 invisible
        transition-all duration-200 ease-in-out
        group-hover:scale-100 group-hover:opacity-100 group-hover:visible
      ">
        <div className="py-1" role="menu" aria-orientation="vertical">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
  const destinationLinks = [
    { name: "All Destinations", href: "/destinations" },
    { name: "Destination Details", href: "/destinations/details" },
  ];

  const pageLinks = [
    { name: "Gallery", href: "/gallery" },
    { name: "Our Team", href: "/team" },
    { name: "FAQ", href: "/faq" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center h-16">
          {/* ✨ Refined logo wrapper with better proportions */}
          <div className="">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="TravelMore Logo"
                width={128}
                height={36}
                priority
              />
            </Link>
          </div>

          {/* Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/">Home</NavLink>
            <DropdownLink title="Destinations" items={destinationLinks} />
            <NavLink href="/services">Services</NavLink>
            <NavLink href="/planner">Trip Planner</NavLink>
            <DropdownLink title="Pages" items={pageLinks} />
            <NavLink href="/about">about</NavLink>
          </div>

          {/* Action Button */}
          <div className="flex pr-4">
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg bg-primary text-black font-medium hover:brightness-90 transition-all"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}