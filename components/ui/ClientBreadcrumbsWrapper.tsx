// components/ClientBreadcrumbsWrapper.tsx
"use client";

import Breadcrumbs from "@/components/Breadcrumps"; // Adjust path if your Breadcrumbs component is elsewhere

export default function ClientBreadcrumbsWrapper() {
  // This component's only job is to render the original Breadcrumbs
  // within a guaranteed client boundary.
  return <Breadcrumbs />;
}