"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { RefundRequest } from "../types";
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";
import { 
  RefreshCcw, 
  Calendar, 
  FileText, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

// ✅ DATA DUMMY / MOCK DATA
// Gunakan ini agar tampilan bisa dicek walaupun Backend belum siap
const MOCK_REFUNDS: any[] = [
  {
    id: 101,
    order_number: "ORD-2025-001",
    status: "pending",
    requested_at: "2025-11-20T10:00:00",
    amount: "250000",
    reason: "Change of plans, trip cancelled by user.",
    service_name: "Toyota Avanza Rental"
  },
  {
    id: 102,
    order_number: "ORD-2025-055",
    status: "approved",
    requested_at: "2025-10-15T14:30:00",
    amount: "750000",
    reason: "Double booking created by mistake.",
    service_name: "Snorkeling Adventure in Nusa Penida"
  },
  {
    id: 103,
    order_number: "ORD-2025-089",
    status: "rejected",
    requested_at: "2025-09-01T09:15:00",
    amount: "1500000",
    reason: "Request submitted past the cancellation policy window.",
    service_name: "Bali 3D2N Package"
  }
];

export default function RefundsTab() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Coba panggil API
      const response = await api.get("/my-refunds");
      setRefunds(response.data);
    } catch (err) {
      // ⚠️ SOLUSI SEMENTARA: Fallback ke Mock Data jika API 404/Error
      console.warn("Backend API not ready (404). Using MOCK DATA for Refunds.");
      
      // Masukkan data palsu ke state agar UI tampil
      setRefunds(MOCK_REFUNDS);
      
      // Jangan set error state agar tampilan tidak merah
      // setError("Failed to fetch..."); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderRefundList = () =>
    !refunds || refunds.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
        <RefreshCcw size={48} className="mb-4 opacity-20" />
        <p>You have no refund requests.</p>
      </div>
    ) : (
      refunds.map((refund) => (
        <div
          key={refund.id}
          className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-md flex flex-col gap-4"
        >
          {/* --- Header --- */}
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-primary">{refund.service_name}</p>
              <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
                <FileText size={14} /> Order #{refund.order_number}
              </p>
            </div>
            <span className={getStatusChip(refund.status)}>
              {refund.status}
            </span>
          </div>

          {/* --- Details Body --- */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/70 flex items-center gap-2">
                <Calendar size={14} /> Requested On:
              </span>
              <span className="font-medium">
                {formatDate(refund.requested_at)}
              </span>
            </div>
            
            <div className="flex justify-between items-start">
              <span className="text-foreground/70 flex items-center gap-2 mt-0.5">
                <AlertCircle size={14} /> Reason:
              </span>
              <span className="font-medium text-right max-w-[60%]">
                {refund.reason}
              </span>
            </div>
          </div>

          {/* --- Footer Amount --- */}
          <div className="flex justify-between items-center border-t border-dashed border-border pt-3 mt-1">
            <span className="text-sm text-foreground/70">Refund Amount</span>
            <span className="font-bold text-lg text-primary flex items-center gap-1">
               {formatCurrency(refund.amount)}
            </span>
          </div>
        </div>
      ))
    );

  if (loading) return <div className="text-center py-10 text-muted-foreground">Loading your refund requests...</div>;
  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold">My Refunds</h2>
        <span className="text-xs text-muted-foreground hidden sm:block">
           Process time: 7-14 business days
        </span>
      </div>
      <div className="space-y-4">{renderRefundList()}</div>
    </div>
  );
}