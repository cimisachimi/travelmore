// app/layout.tsx
import "./globals.css";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "TravelMore", // Updated title
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <Navbar />
        {/* ✨ FIX: Removed the constraining classes from main */}
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}