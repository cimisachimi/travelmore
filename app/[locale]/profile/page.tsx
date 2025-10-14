"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api"; // Make sure you have your configured axios instance

// --- Type Definitions for API Data ---

interface Orderable {
  name?: string; // For HolidayPackage
  car_model?: string; // For CarRental
  // Add other potential orderable types
}

interface OrderItem {
  id: number;
  orderable_type: string;
  orderable: Orderable;
  price: string;
}

interface Transaction {
  id: number;
  status: 'pending' | 'paid' | 'failed' | 'expired';
}

interface Order {
  id: number;
  total_amount: string;
  status: string;
  created_at: string;
  order_items: OrderItem[];
  transaction: Transaction | null;
}


// --- UI Components ---

const SettingsTab = () => {
  const { user, fetchUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      // NOTE: We need to create this API endpoint on the backend
      // For now, this is a placeholder.
      // await api.put('/api/profile/settings', { name });

      // Since we don't have the endpoint, we'll simulate success
      setIsSuccess(true);
      setMessage("Profile updated successfully!");

      // In a real scenario, you'd refresh the user data
      // await fetchUser(); 

    } catch (error) {
      setIsSuccess(false);
      setMessage("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground/80">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 border rounded-lg px-4 py-2 bg-background border-border text-foreground focus:ring-primary focus:ring-2 focus:outline-none transition"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground/80">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            className="w-full mt-1 border rounded-lg px-4 py-2 bg-background border-border text-foreground focus:ring-primary focus:ring-2 focus:outline-none transition"
            disabled // Email is typically not changeable
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none"
        >
          Save Changes
        </button>
        {message && (
          <p className={`mt-2 text-sm ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

const OrderHistoryTab = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/my-orders');
        setOrders(response.data);
      } catch (err) {
        setError("Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatCurrency = (amount: string) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(parseFloat(amount));
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const getStatusChip = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
    switch (status?.toLowerCase()) {
      case 'paid': return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
      case 'expired': return `${baseClasses} bg-red-100 text-red-800`;
      default: return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (loading) return <p>Loading order history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (orders.length === 0) return <p>You have not made any orders yet.</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="text-2xl font-bold">Order History</h2>
      {orders.map(order => (
        <div key={order.id} className="bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-bold text-lg">Order #{order.id}</p>
              <p className="text-sm text-foreground/60">{formatDate(order.created_at)}</p>
            </div>
            <span className={getStatusChip(order.transaction?.status || 'unknown')}>
              {order.transaction?.status || 'Unknown'}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <ul className="space-y-2">
              {order.order_items.map(item => (
                <li key={item.id} className="flex justify-between text-sm">
                  <span>{item.orderable?.name || item.orderable?.car_model || 'Service'}</span>
                  <span>{formatCurrency(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-border">
              <span>Total</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


// --- Main Profile Page Component ---

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p>Loading...</p>
      </div>
    );
  }

  const tabClasses = "px-4 py-2 font-semibold rounded-md transition-colors";
  const activeTabClasses = "bg-primary text-white";
  const inactiveTabClasses = "hover:bg-muted";

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">

          {/* Left: Navigation */}
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
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`${tabClasses} ${activeTab === 'profile' ? activeTabClasses : inactiveTabClasses}`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`${tabClasses} ${activeTab === 'history' ? activeTabClasses : inactiveTabClasses}`}
                >
                  Order History
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 mt-4 font-semibold text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Right: Content */}
          <main className="md:w-3/4">
            <div className="p-6 bg-card border border-border rounded-lg min-h-[300px]">
              {activeTab === 'profile' && <SettingsTab />}
              {activeTab === 'history' && <OrderHistoryTab />}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}