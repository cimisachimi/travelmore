// app/[locale]/activities/[slug]/ActivityBookingModal.tsx
"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl"; 
import api from "@/lib/api";
import { toast } from "sonner";
import { X, Users, Clock, Camera, Plus, TicketPercent, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider";
import { Activity, TFunction, AuthUser } from "@/types/activity";

interface ActivityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  user: AuthUser | null;
  t: TFunction;
}

interface ApiBookingSuccessResponse {
  order: { id: number; };
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

const ActivityBookingModal: React.FC<ActivityBookingModalProps> = ({
  isOpen, onClose, activity, user, t,
}) => {
  const router = useRouter();
  const locale = useLocale();
  const { theme } = useTheme();

  // --- STATES ---
  const [bookingDate, setBookingDate] = useState<string>("");
  const [activityTime, setActivityTime] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [nationality, setNationality] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [specialRequest, setSpecialRequest] = useState<string>("");
  
  const [discountCode, setDiscountCode] = useState<string>("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [phoneCode, setPhoneCode] = useState("+62");
  const [localPhone, setLocalPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const today = new Date().toISOString().split("T")[0];

  // ✅ Scroll Lock Logic
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

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

      setBookingDate("");
      setActivityTime("");
      setQuantity(1);
      setNationality("");
      setPickupLocation("");
      setSpecialRequest("");
      setSelectedAddons([]);
      setDiscountCode("");
      setAppliedDiscount(0);
      setDiscountMessage(null);
      setErrors({});
    }
  }, [isOpen, user]);

