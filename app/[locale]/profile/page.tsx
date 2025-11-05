"use client";

import { useState, useEffect, FormEvent } from "react";
// import { useAuth } from "@/contexts/AuthContext"; // Dihapus: Akan menggunakan mock
// import { useRouter } from "next/navigation"; // Dihapus: Akan menggunakan mock
// import api from "@/lib/api"; // Dihapus: Akan menggunakan mock
import { toast } from "sonner"; // Using sonner for toasts
// import { AxiosError } from "axios"; // Dihapus: Akan menggunakan 'unknown'

// --- ✅ MOCK IMPLEMENTATIONS ---
// Ini adalah data dan fungsi palsu untuk menggantikan import yang gagal
// dalam lingkungan ini, agar kode bisa berjalan.

const useAuth = () => ({
  user: {
    name: "ipul",
    email: "adamhuzain1@gmail.com",
  },
  loading: false,
  logout: () => {
    toast.info("Logout clicked!");
    console.log("User logged out");
  },
});

const useRouter = () => ({
  push: (path: string) => {
    toast.info(`Navigating to ${path}`);
    console.log(`Routing to ${path}`);
  },
});

// --- Type Definitions (Refactored) ---
// (Definisi tipe tetap sama)
interface Bookable {
  id: number;
  brand?: string;
  car_model?: string;
  name?: string; // For other types like HolidayPackage
}
interface SimpleBooking {
  id: number;
  total_price: string;
  status: "pending" | "confirmed" | "cancelled" | "processing";
  payment_status: "unpaid" | "pending" | "partial" | "paid";
  start_date: string | null;
  end_date: string | null;
  bookable: Bookable | null;
}
interface Transaction {
  id: number;
  payment_type: string;
  status: "pending" | "settlement" | "failed" | "expire";
  notes: string | null;
  gross_amount: string;
}
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
  down_payment_amount: string | null;
  payment_deadline: string | null;
  created_at: string;
  booking: SimpleBooking | null;
  transactions: Transaction[];
}

// ✅ --- NEW: Tipe untuk Refund ---
type RefundStatus = "pending" | "approved" | "rejected";
interface RefundRequest {
  id: number;
  order_number: string;
  status: RefundStatus;
  requested_at: string;
  amount: string;
  reason: string;
  service_name: string;
}

// --- Mock Data ---
const mockBookings: SimpleBooking[] = [
  {
    id: 1,
    total_price: "1500000",
    status: "confirmed",
    payment_status: "paid",
    start_date: "2025-11-10",
    end_date: "2025-11-12",
    bookable: { id: 1, name: "Paket Liburan 3 Hari 2 Malam Jogja" },
  },
  {
    id: 2,
    total_price: "500000",
    status: "pending",
    payment_status: "unpaid",
    start_date: "2025-12-01",
    end_date: "2025-12-01",
    bookable: { id: 2, brand: "Toyota", car_model: "Avanza" },
  },
  {
    id: 3,
    total_price: "750000",
    status: "cancelled",
    payment_status: "unpaid",
    start_date: "2025-11-20",
    end_date: "2025-11-21",
    bookable: { id: 3, name: "Tur Candi Prambanan & Ratu Boko" },
  },
];

const mockOrders: Order[] = [
  {
    id: 1,
    order_number: "INV-2025-001",
    status: "paid",
    total_amount: "1500000",
    down_payment_amount: "750000",
    payment_deadline: null,
    created_at: "2025-11-01T10:00:00Z",
    booking: mockBookings[0],
    transactions: [
      {
        id: 1,
        payment_type: "bank_transfer",
        status: "settlement",
        notes: "full_payment",
        gross_amount: "1500000",
      },
    ],
  },
  {
    id: 2,
    order_number: "INV-2025-002",
    status: "pending",
    total_amount: "500000",
    down_payment_amount: "250000",
    payment_deadline: "2025-12-01T12:00:00Z",
    created_at: "2025-11-05T10:00:00Z",
    booking: mockBookings[1],
    transactions: [],
  },
  {
    id: 3,
    order_number: "INV-2025-003",
    status: "cancelled",
    total_amount: "750000",
    down_payment_amount: "375000",
    payment_deadline: null,
    created_at: "2025-11-02T10:00:00Z",
    booking: mockBookings[2],
    transactions: [],
  },
];

