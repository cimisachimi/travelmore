"use client";

import { useEffect } from "react";

export const useMidtransSnap = () => {
  useEffect(() => {
    // 1. Get Snap script URL based on environment
    const snapScript =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    // 2. Get Midtrans client key from environment variables
    const clientKey =
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-dummy-key"; // Fallback

    if (!clientKey) {
      console.error("Midtrans client key is not set in environment variables.");
      return;
    }

    // 3. Create a new script element
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    // 4. Append the script to the document body
    document.body.appendChild(script);

    // 5. Cleanup function: Remove the script when the component unmounts
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []); // Empty dependency array ensures this runs only once
};