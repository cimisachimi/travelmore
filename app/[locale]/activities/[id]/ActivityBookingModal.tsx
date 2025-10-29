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

const ActivityBookingModal: React.FC<ActivityBookingModalProps> = ({
  isOpen,
  onClose,
  activity,
  user,
  t,
}) => {
  const router = useRouter();

  const [startDate, setStartDate] = useState<string>("");
  // [UPDATED] Use 'quantity' instead of 'adults'/'children'
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const today = new Date().toISOString().split("T")[0];

  // [UPDATED] Memoized logic for Activity price
  const { pricePerPax, totalPax } = useMemo(() => {
    // [UPDATED] Use activity.price as the price per person
    const pricePerPax = activity.price || 0;
    const totalPax = quantity; // Use quantity
    return { pricePerPax, totalPax };
  }, [quantity, activity.price]);

  // Total price calculation
  const total = useMemo(() => {
    return pricePerPax * totalPax;
  }, [pricePerPax, totalPax]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      toast.error(t("booking.errors.notLoggedIn", "You must be logged in to book."));
      return;
    }
    if (!startDate) {
      toast.error(t("booking.errors.noDate", "Please select a date."));
      return;
    }
    if (totalPax <= 0) {
       toast.error(t("booking.errors.noParticipants", "You must have at least one participant."));
       return;
    }
    if (pricePerPax <= 0) {
      toast.error(t("booking.errors.noPrice", "Price could not be calculated for this activity."));
      return;
    }

    setIsSubmitting(true);

    try {
      // [UPDATED] API endpoint and payload
      // This now matches your backend BookingController@storeActivityBooking
      const response = await api.post<ApiBookingSuccessResponse>(`/activities/${activity.id}/book`, {
        booking_date: startDate,
        quantity: quantity,
      });

      if (response.status === 201) {
        toast.success(t("booking.success.message", "Booking created! Redirecting..."));
        const orderId = response.data?.id;
        if (orderId) {
          router.push(`/profile/orders/${orderId}`);
        } else {
          router.push('/profile/orders');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t("booking.title", "Book Your Activity")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          {activity.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("booking.startDate", "Select Date")}
            </label>
            <input
              id="start-date"
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* [UPDATED] Single quantity input */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("trip.participants", "Participants / Quantity")}
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* Price calculation display */}
          <div className="pt-4 border-t dark:border-gray-700">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("pricing.pricePerPax", "Price per Pax")} ({totalPax} {totalPax > 1 ? t("trip.people", "people") : t("trip.person", "person")})
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatPrice(pricePerPax)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("booking.total", "Total Price")}:
              </p>
              <p className="text-2xl font-bold text-cyan-600">
                {formatPrice(total)}
              </p>
            </div>
            {(pricePerPax <= 0 || totalPax <= 0) && (
              <p className="text-xs text-red-500 mt-2">
                {t("booking.errors.priceOrPax", "Price or participant count is invalid.")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || pricePerPax <= 0 || totalPax <= 0}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50"
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

export default ActivityBookingModal;