// ✅ --- NEW: Mock Data untuk Refund ---
const mockRefunds: RefundRequest[] = [
  {
    id: 1,
    order_number: "INV-2025-003",
    status: "approved",
    requested_at: "2025-11-03T10:00:00Z",
    amount: "750000",
    reason: "Trip cancelled by user.",
    service_name: "Tur Candi Prambanan & Ratu Boko",
  },
  {
    id: 2,
    order_number: "INV-2025-001",
    status: "pending",
    requested_at: "2025-11-04T10:00:00Z",
    amount: "1500000",
    reason: "Unexpected change of plans.",
    service_name: "Paket Liburan 3 Hari 2 Malam Jogja",
  },
];

const api = {
  get: async (url: string) => {
    console.log(`Mock GET: ${url}`);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulasi loading
    if (url === "/my-profile") {
      return Promise.resolve({
        data: {
          name: "ipul",
          full_name: "Adam Ipul Huzain",
          phone_number: "08123456789",
          nationality: "WNI",
        },
      });
    }
    if (url === "/my-orders") {
      return Promise.resolve({ data: mockOrders });
    }
    if (url === "/my-bookings") {
      return Promise.resolve({ data: mockBookings });
    }
    // ✅ --- NEW: Endpoint untuk Refund ---
    if (url === "/my-refunds") {
      return Promise.resolve({ data: mockRefunds });
    }
    return Promise.resolve({ data: [] });
  },
  post: async (url: string, data: any) => {
    console.log(`Mock POST: ${url}`, data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (url.includes("/payment/create-transaction")) {
      return Promise.resolve({ data: { snap_token: "mock-snap-token-123" } });
    }
    return Promise.resolve({ data: {} });
  },
  put: async (url: string, data: any) => {
    console.log(`Mock PUT: ${url}`, data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return Promise.resolve({ data: { message: "Profile updated" } });
  },
};

// --- END OF MOCK IMPLEMENTATIONS ---

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

// --- Midtrans Snap Script Loader Hook ---
const useMidtransSnap = () => {
  useEffect(() => {
    const snapScript =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

    const clientKey =
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-dummy-key"; // Fallback key
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
  if (s === "paid" || s === "settlement" || s === "confirmed" || s === "approved") // Ditambah 'approved'
    return `${classes} bg-green-100 text-green-800`;
  if (s === "pending" || s === "processing")
    return `${classes} bg-yellow-100 text-yellow-800`;
  if (s === "partially_paid")
    return `${classes} bg-blue-100 text-blue-800`;
  return `${classes} bg-red-100 text-red-800`; // Gagal, expired, cancelled, rejected
};

// --- OrderPaymentActions Component ---
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

// --- History Tab Component ---
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

  const handlePayment = async (
    order: Order,
    paymentOption: "down_payment" | "full_payment"
  ) => {
    if (isPaying) return;
    setIsPaying(true);

    console.log(
      "Payment initiated for Order ID:",
      order.id,
      "Option:",
      paymentOption
    );

    if (!window.snap) {
      toast.error("Payment service is not loaded. Please refresh.");
      console.error("CRITICAL: window.snap is not defined!");
      setIsPaying(false);
      return;
    }

    try {
      const response = await api.post(`/payment/create-transaction`, {
        order_id: order.id,
        payment_option: paymentOption,
      });

      console.log("API Response:", response.data);
      const { snap_token } = response.data;

      if (!snap_token) {
        toast.error("Could not get payment token from server.");
        console.error(
          "API Error: snap_token is null or undefined.",
          response.data
        );
        setIsPaying(false);
        return;
      }

      window.snap.pay(snap_token, {
        onSuccess: () => {
          toast.success("Payment successful!");
          fetchData();
          setIsPaying(false);
        },
        onPending: () => {
          toast.info("Waiting for your payment.");
          setIsPaying(false);
        },
        onError: () => {
          toast.error("Payment failed. Please try again.");
          setIsPaying(false);
        },
        onClose: () => {
          toast.info("Payment popup closed.");
          setIsPaying(false);
        },
      });
    } catch (err: unknown) {
      console.error("Payment initiation error:", err);
      const axiosErr = err as any; // Disederhanakan
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
      {renderOrderList()}
    </div>
  );
};

// --- Settings Tab Component ---
const SettingsTab = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationality, setNationality] = useState<"WNI" | "WNA" | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/my-profile");
        const profile = response.data;
        setName(profile.name || user?.name || "");
        setFullName(profile.full_name || "");
        setPhoneNumber(profile.phone_number || "");
        setNationality(profile.nationality || "");
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load your profile data.");
        setName(user?.name || "");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const toastId = toast.loading("Saving your profile...");
    const profileData = {
      name: name,
      full_name: fullName,
      phone_number: phoneNumber,
      nationality: nationality,
    };

    try {
      await api.put("/my-profile", profileData);
      toast.success("Profile updated successfully!", { id: toastId });
    } catch (err: unknown) {
      console.error("Failed to update profile", err);
      const axiosErr = err as any; // Disederhanakan
      const message =
        axiosErr.response?.data?.message ?? "Failed to save profile.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <p>Loading your profile...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <fieldset disabled={isSaving} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium">
              Name (Display Name)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 border rounded-lg px-4 py-2 bg-background disabled:opacity-70"
            />
          </div>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium">
              Full Name (as per KTP/Passport)
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 border rounded-lg px-4 py-2 bg-background disabled:opacity-70"
              placeholder="Your full legal name"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">
              Phone Number / WhatsApp
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full mt-1 border rounded-lg px-4 py-2 bg-background disabled:opacity-70"
              placeholder="e.g., 08123456789"
            />
          </div>
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium">
              Nationality
            </label>
            <select
              id="nationality"
              value={nationality}
              onChange={(e) =>
                setNationality(e.target.value as "WNI" | "WNA" | "")
              }
              className="w-full mt-1 border rounded-lg px-4 py-2 bg-background disabled:opacity-70"
            >
              <option value="" disabled>
                Select your nationality
              </option>
              <option value="WNI">WNI (Indonesian Citizen)</option>
              <option value="WNA">WNA (Foreign Citizen)</option>
            </select>
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
            disabled={isSaving}
            className="px-4 py-2 font-medium text-white bg-primary rounded-md disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

// --- Bookings Tab Component ---
const BookingsTab = () => {
  const [bookings, setBookings] = useState<SimpleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/my-bookings");
      setBookings(response.data);
    } catch (err) {
      setError("Failed to fetch your bookings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderBookingList = () =>
    !bookings || bookings.length === 0 ? (
      <p>You have no active bookings.</p>
    ) : (
      bookings.map((booking) => {
        const bookable = booking?.bookable;
        const serviceName =
          bookable?.name || // Untuk Holiday Packages
          `${bookable?.brand || ""} ${bookable?.car_model || ""}`.trim() || // Untuk Mobil
          "Service Details Unavailable";

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;

        return (
          <div
            key={booking.id}
            className="bg-card border border-border rounded-lg p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-lg">{serviceName}</p>
                <p className="text-sm text-foreground/60">
                  {startDate
                    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                    : "N/A"}
                </p>
              </div>
              <span className={getStatusChip(booking.status)}>
                {booking.status}
              </span>
            </div>
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground/80">Booking Status:</span>
                <span className="font-semibold capitalize">{booking.status}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-foreground/80">Payment Status:</span>
                <span className="font-semibold capitalize">
                  {booking.payment_status.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-foreground/80">Total Price:</span>
                <span className="font-semibold">
                  {formatCurrency(booking.total_price)}
                </span>
              </div>
            </div>
          </div>
        );
      })
    );

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Bookings</h2>
      </div>
      <div className="space-y-4">{renderBookingList()}</div>
    </div>
  );
};

// --- ✅ --- NEW: Refunds Tab Component --- ✅ ---
const RefundsTab = () => {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/my-refunds"); // Endpoint baru
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
};
// --- END OF RefundsTab ---

// --- Main Profile Page Component ---
export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  // ✅ MODIFIED: Menambahkan "refunds" ke tipe state
  const [activeTab, setActiveTab] = useState<
    "profile" | "bookings" | "history" | "refunds"
  >("profile");

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
                  className={`${tabClasses} ${
                    activeTab === "profile"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`${tabClasses} ${
                    activeTab === "bookings"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`${tabClasses} ${
                    activeTab === "history"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  Purchase History
                </button>
                {/* --- ✅ ADDED: Tombol My Refunds --- */}
                <button
                  onClick={() => setActiveTab("refunds")}
                  className={`${tabClasses} ${
                    activeTab === "refunds"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  My Refunds
                </button>
                {/* --- END OF ADDED SECTION --- */}
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
              {activeTab === "bookings" && <BookingsTab />}
              {activeTab === "history" && <HistoryTab />}
              {/* --- ✅ ADDED: Render Logic untuk RefundsTab --- */}
              {activeTab === "refunds" && <RefundsTab />}
              {/* --- END OF ADDED SECTION --- */}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}