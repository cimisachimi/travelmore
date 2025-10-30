// File: app/[locale]/packages/[id]/PackageBookingModal.tsx

"use client";

import React, { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, CalendarDays, Users, TicketPercent } from "lucide-react"; // ✨ UPDATED: Added TicketPercent icon
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider";

// Import types from the main page
import { HolidayPackage, TFunction, AuthUser } from "./page";

interface PackageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: HolidayPackage;
  user: AuthUser | null;
  t: TFunction;
}

// API response/error types
interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}
interface ApiBookingSuccessResponse {
  id: number; // The new Order ID
}

// ✨ UPDATED: Error state type
type FormErrors = {
  startDate?: string;
  adults?: string;
  children?: string;
  general?: string;
  discountCode?: string; // ✅ ADDED: For discount code errors
};

const PackageBookingModal: React.FC<PackageBookingModalProps> = ({
  isOpen,
  onClose,
  pkg,
  user,
  t,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [discountCode, setDiscountCode] = useState<string>(""); // ✅ ADDED: State for discount code
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const today = new Date().toISOString().split("T")[0];

  // Memoized price calculation logic (This is now the Subtotal)
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
        // Fallback: If no tier matches (e.g., pax < lowest min_pax), find lowest price
        foundPrice = pkg.price_tiers.reduce((min, t) => t.price < min ? t.price : min, pkg.price_tiers[0].price);
      }
    }
    if (foundPrice === 0) {
      foundPrice = pkg.starting_from_price || 0;
    }
    return { pricePerPax: foundPrice, totalPax };
  }, [adults, children, pkg.price_tiers, pkg.starting_from_price]);

  // This is now the subtotal
  const subtotal = useMemo(() => {
    return pricePerPax * totalPax;
  }, [pricePerPax, totalPax]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!startDate) {
      newErrors.startDate = t(
        "booking.errors.noDate",
        "Please select a start date."
      );
    }
    if (adults < 1) {
      newErrors.adults = t(
        "booking.errors.minAdults",
        "At least one adult is required."
      );
    }
     if (children < 0) {
         newErrors.children = t(
             "booking.errors.invalidChildren",
             "Number of children cannot be negative."
         );
     }
    if (subtotal <= 0 || pricePerPax <= 0) {
         newErrors.general = t(
             "booking.errors.noPrice",
             "Price could not be calculated for this number of participants."
         );
     }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
        if(errors.general) toast.error(errors.general);
        return;
    }

    if (!user) {
      toast.error(
        t("booking.errors.notLoggedIn", "You must be logged in to book.")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // ✨ UPDATED: API call payload includes discount_code
      const response = await api.post<ApiBookingSuccessResponse>(
        `/packages/${pkg.id}/book`,
        {
          start_date: startDate,
          adults: adults,
          children: children,
          discount_code: discountCode || null, // ✅ ADDED: Pass the discount code
        }
      );

      if (response.status === 201) {
        toast.success(
          t("booking.success.message", "Booking created! Redirecting...")
        );
        const orderId = response.data?.id;
        router.push(orderId ? `/profile?order_id=${orderId}` : "/profile");
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      
      // ✨ UPDATED: Better error handling to show specific field errors
      if (error.response?.status === 422 && error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          const newApiErrors: FormErrors = {};

          if (validationErrors.start_date) newApiErrors.startDate = validationErrors.start_date[0];
          if (validationErrors.adults) newApiErrors.adults = validationErrors.adults[0];
          if (validationErrors.discount_code) newApiErrors.discountCode = validationErrors.discount_code[0]; // ✅ ADDED
          if (validationErrors.general) newApiErrors.general = validationErrors.general[0];
          
          setErrors(newApiErrors); // This displays errors under the correct fields
          toast.error(
            error.response.data.message || // Use the main message from the response
            t("booking.errors.validation", "Please check the errors on the form.")
          );
      } else {
          toast.error(
              error.response?.data?.message ||
              t("booking.errors.general", "Booking failed. Please try again.")
          );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Theme-based classes
  const modalBgClass = theme === "regular" ? "bg-white" : "bg-card";
  const textColor = theme === "regular" ? "text-gray-900" : "text-foreground";
  const mutedTextColor =
    theme === "regular" ? "text-gray-600" : "text-foreground/70";
  const inputBgClass = theme === "regular" ? "bg-gray-50" : "bg-background";
  const inputBorderClass =
    theme === "regular" ? "border-gray-300" : "border-border";
  const focusRingClass = "focus:ring-primary focus:border-primary";
  const buttonClass =
    "w-full bg-primary text-black font-bold py-3 px-4 rounded-lg transition duration-300 hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed";
  const summaryBgClass = theme === "regular" ? "bg-gray-100" : "bg-background";
  const errorBorderClass = "border-red-500 focus:border-red-500 focus:ring-red-500";
  const iconBgClass = theme === "regular" ? "bg-primary/10" : "bg-primary/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
      <div
        className={`${modalBgClass} rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative transform transition-all duration-300`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${mutedTextColor} hover:${textColor} transition-colors`}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="sm:flex sm:items-start mb-6">
          <div
            className={`mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass} sm:mx-0 sm:h-10 sm:w-10`}
          >
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h2
              className={`text-2xl font-bold ${textColor}`}
              id="modal-title"
            >
              {t("booking.title", "Book Your Trip")}
            </h2>
            <p className={`text-sm ${mutedTextColor} mt-1`}>{pkg.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="start-date"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.startDate", "Select Start Date")}
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
              className={`mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${
                errors.startDate ? errorBorderClass : inputBorderClass
              } ${focusRingClass} ${textColor} placeholder:${mutedTextColor}`}
            />
            {errors.startDate && (
              <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="adults"
                className={`block text-sm font-medium ${mutedTextColor}`}
              >
                <Users size={14} className="inline mr-1 mb-0.5" /> {t("trip.adult", "Adults")}
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
                className={`mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${
                  errors.adults ? errorBorderClass : inputBorderClass
                } ${focusRingClass} ${textColor} placeholder:${mutedTextColor}`}
              />
               {errors.adults && (
                <p className="text-red-600 text-sm mt-1">{errors.adults}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="children"
                className={`block text-sm font-medium ${mutedTextColor}`}
              >
                 <Users size={14} className="inline mr-1 mb-0.5" /> {t("trip.child", "Children")}
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
                className={`mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${
                   errors.children ? errorBorderClass : inputBorderClass
                } ${focusRingClass} ${textColor} placeholder:${mutedTextColor}`}
              />
              {errors.children && (
                <p className="text-red-600 text-sm mt-1">{errors.children}</p>
              )}
            </div>
          </div>

          {/* ✅ ADDED: Discount Code Input */}
          <div>
            <label
              htmlFor="discount-code"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              <TicketPercent size={14} className="inline mr-1 mb-0.5" /> {t("booking.discountCode", "Discount Code (Optional)")}
            </label>
            <input
              id="discount-code"
              type="text"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value.toUpperCase());
                // Clear error when user types
                if (errors.discountCode) setErrors((p) => ({ ...p, discountCode: undefined }));
              }}
              placeholder="e.g., SALE10"
              className={`mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${
                errors.discountCode ? errorBorderClass : inputBorderClass
              } ${focusRingClass} ${textColor} placeholder:${mutedTextColor}`}
            />
            {errors.discountCode && (
              <p className="text-red-600 text-sm mt-1">{errors.discountCode}</p>
            )}
          </div>

          {/* ✨ UPDATED: Price summary (now shows Subtotal) */}
          <div
            className={`pt-4 space-y-2 ${summaryBgClass} p-4 rounded-lg border ${inputBorderClass}`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-sm ${mutedTextColor}`}>
                {t("pricing.pricePerPax", "Price per Pax")} ({totalPax}{" "}
                {totalPax > 1
                  ? t("trip.people", "people")
                  : t("trip.person", "person")}
                )
              </span>
              <span className={`text-sm font-medium ${textColor}`}>
                {formatPrice(pricePerPax)}
              </span>
            </div>
            <div
              className={`flex justify-between items-center border-t ${inputBorderClass} pt-2`}
            >
              <p className={`text-lg font-semibold ${textColor}`}>
                {/* ✨ UPDATED: Label changed from "Total Price" */}
                {t("booking.subtotal", "Subtotal")}:
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(subtotal)}
              </p>
            </div>
             {errors.general && (
                <p className="text-red-600 text-sm mt-1 text-center">{errors.general}</p>
            )}
            <p className={`text-xs ${mutedTextColor} text-center pt-1`}>
              {t("booking.discountInfo", "Discounts will be applied at checkout.")}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!errors.general}
            className={buttonClass}
          >
            {isSubmitting
              ? t("booking.submitting", "Booking...")
              : t("booking.confirm", "Book Now")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PackageBookingModal;