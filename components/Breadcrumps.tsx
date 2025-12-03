"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useTheme } from "./ThemeProvider";

// ✅ CONFIGURATION: Define custom labels and hidden segments here
const SEGMENT_LABELS: Record<string, string> = {
  profile: "My Profile",
  bookings: "My Bookings",
  history: "Purchase History",
  "car-rental": "Car Rental",
};

// Segments to completely skip in the visual breadcrumb
const HIDDEN_SEGMENTS = ["components", "sections", "Booking"]; 

const Breadcrumbs = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const locale = useLocale();

  if (!pathname || pathname === "/" || pathname === `/${locale}`) {
    return null;
  }

  const allSegments = pathname.split("/").filter(Boolean);
  const isLocalePrefixed = allSegments[0] === locale;
  
  // ✅ FIX 1: Changed 'let' to 'const'
  const rawSegments = isLocalePrefixed ? allSegments.slice(1) : allSegments;

  // ✅ FILTER: Remove hidden segments from the visual array
  const visibleSegments = rawSegments
    .map((segment, index) => ({ name: segment, originalIndex: index }))
    .filter((item) => !HIDDEN_SEGMENTS.includes(item.name));

  if (visibleSegments.length === 0) {
    return null;
  }

  const isExclusive = theme === "exclusive";
  const breadcrumbTextColor = isExclusive ? "text-gray-400" : "text-gray-500";
  const linkColor = isExclusive ? "hover:text-primary" : "hover:text-primary";
  const currentPageColor = isExclusive ? "text-white" : "text-foreground";

  // ✅ FIX 2: Removed unused 'isLast' parameter
  const getDisplayName = (segment: string) => {
    // If it is a number (ID), format it nicely
    if (!isNaN(Number(segment))) {
      return `Order #${segment}`;
    }
    // Check our custom map
    if (SEGMENT_LABELS[segment]) {
      return SEGMENT_LABELS[segment];
    }
    // Default formatting: remove hyphens and capitalize
    return segment.replace(/-/g, " ");
  };

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
          {visibleSegments.map((item, visualIndex) => {
            const pathSlice = rawSegments.slice(0, item.originalIndex + 1);
            
            const href = isLocalePrefixed
              ? `/${locale}/${pathSlice.join("/")}`
              : `/${pathSlice.join("/")}`;

            const isLast = visualIndex === visibleSegments.length - 1;
            // ✅ FIX 2: Updated function call
            const displayName = getDisplayName(item.name);

            return (
              <React.Fragment key={href}>
                <li>
                  <span className={breadcrumbTextColor}>/</span>
                </li>
                <li>
                  {isLast ? (
                    <span className={`capitalize font-semibold ${currentPageColor}`}>
                      {displayName}
                    </span>
                  ) : (
                    <Link
                      href={href}
                      className={`capitalize transition-colors duration-300 ${breadcrumbTextColor} ${linkColor}`}
                    >
                      {displayName}
                    </Link>
                  )}
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