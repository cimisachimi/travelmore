"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

// A list of common country codes. You can expand this.
const countryCodes = [
  { code: "+62", label: "ID (+62)" },
  { code: "+65", label: "SG (+65)" },
  { code: "+60", label: "MY (+60)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+1", label: "US (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+82", label: "KR (+82)" },
];

export default function SettingsTab() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  
  // --- UPDATED PHONE STATE ---
  const [phoneCode, setPhoneCode] = useState("+62"); // Default to Indonesia
  const [localPhone, setLocalPhone] = useState("");
  // ---
  
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
        setNationality(profile.nationality || "");

        // --- NEW LOGIC: Split fetched phone number ---
        const fullPhoneNumber = profile.phone_number || "";
        
        // Find the best matching country code from our list
        const matchedCode = countryCodes.find((c) =>
          fullPhoneNumber.startsWith(c.code)
        );

        if (matchedCode) {
          setPhoneCode(matchedCode.code);
          setLocalPhone(fullPhoneNumber.substring(matchedCode.code.length));
        } else if (fullPhoneNumber.startsWith("+")) {
          // It's a valid number but not in our short list.
          // We can try to find the code. For simplicity, we'll default.
          // Or, just set the local part to the full number and let user fix it.
          // For this example, we'll default to +62 and clean the number.
          setPhoneCode("+62");
          setLocalPhone(fullPhoneNumber.replace(/^\+?62/, "")); // Strip +62
        } else if (fullPhoneNumber) {
          // No country code, assume it's a local (ID) number
          setPhoneCode("+62");
          setLocalPhone(fullPhoneNumber.replace(/^0/, "")); // Strip leading 0
        } else {
          // No phone number at all
          setPhoneCode("+62");
          setLocalPhone("");
        }
        // --- END NEW LOGIC ---

      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Failed to load your profile data.");
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
    
   
    const cleanLocalPhone = localPhone.replace(/[^0-9]/g, "");
    const fullPhoneNumber = `${phoneCode}${cleanLocalPhone}`;
    // ---

    const profileData = {
      name: name,
      full_name: fullName,
      phone_number: fullPhoneNumber, // Send the combined string
      nationality: nationality,
    };

    try {
      await api.put("/my-profile", profileData);
      toast.success("Profile updated successfully!", { id: toastId });
      // Re-set the local phone to the cleaned version
      setLocalPhone(cleanLocalPhone);
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
  
  // Helper for local phone input to only allow numbers and strip leading 0
  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setLocalPhone(numericValue);
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

          {/* --- UPDATED PHONE NUMBER INPUT --- */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">
              Phone Number / WhatsApp
            </label>
            <div className="flex mt-1">
              <select
                id="phoneCode"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className="w-auto border rounded-l-lg px-3 py-2 bg-background disabled:opacity-70 border-r-0 focus:ring-primary focus:border-primary"
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                id="phoneNumber"
                type="tel"
                value={localPhone}
                onChange={handleLocalPhoneChange}
                className="w-full flex-1 border rounded-r-lg px-4 py-2 bg-background disabled:opacity-70 focus:ring-primary focus:border-primary"
                placeholder="8123456789"
              />
            </div>
          </div>
          {/* --- END UPDATED INPUT --- */}

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