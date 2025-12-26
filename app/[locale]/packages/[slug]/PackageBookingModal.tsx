// app/[locale]/packages/[slug]/PackageBookingModal.tsx
"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl"; 
import api from "@/lib/api";
import { toast } from "sonner";
import { 
  X, Users, TicketPercent, Camera, Plus, CheckCircle2, 
  AlertCircle, Loader2, MapPin, Phone, Info 
} from "lucide-react"; 
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider";
import { HolidayPackage, TFunction, AuthUser, Addon, PackagePriceTier } from "@/types/package";

interface PackageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: HolidayPackage; 
  user: AuthUser | null;
  t: TFunction;
}

interface ApiCheckPriceResponse {
  discount_amount: number;
  total_amount: number;
  message?: string;
}
type FormErrors = { [key: string]: string | undefined };

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

const PackageBookingModal: React.FC<PackageBookingModalProps> = ({
  isOpen, onClose, pkg, user, t,
}) => {
  const router = useRouter();
  const locale = useLocale();
  const { theme } = useTheme();

  // --- STATES ---
  const [startDate, setStartDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  
  // Discount States
  const [discountCode, setDiscountCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [nationality, setNationality] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState<string>("");
  // State flightNumber dihapus
  const [specialRequest, setSpecialRequest] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [phoneCode, setPhoneCode] = useState("+62");
  const [localPhone, setLocalPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const today = new Date().toISOString().split("T")[0];

  // Body Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  // Initial Form Data Hydration
  useEffect(() => {
    if (isOpen) {
      setFullName(user?.name || "");
      setEmail(user?.email || "");
      
      const fullPhoneNumber = user?.phone_number || user?.phone || "";
      const matchedCode = countryCodes.find((c) => fullPhoneNumber.startsWith(c.code));

      if (matchedCode) {
        setPhoneCode(matchedCode.code);
        setLocalPhone(fullPhoneNumber.substring(matchedCode.code.length));
      } else {
        setPhoneCode("+62");
        setLocalPhone(fullPhoneNumber.replace(/^\+?62|^0/, ""));
      }

      setStartDate("");
      setAdults(1);
      setChildren(0);
      setDiscountCode("");
      setAppliedDiscount(0);
      setDiscountMessage(null);
      setNationality("");
      setPickupLocation("");
      // Reset flightNumber dihapus
      setSpecialRequest("");
      setSelectedAddons([]);
      setErrors({});
    }
  }, [isOpen, user]);

  // --- DISCOUNT HANDLER ---
  const handleApplyCode = async () => {
    if (!discountCode.trim()) return;
    setIsCheckingCode(true);
    
    try {
      const response = await api.post<ApiCheckPriceResponse>('/booking/check-price', {
        type: 'holiday_package',
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

  // Debounce effect for price calculation
  useEffect(() => {
    if (appliedDiscount > 0 && discountCode) {
      const timer = setTimeout(() => {
        handleApplyCode();
      }, 800); 
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, children, selectedAddons]);

  // --- CALCULATIONS ---
  const { pricePerPax, totalPax } = useMemo(() => {
    const totalPax = adults + children;
    let foundPrice = 0;
    
    if (pkg.price_tiers && pkg.price_tiers.length > 0) {
      const tier = pkg.price_tiers.find(
        (t: PackagePriceTier) =>
          totalPax >= t.min_pax &&
          (totalPax <= t.max_pax || !t.max_pax || t.max_pax === 0)
      );
      
      if (tier) {
        foundPrice = tier.price;
      } else {
        foundPrice = pkg.price_tiers.reduce(
          (min: number, t: PackagePriceTier) => (t.price < min ? t.price : min),
          pkg.price_tiers[0].price
        );
      }
    }
    
    if (foundPrice === 0) {
      foundPrice = pkg.starting_from_price || 0;
    }
    return { pricePerPax: foundPrice, totalPax };
  }, [adults, children, pkg.price_tiers, pkg.starting_from_price]);

  const baseSubtotal = useMemo(() => pricePerPax * totalPax, [pricePerPax, totalPax]);

  const addonsTotal = useMemo(() => {
    if (!pkg.addons || selectedAddons.length === 0) return 0;
    return selectedAddons.reduce((total, addonName) => {
      const addon = pkg.addons?.find((a: Addon) => a.name === addonName);
      return total + (Number(addon?.price) || 0);
    }, 0);
  }, [selectedAddons, pkg.addons]);

  const grandTotal = Math.max(0, baseSubtotal + addonsTotal - appliedDiscount);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setLocalPhone(numericValue);
  };

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(name => name !== addonName) : [...prev, addonName]
    );
  };

  // --- VALIDATION & SUBMIT ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Date
    if (!startDate) newErrors.startDate = t("booking.errors.noDate");
    
    // Pax
    if (adults < 1) newErrors.adults = t("booking.errors.minAdults");
    
    // Calculation integrity
    if ((baseSubtotal + addonsTotal) <= 0) newErrors.general = t("booking.errors.noPrice");
    
    // Nationality
    if (!nationality) newErrors.participant_nationality = t("booking.errors.noNationality");
    
    // Name
    if (!fullName || fullName.trim().length < 3) newErrors.full_name = t("booking.errors.noName");
    
    // Email (Enhanced Regex)
    if (!email) {
      newErrors.email = t("booking.errors.noEmail");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = t("booking.errors.invalidEmail");
    }
    
    // Phone Validation (Enhanced)
    if (!localPhone) {
      newErrors.phone_number = t("booking.errors.noPhone");
    } else if (localPhone.length < 9) {
      newErrors.phone_number = "Phone number is too short (min 9 digits)"; 
    }
    
    // Pickup Location Validation (Enhanced)
    if (!pickupLocation) {
      newErrors.pickup_location = t("booking.errors.noPickup");
    } else if (pickupLocation.length < 5) {
       newErrors.pickup_location = "Pickup location details are too short.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
        if (errors.general) toast.error(errors.general);
        else toast.error("Please check the form for errors"); // Feedback visual jika validasi gagal
        return;
    }
    if (!user) {
      toast.error(t("booking.errors.notLoggedIn"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(
        `/packages/${pkg.id}/book`,
        {
          start_date: startDate,
          adults,
          children,
          discount_code: appliedDiscount > 0 ? discountCode : null,
          participant_nationality: nationality,
          full_name: fullName,
          email: email,
          phone_number: `${phoneCode}${localPhone.replace(/[^0-9]/g, "")}`,
          pickup_location: pickupLocation,
          flight_number: null, // Dikirim null karena input sudah dihapus di UI
          special_request: specialRequest || null,
          selected_addons: selectedAddons,
        }
      );

      if (response.status === 201) {
        toast.success(t("booking.success.message"));
        const orderId = response.data?.id;
        const targetUrl = orderId 
            ? `/${locale}/profile?order_id=${orderId}` 
            : `/${locale}/profile`; 
        router.push(targetUrl);
        onClose();
      }
    } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string, errors?: Record<string, unknown> }>;
        toast.error(error.response?.data?.message || t("booking.errors.general"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- STYLING VARS ---
  const modalBgClass = theme === "regular" ? "bg-white" : "bg-card";
  const textColor = theme === "regular" ? "text-gray-900" : "text-foreground";
  const mutedTextColor = theme === "regular" ? "text-gray-600" : "text-foreground/70";
  const inputBgClass = theme === "regular" ? "bg-gray-50" : "bg-background";
  const inputBorderClass = theme === "regular" ? "border-gray-300" : "border-border";
  const focusRingClass = "focus:ring-primary focus:border-primary";
  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor} disabled:opacity-50 disabled:cursor-not-allowed border`;
  const errorBorderClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const addonCardClass = theme === "regular" ? "border-gray-200 hover:border-primary bg-white" : "border-gray-700 hover:border-primary bg-gray-800";
  const addonSelectedClass = "border-primary ring-1 ring-primary bg-primary/10 dark:bg-primary/20";

  // Helper check for maps link
  const isMapLink = (text: string) => text.includes("goo.gl") || text.includes("maps.app") || text.includes("google.com/maps");

  return (
    <div className="fixed inset-0 z-[1000] flex justify-center items-start bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className={`${modalBgClass} rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative my-10 animate-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${mutedTextColor} hover:${textColor} transition-colors`}><X size={24} /></button>

        <div className="sm:flex sm:items-start mb-6 border-b border-border pb-4">
           <div className="w-full text-center sm:text-left">
               <h2 className={`text-2xl font-bold ${textColor}`}>{t("booking.title")}</h2>
               <p className={`text-sm ${mutedTextColor}`}>{pkg.name}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Date */}
          <div>
            <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.startDate")}</label>
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isSubmitting}
              className={`${baseInputClass} ${errors.startDate ? errorBorderClass : inputBorderClass} py-2 px-3`}
            />
            {errors.startDate && <p className="text-red-600 text-sm mt-1 font-medium">{errors.startDate}</p>}
          </div>

          {/* 2. Pax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}><Users size={14} className="inline mr-1" /> {t("trip.adult")}</label>
              <input
                type="number"
                min={1}
                value={adults}
                disabled={isCheckingCode || isSubmitting}
                onChange={(e) => setAdults(Number(e.target.value))}
                required
                className={`${baseInputClass} ${errors.adults ? errorBorderClass : inputBorderClass} py-2 px-3`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}><Users size={14} className="inline mr-1" /> {t("trip.child")}</label>
              <input
                type="number"
                min={0}
                value={children}
                disabled={isCheckingCode || isSubmitting}
                onChange={(e) => setChildren(Number(e.target.value))}
                required
                className={`${baseInputClass} ${errors.children ? errorBorderClass : inputBorderClass} py-2 px-3`}
              />
            </div>
          </div>

          {/* ADD-ONS */}
          {pkg.addons && pkg.addons.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className={`block text-sm font-bold ${textColor} flex items-center gap-2`}><Camera size={16} /> {t("booking.enhanceTrip")}</label>
              <div className="grid grid-cols-1 gap-2">
                {pkg.addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.name);
                  return (
                    <div 
                      key={addon.name}
                      onClick={() => !isCheckingCode && toggleAddon(addon.name)}
                      className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${addonCardClass} ${isSelected ? addonSelectedClass : ""} ${isCheckingCode ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${isSelected ? "bg-primary border-primary" : "border-gray-400"}`}>
                        {isSelected && <Plus size={14} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm ${textColor}`}>{addon.name}</p>
                        <p className={`text-xs ${mutedTextColor}`}>+ {formatPrice(Number(addon.price))}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Nationality */}
          <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.nationality.title")}</label>
              <select
               value={nationality}
               onChange={(e) => setNationality(e.target.value)}
               required
               className={`${baseInputClass} ${errors.participant_nationality ? errorBorderClass : inputBorderClass} py-2 px-3`}
              >
                 <option value="">{t("booking.selectOption")}</option>
                 <option value="WNI">{t("booking.nationality.local")}</option>
                 <option value="WNA">{t("booking.nationality.foreign")}</option>
              </select>
          </div>

           {/* User Info Inputs */}
           <div className="space-y-4 pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
             <div>
                <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.fullName")}</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  required 
                  className={`${baseInputClass} ${errors.full_name ? errorBorderClass : inputBorderClass} py-2 px-3`} 
                />
             </div>
             
             <div>
                <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.email")}</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className={`${baseInputClass} ${errors.email ? errorBorderClass : inputBorderClass} py-2 px-3`} 
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
             </div>
             
             {/* PHONE SECTION - IMPROVED */}
             <div>
                <label className={`block text-sm font-medium ${mutedTextColor} flex items-center gap-1`}>
                    {t("booking.phone")} <span className="text-red-500">*</span>
                </label>
                <div className="flex mt-1">
                    <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className={`w-auto border rounded-l-md px-3 py-2 ${inputBgClass} ${inputBorderClass}`}>
                       {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                    </select>
                    <input 
                      type="tel" 
                      value={localPhone} 
                      onChange={handleLocalPhoneChange} 
                      required 
                      placeholder="8123456789"
                      className={`${baseInputClass} rounded-l-none border-l-0 mt-0 py-2 px-3 ${errors.phone_number ? 'border-red-500' : ''}`} 
                    />
                </div>
                {/* VALIDATION & HINT TEXT */}
                {errors.phone_number ? (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.phone_number}</p>
                ) : (
                    <p className="text-xs text-primary/80 mt-1.5 flex items-center gap-1">
                        <Phone size={12} className="inline" /> 
                        Ensure this number is active on WhatsApp for pickup coordination.
                    </p>
                )}
             </div>

             {/* PICKUP LOCATION - IMPROVED */}
             <div>
                <label className={`block text-sm font-medium ${mutedTextColor} flex items-center gap-1`}>
                    {t("booking.pickupLocation")} <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin size={16} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      value={pickupLocation} 
                      onChange={(e) => setPickupLocation(e.target.value)} 
                      required 
                      placeholder="Hotel Name or Google Maps Link"
                      className={`${baseInputClass} pl-10 py-2 ${errors.pickup_location ? errorBorderClass : inputBorderClass}`} 
                    />
                </div>
                {errors.pickup_location ? (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.pickup_location}</p>
                ) : (
                    <p className={`text-xs mt-1.5 flex items-center gap-1 ${isMapLink(pickupLocation) ? 'text-green-600 font-medium' : mutedTextColor}`}>
                       {isMapLink(pickupLocation) ? <CheckCircle2 size={12}/> : <Info size={12}/>}
                       {isMapLink(pickupLocation) ? "Maps link detected" : "Tip: You can paste a Google Maps link here."}
                    </p>
                )}
             </div>
             
             {/* Input Flight Number TELAH DIHAPUS DARI SINI */}

           </div>

           {/* Discount Code */}
           <div>
            <label className={`block text-sm font-medium ${mutedTextColor}`}><TicketPercent size={14} className="inline mr-1" /> {t("booking.discountCode")}</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={discountCode}
                onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    setAppliedDiscount(0); 
                    setDiscountMessage(null);
                }}
                className={`block w-full rounded-md shadow-sm py-2 px-3 border ${inputBgClass} ${inputBorderClass}`}
                placeholder="SALE10"
              />
              <button
                type="button"
                onClick={handleApplyCode}
                disabled={!discountCode.trim() || isCheckingCode}
                className="bg-primary hover:brightness-95 text-black font-semibold py-2 px-5 rounded-md transition-all active:scale-95 flex justify-center items-center min-w-[80px]"
              >
                {isCheckingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            {discountMessage && (
               <div className={`mt-2 text-xs flex items-center gap-1.5 font-medium ${discountMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {discountMessage.type === 'success' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>} {discountMessage.text}
               </div>
            )}
          </div>

          {/* Price Summary */}
          <div className={`pt-4 space-y-2 bg-gray-50 dark:bg-gray-900/40 p-5 rounded-lg border ${inputBorderClass}`}>
            <div className="flex justify-between items-center text-sm">
              <span className={mutedTextColor}>{t("pricing.pricePerPax")} ({totalPax}x)</span>
              <span className={`font-medium ${textColor}`}>{formatPrice(pricePerPax)}</span>
            </div>
            {addonsTotal > 0 && (
               <div className="flex justify-between items-center text-sm">
                <span className={mutedTextColor}>Add-ons</span>
                <span className={`font-medium ${textColor}`}>+ {formatPrice(addonsTotal)}</span>
              </div>
            )}
            {appliedDiscount > 0 && (
              <div className="flex justify-between items-center text-sm text-green-600 font-bold">
                <span className="flex items-center gap-1"><TicketPercent size={14} /> Discount</span>
                <span>- {formatPrice(appliedDiscount)}</span>
              </div>
            )}
            <div className={`flex justify-between items-center border-t ${inputBorderClass} pt-3 mt-2`}>
              <p className={`text-lg font-bold ${textColor}`}>{t("booking.subtotal")}:</p>
              <p className="text-2xl font-black text-primary">{formatPrice(grandTotal)}</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isCheckingCode} 
            className="w-full bg-primary text-black font-bold py-4 px-4 rounded-lg hover:brightness-95 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
          >
            {isSubmitting ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> {t("booking.submitting")}</span> : t("booking.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PackageBookingModal;