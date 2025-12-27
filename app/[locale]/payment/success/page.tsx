// app/[locale]/payment/success/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react"; 

export default function PaymentSuccessPage() {
  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-black mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for your booking. We have sent a confirmation email with your ticket details.
        </p>

        <div className="space-y-3">
          <Link
            href="/profile"
            className="block w-full px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:brightness-90 transition-all"
          >
            View My Bookings
          </Link>
          <Link
            href="/"
            className="block w-full px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}