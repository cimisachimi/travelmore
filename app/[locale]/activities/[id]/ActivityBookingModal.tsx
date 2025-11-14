"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, CalendarDays, Users } from "lucide-react"; // [UPDATED] Imports
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider"; // [ADDED] Import
import { Activity, TFunction, AuthUser } from "./page"; // Assuming types are in a shared file

interface ActivityBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity;
  user: AuthUser | null;
  t: TFunction;
}

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>; // [ADDED] For 422 errors
}
interface ApiBookingSuccessResponse {
  id: number;
}

// [UPDATED] Error keys to match backend validation
type FormErrors = {
  booking_date?: string;
  quantity?: string;
  participant_nationality?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  pickup_location?: string;
  general?: string; // [ADDED] For general errors
};

// [ADDED] Country Codes
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
  const { theme } = useTheme(); // [ADDED]

  // --- STATES ---
  const [bookingDate, setBookingDate] = useState<string>(""); // [RENAMED]
  const [quantity, setQuantity] = useState<number>(1);
  const [nationality, setNationality] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pickupLocation, setPickupLocation] = useState<string>("");
  const [specialRequest, setSpecialRequest] = useState<string>("");

  // [UPDATED] Phone state
  const [phoneCode, setPhoneCode] = useState("+62");
  const [localPhone, setLocalPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.name || "");
      setEmail(user?.email || "");

      // [UPDATED] Phone pre-fill logic
      // @ts-expect-error: Assuming user might have phone_number or phone
      const fullPhoneNumber = user?.phone_number || user?.phone || "";
      const matchedCode = countryCodes.find((c) =>
        fullPhoneNumber.startsWith(c.code)
      );

      if (matchedCode) {
        setPhoneCode(matchedCode.code);
        setLocalPhone(fullPhoneNumber.substring(matchedCode.code.length));
      } else if (fullPhoneNumber.startsWith("+")) {
        setPhoneCode("+62"); // Default
        setLocalPhone(fullPhoneNumber.replace(/^\+?62/, ""));
      } else if (fullPhoneNumber) {
        setPhoneCode("+62");
        setLocalPhone(fullPhoneNumber.replace(/^0/, ""));
      } else {
        setPhoneCode("+62");
        setLocalPhone("");
      }

      // Reset other fields
      setBookingDate("");
      setQuantity(1);
      setNationality("");
      setPickupLocation("");
      setSpecialRequest("");
      setErrors({});
    }
  }, [isOpen, user]);

  // [RENAMED]
  const subtotal = useMemo(() => {
    const pricePerPax = activity.price || 0;
    return pricePerPax * quantity;
  }, [quantity, activity.price]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // [ADDED] Phone input helper
  const handleLocalPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setLocalPhone(numericValue);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!bookingDate) {
      newErrors.booking_date = t(
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
    if (subtotal <= 0) {
      // [ADDED] General error for price
      newErrors.general = t(
        "booking.errors.noPrice",
        "Price could not be calculated."
      );
    }
    if (!nationality) {
      newErrors.participant_nationality = t( // [UPDATED] Key
        "booking.errors.noNationality",
        "Please select nationality."
      );
    }
    if (!fullName) {
      newErrors.full_name = t( // [UPDATED] Key
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
    if (!localPhone) { // [UPDATED] Check
      newErrors.phone_number = t( // [UPDATED] Key
        "booking.errors.noPhone",
        "Please enter your phone number."
      );
    }
    if (!pickupLocation) {
      newErrors.pickup_location = t( // [UPDATED] Key
        "booking.errors.noPickup",
        "Please enter a pickup location." // [UPDATED] Message
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      if (errors.general) toast.error(errors.general); // [ADDED]
      return;
    }

    if (!user) {
      toast.error(
        t("booking.errors.notLoggedIn", "You must be logged in to book.")
      );
      return;
    }

    // [MOVED] Price check from validateForm to here
    if (subtotal <= 0) {
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
      // [UPDATED] API Payload
      const response = await api.post<ApiBookingSuccessResponse>(
        `/activities/${activity.id}/book`,
        {
          booking_date: bookingDate,
          quantity,
          participant_nationality: nationality, // [UPDATED] Key
          full_name: fullName,
          email,
          phone_number: `${phoneCode}${localPhone.replace(/[^0-9]/g, "")}`, // [UPDATED] Value
          pickup_location: pickupLocation,
          special_request: specialRequest || null,
        }
      );

      if (response.status === 201) {
        toast.success(
          t("booking.success.message", "Booking created! Redirecting...")
        );
        // [UPDATED] Handle response.data.id
        const orderId = response.data?.id; 
        router.push(orderId ? `/profile?order_id=${orderId}` : "/profile");
        onClose();
      }
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;

      // [UPDATED] Full 422 Error Handling
      if (error.response?.status === 422 && error.response.data.errors) {
        const validationErrors = error.response.data.errors;
        const newApiErrors: FormErrors = {};

        if (validationErrors.booking_date)
          newApiErrors.booking_date = validationErrors.booking_date[0];
        if (validationErrors.quantity)
          newApiErrors.quantity = validationErrors.quantity[0];
        if (validationErrors.participant_nationality)
          newApiErrors.participant_nationality =
            validationErrors.participant_nationality[0];
        if (validationErrors.full_name)
          newApiErrors.full_name = validationErrors.full_name[0];
        if (validationErrors.email)
          newApiErrors.email = validationErrors.email[0];
        if (validationErrors.phone_number)
          newApiErrors.phone_number = validationErrors.phone_number[0];
        if (validationErrors.pickup_location)
          newApiErrors.pickup_location = validationErrors.pickup_location[0];

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

  // [UPDATED] Theme-aware styling
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

  const baseInputClass = `mt-1 block w-full rounded-md shadow-sm ${inputBgClass} ${focusRingClass} ${textColor} placeholder:${mutedTextColor}`;

  return (
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

        {/* Header */}
        <div className="sm:flex sm:items-start mb-6">
          <div
            className={`mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass} sm:mx-0 sm:h-10 sm:w-10`}
          >
            <CalendarDays className="h-6 w-6 text-primary" /> {/* [ADDED] Icon */}
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h2
              className={`text-2xl font-bold ${textColor}`}
              id="modal-title"
            >
              {t("booking.title", "Book Your Activity")}
            </h2>
            <p className={`text-sm ${mutedTextColor} mt-1`}>
              {activity.name}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date & Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="booking-date"
                className={`block text-sm font-medium ${mutedTextColor}`}
              >
                {t("booking.date", "Select Date")}
              </label>
              <input
                id="booking-date"
                type="date"
                min={today}
                value={bookingDate}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  if (errors.booking_date)
                    setErrors((p) => ({ ...p, booking_date: undefined }));
                }}
                required
                className={`${baseInputClass} ${
                  errors.booking_date ? errorBorderClass : inputBorderClass
                }`}
              />
              {errors.booking_date && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.booking_date}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="quantity"
                className={`block text-sm font-medium ${mutedTextColor}`}
              >
                <Users size={14} className="inline mr-1 mb-0.5" />{" "}
                {t("booking.quantity", "Quantity")}
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  if (errors.quantity || errors.general)
                    setErrors((p) => ({
                      ...p,
                      quantity: undefined,
                      general: undefined,
                    }));
                }}
                required
                className={`${baseInputClass} ${
                  errors.quantity ? errorBorderClass : inputBorderClass
                }`}
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Nationality */}
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
                if (errors.participant_nationality)
                  setErrors((p) => ({
                    ...p,
                    participant_nationality: undefined,
                  }));
              }}
              required
              className={`${baseInputClass} ${
                errors.participant_nationality
                  ? errorBorderClass
                  : inputBorderClass
              }`}
            >
              <option value="">
                {t("booking.selectOption", "-- Select Option --")}
              </option>
              <option value="WNI"> {/* [UPDATED] Value */}
                {t("booking.nationality.local", "Domestik (Local)")}
              </option>
              <option value="WNA"> {/* [UPDATED] Value */}
                {t("booking.nationality.foreign", "Mancanegara (Foreign)")}
              </option>
            </select>
            {errors.participant_nationality && (
              <p className="text-red-600 text-sm mt-1">
                {errors.participant_nationality}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="full-name"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.fullName.title", "Full Name")}
            </label>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.full_name)
                  setErrors((p) => ({ ...p, full_name: undefined }));
              }}
              required
              className={`${baseInputClass} ${
                errors.full_name ? errorBorderClass : inputBorderClass
              }`}
            />
            {errors.full_name && (
              <p className="text-red-600 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.email.title", "Email")}
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

          {/* [UPDATED] Phone Number Input */}
          <div>
            <label
              htmlFor="phoneNumber"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.phone.title", "Phone Number (WA)")}
            </label>
            <div className="flex mt-1">
              <select
                id="phoneCode"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                className={`w-auto border rounded-l-md shadow-sm px-3 py-2 ${inputBgClass} ${focusRingClass} ${textColor} ${
                  errors.phone_number ? errorBorderClass : inputBorderClass
                } border-r-0`}
              >
                {countryCodes.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                id="phoneNumber"
                type="tel"
                value={localPhone}
                onChange={(e) => {
                  handleLocalPhoneChange(e);
                  if (errors.phone_number)
                    setErrors((p) => ({ ...p, phone_number: undefined }));
                }}
                required
                placeholder="8123456789"
                className={`${baseInputClass} rounded-l-none rounded-r-md ${
                  errors.phone_number ? errorBorderClass : inputBorderClass
                }`}
              />
            </div>
            {errors.phone_number && (
              <p className="text-red-600 text-sm mt-1">
                {errors.phone_number}
              </p>
            )}
          </div>

          {/* [UPDATED] Pickup Location (Text Input) */}
          <div>
            <label
              htmlFor="pickupLocation"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.pickupLocation.title", "Pickup Location")}
            </label>
            <input
              id="pickupLocation"
              type="text"
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value);
                if (errors.pickup_location)
                  setErrors((p) => ({ ...p, pickup_location: undefined }));
              }}
              required
              placeholder={t(
                "booking.pickup.placeholder",
                "e.g., Hotel, Villa, or Address"
              )}
              className={`${baseInputClass} ${
                errors.pickup_location ? errorBorderClass : inputBorderClass
              }`}
            />
            {errors.pickup_location && (
              <p className="text-red-600 text-sm mt-1">
                {errors.pickup_location}
              </p>
            )}
          </div>

          {/* Special Request */}
          <div>
            <label
              htmlFor="specialRequest"
              className={`block text-sm font-medium ${mutedTextColor}`}
            >
              {t("booking.specialRequest.title", "Special Request")}{" "}
              <span className={`${mutedTextColor} text-xs`}>
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

          {/* Price Summary */}
          <div
            className={`pt-4 space-y-2 ${summaryBgClass} p-4 rounded-lg border ${inputBorderClass}`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-sm ${mutedTextColor}`}>
                {t("pricing.pricePerPax", "Price per Pax")}
              </span>
              <span className={`text-sm font-medium ${textColor}`}>
                {formatPrice(activity.price)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${mutedTextColor}`}>
                {t("booking.quantity", "Quantity")}
              </span>
              <span className={`text-sm font-medium ${textColor}`}>
                x {quantity}
              </span>
            </div>
            <div
              className={`flex justify-between items-center border-t ${inputBorderClass} pt-2`}
            >
              <p className={`text-lg font-semibold ${textColor}`}>
                {t("booking.total", "Total Price")}:
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