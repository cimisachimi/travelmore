// File: activities/[id]/ActivityBookingModal.tsx

"use client";

// [UPDATED] Import useEffect
import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";
import { AxiosError } from "axios";

// [UPDATED] Asumsi tipe AuthUser memiliki 'phone' (opsional)
import { Activity, TFunction, AuthUser } from "./page";

interface ActivityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  user: AuthUser | null; // Asumsi AuthUser memiliki: name, email, phone?
  t: TFunction;
}

// [UPDATED] API response/error types (Asumsi dari user)
interface ApiErrorResponse {
  message?: string;
}
interface ApiBookingSuccessResponse {
  id: number; // The new Order ID
}

// [UPDATED] Tipe Error state diperluas
type FormErrors = {
  startDate?: string;
  quantity?: string;
  nationality?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  pickupLocation?: string;
};

const ActivityBookingModal: React.FC<ActivityBookingModalProps> = ({
  isOpen,
  onClose,
  activity,
  user,
  t,
}) => {
  const router = useRouter();

  // --- STATE ---
  const [startDate, setStartDate] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // [TAMBAHAN] State untuk kolom baru
  const [nationality, setNationality] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [specialRequest, setSpecialRequest] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const today = new Date().toISOString().split("T")[0];

  // [TAMBAAN] useEffect untuk pre-fill data & reset form saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      // Pre-fill data dari user
      setFullName(user?.name || "");
      setEmail(user?.email || "");
      // @ts-expect-errora sdfsafsdaa
      setPhone(user?.phone || ""); 

      // Reset field lainnya
      setStartDate("");
      setQuantity(1);
      setNationality("");
      setPickupLocation("");
      setSpecialRequest("");
      setErrors({});
    }
  }, [isOpen, user]); // Jalankan saat modal dibuka atau data user berubah

  // --- CALCULATIONS ---
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

  // --- VALIDATION ---
  // [UPDATED] Fungsi validasi diperbarui
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

    // [TAMBAHAN] Validasi untuk kolom baru
    if (!nationality) {
      newErrors.nationality = t(
        "booking.errors.noNationality",
        "Please select nationality."
      );
    }
    if (!fullName) {
      newErrors.fullName = t(
        "booking.errors.noName",
        "Please enter your full name."
      );
    }
    if (!email) {
      newErrors.email = t("booking.errors.noEmail", "Please enter your email.");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      // Basic email format check
      newErrors.email = t(
        "booking.errors.invalidEmail",
        "Please enter a valid email."
      );
    }
    if (!phone) {
      newErrors.phone = t(
        "booking.errors.noPhone",
        "Please enter your phone number."
      );
    }
    if (!pickupLocation) {
      newErrors.pickupLocation = t(
        "booking.errors.noPickup",
        "Please select a pickup location."
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // --- SUBMISSION ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      // [UPDATED] Payload API diperbarui
      const response = await api.post<ApiBookingSuccessResponse>(
        `/activities/${activity.id}/book`,
        {
          booking_date: startDate,
          quantity: quantity,
          // [TAMBAHAN] Data baru untuk dikirim
          nationality: nationality,
          full_name: fullName,
          email: email,
          phone: phone,
          pickup_location: pickupLocation,
          special_request: specialRequest || null, // Kirim null jika kosong
        }
      );

      if (response.status === 201) {
        toast.success(
          t("booking.success.message", "Booking created! Redirecting...")
        );
        const orderId = response.data?.id;
        if (orderId) {
          router.push(`/profile?order_id=${orderId}`);
        } else {
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

  // --- STYLING ---
  const baseInputClass =
    "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600";
  const errorInputClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500";
  const buttonClass =
    "w-full bg-primary text-black font-bold py-3 px-4 rounded-lg transition duration-300 hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed";

  // --- RENDER ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto py-10">
      {/* [UPDATED] Tambahkan overflow-y-auto pada wrapper & max-h pada modal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg m-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div className="sm:flex sm:items-start mb-6">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 sm:mx-0 sm:h-10 sm:w-10">
            <svg /* ... icon ... */ >
              {/* ... path ... */ }
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

        {/* [UPDATED] Form dengan kolom tambahan */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Select Date */}
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
                if (errors.startDate)
                  setErrors((p) => ({ ...p, startDate: undefined }));
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

          {/* 2. Participants */}
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
                if (errors.quantity)
                  setErrors((p) => ({ ...p, quantity: undefined }));
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

          {/* --- [TAMBAHAN] Kolom Form Baru Dimulai --- */}

          {/* 3. Kewarganegaraan Peserta (Dropdown) */}
          <div>
            <label
              htmlFor="nationality"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("booking.nationality", "Participant Nationality")}
            </label>
            <select
              id="nationality"
              value={nationality}
              onChange={(e) => {
                setNationality(e.target.value);
                if (errors.nationality)
                  setErrors((p) => ({ ...p, nationality: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.nationality ? errorInputClass : ""
              }`}
            >
              <option value="">
                {t("booking.selectOption", "-- Select Option --")}
              </option>
              <option value="domestik">
                {t("booking.nationality.local", "Domestik (Local)")}
              </option>
              <option value="manca">
                {t("booking.nationality.foreign", "Mancanegara (Foreign)")}
              </option>
            </select>
            {errors.nationality && (
              <p className="text-red-600 text-sm mt-1">{errors.nationality}</p>
            )}
          </div>

          {/* 4. Nama Lengkap (Text - Pre-filled) */}
          <div>
            <label
              htmlFor="full-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("booking.fullName", "Full Name")}
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName)
                  setErrors((p) => ({ ...p, fullName: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.fullName ? errorInputClass : ""
              }`}
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* 5. Email (Email - Pre-filled) */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("booking.email", "Email")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email)
                  setErrors((p) => ({ ...p, email: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.email ? errorInputClass : ""
              }`}
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* 6. No. Telepon/WA (Text - Pre-filled) */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("booking.phone", "Phone Number (WA)")}
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone)
                  setErrors((p) => ({ ...p, phone: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.phone ? errorInputClass : ""
              }`}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 7. Lokasi Penjemputan (Dropdown) */}
          <div>
            <label
              htmlFor="pickupLocation"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("booking.pickupLocation", "Pickup Location")}
            </label>
            <select
              id="pickupLocation"
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value);
                if (errors.pickupLocation)
                  setErrors((p) => ({ ...p, pickupLocation: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.pickupLocation ? errorInputClass : ""
              }`}
            >
              <option value="">
                {t("booking.selectOption", "-- Select Option --")}
              </option>
              <option value="bandara">
                {t("booking.pickup.airport", "Bandara (Airport)")}
              </option>
              <option value="stasiun">
                {t("booking.pickup.station", "Stasiun (Train Station)")}
              </option>
              <option value="hotel">
                {t("booking.pickup.hotel", "Hotel")}
              </option>
            </select>
            {errors.pickupLocation && (
              <p className="text-red-600 text-sm mt-1">
                {errors.pickupLocation}
              </p>
            )}
          </div>

          {/* 8. Permintaan Khusus (Opsional) (Text Area) */}
          <div>
            <label
              htmlFor="specialRequest"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t("booking.specialRequest", "Special Request")}{" "}
              <span className="text-gray-500 dark:text-gray-400">
                ({t("booking.optional", "Optional")})
              </span>
            </label>
            <textarea
              id="specialRequest"
              rows={3}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              className={`${baseInputClass}`}
              placeholder={t(
                "booking.specialRequest.placeholder",
                "e.g., allergies, dietary needs, late pickup..."
              )}
            />
          </div>

          {/* --- [TAMBAHAN] Kolom Form Baru Selesai --- */}

          {/* Price Summary */}
          <div className="pt-4 space-y-2 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("pricing.pricePerPax", "Price per Pax")} ({totalPax}{" "}
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

          {/* Submit Button */}
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