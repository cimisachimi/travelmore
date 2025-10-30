// File: app/[locale]/packages/[id]/PackageBookingModal.tsx

"use client";

import React, { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, CalendarDays, Users } from "lucide-react"; // Import relevant icons
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider"; // ✨ Import useTheme

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
  errors?: Record<string, string[]>; // Optional validation errors from the API
}
interface ApiBookingSuccessResponse {
  id: number; // The new Order ID
}

// Error state type
type FormErrors = {
  startDate?: string;
  adults?: string;
  children?: string; // Add children validation if needed
  general?: string; // For price calculation errors
};

const PackageBookingModal: React.FC<PackageBookingModalProps> = ({
  isOpen,
  onClose,
  pkg,
  user,
  t,
}) => {
  const router = useRouter();
  const { theme } = useTheme(); // ✨ Get the current theme
  const [startDate, setStartDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({}); // ✅ NEW: State for errors

  const today = new Date().toISOString().split("T")[0];

  // Memoized price calculation logic (Unchanged)
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
        foundPrice = pkg.price_tiers[pkg.price_tiers.length - 1].price;
      }
    }
    if (foundPrice === 0) {
      foundPrice = pkg.starting_from_price || 0;
    }
    return { pricePerPax: foundPrice, totalPax };
  }, [adults, children, pkg.price_tiers, pkg.starting_from_price]);

  const total = useMemo(() => {
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

  // ✅ NEW: Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!startDate) {
      newErrors.startDate = t(
        "booking.errors.noDate",
        "Please select a start date."
      );
    }
    if (adults < 1) {
      // Assuming at least one adult is required
      newErrors.adults = t(
        "booking.errors.minAdults",
        "At least one adult is required."
      );
    }
     if (children < 0) { // Basic validation for children
         newErrors.children = t(
             "booking.errors.invalidChildren",
             "Number of children cannot be negative."
         );
     }
    if (total <= 0 || pricePerPax <= 0) {
        // Add a general error if price calculation fails, maybe due to invalid pax numbers
         newErrors.general = t(
             "booking.errors.noPrice",
             "Price could not be calculated for this number of participants."
         );
     }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ UPDATED: Run validation first
    if (!validateForm()) {
        // If price calculation failed, show it as a toast as well
        if(errors.general) toast.error(errors.general);
        return; // Stop submission if validation fails
    }

    if (!user) {
      toast.error(
        t("booking.errors.notLoggedIn", "You must be logged in to book.")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // API call (Unchanged endpoint/payload)
      const response = await api.post<ApiBookingSuccessResponse>(
        `/packages/${pkg.id}/book`,
        {
          start_date: startDate,
          adults: adults,
          children: children,
        }
      );

      if (response.status === 201) {
        toast.success(
          t("booking.success.message", "Booking created! Redirecting...")
        );
        const orderId = response.data?.id;
        router.push(orderId ? `/profile?order_id=${orderId}` : "/profile"); // Use query param for order ID
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      // Display specific validation errors from backend if available
      if (error.response?.status === 422 && error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          const errorMessages = Object.values(validationErrors).flat().join(' ');
          toast.error(errorMessages || t("booking.errors.general", "Booking failed. Please try again."));
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

  // ✨ Define theme-based classes (similar to ActivityBookingModal)
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
      {/* ✨ UPDATED: Modal container with theme class */}
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

        {/* ✨ UPDATED: Header with theme classes */}
        <div className="sm:flex sm:items-start mb-6">
          <div
            className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass} sm:mx-0 sm:h-10 sm:w-10`}
          >
            <CalendarDays className="h-6 w-6 text-primary" /> {/* Calendar Icon */}
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

        {/* ✨ UPDATED: Form with theme classes and error display */}
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
                min={1} // Assuming at least 1 adult
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

          {/* ✨ UPDATED: Price summary with theme classes */}
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
                {t("booking.total", "Total Price")}:
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(total)}
              </p>
            </div>
             {errors.general && ( // Show general price error here
                <p className="text-red-600 text-sm mt-1 text-center">{errors.general}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !!errors.general} // Disable if price calculation failed
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