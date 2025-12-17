"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, CalendarDays, Users, TicketPercent, Camera, Plus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider";

import { HolidayPackage, TFunction, AuthUser } from "./page";

interface PackageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: HolidayPackage; 
  user: AuthUser | null;
  t: TFunction;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
interface ApiBookingSuccessResponse {
  id: number;
}
interface ApiCheckPriceResponse {
  discount_amount: number;
  total_amount: number;
  message?: string;
}

type FormErrors = {
  startDate?: string;
  adults?: string;
  children?: string;
  general?: string;
  discountCode?: string;
  participant_nationality?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  pickup_location?: string;
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

const PackageBookingModal: React.FC<PackageBookingModalProps> = ({
  isOpen,
  onClose,
  pkg,
  user,
  t,
}) => {
  const router = useRouter();
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
  
  // Add-ons State
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

      // @ts-expect-error: Accessing potential phone property
      const fullPhoneNumber = user?.phone_number || user?.phone || "";
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
    // Don't clear message immediately to prevent flicker during auto-update
    
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

  // --- CALCULATIONS ---
  const { pricePerPax, totalPax } = useMemo(() => {
    const totalPax = adults + children;
    let foundPrice = 0;
    if (pkg.price_tiers && pkg.price_tiers.length > 0) {
      const tier = pkg.price_tiers.find(
        (t) =>
          totalPax >= t.min_pax &&
          (totalPax <= t.max_pax || !t.max_pax || t.max_pax === 0)
      );
      if (tier) {
        foundPrice = tier.price;
      } else {
        foundPrice = pkg.price_tiers.reduce(
          (min, t) => (t.price < min ? t.price : min),
          pkg.price_tiers[0].price
        );
      }
    }
    if (foundPrice === 0) {
      foundPrice = pkg.starting_from_price || 0;
    }
    return { pricePerPax: foundPrice, totalPax };
  }, [adults, children, pkg.price_tiers, pkg.starting_from_price]);

  // 1. Base Subtotal
  const baseSubtotal = useMemo(() => {
    return pricePerPax * totalPax;
  }, [pricePerPax, totalPax]);

  // 2. Add-ons Total
  const addonsTotal = useMemo(() => {
    if (!pkg.addons || selectedAddons.length === 0) return 0;
    
    return selectedAddons.reduce((total, addonName) => {
      const addon = pkg.addons?.find(a => a.name === addonName);
      return total + (Number(addon?.price) || 0);
    }, 0);
  }, [selectedAddons, pkg.addons]);

  // 3. Grand Total
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

  // --- VALIDATION ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!startDate) {
      newErrors.startDate = t("booking.errors.noDate");
    }
    if (adults < 1) {
      newErrors.adults = t("booking.errors.minAdults");
    }
    if (children < 0) {
      newErrors.children = t("booking.errors.invalidChildren");
    }
    
    // Check base price
    if ((baseSubtotal + addonsTotal) <= 0) {
      newErrors.general = t("booking.errors.noPrice");
    }

    if (!nationality) {
      newErrors.participant_nationality = t("booking.errors.noNationality");
    }
    if (!fullName) {
      newErrors.full_name = t("booking.errors.noName");
    }
    if (!email) {
      newErrors.email = t("booking.errors.noEmail");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("booking.errors.invalidEmail");
    }
    if (!localPhone) {
      newErrors.phone_number = t("booking.errors.noPhone");
    }
    if (!pickupLocation) {
      newErrors.pickup_location = t("booking.errors.noPickup");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMISSION ---
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
      const response = await api.post<ApiBookingSuccessResponse>(
        `/packages/${pkg.id}/book`,
        {
          start_date: startDate,
          adults: adults,
          children: children,
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
        router.push(orderId ? `/profile?order_id=${orderId}` : "/profile");
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;

      if (error.response?.status === 422 && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        const newApiErrors: FormErrors = {};

        if (validationErrors.start_date) newApiErrors.startDate = validationErrors.start_date[0];
        if (validationErrors.adults) newApiErrors.adults = validationErrors.adults[0];
        if (validationErrors.discount_code) newApiErrors.discountCode = validationErrors.discount_code[0];
        if (validationErrors.general) newApiErrors.general = validationErrors.general[0];
        if (validationErrors.participant_nationality) newApiErrors.participant_nationality = validationErrors.participant_nationality[0];
        if (validationErrors.full_name) newApiErrors.full_name = validationErrors.full_name[0];
        if (validationErrors.email) newApiErrors.email = validationErrors.email[0];
        if (validationErrors.phone_number) newApiErrors.phone_number = validationErrors.phone_number[0];
        if (validationErrors.pickup_location) newApiErrors.pickup_location = validationErrors.pickup_location[0];

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

  // --- STYLING ---
  const modalBgClass = theme === "regular" ? "bg-white" : "bg-card";
  const textColor = theme === "regular" ? "text-gray-900" : "text-foreground";
  const mutedTextColor = theme === "regular" ? "text-gray-600" : "text-foreground/70";
  const inputBgClass = theme === "regular" ? "bg-gray-50" : "bg-background";
  const inputBorderClass = theme === "regular" ? "border-gray-300" : "border-border";
  const focusRingClass = "focus:ring-primary focus:border-primary";
  const buttonClass = "w-full bg-primary text-black font-bold py-3 px-4 rounded-lg transition duration-300 hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed";
  const summaryBgClass = theme === "regular" ? "bg-gray-100" : "bg-background";
  const errorBorderClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const iconBgClass = theme === "regular" ? "bg-primary/10" : "bg-primary/20";
  const addonCardClass = theme === "regular" ? "border-gray-200 hover:border-primary bg-white" : "border-gray-600 hover:border-primary bg-gray-700";
  const addonSelectedClass = "border-primary ring-1 ring-primary bg-primary/10 dark:bg-primary/20";

  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto py-10">
      <div className={`${modalBgClass} rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${mutedTextColor} hover:${textColor} transition-colors`} aria-label="Close modal">
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div className="sm:flex sm:items-start mb-6">
          <div className={`mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass} sm:mx-0 sm:h-10 sm:w-10`}>
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h2 className={`text-2xl font-bold ${textColor}`} id="modal-title">
              {t("booking.title")}
            </h2>
            <p className={`text-sm ${mutedTextColor} mt-1`}>{pkg.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Date */}
          <div>
            <label htmlFor="start-date" className={`block text-sm font-medium ${mutedTextColor}`}>
              {t("booking.startDate")}
            </label>
            <input
              id="start-date"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.startDate) setErrors((p) => ({ ...p, startDate: undefined }));
              }}
              required
              className={`${baseInputClass} ${errors.startDate ? errorBorderClass : inputBorderClass}`}
            />
            {errors.startDate && <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>}
          </div>

          {/* 2. Pax */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="adults" className={`block text-sm font-medium ${mutedTextColor}`}>
                <Users size={14} className="inline mr-1 mb-0.5" /> {t("trip.adult")}
              </label>
              <input
                id="adults"
                type="number"
                min={1}
                value={adults}
                onChange={(e) => {
                  setAdults(Number(e.target.value));
                  if (errors.adults || errors.general) setErrors((p) => ({ ...p, adults: undefined, general: undefined }));
                }}
                required
                className={`${baseInputClass} ${errors.adults ? errorBorderClass : inputBorderClass}`}
              />
              {errors.adults && <p className="text-red-600 text-sm mt-1">{errors.adults}</p>}
            </div>
            <div>
              <label htmlFor="children" className={`block text-sm font-medium ${mutedTextColor}`}>
                <Users size={14} className="inline mr-1 mb-0.5" /> {t("trip.child")}
              </label>
              <input
                id="children"
                type="number"
                min={0}
                value={children}
                onChange={(e) => {
                  setChildren(Number(e.target.value));
                  if (errors.children || errors.general) setErrors((p) => ({ ...p, children: undefined, general: undefined }));
                }}
                required
                className={`${baseInputClass} ${errors.children ? errorBorderClass : inputBorderClass}`}
              />
              {errors.children && <p className="text-red-600 text-sm mt-1">{errors.children}</p>}
            </div>
          </div>

          {/* ADD-ONS SECTION */}
          {pkg.addons && pkg.addons.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className={`block text-sm font-bold ${textColor} flex items-center gap-2`}>
                <Camera size={16} />
                {t("booking.enhanceTrip")}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {pkg.addons.map((addon) => {
                  const isSelected = selectedAddons.includes(addon.name);
                  return (
                    <div 
                      key={addon.name}
                      onClick={() => toggleAddon(addon.name)}
                      className={`
                        relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200
                        ${addonCardClass}
                        ${isSelected ? addonSelectedClass : ""}
                      `}
                    >
                      <div className={`
                        w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
                        ${isSelected ? "bg-primary border-primary" : "border-gray-400 bg-transparent"}
                      `}>
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
            <label htmlFor="nationality" className={`block text-sm font-medium ${mutedTextColor}`}>
              {t("booking.nationality.title")}
            </label>
            <select
              id="nationality"
              value={nationality}
              onChange={(e) => {
                setNationality(e.target.value);
                if (errors.participant_nationality) setErrors((p) => ({ ...p, participant_nationality: undefined }));
              }}
              required
              className={`${baseInputClass} ${errors.participant_nationality ? errorBorderClass : inputBorderClass}`}
            >
              <option value="">{t("booking.selectOption")}</option>
              <option value="WNI">{t("booking.nationality.local")}</option>
              <option value="WNA">{t("booking.nationality.foreign")}</option>
            </select>
            {errors.participant_nationality && <p className="text-red-600 text-sm mt-1">{errors.participant_nationality}</p>}
          </div>

          {/* 4. Name */}
          <div>
            <label htmlFor="full-name" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.fullName")}</label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.full_name) setErrors((p) => ({ ...p, full_name: undefined }));
              }}
              required
              className={`${baseInputClass} ${errors.full_name ? errorBorderClass : inputBorderClass}`}
            />
            {errors.full_name && <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>}
          </div>

          {/* 5. Email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.email")}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              required
              className={`${baseInputClass} ${errors.email ? errorBorderClass : inputBorderClass}`}
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* 6. Phone */}
          <div>
            <label htmlFor="phoneNumber" className={`block text-sm font-medium ${mutedTextColor}`}>{t("booking.phone")}</label>
            <div className="flex mt-1">
              <select
                id="phoneCode"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className={`w-auto border rounded-l-md shadow-sm px-3 py-2 ${inputBgClass} ${focusRingClass} ${textColor} ${errors.phone_number ? errorBorderClass : inputBorderClass} border-r-0`}
              >
                {countryCodes.map((c) => (<option key={c.code} value={c.code}>{c.label}</option>))}
              </select>
              <input
                id="phoneNumber"
                type="tel"
                value={localPhone}
                onChange={(e) => {
                  handleLocalPhoneChange(e);
                  if (errors.phone_number) setErrors((p) => ({ ...p, phone_number: undefined }));
                }}
                required
                placeholder="8123456789"
                className={`${baseInputClass} rounded-l-none rounded-r-md ${errors.phone_number ? errorBorderClass : inputBorderClass}`}
              />
            </div>
            {errors.phone_number && <p className="text-red-600 text-sm mt-1">{errors.phone_number}</p>}
          </div>

          {/* 7. Pickup */}
          <div>
            <label htmlFor="pickupLocation" className={`block text-sm font-medium ${mutedTextColor}`}>
              {t("booking.pickupLocation")}
            </label>
            <input
              type="text"
              id="pickupLocation"
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value);
                if (errors.pickup_location) setErrors((p) => ({ ...p, pickup_location: undefined }));
              }}
              required
              placeholder={t("booking.pickupLocation")}
              className={`${baseInputClass} ${errors.pickup_location ? errorBorderClass : inputBorderClass}`}
            />
            {errors.pickup_location && (
              <p className="text-red-600 text-sm mt-1">{errors.pickup_location}</p>
            )}
          </div>

          {/* 8. Flight (Optional) */}
          <div>
            <label htmlFor="flightNumber" className={`block text-sm font-medium ${mutedTextColor}`}>
              {t("booking.flightNumber.title")} <span className="text-xs">({t("booking.optional")})</span>
            </label>
            <input
              id="flightNumber"
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder={t("booking.flightNumber.placeholder", { defaultValue: "e.g., GA 205" })}
              className={`${baseInputClass} ${inputBorderClass}`}
            />
          </div>

          {/* 9. Special Request (Optional) */}
          <div>
            <label htmlFor="specialRequest" className={`block text-sm font-medium ${mutedTextColor}`}>
              {t("booking.specialRequest.title")} <span className="text-xs">({t("booking.optional")})</span>
            </label>
            <textarea
              id="specialRequest"
              rows={3}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              className={`${baseInputClass} ${inputBorderClass}`}
              placeholder={t("booking.specialRequest.placeholder", { defaultValue: "e.g., allergies..." })}
            />
          </div>

          {/* Discount Code */}
          <div>
            <label htmlFor="discount-code" className={`block text-sm font-medium ${mutedTextColor}`}>
              <TicketPercent size={14} className="inline mr-1 mb-0.5" /> {t("booking.discountCode")}
            </label>
            <div className="flex gap-2 mt-1">
              <input
                id="discount-code"
                type="text"
                value={discountCode}
                onChange={(e) => {
                  setDiscountCode(e.target.value.toUpperCase());
                  setAppliedDiscount(0); // Reset applied if typing
                  setDiscountMessage(null);
                  if (errors.discountCode) setErrors((p) => ({ ...p, discountCode: undefined }));
                }}
                placeholder="e.g., SALE10"
                className={`block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor} ${errors.discountCode ? errorBorderClass : inputBorderClass}`}
              />
              <button
                type="button"
                onClick={handleApplyCode}
                disabled={!discountCode.trim() || isCheckingCode}
                className="bg-primary hover:bg-primary/90 text-black font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50 min-w-[80px] flex items-center justify-center"
              >
                {isCheckingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
              </button>
            </div>
            
            {/* Status Message */}
            {discountMessage && (
              <div className={`mt-2 text-sm flex items-center gap-1.5 ${discountMessage.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600'}`}>
                {discountMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {discountMessage.text}
              </div>
            )}
            
            {errors.discountCode && <p className="text-red-600 text-sm mt-1">{errors.discountCode}</p>}
          </div>

          {/* Price Summary */}
          <div className={`pt-4 space-y-2 ${summaryBgClass} p-4 rounded-lg border ${inputBorderClass}`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${mutedTextColor}`}>
                {t("pricing.pricePerPax")} ({totalPax} {totalPax > 1 ? t("trip.people") : t("trip.person")})
              </span>
              <span className={`text-sm font-medium ${textColor}`}>{formatPrice(pricePerPax)}</span>
            </div>
            
            {/* Show Add-ons if selected */}
            {addonsTotal > 0 && (
               <div className="flex justify-between items-center">
                <span className={`text-sm ${mutedTextColor}`}>Add-ons</span>
                <span className={`text-sm font-medium ${textColor}`}>+ {formatPrice(addonsTotal)}</span>
              </div>
            )}

            {/* Show Discount if Applied */}
            {appliedDiscount > 0 && (
              <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                <span className="text-sm font-medium flex items-center gap-1">
                  <TicketPercent size={14} /> Discount
                </span>
                <span className="text-sm font-bold">- {formatPrice(appliedDiscount)}</span>
              </div>
            )}

            <div className={`flex justify-between items-center border-t ${inputBorderClass} pt-2 mt-2`}>
              <p className={`text-lg font-semibold ${textColor}`}>{t("booking.subtotal")}:</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(grandTotal)}</p>
            </div>
            {errors.general && <p className="text-red-600 text-sm mt-1 text-center">{errors.general}</p>}
            <p className={`text-xs ${mutedTextColor} text-center pt-1`}>{t("booking.discountInfo")}</p>
          </div>

          <button type="submit" disabled={isSubmitting || !!errors.general} className={buttonClass}>
            {isSubmitting ? t("booking.submitting") : t("booking.confirm")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PackageBookingModal;