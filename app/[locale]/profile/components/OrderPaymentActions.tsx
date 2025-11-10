"use client";

import { Order } from "../types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

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

  if (status === "pending" || status === "processing") {
    const isDeadlinePast =
      order.payment_deadline && new Date(order.payment_deadline) < new Date();

    if (isDeadlinePast) {
      return (
        <p className="text-sm text-red-500 mt-2">
          The payment deadline for this order has passed.
        </p>
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
        <div className="text-sm flex justify-between">
          <span className="text-foreground/80">Down Payment (50%):</span>
          <span className="font-semibold">
            {formatCurrency(order.down_payment_amount)}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onPay(order, "down_payment")}
            disabled={isPaying}
            className="flex-1 px-4 py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isPaying ? "Loading..." : "Pay 50% DP"}
          </button>
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