// File: activities/[id]/ActivityBookingModal.tsx

"use client";

import React, { useState, FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";
import { AxiosError } from "axios";

// [UPDATED] Import types from the main page
import { Activity, TFunction, AuthUser } from "./page";

interface ActivityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  user: AuthUser | null;
  t: TFunction;
}

// [NEW] API response/error types
interface ApiErrorResponse {
  message?: string;
}
interface ApiBookingSuccessResponse {
  id: number; // The new Order ID
}

// [NEW] Error state type
type FormErrors = {
  startDate?: string;
  quantity?: string;
};

const ActivityBookingModal: React.FC<ActivityBookingModalProps> = ({
  isOpen,
  onClose,
  activity,
  user,
  t,
}) => {
  const router = useRouter();

  const [startDate, setStartDate] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({}); // ✅ NEW: State for errors

  const today = new Date().toISOString().split("T")[0];

  // Memoized price calculation (Unchanged)
  const { pricePerPax, totalPax } = useMemo(() => {
    const pricePerPax = activity.price || 0;
    const totalPax = quantity;
    return { pricePerPax, totalPax };
  }, [quantity, activity.price]);

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
        "Please select a date."
      );
    }
    if (!quantity || quantity < 1) {
      newErrors.quantity = t(
        "booking.errors.noParticipants",
        "Must have at least 1 participant."
      );
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ UPDATED: Run validation first
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    if (!user) {
      toast.error(
        t("booking.errors.notLoggedIn", "You must be logged in to book.")
      );
      return;
    }
    
    if (total <= 0 || pricePerPax <= 0) {
      toast.error(
        t(
          "booking.errors.noPrice",
          "Price could not be calculated for this activity."
        )
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<ApiBookingSuccessResponse>(
        `/activities/${activity.id}/book`,
        {
          booking_date: startDate,
          quantity: quantity,
        }
      );

      if (response.status === 201) {
        toast.success(
          t("booking.success.message", "Booking created! Redirecting...")
        );
        const orderId = response.data?.id;
        if (orderId) {
          // Redirect to the specific order if ID is returned
          router.push(`/profile?order_id=${orderId}`); // You can customize this URL
        } else {
          // Fallback redirect to profile
          router.push("/profile");
        }
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      toast.error(
        error.response?.data?.message ||
          t("booking.errors.general", "Booking failed. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ✅ NEW: CSS classes for inputs
  const baseInputClass =
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600";
  const errorInputClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500";
  const buttonClass =
    "w-full bg-primary text-black font-bold py-3 px-4 rounded-lg transition duration-300 hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* ✅ UPDATED: UI Modal container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg m-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* ✅ UPDATED: UI Modal Header */}
        <div className="sm:flex sm:items-start mb-6">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
            <svg
              className="h-6 w-6 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h2
              className="text-2xl font-bold text-gray-900 dark:text-white"
              id="modal-title"
            >
              {t("booking.title", "Book Your Activity")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {activity.name}
            </p>
          </div>
        </div>

        {/* ✅ UPDATED: Form with error handling */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("booking.startDate", "Select Date")}
            </label>
            <input
              id="start-date"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                // Clear error on change
                if (errors.startDate) setErrors((p) => ({ ...p, startDate: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.startDate ? errorInputClass : ""
              }`}
            />
            {errors.startDate && (
              <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("trip.participants", "Participants / Quantity")}
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                 // Clear error on change
                if (errors.quantity) setErrors((p) => ({ ...p, quantity: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.quantity ? errorInputClass : ""
              }`}
            />
            {errors.quantity && (
              <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          {/* ✅ UPDATED: UI for Price summary */}
          <div className="pt-4 space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("pricing.pricePerPax", "Price per Pax")} (
                {totalPax}{" "}
                {totalPax > 1
                  ? t("trip.people", "people")
                  : t("trip.person", "person")}
                )
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatPrice(pricePerPax)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-2">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("booking.total", "Total Price")}:
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(total)}
              </p>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className={buttonClass}>
            {isSubmitting
              ? t("booking.submitting", "Booking...")
              : t("booking.confirm", "Book Now")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActivityBookingModal;