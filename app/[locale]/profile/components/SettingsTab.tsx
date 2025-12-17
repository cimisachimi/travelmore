"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

// Icons (Inline SVGs for performance and no external deps)
const UserIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const MailIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const PhoneIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const GlobeIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
);

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
  const [phoneCode, setPhoneCode] = useState("+62");
  const [localPhone, setLocalPhone] = useState("");
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

        const fullPhoneNumber = profile.phone_number || "";
        const matchedCode = countryCodes.find((c) =>
          fullPhoneNumber.startsWith(c.code)
        );

        if (matchedCode) {
          setPhoneCode(matchedCode.code);
          setLocalPhone(fullPhoneNumber.substring(matchedCode.code.length));
        } else if (fullPhoneNumber.startsWith("+")) {
          setPhoneCode("+62");
          setLocalPhone(fullPhoneNumber.replace(/^\+?62/, ""));
        } else if (fullPhoneNumber) {
          setPhoneCode("+62");
          setLocalPhone(fullPhoneNumber.replace(/^0/, ""));
        } else {
          setPhoneCode("+62");
          setLocalPhone("");
        }
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

    const profileData = {
      name: name,
      full_name: fullName,
      phone_number: fullPhoneNumber,
      nationality: nationality,
    };

    try {
      await api.put("/my-profile", profileData);
      toast.success("Profile updated successfully!", { id: toastId });
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

  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setLocalPhone(numericValue);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-100 text-center">
      {error}
    </div>
  );

  return (
    <div className="animate-fadeIn w-full max-w-5xl mx-auto">
      {/* Header Section inside the form area */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-500 text-sm mt-1">
          Update your personal information and contact details.
        </p>
      </div>

      <form onSubmit={handleProfileUpdate}>
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <fieldset disabled={isSaving} className="space-y-6">
            
            {/* Grid Layout: 1 column on mobile, 2 columns on tablet/desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Display Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Display Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <UserIcon />
                  </span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="How should we call you?"
                  />
                </div>
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <label htmlFor="nationality" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Nationality
                </label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <GlobeIcon />
                  </span>
                  <select
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value as "WNI" | "WNA" | "")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none"
                  >
                    <option value="" disabled>Select nationality</option>
                    <option value="WNI">WNI (Indonesian Citizen)</option>
                    <option value="WNA">WNA (Foreign Citizen)</option>
                  </select>
                  {/* Custom Arrow for select */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Full Name - Spans full width on desktop if you want, or keep in grid. 
                  Let's make it span full width for better emphasis on legal name */}
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name <span className="text-xs font-normal text-gray-400 ml-1">(As per KTP/Passport)</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  placeholder="Your full legal name"
                />
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    <MailIcon />
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Phone Number
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <select
                    id="phoneCode"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="relative w-full">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      <PhoneIcon />
                    </span>
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={localPhone}
                      onChange={handleLocalPhoneChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-r-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all flex-1"
                      placeholder="8123456789"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex justify-end border-t border-gray-100 mt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl shadow-lg shadow-primary/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </fieldset>
        </div>
      </form>
    </div>
  );
}