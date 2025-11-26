// app/[locale]/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Import components
import SettingsTab from "./components/SettingsTab";
import BookingsTab from "./components/Booking/BookingsTab";
import HistoryTab from "./components/HistoryTab";
import RefundsTab from "./components/RefundsTab";

// Define the available tabs
type ProfileTab = "profile" | "bookings" | "history" | "refunds";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    toast.info("You have been logged out.");
  };

  // Show loading skeleton or spinner while checking auth
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Tab button styles
  const tabClasses =
    "px-4 py-2 font-semibold rounded-md transition-colors text-left w-full";
  const activeTabClasses = "bg-primary text-primary-foreground";
  const inactiveTabClasses = "hover:bg-muted";

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <SettingsTab />;
      
      
      case "bookings":
        return <HistoryTab />;

     
      case "history":
        return <BookingsTab />;

      case "refunds":
        return <RefundsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
          {/* --- Sidebar --- */}
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
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 mt-4 font-semibold text-red-500 rounded-md hover:bg-red-500/10 transition-colors text-left w-full"
                >
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* --- Main Content Area --- */}
          <main className="md:w-3/4">
            <div className="p-6 bg-card border border-border rounded-lg min-h-[300px]">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}