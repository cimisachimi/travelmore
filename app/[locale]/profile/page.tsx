// app/[locale]/profile/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
// ✅ Correct import for locale-aware navigation
import { useRouter } from "@/i18n/navigation"; 
import { useSearchParams } from "next/navigation"; // ✅ ADD THIS
import { toast } from "sonner";

// Import components
import SettingsTab from "./components/SettingsTab";
import BookingsTab from "./components/BookingsTab";
import HistoryTab from "./components/HistoryTab";
import RefundsTab from "./components/RefundsTab";

// Define the available tabs
type ProfileTab = "profile" | "bookings" | "history" | "refunds";

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Get URL params
  
  const [activeTab, setActiveTab] = useState<ProfileTab>("profile");

  // ✅ NEW: Sync Tab with URL Parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["profile", "bookings", "history", "refunds"].includes(tabParam)) {
      setActiveTab(tabParam as ProfileTab);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    toast.info("You have been logged out.");
  };

  // ✅ OPTIONAL: Update URL when clicking tabs manually (so reloading keeps the tab)
  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    // Use window.history to update URL without full reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("tab", tab);
    window.history.pushState({}, "", newUrl);
  };

  // Show loading skeleton or spinner while checking auth
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Tab button styles
  const tabClasses =
    "px-4 py-2 font-semibold rounded-md transition-colors text-left w-full flex items-center gap-2";
  const activeTabClasses = "bg-primary text-primary-foreground";
  const inactiveTabClasses = "hover:bg-muted text-foreground/70";

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <SettingsTab />;
      
      case "bookings":
        return <BookingsTab />; 

      case "history":
        return <HistoryTab />;

      case "refunds":
        return <RefundsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
          {/* --- Sidebar --- */}
          <aside className="md:w-1/4">
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary text-2xl font-bold border-2 border-primary/20">
                  {user.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </div>
                <h2 className="mt-3 text-lg font-bold">{user.name}</h2>
                <p className="text-xs text-muted-foreground truncate max-w-[200px] mx-auto" title={user.email}>
                    {user.email}
                </p>
              </div>

              <nav className="flex flex-col space-y-1">
                <button
                  onClick={() => switchTab("profile")} // ✅ Updated to use switchTab
                  className={`${tabClasses} ${
                    activeTab === "profile"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  My Profile
                </button>
                <button
                  onClick={() => switchTab("bookings")} // ✅ Updated
                  className={`${tabClasses} ${
                    activeTab === "bookings"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => switchTab("history")} // ✅ Updated
                  className={`${tabClasses} ${
                    activeTab === "history"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  Purchase History
                </button>
                <button
                  onClick={() => switchTab("refunds")} // ✅ Updated
                  className={`${tabClasses} ${
                    activeTab === "refunds"
                      ? activeTabClasses
                      : inactiveTabClasses
                  }`}
                >
                  My Refunds
                </button>
                
                <div className="pt-4 mt-2 border-t border-border">
                    <button
                    onClick={handleLogout}
                    className="px-4 py-2 font-semibold text-red-600 rounded-md hover:bg-red-50 transition-colors text-left w-full flex items-center gap-2"
                    >
                    Logout
                    </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* --- Main Content Area --- */}
          <main className="md:w-3/4">
            <div className="p-6 bg-card border border-border rounded-xl shadow-sm min-h-[500px]">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}