"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api"; 
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  RefreshCcw, 
  Calendar, 
  FileText, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

// --- 1. Strict Type Definitions ---

interface BookingDetails {
  service_name?: string;
  brand?: string;
  car_model?: string;
  city?: string;
  [key: string]: unknown; 
}

interface Booking {
  id: number;
  bookable_type: string;
  start_date: string;
  details: BookingDetails;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  booking?: Booking;
}

interface RefundRequest {
  id: number;
  order_id: number;
  user_id: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  order?: Order; 
}

// --- 2. Helper Components ---

const StatusBadge = ({ status }: { status: RefundRequest['status'] }) => {
  const styles = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const icons = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  };

  const Icon = icons[status] || Clock;
  const style = styles[status] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${style}`}>
      <Icon size={12} />
      <span className="capitalize">{status}</span>
    </span>
  );
};

// --- 3. Main Component ---

export default function RefundsTab() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<RefundRequest[]>("/my-refunds");
      setRefunds(response.data);
    } catch (err) {
      console.error("Fetch refunds error:", err);
      setError("Unable to load refund history.");
      toast.error("Failed to load refunds.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getServiceName = (refund: RefundRequest): string => {
    if (!refund.order?.booking) return "Order #" + (refund.order?.order_number || "Unknown");
    
    const details = refund.order.booking.details || {};
    const bookableType = refund.order.booking.bookable_type || "";

    if (details.service_name) return String(details.service_name);
    if (details.brand && details.car_model) return `${details.brand} ${details.car_model}`;
    if (details.city && bookableType.includes("TripPlanner")) return `Trip to ${details.city}`;
    
    return "Travel Service";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="w-full max-w-2xl space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-red-50 p-3 rounded-full mb-3">
          <AlertCircle className="text-red-500 w-6 h-6" />
        </div>
        <p className="text-red-600 font-medium">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 text-sm text-gray-600 underline hover:text-gray-900"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Refund Requests</h2>
          <p className="text-sm text-gray-500">Track the status of your refund applications</p>
        </div>
        <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-fit">
           Processing Time: 7-14 Business Days
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {refunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <RefreshCcw size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Refunds Found</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              You haven&apos;t submitted any refund requests yet. 
              To request a refund, go to <strong>My Bookings</strong> and select an eligible order.
            </p>
          </div>
        ) : (
          refunds.map((refund) => (
            <div
              key={refund.id}
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 relative overflow-hidden"
            >
              {/* Decorative side bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                refund.status === 'approved' ? 'bg-green-500' : 
                refund.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-400'
              }`} />

              <div className="pl-3 flex flex-col gap-4">
                {/* Top Row: Service & Status */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors">
                      {getServiceName(refund)}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText size={14} /> 
                      <span>Order #{refund.order?.order_number || "N/A"}</span>
                    </div>
                  </div>
                  <StatusBadge status={refund.status} />
                </div>

                {/* Middle Row: Details Grid */}
                <div className="bg-gray-50/80 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border border-gray-100">
                  <div className="space-y-1">
                    <span className="text-gray-500 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      <Calendar size={12} /> Requested On
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatDate(refund.created_at)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-gray-500 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                      <RefreshCcw size={12} /> Refund Amount
                    </span>
                    <span className="font-bold text-gray-900">
                      {/* ✅ FIXED: Added fallback (?? 0) to prevent 'undefined' error */}
                      {formatCurrency(refund.order?.total_amount ?? 0)}
                    </span>
                  </div>

                  <div className="col-span-1 md:col-span-2 pt-2 border-t border-gray-200/60 mt-1">
                    <span className="text-gray-500 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1">
                      <AlertCircle size={12} /> Reason Provided
                    </span>
                    <p className="text-gray-700 italic leading-relaxed">
                      &quot;{refund.reason}&quot;
                    </p>
                  </div>
                </div>

                {/* Footer Tip (Conditional) */}
                {refund.status === 'approved' && (
                  <div className="flex items-start gap-2 text-xs text-green-700 bg-green-50 p-3 rounded-md">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                    <p>
                      Your refund has been approved. The funds will be returned to your original payment method within 3-5 business days.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}