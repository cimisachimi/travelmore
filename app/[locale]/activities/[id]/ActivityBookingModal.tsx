// app/[locale]/packages/[id]/PackageBookingModal.tsx
"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, CalendarDays, Users, Clock, Camera, Plus, TicketPercent, Loader2, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider";
import { Activity, TFunction, AuthUser } from "./page";

interface Addon {
  name: string;
  price: number;
}

interface ActivityWithAddons extends Activity {
  addons?: Addon[];
}

interface ActivityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityWithAddons;
  user: AuthUser | null;
  t: TFunction;
}

interface ApiBookingSuccessResponse {
  message: string;
  payment_deadline: string;
  order: {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
  };
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

// ✅ Added API Response Type for checking price
interface ApiCheckPriceResponse {
  discount_amount: number;
  total_amount: number;
  message?: string;
}

type FormErrors = {
  booking_date?: string;
  activity_time?: string;
  quantity?: string;
  participant_nationality?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  pickup_location?: string;
  general?: string;
  discount_code?: string;
};

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
  isOpen,
  onClose,
  activity,
  user,
  t,
}) => {
  const router = useRouter();
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
  
  // ✅ 3. Updated Discount States
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

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.name || "");
      setEmail(user?.email || "");

      const fullPhoneNumber = user?.phone_number || "";
      const matchedCode = countryCodes.find((c) => fullPhoneNumber.startsWith(c.code));

      if (matchedCode) {
        setPhoneCode(matchedCode.code);
        setLocalPhone(fullPhoneNumber.substring(matchedCode.code.length));
      } else {
        setPhoneCode("+62");
        setLocalPhone(fullPhoneNumber.replace(/^0|^\+62/, ""));
      }

      setBookingDate("");
      setActivityTime("");
      setQuantity(1);
      setNationality("");
      setPickupLocation("");
      setSpecialRequest("");
      setSelectedAddons([]);
      
      // ✅ Reset Discount
      setDiscountCode("");
      setAppliedDiscount(0);
      setDiscountMessage(null);
      setErrors({});
    }
  }, [isOpen, user]);

  // --- HELPER: Discount Handler ---
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

  // ✅ Auto-Recalculate Discount (Debounced)
  useEffect(() => {
    if (appliedDiscount > 0 && discountCode) {
      const timer = setTimeout(() => {
        handleApplyCode();
      }, 500); 
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, selectedAddons]);

  // --- CALCULATIONS ---
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

  // ✅ Updated Grand Total Calculation
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
      prev.includes(addonName) 
        ? prev.filter(name => name !== addonName)
        : [...prev, addonName]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!bookingDate) newErrors.booking_date = t("booking.errors.noDate");
    if (!activityTime) newErrors.activity_time = t("booking.errors.noTime");
    if (!quantity || quantity < 1) newErrors.quantity = t("booking.errors.noParticipants");
    // Check base price, not grandTotal (which might be 0)
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
        // ✅ Send Discount Code Only if Valid
        discount_code: appliedDiscount > 0 ? discountCode : null,
      };

      const response = await api.post<ApiBookingSuccessResponse>(
        `/activities/${activity.id}/book`,
        payload
      );

      if (response.status === 201) {
        toast.success(t("booking.success.message"));
        const orderId = response.data.order?.id;
        router.push(orderId ? `/profile?order_id=${orderId}` : "/profile");
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;

      if (error.response?.status === 422 && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        const newApiErrors: FormErrors = {};

        if (validationErrors.booking_date) newApiErrors.booking_date = validationErrors.booking_date[0];
        if (validationErrors.activity_time) newApiErrors.activity_time = validationErrors.activity_time[0];
        if (validationErrors.quantity) newApiErrors.quantity = validationErrors.quantity[0];
        if (validationErrors.participant_nationality) newApiErrors.participant_nationality = validationErrors.participant_nationality[0];
        if (validationErrors.full_name) newApiErrors.full_name = validationErrors.full_name[0];
        if (validationErrors.email) newApiErrors.email = validationErrors.email[0];
        if (validationErrors.phone_number) newApiErrors.phone_number = validationErrors.phone_number[0];
        if (validationErrors.pickup_location) newApiErrors.pickup_location = validationErrors.pickup_location[0];
        if (validationErrors.discount_code) newApiErrors.discount_code = validationErrors.discount_code[0];

        setErrors(newApiErrors);
        toast.error(error.response.data.message || t("booking.errors.validation"));
      } else {
        toast.error(error.response?.data?.message || t("booking.errors.general"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Theme Classes
  const modalBgClass = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "regular" ? "text-gray-900" : "text-white";
  const mutedTextColor = theme === "regular" ? "text-gray-600" : "text-gray-300";
  const inputBgClass = theme === "regular" ? "bg-gray-50" : "bg-gray-700";
  const inputBorderClass = theme === "regular" ? "border-gray-300" : "border-gray-600";
  const focusRingClass = "focus:ring-2 focus:ring-primary focus:border-primary";
  const buttonClass = "w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const summaryBgClass = theme === "regular" ? "bg-gray-100" : "bg-gray-700/50";
  const errorBorderClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const iconBgClass = theme === "regular" ? "bg-primary/20" : "bg-primary/30";
  
  const addonCardClass = theme === "regular" ? "border-gray-200 hover:border-primary bg-white" : "border-gray-600 hover:border-primary bg-gray-700";
  const addonSelectedClass = "border-primary ring-1 ring-primary bg-primary/20 dark:bg-primary/30";

  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor} py-2 px-3 border ${inputBorderClass}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
      <div className={`${modalBgClass} rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${mutedTextColor} hover:${textColor} transition-colors`} aria-label="Close modal">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="sm:flex sm:items-start mb-6">
          <div className={`mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass} sm:mx-0 sm:h-10 sm:w-10`}>
            <CalendarDays className="h-6 w-6 text-primary dark:text-primary" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h2 className={`text-2xl font-bold ${textColor}`} id="modal-title">
              {t("booking.title")}
            </h2>
            <p className={`text-sm ${mutedTextColor} mt-1`}>{activity.name}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="booking-date" className={`block text-sm font-medium ${mutedTextColor}`}>
                {t("booking.date")}
              </label>
              <input
                id="booking-date"
                type="date"
                min={today}
                value={bookingDate}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  setErrors((p) => ({ ...p, booking_date: undefined }));
                }}
                required
                className={`${baseInputClass} ${errors.booking_date ? errorBorderClass : ""}`}
              />
              {errors.booking_date && <p className="text-red-600 text-sm mt-1">{errors.booking_date}</p>}
            </div>

            <div>
              <label htmlFor="activity-time" className={`block text-sm font-medium ${mutedTextColor}`}>
                <Clock size={14} className="inline mr-1 mb-0.5" />
                {t("booking.time")}
              </label>
              <input
                id="activity-time"
                type="time"
                value={activityTime}
                onChange={(e) => {
                  setActivityTime(e.target.value);
                  setErrors((p) => ({ ...p, activity_time: undefined }));
                }}
                required
                className={`${baseInputClass} ${errors.activity_time ? errorBorderClass : ""}`}
              />
              {errors.activity_time && <p className="text-red-600 text-sm mt-1">{errors.activity_time}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="quantity" className={`block text-sm font-medium ${mutedTextColor}`}>
              <Users size={14} className="inline mr-1 mb-0.5" />
              {t("booking.quantity")}
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                setErrors((p) => ({ ...p, quantity: undefined, general: undefined }));
              }}
              required
              className={`${baseInputClass} ${errors.quantity ? errorBorderClass : ""}`}
            />
            {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
          </div>

          {/* ADD-ONS SECTION */}
          {activity.addons && activity.addons.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className={`block text-sm font-bold ${textColor} flex items-center gap-2`}>
                <Camera size={16} />
                {t("booking.enhanceTrip") || "Optional Add-ons"}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {activity.addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.name);
                  return (
                    <div 
                      key={addon.name}
                      onClick={() => toggleAddon(addon.name)}
                      className={`relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${addonCardClass} ${isSelected ? addonSelectedClass : ""}`}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${isSelected ? "bg-primary border-primary" : "border-gray-400 bg-transparent"}`}>
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

          <div>
            <label htmlFor="nationality" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.nationality.title")}</label>
            <select id="nationality" value={nationality} onChange={(e) => { setNationality(e.target.value); setErrors((p) => ({ ...p, participant_nationality: undefined })); }} required className={`${baseInputClass} ${errors.participant_nationality ? errorBorderClass : ""}`}>
              <option value="">{t("booking.selectOption")}</option>
              <option value="WNI">{t("booking.nationality.local")}</option>
              <option value="WNA">{t("booking.nationality.foreign")}</option>
            </select>
            {errors.participant_nationality && <p className="text-red-600 text-sm mt-1">{errors.participant_nationality}</p>}
          </div>

          <div>
            <label htmlFor="full-name" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.fullName")}</label>
            <input id="full-name" type="text" value={fullName} onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, full_name: undefined })); }} required className={`${baseInputClass} ${errors.full_name ? errorBorderClass : ""}`} />
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.email")}</label>
            <input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }} required className={`${baseInputClass} ${errors.email ? errorBorderClass : ""}`} />
          </div>

          <div>
            <label htmlFor="phoneNumber" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.phone")}</label>
            <div className="flex mt-1">
              <select id="phoneCode" value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)} className={`w-auto border rounded-l-md shadow-sm px-3 py-2 ${inputBgClass} ${focusRingClass} ${textColor} ${errors.phone_number ? errorBorderClass : inputBorderClass} border-r-0`}>
                {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
              </select>
              <input id="phoneNumber" type="tel" value={localPhone} onChange={(e) => { handleLocalPhoneChange(e); setErrors((p) => ({ ...p, phone_number: undefined })); }} required placeholder="8123456789" className={`${baseInputClass} rounded-l-none rounded-r-md ${errors.phone_number ? errorBorderClass : ""}`} />
            </div>
            {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
          </div>

          <div>
            <label htmlFor="pickupLocation" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.pickupLocation")}</label>
            <input id="pickupLocation" type="text" value={pickupLocation} onChange={(e) => { setPickupLocation(e.target.value); setErrors((p) => ({ ...p, pickup_location: undefined })); }} required placeholder={t("booking.pickup.placeholder")} className={`${baseInputClass} ${errors.pickup_location ? errorBorderClass : ""}`} />
            {errors.pickup_location && <p className="text-red-600 text-sm mt-1">{errors.pickup_location}</p>}
          </div>

          <div>
            <label htmlFor="specialRequest" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.specialRequest.title")} <span className="text-xs opacity-70">({t("booking.optional")})</span></label>
            <textarea id="specialRequest" rows={2} value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} className={`${baseInputClass}`} placeholder={t("booking.specialRequest.placeholder")} />
          </div>

          
          {/* ✅ UPDATED DISCOUNT CODE SECTION */}
          <div>
            <label htmlFor="discount-code" className={`block text-sm font-medium ${mutedTextColor} flex items-center gap-1`}>
              <TicketPercent size={14} /> {t("booking.discountCode") || "Discount Code"}
            </label>
            <div className="flex gap-2 mt-1">
                <input
                id="discount-code"
                type="text"
                value={discountCode}
                onChange={(e) => {
                    setDiscountCode(e.target.value.toUpperCase());
                    // Reset if typing to force re-check
                    setAppliedDiscount(0);
                    setDiscountMessage(null);
                    if (errors.discount_code) setErrors((p) => ({ ...p, discount_code: undefined }));
                }}
                placeholder="e.g., SALE10"
                className={`block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor} ${errors.discount_code ? errorBorderClass : inputBorderClass} py-2 px-3`}
                />
                <button
                    type="button"
                    onClick={handleApplyCode}
                    disabled={!discountCode.trim() || isCheckingCode}
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded transition disabled:opacity-50 min-w-[80px] flex items-center justify-center"
                >
                    {isCheckingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                </button>
            </div>
            
            {/* Discount Status Message */}
            {discountMessage && (
                <div className={`mt-2 text-sm flex items-center gap-1.5 ${discountMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                    {discountMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {discountMessage.text}
                </div>
            )}
            
            {errors.discount_code && <p className="text-red-600 text-sm mt-1">{errors.discount_code}</p>}
          </div>

          {/* Price Summary */}
          <div className={`mt-2 ${summaryBgClass} p-4 rounded-lg border ${inputBorderClass}`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${mutedTextColor}`}>{t("pricing.pricePerPax")}</span>
              <span className={`text-sm font-medium ${textColor}`}>{formatPrice(Number(activity.price))}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${mutedTextColor}`}>{t("booking.quantity")}</span>
              <span className={`text-sm font-medium ${textColor}`}>x {quantity}</span>
            </div>
            
            {addonsTotal > 0 && (
               <div className="flex justify-between items-center mb-1">
                <span className={`text-sm ${mutedTextColor}`}>Add-ons</span>
                <span className={`text-sm font-medium ${textColor}`}>+ {formatPrice(addonsTotal)}</span>
              </div>
            )}

            {/* ✅ Show Applied Discount */}
            {appliedDiscount > 0 && (
                <div className="flex justify-between items-center mb-1 text-green-600 font-medium">
                    <span className="text-sm">Discount</span>
                    <span className="text-sm">- {formatPrice(appliedDiscount)}</span>
                </div>
            )}

            <div className={`flex justify-between items-center border-t ${inputBorderClass} pt-2 mt-2`}>
              <p className={`text-lg font-semibold ${textColor}`}>{t("booking.total")}:</p>
              <p className="text-xl font-bold text-primary">{formatPrice(grandTotal)}</p>
            </div>
             {errors.general && <p className="text-red-600 text-sm mt-1 text-center">{errors.general}</p>}
             
             <p className={`text-xs ${mutedTextColor} text-center pt-1`}>{t("booking.discountInfo") || "Discount applied at next step"}</p>
          </div>

          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting ? t("booking.submitting") : t("booking.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivityBookingModal;