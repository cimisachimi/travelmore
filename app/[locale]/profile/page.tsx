"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner"; // Using sonner for toasts
import { AxiosError } from "axios";
// --- Midtrans Global Type ---
interface MidtransResult {
  order_id?: string;
  transaction_status?: string;
  transaction_id?: string;
  payment_type?: string;
  gross_amount?: string;
  status_message?: string;
}

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: MidtransResult) => void;
          onPending?: (result: MidtransResult) => void;
          onError?: (result: MidtransResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

// --- Type Definitions (Refactored) ---
interface Bookable {
  id: number;
  brand?: string;
  car_model?: string;
  name?: string; // For other types like HolidayPackage
}

// Represents the booking data nested inside an order
interface SimpleBooking {
  id: number;
  total_price: string;
  status: "pending" | "confirmed" | "cancelled" | "processing";
  payment_status: "unpaid" | "pending" | "partial" | "paid";
  start_date: string | null; // Correctly placed at top level
  end_date: string | null; // Correctly placed at top level
  bookable: Bookable | null;
}

interface Transaction {
  id: number;
  payment_type: string;
  status: "pending" | "settlement" | "failed" | "expire";
  notes: string | null; // e.g., 'down_payment'
  gross_amount: string;
}

// ✅ NEW: Updated Order interface
type OrderStatus =
  | "pending"
  | "processing"
  | "partially_paid"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled";

interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: string;
  down_payment_amount: string | null; // ✅ ADDED
  payment_deadline: string | null; // ✅ ADDED
  created_at: string;
  booking: SimpleBooking | null;
  transactions: Transaction[]; // ✅ CHANGED: from singular 'transaction'
}

// --- Midtrans Snap Script Loader Hook ---
const useMidtransSnap = () => {
  useEffect(() => {
    const snapScript =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      console.error("Midtrans client key is not set in environment variables.");
      return;
    }
    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
};

// --- Helper Functions ---
const formatCurrency = (amount: string | number | null) => {
  if (amount === null || amount === undefined) return "N/A";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};
// ✅ Allow 'undefined' in the type signature
const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A"; // This check already handles null and undefined
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusChip = (status: string) => {
  const s = status?.toLowerCase() || "pending";
  const classes = "px-2 py-1 text-xs font-semibold rounded-full capitalize";
  if (s === "paid" || s === "settlement" || s === "confirmed")
    return `${classes} bg-green-100 text-green-800`;
  if (s === "pending" || s === "processing")
    return `${classes} bg-yellow-100 text-yellow-800`;
  if (s === "partially_paid")
    return `${classes} bg-blue-100 text-blue-800`;
  return `${classes} bg-red-100 text-red-800`;
};

// --- ✅ NEW: OrderPaymentActions Component ---
const OrderPaymentActions = ({
  order,
  onPay,
  isPaying,
}: {
  order: Order;
  onPay: (order: Order, paymentOption: "down_payment" | "full_payment") => void;
  isPaying: boolean;
}) => {
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
};

// --- History Tab Component (Refactored) ---
const HistoryTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  useMidtransSnap(); // Load Midtrans script

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Only fetch orders, as they contain all needed data
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

  // ✅ REFACTORED: handlePayment function
  const handlePayment = async (
    order: Order,
    paymentOption: "down_payment" | "full_payment"
  ) => {
    if (isPaying) return;
    setIsPaying(true);

    // --- DEBUGGING ---
    console.log("Payment initiated for Order ID:", order.id, "Option:", paymentOption);

    // ✅ CHECK 1: Is Midtrans script loaded?
    if (!window.snap) {
      toast.error("Payment service is not loaded. Please refresh.");
      console.error("CRITICAL: window.snap is not defined!");
      setIsPaying(false);
      return;
    }
    // --- END DEBUGGING ---

    try {
      // 1. Call your backend to get the snap_token
      const response = await api.post(`/payment/create-transaction`, {
        order_id: order.id,
        payment_option: paymentOption,
      });

      // --- DEBUGGING ---
      console.log("API Response:", response.data);
      // --- END DEBUGGING ---

      const { snap_token } = response.data;

      // ✅ CHECK 2: Did we get a valid snap_token?
      if (!snap_token) {
        toast.error("Could not get payment token from server.");
        console.error("API Error: snap_token is null or undefined.", response.data);
        setIsPaying(false);
        return;
      }

      // 2. Use window.snap.pay to open the Midtrans popup
      window.snap.pay(snap_token, {
        onSuccess: (_result) => {
          toast.success("Payment successful!");
          fetchData();
          setIsPaying(false);
        },
        onPending: (_result) => {
          toast.info("Waiting for your payment.");
          setIsPaying(false);
        },
        onError: (_result) => {
          toast.error("Payment failed. Please try again.");
          setIsPaying(false);
        },

        onClose: () => {
          toast.info("Payment popup closed.");
          setIsPaying(false); // ✅ Moved here
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

              {/* Transaction Info (optional) */}
              {/* ✅ FIXED: Added optional chaining '?' */}
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
        {/* Removed the Simple/Detailed toggle */}
      </div>
      {renderOrderList()}
    </div>
  );
};

// --- Settings Tab Component (Unchanged) ---
const SettingsTab = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");

  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    toast.info("Profile update functionality not yet implemented.");
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 border rounded-lg px-4 py-2 bg-background"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full mt-1 border rounded-lg px-4 py-2 bg-muted/50 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white bg-primary rounded-md"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

// --- Main Profile Page Component (Unchanged) ---
export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "history">("profile");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const tabClasses =
    "px-4 py-2 font-semibold rounded-md transition-colors text-left w-full";
  const activeTabClasses = "bg-primary text-primary-foreground";
  const inactiveTabClasses = "hover:bg-muted";

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-center mb-4">
                <div className="w-24 h-24 rounded-full bg-primary mx-auto flex items-center justify-center text-white text-4xl font-bold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <h2 className="mt-3 text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-foreground/60">{user.email}</p>
              </div>
              <nav className="flex flex-col space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`${tabClasses} ${activeTab === "profile"
                    ? activeTabClasses
                    : inactiveTabClasses
                    }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`${tabClasses} ${activeTab === "history"
                    ? activeTabClasses
                    : inactiveTabClasses
                    }`}
                >
                  Purchase History
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 mt-4 font-semibold text-red-500 rounded-md hover:bg-red-500/10 transition-colors text-left w-full"
                >
                  Logout
                </button>
              </nav>
            </div>
          </aside>
          <main className="md:w-3/4">
            <div className="p-6 bg-card border border-border rounded-lg min-h-[300px]">
              {activeTab === "profile" && <SettingsTab />}
              {activeTab === "history" && <HistoryTab />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}