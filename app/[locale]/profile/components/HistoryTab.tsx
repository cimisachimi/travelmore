// app/[locale]/profile/components/HistoryTab.tsx

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Order } from "../types";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
  getStatusChip,
} from "@/lib/utils";
import OrderPaymentActions from "./OrderPaymentActions";
import { AxiosError } from "axios";
import { 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Plane, 
  MessageSquare, 
  Flag 
} from "lucide-react";

export default function HistoryTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  
  // State untuk menghandle accordion/expand detail
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useMidtransSnap(); 

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

  // Fungsi toggle untuk membuka/menutup detail
  const toggleDetails = (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handlePayment = async (
    order: Order,
    paymentOption: "down_payment" | "full_payment"
  ) => {
    if (isPaying) return;
    setIsPaying(true);

    if (!window.snap) {
      toast.error("Payment service is not loaded. Please refresh.");
      setIsPaying(false);
      return;
    }

    try {
      const response = await api.post(`/payment/create-transaction`, {
        order_id: order.id,
        payment_option: paymentOption,
      });

      const { snap_token } = response.data;

      if (!snap_token) {
        toast.error("Could not get payment token.");
        setIsPaying(false);
        return;
      }

      let paymentInProgress = true;

      window.snap.pay(snap_token, {
        onSuccess: () => {
          paymentInProgress = false;
          toast.success("Payment successful!");
          fetchData();
          setIsPaying(false);
        },
        onPending: () => {
          paymentInProgress = false;
          toast.info("Waiting for your payment.");
          setIsPaying(false);
        },
        onError: () => {
          paymentInProgress = false;
          toast.error("Payment failed. Please try again.");
          setIsPaying(false);
        },
        onClose: () => {
          setIsPaying(false);
          if (paymentInProgress) {
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
        "Could not initiate payment.";
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
        // Ambil details dari JSON column yang disimpan saat booking
        // @ts-expect-error: booking details might be any
        const details = booking?.details || {}; 

        const serviceName =
          bookable?.name ||
          `${bookable?.brand || ""} ${bookable?.car_model || ""}`.trim() ||
          "Service Details Unavailable";

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;
        const isExpanded = expandedOrderId === order.id;

        return (
          <div
            key={order.id}
            className="bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md"
          >
            {/* --- Header Section --- */}
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

            {/* --- Main Info --- */}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-semibold">{serviceName}</span>
                <span className="text-foreground/60 text-right">
                  {startDate
                    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                    : "N/A"}
                </span>
              </div>

              {/* Transaction Info (Last status) */}
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

              {/* --- Toggle Detail Button --- */}
              <button
                onClick={() => toggleDetails(order.id)}
                className="flex items-center text-sm text-primary font-medium hover:underline mb-3 focus:outline-none"
              >
                {isExpanded ? "Hide Details" : "View Booking Details"}
                {isExpanded ? (
                  <ChevronUp size={16} className="ml-1" />
                ) : (
                  <ChevronDown size={16} className="ml-1" />
                )}
              </button>

              {/* --- EXPANDED DETAILS SECTION --- */}
              {isExpanded && (
                <div className="bg-muted/30 rounded-md p-3 mb-4 text-sm space-y-2 border border-border animate-fadeIn">
                  <h4 className="font-semibold mb-2 border-b border-border pb-1">Guest Information</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Nama */}
                    <div className="flex items-start gap-2">
                        <User size={14} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <span className="block text-xs text-muted-foreground">Full Name</span>
                            <span className="font-medium">{details.full_name || "-"}</span>
                        </div>
                    </div>

                    {/* Nationality */}
                    <div className="flex items-start gap-2">
                        <Flag size={14} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <span className="block text-xs text-muted-foreground">Nationality</span>
                            <span className="font-medium">{details.participant_nationality || "-"}</span>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-2">
                        <Mail size={14} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <span className="block text-xs text-muted-foreground">Email</span>
                            <span className="font-medium truncate max-w-[150px]">{details.email || "-"}</span>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-2">
                        <Phone size={14} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <span className="block text-xs text-muted-foreground">Phone</span>
                            <span className="font-medium">{details.phone_number || "-"}</span>
                        </div>
                    </div>
                  </div>

                  <h4 className="font-semibold mt-4 mb-2 border-b border-border pb-1">Trip Logistics</h4>
                  <div className="space-y-2">
                     {/* Pickup */}
                     <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 text-muted-foreground" />
                        <div>
                            <span className="block text-xs text-muted-foreground">Pickup Location</span>
                            <span className="font-medium capitalize">{details.pickup_location || "-"}</span>
                        </div>
                    </div>

                    {/* Flight Number (Only show if exists) */}
                    {details.flight_number && (
                        <div className="flex items-start gap-2">
                            <Plane size={14} className="mt-0.5 text-muted-foreground" />
                            <div>
                                <span className="block text-xs text-muted-foreground">Flight Number</span>
                                <span className="font-medium">{details.flight_number}</span>
                            </div>
                        </div>
                    )}

                    {/* Special Request (Only show if exists) */}
                    {details.special_request && (
                        <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="mt-0.5 text-muted-foreground" />
                            <div>
                                <span className="block text-xs text-muted-foreground">Special Request</span>
                                <span className="font-medium italic">"{details.special_request}"</span>
                            </div>
                        </div>
                    )}
                  </div>
                  
                  {/* Pax Info */}
                  <div className="mt-2 text-xs text-right text-muted-foreground">
                    Participants: {details.adults || 0} Adults, {details.children || 0} Children
                  </div>
                </div>
              )}

              {/* Total Amount & Actions */}
              <div className="flex justify-between items-center font-bold text-lg pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>

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
        <h2 className="text-2xl font-bold">My Bookings</h2>
      </div>
      <div className="space-y-4">{renderOrderList()}</div>
    </div>
  );
}