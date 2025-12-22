// app/[locale]/packages/[slug]/PackageBookingModal.tsx
"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl"; 
import api from "@/lib/api";
import { toast } from "sonner";
import { X, Users, TicketPercent, Camera, Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
  const [flightNumber, setFlightNumber] = useState<string>("");
  const [specialRequest, setSpecialRequest] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [phoneCode, setPhoneCode] = useState("+62");
  const [localPhone, setLocalPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const today = new Date().toISOString().split("T")[0];

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
      setFlightNumber("");
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

  // ✅ OPTIMASI: Debounce Effect
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
    if (!startDate) newErrors.startDate = t("booking.errors.noDate");
    if (adults < 1) newErrors.adults = t("booking.errors.minAdults");
    if (children < 0) newErrors.children = t("booking.errors.invalidChildren");
    if ((baseSubtotal + addonsTotal) <= 0) newErrors.general = t("booking.errors.noPrice");
    if (!nationality) newErrors.participant_nationality = t("booking.errors.noNationality");
    if (!fullName) newErrors.full_name = t("booking.errors.noName");
    if (!email) {
      newErrors.email = t("booking.errors.noEmail");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("booking.errors.invalidEmail");
    }
    if (!localPhone) newErrors.phone_number = t("booking.errors.noPhone");
    if (!pickupLocation) newErrors.pickup_location = t("booking.errors.noPickup");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
        if (errors.general) toast.error(errors.general);
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
          flight_number: flightNumber || null,
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
        // PERBAIKAN DI SINI: Mengganti 'any' dengan 'Record<string, unknown>'
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
  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor} disabled:opacity-50 disabled:cursor-not-allowed`;
  const errorBorderClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const addonCardClass = theme === "regular" ? "border-gray-200 hover:border-primary bg-white" : "border-gray-600 hover:border-primary bg-gray-700";
  const addonSelectedClass = "border-primary ring-1 ring-primary bg-primary/10 dark:bg-primary/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto py-10">
      <div className={`${modalBgClass} rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${mutedTextColor} hover:${textColor}`}><X size={24} /></button>

        <div className="sm:flex sm:items-start mb-6">
           <div className="w-full text-center sm:text-left ml-0 sm:ml-4">
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
              className={`${baseInputClass} ${errors.startDate ? errorBorderClass : inputBorderClass}`}
            />
            {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
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
                className={`${baseInputClass} ${errors.adults ? errorBorderClass : inputBorderClass}`}
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
                className={`${baseInputClass} ${errors.children ? errorBorderClass : inputBorderClass}`}
              />
            </div>
          </div>

          {/* ADD-ONS */}
          {pkg.addons && pkg.addons.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className={`block text-sm font-bold ${textColor} flex items-center gap-2`}><Camera size={16} /> {t("booking.enhanceTrip")}</label>
              <div className="grid grid-cols-1 gap-3">
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
               className={`${baseInputClass} ${errors.participant_nationality ? errorBorderClass : inputBorderClass}`}
             >
                <option value="">{t("booking.selectOption")}</option>
                <option value="WNI">{t("booking.nationality.local")}</option>
                <option value="WNA">{t("booking.nationality.foreign")}</option>
             </select>
          </div>

           {/* User Info Inputs */}
           <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.fullName")}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={baseInputClass} />
           </div>
           <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={baseInputClass} />
           </div>
           
           <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.phone")}</label>
              <div className="flex mt-1">
                  <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className={`w-auto border rounded-l-md px-3 py-2 ${inputBgClass} ${inputBorderClass}`}>
                     {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
                  </select>
                  <input type="tel" value={localPhone} onChange={handleLocalPhoneChange} required className={`${baseInputClass} rounded-l-none mt-0`} />
              </div>
           </div>

           <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.pickupLocation")}</label>
              <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required className={baseInputClass} />
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
                className={`block w-full rounded-md shadow-sm ${inputBgClass} ${inputBorderClass}`}
                placeholder="SALE10"
              />
              <button
                type="button"
                onClick={handleApplyCode}
                disabled={!discountCode.trim() || isCheckingCode}
                className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-md min-w-[80px] flex justify-center items-center"
              >
                {isCheckingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            {discountMessage && (
               <div className={`mt-2 text-sm flex items-center gap-1.5 ${discountMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {discountMessage.type === 'success' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>} {discountMessage.text}
               </div>
            )}
          </div>

          {/* Price Summary */}
          <div className={`pt-4 space-y-2 bg-gray-100 dark:bg-background p-4 rounded-lg border ${inputBorderClass}`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${mutedTextColor}`}>{t("pricing.pricePerPax")} ({totalPax}x)</span>
              <span className={`text-sm font-medium ${textColor}`}>{formatPrice(pricePerPax)}</span>
            </div>
            {addonsTotal > 0 && (
               <div className="flex justify-between items-center">
                <span className={`text-sm ${mutedTextColor}`}>Add-ons</span>
                <span className={`text-sm font-medium ${textColor}`}>+ {formatPrice(addonsTotal)}</span>
              </div>
            )}
            {appliedDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-sm font-medium flex items-center gap-1"><TicketPercent size={14} /> Discount</span>
                <span className="text-sm font-bold">- {formatPrice(appliedDiscount)}</span>
              </div>
            )}
            <div className={`flex justify-between items-center border-t ${inputBorderClass} pt-2 mt-2`}>
              <p className={`text-lg font-semibold ${textColor}`}>{t("booking.subtotal")}:</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(grandTotal)}</p>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || isCheckingCode} className="w-full bg-primary text-black font-bold py-3 px-4 rounded-lg hover:brightness-90 disabled:opacity-50 transition-all">
            {isSubmitting ? t("booking.submitting") : t("booking.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PackageBookingModal;