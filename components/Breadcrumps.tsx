// components/Breadcrumbs.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";

const Breadcrumbs = () => {
  const pathname = usePathname();
  const { theme } = useTheme();

  // Don't render on the homepage
  if (!pathname || pathname === "/") {
    return null;
  }

  const pathSegments = pathname.split("/").filter((segment) => segment);
  const isExclusive = theme === "exclusive";

  const breadcrumbTextColor = isExclusive ? "text-gray-400" : "text-gray-500";
  const linkColor = isExclusive ? "hover:text-primary" : "hover:text-primary";
  const currentPageColor = isExclusive ? "text-white" : "text-foreground";

  return (
    // Use the main background color to blend and remove the bottom border
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
            const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
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