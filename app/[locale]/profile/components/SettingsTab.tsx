"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

export default function SettingsTab() {
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
        // Assume /my-profile returns data for the form
        const response = await api.get("/my-profile");
        const profile = response.data;
        setName(profile.name || user?.name || "");
        setFullName(profile.full_name || "");
        setPhoneNumber(profile.phone_number || "");
        setNationality(profile.nationality || "");
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load your profile data.");
        // Fallback to auth user data
        setName(user?.name || "");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProfile();
    }
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
      let message = "Failed to save profile.";
      if (err instanceof AxiosError) {
        message = err.response?.data?.message ?? message;
      }
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
}