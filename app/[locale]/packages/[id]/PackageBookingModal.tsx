"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";
import { AxiosError } from "axios";
// ✅ PERBAIKAN TS2307: Impor tipe dari './page' (file page.tsx)
import { HolidayPackage, TFunction, AuthUser } from "./page";

// ✅ Tentukan props untuk modal
interface PackageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: HolidayPackage;
  user: AuthUser | null; // ✅ PERBAIKAN TS2305: Menggunakan tipe AuthUser lokal
  t: TFunction;
}

const PackageBookingModal: React.FC<PackageBookingModalProps> = ({
  isOpen,
  onClose,
  pkg,
  user,
  t,
}) => {
  const router = useRouter();

  const [startDate, setStartDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error(t("booking.errors.notLoggedIn", "You must be logged in to book."));
      return;
    }
    if (!startDate) {
      toast.error(t("booking.errors.noDate", "Please select a start date."));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`/packages/${pkg.id}/book`, {
        start_date: startDate,
        adults: adults,
        children: children,
      });

      if (response.status === 201) {
        toast.success(t("booking.success.message", "Booking created! Redirecting to payment..."));
        router.push('/profile/orders');
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      toast.error(
        error.response?.data?.message ||
        t("booking.errors.general", "Booking failed. Please try again.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const total = (pkg.exclusivePrice * adults) + (pkg.childPrice * children);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {t("booking.title", "Book Your Trip")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
          {pkg.name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("booking.startDate", "Select Start Date")}
            </label>
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("trip.adult", "Adults")}
              </label>
              <input
                type="number"
                min={1}
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("trip.child", "Children")}
              </label>
              <input
                type="number"
                min={0}
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t dark:border-gray-700">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("booking.total", "Total Price")}:
            </p>
            <p className="text-2xl font-bold text-cyan-600">
              Rp{total.toLocaleString("id-ID")}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
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

export default PackageBookingModal;