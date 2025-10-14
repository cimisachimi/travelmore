"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl"; // Import useLocale
import { useTheme } from "./ThemeProvider";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const locale = useLocale(); // Get the current locale (e.g., "en" or "id")

  // 1. Updated check to hide on any homepage (e.g., "/" or "/en")
  if (!pathname || pathname === "/" || pathname === `/${locale}`) {
    return null;
  }

  // 2. Logic to remove the locale from the breadcrumb segments for a cleaner display
  const allSegments = pathname.split("/").filter(Boolean);
  const isLocalePrefixed = allSegments[0] === locale;
  const pathSegments = isLocalePrefixed ? allSegments.slice(1) : allSegments;

  // If there are no actual page segments after removing the locale, don't render.
  if (pathSegments.length === 0) {
    return null;
  }

  const isExclusive = theme === "exclusive";
  const breadcrumbTextColor = isExclusive ? "text-gray-400" : "text-gray-500";
  const linkColor = isExclusive ? "hover:text-primary" : "hover:text-primary";
  const currentPageColor = isExclusive ? "text-white" : "text-foreground";

  return (
    <nav aria-label="Breadcrumb" className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link
              href="/"
              className={`transition-colors duration-300 ${breadcrumbTextColor} ${linkColor}`}
            >
              Home
            </Link>
          </li>
          {pathSegments.map((segment, index) => {
            const pathSlice = pathSegments.slice(0, index + 1);

            // 3. Reconstruct the href correctly, including the locale if needed
            const href = isLocalePrefixed
              ? `/${locale}/${pathSlice.join("/")}`
              : `/${pathSlice.join("/")}`;

            const isLast = index === pathSegments.length - 1;

            return (
              <React.Fragment key={href}>
                <li>
                  <span className={breadcrumbTextColor}>/</span>
                </li>
                <li>
                  <Link
                    href={href}
                    className={`capitalize transition-colors duration-300 ${isLast
                        ? `font-semibold ${currentPageColor}`
                        : `${breadcrumbTextColor} ${linkColor}`
                      }`}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {segment.replace(/-/g, " ")}
                  </Link>
                </li>
              </React.Fragment>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;