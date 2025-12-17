"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, MapPin, AlertCircle, Tag, TicketPercent, Loader2, CheckCircle2 } from "lucide-react"; 
import { useTheme } from "@/components/ThemeProvider";
import { AxiosError } from "axios";

// --- INTERFACES ---
interface MeetingPoint {
  id: number;
  name: string;
  time?: string;
  notes?: string;
}

interface PriceTier {
  min_pax: number;
  max_pax: number | null;
  price: number;
}

interface Addon {
  name: string;
  price: number;
}

interface TripDetail {
  id: number;
  name: string;
  starting_from_price: number | null;
  price_tiers?: PriceTier[];
  meeting_points?: MeetingPoint[];
  addons?: Addon[];
}

interface User {
  name?: string;
  email?: string;
  phone?: string;
}

interface ApiCheckPriceResponse {
  discount_amount: number;
  total_amount: number;
  message?: string;
}

interface OpenTripBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: TripDetail;
  user: User | null; 
  t: (key: string) => string; 
}

const OpenTripBookingModal: React.FC<OpenTripBookingModalProps> = ({
  isOpen,
  onClose,
  pkg,
  user,
  t,
}) => {
  const router = useRouter();
  const { theme } = useTheme();

  // --- STATES ---
  const [startDate, setStartDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  
  // Discount States
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.name || "");
      setEmail(user?.email || "");
      setPhone(user?.phone || "");
      
      // Reset
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
      
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, user]);

  // --- DISCOUNT HANDLER ---
  const handleApplyCode = async () => {
    if (!discountCode.trim()) return;
    setIsCheckingCode(true);
    // Don't clear message immediately
    
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
        setDiscountMessage({ 
          type: 'success', 
          text: `Code applied! You saved ${formatPrice(response.data.discount_amount)}` 
        });
      } else {
        setAppliedDiscount(0);
        setDiscountMessage({ type: 'error', text: "Code valid but no discount applicable." });
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{message: string}>;
      setAppliedDiscount(0);
      setDiscountMessage({ 
        type: 'error', 
        text: error.response?.data?.message || "Invalid or expired discount code." 
      });
    } finally {
      setIsCheckingCode(false);
    }
  };

  useEffect(() => {
    // Only auto-recalculate if we already have a valid discount applied
    if (appliedDiscount > 0 && discountCode) {
      const timer = setTimeout(() => {
        handleApplyCode();
      }, 500); // Wait 500ms after last change

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, children, selectedAddons]);

  const toggleAddon = (addonName: string) => {
    setSelectedAddons((prev) => 
      prev.includes(addonName) 
        ? prev.filter((item) => item !== addonName) 
        : [...prev, addonName]
    );
  };

  // --- DYNAMIC PRICE CALCULATION ---
  const { pricePerPax, totalPax, activeTier, addonsTotal, grandTotal } = useMemo(() => {
    const count = adults + children;
    
    // 1. Base Price Calculation (Tiered)
    let finalPrice = pkg.starting_from_price || 0;
    let foundTier = null;

    if (pkg.price_tiers && pkg.price_tiers.length > 0) {
        const sortedTiers = [...pkg.price_tiers].sort((a, b) => a.min_pax - b.min_pax);

        foundTier = sortedTiers.find(tier => {
            const min = Number(tier.min_pax);
            const max = tier.max_pax ? Number(tier.max_pax) : Infinity;
            return count >= min && count <= max;
        });

        if (!foundTier && count > 0) {
             const lastTier = sortedTiers[sortedTiers.length - 1];
             if (count > Number(lastTier.max_pax)) {
                foundTier = lastTier;
             }
        }

        if (foundTier) {
            finalPrice = Number(foundTier.price);
        }
    }

    // 2. Addons Calculation
    const addonsCost = selectedAddons.reduce((sum, addonName) => {
        const addon = pkg.addons?.find(a => a.name === addonName);
        return sum + (addon ? Number(addon.price) : 0);
    }, 0);

    // 3. Grand Total (Subtract Discount)
    const baseTotal = (finalPrice * count) + addonsCost;
    const total = Math.max(0, baseTotal - appliedDiscount);

    return { 
        pricePerPax: finalPrice, 
        totalPax: count, 
        activeTier: foundTier, 
        addonsTotal: addonsCost, 
        grandTotal: total 
    };
  }, [adults, children, pkg, selectedAddons, appliedDiscount]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = t("booking.errors.noDate");
    if (!selectedMeetingPoint) newErrors.meetingPoint = "Please select a meeting point.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) {
        toast.error(t("booking.errors.notLoggedIn"));
        return;
    }

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
        toast.success(t("booking.success.message"));
        router.push("/profile");
        onClose();
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        if (serverErrors.discount_code) {
           toast.error(serverErrors.discount_code[0]);
        } else if (serverErrors.start_date) {
           toast.error(serverErrors.start_date[0]);
        } else {
           toast.error("Please check your input details.");
        }
      } else {
        toast.error("Booking failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Styles
  const modalBg = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "regular" ? "text-gray-900" : "text-white";
  const inputClass = `w-full p-2 rounded border ${theme === "regular" ? "bg-gray-50 border-gray-300" : "bg-gray-700 border-gray-600 text-white"}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        
        <div className={`${modalBg} w-full max-w-lg transform rounded-xl shadow-xl p-6 text-left align-middle transition-all relative`}>
            
            <button 
                onClick={onClose} 
                className={`absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition ${textColor}`}
            >
                <X size={20} />
            </button>
            
            <h2 className={`text-2xl font-bold mb-1 ${textColor}`}>{t("booking.title")}</h2>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">OPEN TRIP</span>
            <p className="text-sm text-gray-500 mb-6">{pkg.name}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Date Picker */}
            <div>
                <label className={`block text-sm font-medium ${textColor}`}>Select Date</label>
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className={inputClass} 
                    min={new Date().toISOString().split("T")[0]}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
            </div>

            {/* Pax Input */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className={`block text-sm font-medium ${textColor}`}>Adults</label>
                    <input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={inputClass} />
                </div>
                <div className="flex-1">
                    <label className={`block text-sm font-medium ${textColor}`}>Children</label>
                    <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} className={inputClass} />
                </div>
            </div>

            {/* Price Tier Info Bubble */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-start gap-2 text-sm text-gray-900 dark:text-blue-200">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                    <p className="font-bold">Price Tier Applied:</p>
                    {activeTier ? (
                    <p>For {totalPax} pax: {formatPrice(pricePerPax)}/pax</p>
                    ) : (
                    <p>Base price: {formatPrice(pricePerPax)}/pax</p>
                    )}
                </div>
            </div>

            {/* Add-ons */}
            {pkg.addons && pkg.addons.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <h4 className={`text-sm font-bold flex items-center gap-2 mb-3 ${textColor}`}>
                  <Tag size={16} className="text-primary"/> Optional Add-ons
                </h4>
                <div className="space-y-2">
                  {pkg.addons.map((addon, idx) => (
                    <label key={idx} className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          checked={selectedAddons.includes(addon.name)}
                          onChange={() => toggleAddon(addon.name)}
                          className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                        />
                        <span className={`text-sm ${textColor}`}>{addon.name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${textColor}`}>
                        +{formatPrice(addon.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Point */}
            <div>
                <label className={`block text-sm font-medium ${textColor} flex items-center gap-1`}>
                    <MapPin size={14} /> Meeting Point (Titik Kumpul)
                </label>
                
                {pkg.meeting_points && pkg.meeting_points.length > 0 ? (
                    <select 
                        value={selectedMeetingPoint} 
                        onChange={(e) => setSelectedMeetingPoint(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">-- Select Meeting Point --</option>
                        {pkg.meeting_points.map((mp, idx) => (
                            <option key={idx} value={`${mp.name} (${mp.time || ''})`}>
                                {mp.name} {mp.time ? `- ${mp.time}` : ""}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input 
                        type="text" 
                        placeholder="e.g. Stasiun Tugu Yogyakarta"
                        value={selectedMeetingPoint}
                        onChange={(e) => setSelectedMeetingPoint(e.target.value)}
                        className={inputClass}
                    />
                )}
                {errors.meetingPoint && <p className="text-red-500 text-xs mt-1">{errors.meetingPoint}</p>}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-3">
                <div>
                    <label className={`block text-sm font-medium ${textColor}`}>Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={`block text-sm font-medium ${textColor}`}>WhatsApp</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${textColor}`}>Nationality</label>
                        <input type="text" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Indonesia" className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Special Request */}
            <div>
                <label className={`block text-sm font-medium ${textColor}`}>Special Request</label>
                <textarea 
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    className={inputClass}
                    rows={2}
                />
            </div>

            {/* Discount Code */}
            <div>
                <label className={`block text-sm font-medium ${textColor} flex items-center gap-1`}>
                    <TicketPercent size={14} /> Discount Code
                </label>
                <div className="flex gap-2 mt-1">
                    <input 
                        type="text" 
                        value={discountCode} 
                        onChange={(e) => {
                            setDiscountCode(e.target.value.toUpperCase());
                            setAppliedDiscount(0);
                            setDiscountMessage(null);
                        }}
                        className={`${inputClass} uppercase`} 
                        placeholder="e.g. SALE10"
                    />
                    <button
                        type="button"
                        onClick={handleApplyCode}
                        disabled={!discountCode.trim() || isCheckingCode}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 min-w-[80px] flex items-center justify-center"
                    >
                        {isCheckingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                    </button>
                </div>
                {discountMessage && (
                    <div className={`mt-2 text-sm flex items-center gap-1.5 ${discountMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                        {discountMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {discountMessage.text}
                    </div>
                )}
            </div>

            {/* Price Summary */}
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg sticky bottom-0 z-10 space-y-1 mt-4">
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Base Price ({totalPax} pax)</span>
                    <span>{formatPrice(pricePerPax * totalPax)}</span>
                </div>
                
                {addonsTotal > 0 && (
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>Add-ons Total</span>
                        <span>+ {formatPrice(addonsTotal)}</span>
                    </div>
                )}

                {appliedDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs text-green-600 font-semibold">
                        <span>Discount Applied</span>
                        <span>- {formatPrice(appliedDiscount)}</span>
                    </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600 mt-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Grand Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(grandTotal)}</span>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {isSubmitting ? "Booking..." : "Join Open Trip"}
            </button>

            </form>
        </div>
      </div>
    </div>
  );
};

export default OpenTripBookingModal;
