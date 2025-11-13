// File: app/[locale]/packages/[id]/PackageBookingModal.tsx

"use client";

// [UPDATED] Import useEffect
import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, CalendarDays, Users, TicketPercent } from "lucide-react";
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider";

// [UPDATED] Asumsi tipe AuthUser memiliki 'phone' (opsional)
import { HolidayPackage, TFunction, AuthUser } from "./page";

interface PackageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: HolidayPackage;
  user: AuthUser | null; // Asumsi AuthUser memiliki: name, email, phone?
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

// [UPDATED] Error state type diperluas
type FormErrors = {
  startDate?: string;
  adults?: string;
  children?: string;
  general?: string;
  discountCode?: string;
  // [ADDED] Error states untuk kolom baru
  nationality?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  pickupLocation?: string;
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

  // --- STATES ---
  const [startDate, setStartDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [discountCode, setDiscountCode] = useState<string>("");

  // [ADDED] State untuk kolom baru
  const [nationality, setNationality] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [flightOrTrainNumber, setFlightOrTrainNumber] = useState<string>("");
  const [specialRequest, setSpecialRequest] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const today = new Date().toISOString().split("T")[0];

  // [ADDED] useEffect untuk pre-fill data & reset form
  useEffect(() => {
    if (isOpen) {
      // Pre-fill data dari user
      setFullName(user?.name || "");
      setEmail(user?.email || "");
      // @ts-expect-error sadfsadfsdfd
      setPhone(user?.phone || "");

      // Reset field lainnya
      setStartDate("");
      setAdults(1);
      setChildren(0);
      setDiscountCode("");
      setNationality("");
      setPickupLocation("");
      setFlightOrTrainNumber("");
      setSpecialRequest("");
      setErrors({});
    }
  }, [isOpen, user]); // Jalankan saat modal dibuka atau data user berubah

  // --- CALCULATIONS ---
  // (Perhitungan harga tidak berubah)
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

  // --- VALIDATION ---
  // [UPDATED] Fungsi validasi diperbarui
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

    // [ADDED] Validasi untuk kolom baru
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
      toast.error(
        t("booking.errors.notLoggedIn", "You must be logged in to book.")
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // [UPDATED] Payload API diperbarui
      const response = await api.post<ApiBookingSuccessResponse>(
        `/packages/${pkg.id}/book`,
        {
          start_date: startDate,
          adults: adults,
          children: children,
          discount_code: discountCode || null,
          // [ADDED] Data baru untuk dikirim
          nationality: nationality,
          full_name: fullName,
          email: email,
          phone: phone,
          pickup_location: pickupLocation,
          flight_or_train_number: flightOrTrainNumber || null,
          special_request: specialRequest || null,
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

      if (error.response?.status === 422 && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        const newApiErrors: FormErrors = {};

        if (validationErrors.start_date)
          newApiErrors.startDate = validationErrors.start_date[0];
        if (validationErrors.adults)
          newApiErrors.adults = validationErrors.adults[0];
        if (validationErrors.discount_code)
          newApiErrors.discountCode = validationErrors.discount_code[0];
        if (validationErrors.general)
          newApiErrors.general = validationErrors.general[0];
        
        // [ADDED] Error handling untuk data baru
        if (validationErrors.nationality) newApiErrors.nationality = validationErrors.nationality[0];
        if (validationErrors.full_name) newApiErrors.fullName = validationErrors.full_name[0];
        if (validationErrors.email) newApiErrors.email = validationErrors.email[0];
        if (validationErrors.phone) newApiErrors.phone = validationErrors.phone[0];
        if (validationErrors.pickup_location) newApiErrors.pickupLocation = validationErrors.pickup_location[0];

        setErrors(newApiErrors);
        toast.error(
          error.response.data.message ||
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

  // --- STYLING ---
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
  const errorBorderClass =
    "border-red-500 focus:border-red-500 focus:ring-red-500";
  const iconBgClass = theme === "regular" ? "bg-primary/10" : "bg-primary/20";
  
  // [ADDED] Base class untuk input
  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor}`;

  // --- RENDER ---
  return (
    // [UPDATED] Tambahkan overflow-y-auto untuk modal yang panjang
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto py-10">
      <div
        className={`${modalBgClass} rounded-xl shadow-xl p-6 sm:p-8 w-full max-w-lg relative transform transition-all duration-300 max-h-[90vh] overflow-y-auto`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${mutedTextColor} hover:${textColor} transition-colors`}
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
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

        {/* [UPDATED] Form dengan kolom tambahan */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Tanggal Mulai Tur (Date Picker) */}
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
                if (errors.startDate)
                  setErrors((p) => ({ ...p, startDate: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.startDate ? errorBorderClass : inputBorderClass
              }`}
            />
            {errors.startDate && (
              <p className="text-red-600 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* 2. Jumlah Peserta (Dewasa & Anak) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="adults"
                className={`block text-sm font-medium ${mutedTextColor}`}
              >
                <Users size={14} className="inline mr-1 mb-0.5" />{" "}
                {t("trip.adult", "Adults")}
              </label>
              <input
                id="adults"
                type="number"
                min={1}
                value={adults}
                onChange={(e) => {
                  setAdults(Number(e.target.value));
                  if (errors.adults || errors.general)
                    setErrors((p) => ({
                      ...p,
                      adults: undefined,
                      general: undefined,
                    }));
                }}
                required
                className={`${baseInputClass} ${
                  errors.adults ? errorBorderClass : inputBorderClass
                }`}
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
                <Users size={14} className="inline mr-1 mb-0.5" />{" "}
                {t("trip.child", "Children")}
              </label>
              <input
                id="children"
                type="number"
                min={0}
                value={children}
                onChange={(e) => {
                  setChildren(Number(e.target.value));
                  if (errors.children || errors.general)
                    setErrors((p) => ({
                      ...p,
                      children: undefined,
                      general: undefined,
                    }));
                }}
                required
                className={`${baseInputClass} ${
                  errors.children ? errorBorderClass : inputBorderClass
                }`}
              />
              {errors.children && (
                <p className="text-red-600 text-sm mt-1">{errors.children}</p>
              )}
            </div>
          </div>

          {/* --- [ADDED] Kolom Form Baru Dimulai --- */}

          {/* 3. Kewarganegaraan Peserta (Dropdown) */}
          <div>
            <label
              htmlFor="nationality"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.nationality.title", "Participant Nationality")}
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
                errors.nationality ? errorBorderClass : inputBorderClass
              }`}
            >
              <option value="">
                {t("booking.selectOption", "-- Select Option --")}
              </option>
              <option value="WNI">
                {t("booking.nationality.local", "Domestik (Local)")}
              </option>
              <option value="WNA">
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
              className={`block text-sm font-medium ${mutedTextColor}`}
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
                errors.fullName ? errorBorderClass : inputBorderClass
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
              className={`block text-sm font-medium ${mutedTextColor}`}
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
                errors.email ? errorBorderClass : inputBorderClass
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
              className={`block text-sm font-medium ${mutedTextColor}`}
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
                errors.phone ? errorBorderClass : inputBorderClass
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
              className={`block text-sm font-medium ${mutedTextColor}`}
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
                errors.pickupLocation ? errorBorderClass : inputBorderClass
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

          {/* 8. No. Penerbangan/Kereta (Opsional) (Text) */}
          <div>
            <label
              htmlFor="flightOrTrainNumber"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.flightNumber.title", "Flight Number")}{" "}
              <span className="text-xs">
                ({t("booking.optional", "Optional")})
              </span>
            </label>
            <input
              id="flightOrTrainNumber"
              type="text"
              value={flightOrTrainNumber}
              onChange={(e) => setFlightOrTrainNumber(e.target.value)}
              placeholder={t("booking.flightNumber.placeholder", "e.g., GA 205")}
              className={`${baseInputClass} ${inputBorderClass}`}
            />
          </div>

          {/* 9. Permintaan Khusus (Opsional) (Text Area) */}
          <div>
            <label
              htmlFor="specialRequest"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.specialRequest.title", "Special Request")}{" "}
              <span className="text-xs">
                ({t("booking.optional", "Optional")})
              </span>
            </label>
            <textarea
              id="specialRequest"
              rows={3}
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              className={`${baseInputClass} ${inputBorderClass}`}
              placeholder={t(
                "booking.specialRequest.placeholder",
                "e.g., allergies, dietary needs, late pickup..."
              )}
            />
          </div>

          {/* --- [ADDED] Kolom Form Baru Selesai --- */}

          {/* Discount Code Input (Existing) */}
          <div>
            <label
              htmlFor="discount-code"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              <TicketPercent size={14} className="inline mr-1 mb-0.5" />{" "}
              {t("booking.discountCode", "Discount Code (Optional)")}
            </label>
            <input
              id="discount-code"
              type="text"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value.toUpperCase());
                if (errors.discountCode)
                  setErrors((p) => ({ ...p, discountCode: undefined }));
              }}
              placeholder="e.g., SALE10"
              className={`${baseInputClass} ${
                errors.discountCode ? errorBorderClass : inputBorderClass
              }`}
            />
            {errors.discountCode && (
              <p className="text-red-600 text-sm mt-1">{errors.discountCode}</p>
            )}
          </div>

          {/* Price Summary (Existing) */}
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
                {t("booking.subtotal", "Subtotal")}:
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(subtotal)}
              </p>
            </div>
            {errors.general && (
              <p className="text-red-600 text-sm mt-1 text-center">
                {errors.general}
              </p>
            )}
            <p className={`text-xs ${mutedTextColor} text-center pt-1`}>
              {t(
                "booking.discountInfo",
                "Discounts will be applied at checkout."
              )}
            </p>
          </div>

          {/* Submit Button (Existing) */}
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