  const handleApplyCode = async () => {
    if (!discountCode.trim()) return;
    setIsCheckingCode(true);
    
    try {
      const response = await api.post<ApiCheckPriceResponse>('/booking/check-price', {
        type: 'activity',
        id: activity.id,
        discount_code: discountCode,
        quantity: quantity,
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
    if (appliedDiscount > 0 && discountCode) {
      const timer = setTimeout(() => {
        handleApplyCode();
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [quantity, selectedAddons]);

  const baseSubtotal = useMemo(() => {
    const pricePerPax = Number(activity.price) || 0;
    return pricePerPax * quantity;
  }, [quantity, activity.price]);

  const addonsTotal = useMemo(() => {
    if (!activity.addons || selectedAddons.length === 0) return 0;
    return selectedAddons.reduce((total, addonName) => {
      const addon = activity.addons?.find(a => a.name === addonName);
      return total + (Number(addon?.price) || 0);
    }, 0);
  }, [selectedAddons, activity.addons]);

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!bookingDate) newErrors.booking_date = t("booking.errors.noDate");
    if (!activityTime) newErrors.activity_time = t("booking.errors.noTime");
    if (!quantity || quantity < 1) newErrors.quantity = t("booking.errors.noParticipants");
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
      const fullPhoneNumber = `${phoneCode}${localPhone.replace(/[^0-9]/g, "")}`;
      const payload = {
        booking_date: bookingDate,
        activity_time: activityTime,
        quantity: quantity,
        participant_nationality: nationality,
        full_name: fullName,
        email: email,
        phone_number: fullPhoneNumber,
        pickup_location: pickupLocation,
        special_request: specialRequest || null,
        selected_addons: selectedAddons,
        discount_code: appliedDiscount > 0 ? discountCode : null,
      };

      const response = await api.post<ApiBookingSuccessResponse>(`/activities/${activity.id}/book`, payload);

      if (response.status === 201) {
        toast.success(t("booking.success.message"));
        const orderId = response.data.order?.id;
        router.push(orderId ? `/${locale}/profile?order_id=${orderId}` : `/${locale}/profile`);
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(error.response?.data?.message || t("booking.errors.general"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // --- STYLING VARS (Matched to Package Modal) ---
  const modalBgClass = theme === "regular" ? "bg-white" : "bg-card";
  const textColor = theme === "regular" ? "text-gray-900" : "text-foreground";
  const mutedTextColor = theme === "regular" ? "text-gray-600" : "text-foreground/70";
  const inputBgClass = theme === "regular" ? "bg-gray-50" : "bg-background";
  const inputBorderClass = theme === "regular" ? "border-gray-300" : "border-border";
  const focusRingClass = "focus:ring-primary focus:border-primary";
  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor} border ${inputBorderClass} disabled:opacity-50 disabled:cursor-not-allowed`;
  const errorBorderClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const addonCardClass = theme === "regular" ? "border-gray-200 hover:border-primary bg-white" : "border-gray-700 hover:border-primary bg-gray-800";
  const addonSelectedClass = "border-primary ring-1 ring-primary bg-primary/10 dark:bg-primary/20";

  return (
    <div className="fixed inset-0 z-[1000] flex justify-center items-start bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className={`${modalBgClass} rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative my-10 animate-in zoom-in-95 duration-200`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${mutedTextColor} hover:${textColor} transition-colors`}><X size={24} /></button>

        <div className="sm:flex sm:items-start mb-6 border-b border-border pb-4">
          <div className="w-full text-center sm:text-left">
            <h2 className={`text-2xl font-bold ${textColor}`}>{t("booking.title")}</h2>
            <p className={`text-sm ${mutedTextColor} mt-1`}>{activity.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.date")}</label>
              <input 
                type="date" 
                min={today} 
                value={bookingDate} 
                onChange={(e) => setBookingDate(e.target.value)} 
                required 
                disabled={isSubmitting} 
                className={`${baseInputClass} py-2 px-3 ${errors.booking_date ? errorBorderClass : ""}`} 
              />
              {errors.booking_date && <p className="text-red-600 text-xs mt-1">{errors.booking_date}</p>}
            </div>
            <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}><Clock size={14} className="inline mr-1" /> {t("booking.time")}</label>
              <input 
                type="time" 
                value={activityTime} 
                onChange={(e) => setActivityTime(e.target.value)} 
                required 
                disabled={isSubmitting} 
                className={`${baseInputClass} py-2 px-3 ${errors.activity_time ? errorBorderClass : ""}`} 
              />
              {errors.activity_time && <p className="text-red-600 text-xs mt-1">{errors.activity_time}</p>}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className={`block text-sm font-medium ${mutedTextColor}`}><Users size={14} className="inline mr-1" /> {t("booking.quantity")}</label>
            <input 
              type="number" 
              min={1} 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
              required 
              disabled={isSubmitting || isCheckingCode} 
              className={`${baseInputClass} py-2 px-3 ${errors.quantity ? errorBorderClass : ""}`} 
            />
            {errors.quantity && <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>}
          </div>

          {/* Add-ons */}
          {activity.addons && activity.addons.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className={`block text-sm font-bold ${textColor} flex items-center gap-2`}><Camera size={16} /> {t("booking.enhanceTrip")}</label>
              <div className="grid grid-cols-1 gap-2">
                {activity.addons.map((addon) => {
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

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.nationality.title")}</label>
              <select 
                value={nationality} 
                onChange={(e) => setNationality(e.target.value)} 
                required 
                className={`${baseInputClass} py-2 px-3 ${errors.participant_nationality ? errorBorderClass : ""}`}
              >
                <option value="">{t("booking.selectOption")}</option>
                <option value="WNI">{t("booking.nationality.local")}</option>
                <option value="WNA">{t("booking.nationality.foreign")}</option>
              </select>
            </div>

            <input type="text" placeholder={t("booking.fullName")} value={fullName} onChange={(e) => setFullName(e.target.value)} required className={`${baseInputClass} py-2 px-3`} />
            <input type="email" placeholder={t("booking.email")} value={email} onChange={(e) => setEmail(e.target.value)} required className={`${baseInputClass} py-2 px-3`} />
            
            <div className="flex">
              <select value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className={`w-auto border rounded-l-md px-3 py-2 ${inputBgClass} ${inputBorderClass}`}>
                {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
              </select>
              <input 
                type="tel" 
                placeholder={t("booking.phone")} 
                value={localPhone} 
                onChange={handleLocalPhoneChange} 
                required 
                className={`${baseInputClass} rounded-l-none border-l-0 mt-0 py-2 px-3`} 
              />
            </div>

            <input type="text" placeholder={t("booking.pickupLocation")} value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required className={`${baseInputClass} py-2 px-3`} />
            <textarea placeholder={t("booking.specialRequest.title")} rows={2} value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} className={`${baseInputClass} py-2 px-3`} />
          </div>

          {/* Discount Code */}
          <div>
            <label className={`block text-sm font-medium ${mutedTextColor} flex items-center gap-1`}><TicketPercent size={14} /> {t("booking.discountCode")}</label>
            <div className="flex gap-2 mt-1">
              <input 
                type="text" 
                value={discountCode} 
                onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setAppliedDiscount(0); setDiscountMessage(null); }} 
                className={`${baseInputClass} py-2 px-3`} 
                placeholder="SALE10" 
              />
              <button 
                type="button" 
                onClick={handleApplyCode} 
                disabled={!discountCode.trim() || isCheckingCode} 
                className="bg-primary hover:brightness-95 text-black font-semibold py-2 px-5 rounded-md transition-all active:scale-95 flex items-center justify-center min-w-[80px]"
              >
                {isCheckingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            {discountMessage && (
              <div className={`mt-2 text-xs flex items-center gap-1.5 font-medium ${discountMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {discountMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} {discountMessage.text}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className={`pt-4 space-y-2 bg-gray-50 dark:bg-gray-900/40 p-5 rounded-lg border ${inputBorderClass}`}>
            <div className="flex justify-between items-center text-sm">
              <span className={mutedTextColor}>{t("pricing.pricePerPax")}</span>
              <span className={`font-medium ${textColor}`}>{formatPrice(Number(activity.price))}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className={mutedTextColor}>{t("booking.quantity")}</span>
              <span className={`font-medium ${textColor}`}>x {quantity}</span>
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
              <p className={`text-lg font-bold ${textColor}`}>{t("booking.total")}:</p>
              <p className="text-2xl font-black text-primary">{formatPrice(grandTotal)}</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || isCheckingCode} 
            className="w-full bg-primary text-black font-bold py-4 px-4 rounded-lg hover:brightness-95 disabled:opacity-50 transition-all active:scale-[0.98] shadow-lg shadow-primary/10"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> {t("booking.submitting")}
              </span>
            ) : t("booking.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivityBookingModal;