"use client";

import React from "react";
import Link from "next/link";
import { XCircle } from "lucide-react"; 

export default function PaymentFailedPage() {
  return (
    <main className="bg-gray-50 min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        {/* Red Icon Circle */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-black mb-4">Payment Failed</h2>
        <p className="text-gray-600 mb-8">
  We couldn&apos;t process your payment. This might be due to a network error, insufficient funds, or a cancelled transaction.
</p>


        <div className="space-y-3">
          {/* Primary Button: Retry */}
          <Link
            href="/booking" // Or wherever you want them to retry
            className="block w-full px-8 py-3 rounded-lg bg-red-600 text-white font-bold hover:brightness-90 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Try Again
          </Link>
          
          {/* Secondary Button: Home */}
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