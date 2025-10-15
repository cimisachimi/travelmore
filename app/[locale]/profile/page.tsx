"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// --- Type Definitions ---
interface Bookable {
  brand?: string;
  car_model?: string;
  name?: string;
}
interface Booking {
  id: number;
  total_price: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'settlement';
  booking_date: string;
  bookable: Bookable | null;
  details: {
    start_date: string;
    end_date: string;
  } | null;
}

// --- Midtrans Snap Script Loader Hook ---
const useMidtransSnap = () => {
  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
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

// --- Booking History Tab Component ---
const BookingHistoryTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useMidtransSnap();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings');
      console.log("API Response for Bookings:", response.data);
      setBookings(response.data);
    } catch (err) {
      setError("Failed to fetch booking history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePay = async (bookingId: number) => {
    try {
      const response = await api.post(`/payment/token`, {
        booking_id: bookingId
      });
      const { snap_token } = response.data;
      if (!snap_token) {
        alert("Could not get payment token. Please try again.");
        return;
      }
      (window as any).snap.pay(snap_token, {
        onSuccess: () => {
          alert("Payment successful!");
          fetchBookings();
        },
        onPending: () => alert("Waiting for your payment!"),
        onError: () => alert("Payment failed!"),
      });
    } catch (error) {
      console.error("Payment initiation error:", error);
      alert("Could not initiate payment. Please try again.");
    }
  };

  const formatCurrency = (amount: string) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(parseFloat(amount));
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const getStatusChip = (status: string) => {
    const s = status?.toLowerCase() || 'pending';
    const classes = "px-2 py-1 text-xs font-semibold rounded-full capitalize";
    if (s === 'paid' || s === 'settlement' || s === 'confirmed') return `${classes} bg-green-100 text-green-800`;
    if (s === 'pending') return `${classes} bg-yellow-100 text-yellow-800`;
    return `${classes} bg-red-100 text-red-800`;
  };

  if (loading) return <p>Loading booking history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!bookings || bookings.length === 0) return <p>You have no bookings yet.</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="text-2xl font-bold">Booking History</h2>
      {bookings.map(booking => (
        <div key={booking.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-lg">Booking #{booking.id}</p>
              <p className="text-sm text-foreground/60">
                {booking.details ? `${formatDate(booking.details.start_date)} - ${formatDate(booking.details.end_date)}` : 'Date not available'}
              </p>
            </div>
            <span className={getStatusChip(booking.payment_status)}>
              {booking.payment_status}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-sm mb-3">
              <span className="font-semibold">{booking.bookable?.name || `${booking.bookable?.brand || ''} ${booking.bookable?.car_model || ''}`.trim() || 'Service'}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-lg pt-3 border-t">
              <span>Total</span>
              <span>{formatCurrency(booking.total_price)}</span>
            </div>
            {booking.payment_status !== 'paid' && booking.payment_status !== 'settlement' && (
              <div className="mt-4 text-right">
                <button onClick={() => handlePay(booking.id)} className="px-4 py-2 font-semibold text-white bg-primary rounded-md hover:bg-primary/90">
                  Pay Now
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Settings Tab Component ---
const SettingsTab = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");

  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    alert("Profile update functionality not yet implemented.");
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 border rounded-lg px-4 py-2 bg-background" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input id="email" type="email" value={user?.email || ""} disabled className="w-full mt-1 border rounded-lg px-4 py-2 bg-muted/50" />
        </div>
        <button type="submit" className="px-4 py-2 font-medium text-white bg-primary rounded-md">Save Changes</button>
      </form>
    </div>
  );
};

// --- Main Profile Page Component ---
export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>('profile');

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;
  }

  const tabClasses = "px-4 py-2 font-semibold rounded-md transition-colors text-left w-full";
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
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <h2 className="mt-3 text-xl font-bold">{user.name}</h2>
                <p className="text-sm text-foreground/60">{user.email}</p>
              </div>
              <nav className="flex flex-col space-y-2">
                <button onClick={() => setActiveTab('profile')} className={`${tabClasses} ${activeTab === 'profile' ? activeTabClasses : inactiveTabClasses}`}>My Profile</button>
                <button onClick={() => setActiveTab('bookings')} className={`${tabClasses} ${activeTab === 'bookings' ? activeTabClasses : inactiveTabClasses}`}>Booking History</button>
                <button onClick={logout} className="px-4 py-2 mt-4 font-semibold text-red-500 rounded-md hover:bg-red-500/10 transition-colors text-left w-full">Logout</button>
              </nav>
            </div>
          </aside>
          <main className="md:w-3/4">
            <div className="p-6 bg-card border border-border rounded-lg min-h-[300px]">
              {activeTab === 'profile' && <SettingsTab />}
              {activeTab === 'bookings' && <BookingHistoryTab />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}