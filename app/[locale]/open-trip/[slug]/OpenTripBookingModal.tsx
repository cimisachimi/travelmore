// app/[locale]/open-trip/[slug]/OpenTripBookingModal.tsx
"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, MapPin, User, Mail, Phone, Flag, FileText, TicketPercent, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"; 
import { useTheme } from "@/components/ThemeProvider";
import axios, { AxiosError } from "axios";
import { OpenTrip, AuthUser } from "@/types/opentrip";

interface ApiCheckPriceResponse {
  discount_amount: number;
  total_amount: number;
  message?: string;
}

interface OpenTripBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: OpenTrip;
  user: AuthUser | null; 
  t: (key: string) => string; 
}

const OpenTripBookingModal: React.FC<OpenTripBookingModalProps> = ({ isOpen, onClose, pkg, user, t }) => {
  const router = useRouter();
  const { theme } = useTheme();

  // --- STATE ---
  const [startDate, setStartDate] = useState("");
  const [minDate, setMinDate] = useState(""); 
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  
  // Data Diri (Wajib Ada)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Discount
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fix Hydration & Reset Form
  useEffect(() => {
    setMinDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.name || "");
      setEmail(user?.email || "");
      setPhone(user?.phone || user?.phone_number || "");
      setStartDate("");
      setAdults(1);
      setChildren(0);
      setSelectedMeetingPoint("");
      setNationality("");
      setSpecialRequest("");
      setDiscountCode("");
      setAppliedDiscount(0); 
      setDiscountMessage(null);
      setSelectedAddons([]); 
      setErrors({});
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, user]);

  const formatPrice = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  // --- LOGIC ---
  const toggleAddon = (addonName: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonName) ? prev.filter((item) => item !== addonName) : [...prev, addonName]
    );
  };

  const handleApplyCode = async () => {
    if (!discountCode.trim()) return;
    setIsCheckingCode(true);
    try {
      const response = await api.post<ApiCheckPriceResponse>('/booking/check-price', {
        type: 'open_trip',
        id: pkg.id,
        discount_code: discountCode,
        adults,
        children,
        selected_addons: selectedAddons
      });
      if (response.data.discount_amount > 0) {
        setAppliedDiscount(response.data.discount_amount);
        setDiscountMessage({ type: 'success', text: `Code applied! You saved ${formatPrice(response.data.discount_amount)}` });
      } else {
        setAppliedDiscount(0);
        setDiscountMessage({ type: 'error', text: "Code valid but no discount applicable." });
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{message: string}>;
      setAppliedDiscount(0);
      setDiscountMessage({ type: 'error', text: error.response?.data?.message || "Invalid or expired discount code." });
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Re-check discount if params change
  useEffect(() => {
    if (appliedDiscount > 0 && discountCode) {
      const timer = setTimeout(() => handleApplyCode(), 500); 
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, children, selectedAddons]);

  const { pricePerPax, totalPax, addonsTotal, grandTotal } = useMemo(() => {
    const count = adults + children;
    let finalPrice = Number(pkg.starting_from_price) || 0;
    
    // Tier Logic
    if (pkg.price_tiers && pkg.price_tiers.length > 0) {
        const sortedTiers = [...pkg.price_tiers].sort((a, b) => a.min_pax - b.min_pax);
        const foundTier = sortedTiers.find(tier => {
            const min = Number(tier.min_pax);
            const max = tier.max_pax ? Number(tier.max_pax) : Infinity;
            return count >= min && count <= max;
        });
        
        if (foundTier) {
            finalPrice = Number(foundTier.price);
        } else if (count > 0) {
             const lastTier = sortedTiers[sortedTiers.length - 1];
             if (count > Number(lastTier.max_pax)) finalPrice = Number(lastTier.price);
        }
    }

    const addonsCost = selectedAddons.reduce((sum, addonName) => {
        const addon = pkg.addons?.find(a => a.name === addonName);
        return sum + (addon ? Number(addon.price) : 0);
    }, 0);

    const baseTotal = (finalPrice * count) + addonsCost;
    const total = Math.max(0, baseTotal - appliedDiscount);

    return { pricePerPax: finalPrice, totalPax: count, addonsTotal: addonsCost, grandTotal: total };
  }, [adults, children, pkg, selectedAddons, appliedDiscount]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = t("errors.noDate") || "Date is required";
    if (!selectedMeetingPoint) newErrors.meetingPoint = "Please select a meeting point.";
    if (!fullName) newErrors.fullName = "Full Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!phone) newErrors.phone = "Phone/WhatsApp is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) { toast.error(t("errors.notLoggedIn") || "Please login first"); return; }

    setIsSubmitting(true);
    try {
      const payload = {
        start_date: startDate,
        adults,
        children: children || 0,
        full_name: fullName,
        email,
        phone_number: phone,
        participant_nationality: nationality,
        pickup_location: selectedMeetingPoint, 
        special_request: specialRequest || null,
        discount_code: appliedDiscount > 0 ? discountCode : null,
        selected_addons: selectedAddons, 
      };

      const response = await api.post(`/open-trips/${pkg.id}/book`, payload);
      
      if (response.status === 201 || response.status === 200) {
        toast.success(t("success.message") || "Booking successful!");
        router.push("/profile");
        onClose();
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const serverErrors = error.response.data.errors as Record<string, string[]>;
        if (serverErrors.discount_code) toast.error(serverErrors.discount_code[0]);
        else if (serverErrors.start_date) toast.error(serverErrors.start_date[0]);
        else toast.error("Please check your input details.");
      } else {
        toast.error("Booking failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- STYLES ---
  const modalBg = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "regular" ? "text-gray-900" : "text-white";
  const mutedText = theme === "regular" ? "text-gray-600" : "text-gray-400";
  const inputClass = `w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all ${theme === "regular" ? "bg-white border-gray-300" : "bg-gray-700 border-gray-600 text-white"}`;
  const labelClass = `block text-sm font-semibold mb-1.5 ${textColor}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className={`${modalBg} w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden`}>
            
            {/* Header (Sticky) */}
            <div className={`p-5 border-b ${theme === "regular" ? "border-gray-100" : "border-gray-700"} flex justify-between items-start shrink-0`}>
                <div>
                    <h2 className={`text-xl font-bold ${textColor}`}>
                        {t("title") || "Booking Form"}
                    </h2>
                    <p className={`text-sm ${mutedText} mt-1 line-clamp-1`}>{pkg.name}</p>
                </div>
                <button onClick={onClose} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition ${textColor}`}>
                    <X size={20} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SECTION 1: Date & Pax */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Select Date</label>
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} min={minDate} />
                            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className={labelClass}>Adults</label>
                                <input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={inputClass} />
                            </div>
                            <div className="flex-1">
                                <label className={labelClass}>Children</label>
                                <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Price Info */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                        <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                        <div className="text-sm">
                            <p className="font-semibold text-blue-800 dark:text-blue-200">Price Tier Applied:</p>
                            <p className="text-blue-700 dark:text-blue-300">
                                {totalPax} Pax @ <strong>{formatPrice(pricePerPax)}</strong> /pax
                            </p>
                        </div>
                    </div>

                    {/* SECTION 3: Add-ons */}
                    {pkg.addons && pkg.addons.length > 0 && (
                      <div className="space-y-3">
                        <h4 className={`text-sm font-bold flex items-center gap-2 ${textColor}`}>
                          <TicketPercent size={16} className="text-primary"/> Optional Add-ons
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {pkg.addons.map((addon, idx) => (
                            <label key={idx} className={`flex items-center justify-between cursor-pointer p-3 rounded-lg border transition ${selectedAddons.includes(addon.name) ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox"
                                  checked={selectedAddons.includes(addon.name)}
                                  onChange={() => toggleAddon(addon.name)}
                                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className={`text-sm font-medium ${textColor}`}>{addon.name}</span>
                              </div>
                              <span className={`text-sm font-bold ${textColor}`}>+{formatPrice(addon.price)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECTION 4: Meeting Point */}
                    <div>
                        <label className={labelClass}><MapPin size={14} className="inline mr-1"/> Meeting Point</label>
                        {pkg.meeting_points && pkg.meeting_points.length > 0 ? (
                            <select value={selectedMeetingPoint} onChange={(e) => setSelectedMeetingPoint(e.target.value)} className={inputClass}>
                                <option value="">-- Select Meeting Point --</option>
                                {pkg.meeting_points.map((mp, idx) => (<option key={idx} value={`${mp.name} (${mp.time || ''})`}>{mp.name} {mp.time ? `- ${mp.time}` : ""}</option>))}
                            </select>
                        ) : ( <input type="text" placeholder="e.g. Stasiun Tugu" value={selectedMeetingPoint} onChange={(e) => setSelectedMeetingPoint(e.target.value)} className={inputClass}/> )}
                        {errors.meetingPoint && <p className="text-red-500 text-xs mt-1">{errors.meetingPoint}</p>}
                    </div>

                    {/* SECTION 5: Contact Details (YANG SEBELUMNYA HILANG) */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h3 className={`text-base font-bold mb-4 ${textColor}`}>Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className={labelClass}><User size={14} className="inline mr-1"/> Full Name</label>
                                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" className={inputClass} />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>
                            <div>
                                <label className={labelClass}><Phone size={14} className="inline mr-1"/> WhatsApp</label>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62..." className={inputClass} />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className={labelClass}><Flag size={14} className="inline mr-1"/> Nationality</label>
                                <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Indonesia" className={inputClass} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}><Mail size={14} className="inline mr-1"/> Email</label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className={inputClass} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}><FileText size={14} className="inline mr-1"/> Special Request</label>
                                <textarea value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} placeholder="Any dietary requirements or allergies?" className={`${inputClass} min-h-[80px] resize-y`} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6: Discount */}
                    <div className="pt-2">
                        <label className={labelClass}><TicketPercent size={14} className="inline mr-1"/> Discount Code</label>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="E.G. SALE10" 
                                value={discountCode} 
                                onChange={(e) => {
                                    setDiscountCode(e.target.value.toUpperCase());
                                    setAppliedDiscount(0);
                                    setDiscountMessage(null);
                                }} 
                                className={`${inputClass} uppercase`}
                            />
                            <button 
                                type="button" 
                                onClick={handleApplyCode} 
                                disabled={!discountCode.trim() || isCheckingCode}
                                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold px-5 rounded-lg transition-colors disabled:opacity-50 min-w-[80px] flex items-center justify-center"
                            >
                                {isCheckingCode ? <Loader2 size={18} className="animate-spin"/> : "Apply"}
                            </button>
                        </div>
                        {discountMessage && (
                            <div className={`mt-2 text-xs flex items-center gap-1.5 ${discountMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {discountMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} 
                                {discountMessage.text}
                            </div>
                        )}
                    </div>
                </form>
            </div>

            {/* Footer (Sticky Bottom) */}
            <div className={`p-5 border-t ${theme === "regular" ? "border-gray-100 bg-white" : "border-gray-700 bg-gray-800"} shrink-0`}>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <p className={`text-xs ${mutedText}`}>Grand Total</p>
                        <p className="text-2xl font-bold text-primary">{formatPrice(grandTotal)}</p>
                    </div>
                    {appliedDiscount > 0 && (
                        <div className="text-right text-xs text-green-600">
                            <p>Discount Applied</p>
                            <p className="font-bold">- {formatPrice(appliedDiscount)}</p>
                        </div>
                    )}
                </div>
                
                <button 
                    type="submit" 
                    form="booking-form"
                    disabled={isSubmitting} 
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center gap-2"
                >
                    {isSubmitting ? <><Loader2 className="animate-spin"/> Processing...</> : "Join Open Trip"}
                </button>
            </div>

        </div>
    </div>
  );
};

export default OpenTripBookingModal;