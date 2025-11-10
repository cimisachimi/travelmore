"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Order } from "../types"; // Assumes types.ts is in ../types
import { useMidtransSnap } from "@/hooks/useMidtransSnap"; // Assumes hook is in @/hooks
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusChip,
} from "@/lib/utils"; // Assumes utils are in @/lib/utils
import OrderPaymentActions from "./OrderPaymentActions";
import { AxiosError } from "axios";

export default function HistoryTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useMidtransSnap(); // Load Midtrans script

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersResponse = await api.get("/my-orders");
      setOrders(ordersResponse.data);
    } catch (err) {
      setError("Failed to fetch history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ This is the "perfect" handlePayment function from your file
  const handlePayment = async (
    order: Order,
    paymentOption: "down_payment" | "full_payment"
  ) => {
    if (isPaying) return;
    setIsPaying(true);

    if (!window.snap) {
      toast.error("Payment service is not loaded. Please refresh.");
      console.error("CRITICAL: window.snap is not defined!");
      setIsPaying(false);
      return;
    }

    try {
      // 1. Call your backend to get the snap_token
      const response = await api.post(`/payment/create-transaction`, {
        order_id: order.id,
        payment_option: paymentOption,
      });

      const { snap_token } = response.data;

      // 2. Check if we got a valid snap_token
      if (!snap_token) {
        toast.error("Could not get payment token from server.");
        console.error("API Error: snap_token is null or undefined.", response.data);
        setIsPaying(false);
        return;
      }

      // This flag prevents the 'onClose' toast from firing
      // if 'onSuccess', 'onPending', or 'onError' has already fired.
      let paymentInProgress = true; 

      // 3. Use window.snap.pay to open the Midtrans popup
      window.snap.pay(snap_token, {
        onSuccess: () => {
          paymentInProgress = false; // Mark payment as completed
          toast.success("Payment successful!");
          fetchData();
          setIsPaying(false);
        },
        onPending: () => {
          paymentInProgress = false; // Mark payment as completed
          toast.info("Waiting for your payment.");
          setIsPaying(false);
        },
        onError: () => {
          paymentInProgress = false; // Mark payment as completed
          toast.error("Payment failed. Please try again.");
          setIsPaying(false);
        },
        onClose: () => {
          setIsPaying(false); // Always set paying to false
          if (paymentInProgress) {
            // Only show "closed" if the user *only* closed the popup
            toast.info("Payment popup closed.");
          }
        },
      });

    } catch (err: unknown) {
      console.error("Payment initiation error:", err);

      const axiosErr = err as AxiosError<{ message?: string }>;
      const message =
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        "Could not initiate payment. Please try again.";

      toast.error(message);
      setIsPaying(false);
    }
  };

  const renderOrderList = () =>
    !orders || orders.length === 0 ? (
      <p>You have no orders yet.</p>
    ) : (
      orders.map((order) => {
        const { booking } = order;
        const bookable = booking?.bookable;
        const serviceName =
          bookable?.name || // For Holiday Packages
          `${bookable?.brand || ""} ${bookable?.car_model || ""}`.trim() || // For Cars
          "Service Details Unavailable";

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;

        return (
          <div
            key={order.id}
            className="bg-card border border-border rounded-lg p-4 transition-shadow hover:shadow-md"
          >
            {/* Order Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-lg">Order #{order.order_number}</p>
                <p className="text-sm text-foreground/60">
                  Ordered on {formatDate(order.created_at)}
                </p>
              </div>
              <span className={getStatusChip(order.status)}>
                {order.status.replace("_", " ")}
              </span>
            </div>

            {/* Booking Details */}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-semibold">{serviceName}</span>
                <span className="text-foreground/60 text-right">
                  {startDate
                    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                    : "N/A"}
                </span>
              </div>

              {/* Transaction Info */}
              {order.transactions?.length > 0 && (
                <div className="text-xs text-foreground/60 flex justify-between mb-3">
                  <span>
                    Last Txn:{" "}
                    {order.transactions[
                      order.transactions.length - 1
                    ].payment_type?.replace(/_/g, " ")}
                  </span>
                  <span
                    className={getStatusChip(
                      order.transactions[order.transactions.length - 1].status
                    )}
                  >
                    {order.transactions[order.transactions.length - 1].status}
                  </span>
                </div>
              )}

              {/* Total Amount */}
              <div className="flex justify-between items-center font-bold text-lg pt-3 border-t">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>

              {/* Payment Actions */}
              <OrderPaymentActions
                order={order}
                onPay={handlePayment}
                isPaying={isPaying}
              />
            </div>
          </div>
        );
      })
    );

  if (loading) return <p>Loading your history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase History</h2>
      </div>
      <div className="space-y-4">{renderOrderList()}</div>
    </div>
  );
}