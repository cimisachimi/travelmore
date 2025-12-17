"use client";

import { Order } from "../types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface OrderPaymentActionsProps {
  order: Order;
  onPay: (order: Order, paymentOption: "down_payment" | "full_payment") => void;
  isPaying: boolean;
}

export default function OrderPaymentActions({
  order,
  onPay,
  isPaying,
}: OrderPaymentActionsProps) {
  const status = order.status;

  // ✅ ADDED: Identify if this is a Trip Planner order
  const isTripPlanner = order.booking?.bookable_type?.includes("TripPlanner");

  if (status === "pending" || status === "processing") {
    const isDeadlinePast =
      order.payment_deadline && new Date(order.payment_deadline) < new Date();

    if (isDeadlinePast) {
      return (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
           <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
           <div className="space-y-1">
              <p className="text-sm font-semibold text-red-700">Payment Deadline Passed</p>
              <p className="text-xs text-red-600/80">
                This order has passed its payment deadline and may be cancelled automatically. Please contact support if you need assistance.
              </p>
           </div>
        </div>
      );
    }

    return (
      <div className="mt-4 pt-4 border-t space-y-3">
        {order.payment_deadline && (
          <p className="text-sm text-center text-foreground/70">
            Please pay before:{" "}
            <span className="font-semibold">
              {formatDateTime(order.payment_deadline)}
            </span>
          </p>
        )}
        
        {/* ✅ CHANGED: Hide Down Payment info for Trip Planner */}
        {!isTripPlanner && (
          <div className="text-sm flex justify-between">
            <span className="text-foreground/80">Down Payment (50%):</span>
            <span className="font-semibold">
              {formatCurrency(order.down_payment_amount)}
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* ✅ CHANGED: Hide Down Payment button for Trip Planner */}
          {!isTripPlanner && (
            <button
              onClick={() => onPay(order, "down_payment")}
              disabled={isPaying}
              className="flex-1 px-4 py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isPaying ? "Loading..." : "Pay 50% DP"}
            </button>
          )}
          
          <button
            onClick={() => onPay(order, "full_payment")}
            disabled={isPaying}
            className="flex-1 px-4 py-2 font-semibold text-primary bg-secondary rounded-md hover:bg-secondary/90 disabled:opacity-50"
          >
            {isPaying ? "Loading..." : "Pay Full Amount"}
          </button>
        </div>
      </div>
    );
  }

  if (status === "partially_paid") {
    const total = parseFloat(order.total_amount);
    const paid = parseFloat(order.down_payment_amount || "0");
    const remaining = total - paid;

    return (
      <div className="mt-4 pt-4 border-t space-y-3">
        <div className="text-sm flex justify-between">
          <span className="text-foreground/80">Amount Paid:</span>
          <span className="font-semibold">{formatCurrency(paid)}</span>
        </div>
        <div className="text-sm flex justify-between">
          <span className="text-foreground/80">Remaining Balance:</span>
          <span className="font-semibold">{formatCurrency(remaining)}</span>
        </div>
        <button
          onClick={() => onPay(order, "full_payment")}
          disabled={isPaying}
          className="w-full px-4 py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isPaying ? "Loading..." : "Pay Remaining Balance"}
        </button>
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="mt-4 pt-4 border-t">
        <p className="text-center font-semibold text-green-600">
          This order is fully paid.
        </p>
      </div>
    );
  }

  if (status === "failed" || status === "expired" || status === "cancelled") {
    return (
      <div className="mt-4 pt-4 border-t">
        <p className="text-center font-semibold text-red-600 capitalize">
          Order {status}
        </p>
      </div>
    );
  }

  return null; // No actions for other states
}