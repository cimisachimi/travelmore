"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { RefundRequest } from "../types";
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";

export default function RefundsTab() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/my-refunds");
      setRefunds(response.data);
    } catch (err) {
      setError("Failed to fetch your refund requests.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderRefundList = () =>
    !refunds || refunds.length === 0 ? (
      <p>You have no refund requests.</p>
    ) : (
      refunds.map((refund) => (
        <div
          key={refund.id}
          className="bg-card border border-border rounded-lg p-4 transition-shadow hover:shadow-md"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-lg">{refund.service_name}</p>
              <p className="text-sm text-foreground/60">
                Order #{refund.order_number}
              </p>
            </div>
            <span className={getStatusChip(refund.status)}>
              {refund.status}
            </span>
          </div>
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/80">Requested On:</span>
              <span className="font-semibold">
                {formatDate(refund.requested_at)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-foreground/80">Reason:</span>
              <span className="font-semibold text-right truncate">
                {refund.reason}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1 font-bold">
              <span className="text-foreground/80">Refund Amount:</span>
              <span>{formatCurrency(refund.amount)}</span>
            </div>
          </div>
        </div>
      ))
    );

  if (loading) return <p>Loading your refund requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Refunds</h2>
      </div>
      <div className="space-y-4">{renderRefundList()}</div>
    </div>
  );
}