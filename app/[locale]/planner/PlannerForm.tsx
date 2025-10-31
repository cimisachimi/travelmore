// app/[locale]/planner/PlannerForm.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
} from "react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AxiosError } from "axios"; // Import AxiosError

// --- Tipe Data ---
interface IFormData {
  type: "personal" | "company" | "";
  tripType: "domestic" | "foreign" | "";
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  brandName: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  country: string;
  paxAdults: number | string;
  paxTeens: number | string;
  paxKids: number | string;
  paxSeniors: number | string;
  departureDate: string;
  duration: string;
  budgetPack: string;
  addons: string[];
  budgetPriorities: string[]; // Keep this if used elsewhere, though not in form
  travelStyle: string[];
  otherTravelStyle: string;
  travelPersonality: string[];
  otherTravelPersonality: string;
  activityLevel: string;
  mustVisit: string;
  attractionPreference: string; // Keep this if used elsewhere, though not in form
  foodPreference: string[];
  otherFoodPreference: string;
  accommodationPreference: string;
  consent: boolean;
  isFrequentTraveler: string;
  travelType: string;
}

// --- [DIHAPUS] Tipe untuk Midtrans Snap tidak lagi diperlukan di sini ---
// interface Snap { ... }

// --- Komponen Sidebar Baru (Sudah Responsif) ---
const CheckmarkIcon = () => (
  <svg
    className="w-6 h-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const PlannerSidebar = ({
  currentStep,
  totalSteps,
  setStep,
}: {
  currentStep: number;
  totalSteps: number;
  setStep: (step: number) => void;
}) => {
  const t = useTranslations("PlannerForm");

  const plannerSteps = useMemo(
    () => [
      { id: 1, title: t("step1_title") },
      { id: 2, title: t("step2_title") },
      { id: 3, title: t("step3_title") },
      { id: 4, title: t("step4_title") },
      { id: 5, title: t("step5_title") },
      { id: 6, title: t("step6_title") },
      { id: 7, title: t("step7_title") },
      { id: 8, title: t("step8_title") },
      { id: 9, title: t("step9_title") },
      { id: 10, title: t("step10_title") },
    ],
    [t]
  );

  const handleStepClick = (stepId: number) => {
    // Allow clicking only if the target step is already completed (less than current)
    // OR if the current step is the final summary step (allow going back)
    if (stepId < currentStep || currentStep === totalSteps) {
      setStep(stepId);
    }
  };

  // Tampilan Desktop (Stepper)
  const DesktopStepper = () => (
    <div className="hidden lg:block bg-black/20 dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl h-full lg:sticky lg:top-16">
      <p className="text-sm font-semibold text-primary uppercase tracking-wider">
        🗺️ {t("sidebar.planYourTrip")}
      </p>
      <h2 className="text-4xl lg:text-5xl font-bold mt-2 font-serif text-white">
        {t("sidebar.title")}
      </h2>

      <div className="mt-8 space-y-4 relative">
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200/30 dark:bg-slate-700/50" />

        {plannerSteps.map((item) => {
          const isCompleted = currentStep > item.id;
          const isCurrent = currentStep === item.id;
          // Can click if completed OR if currently on the summary step
          const canClick = isCompleted || currentStep === totalSteps;

          return (
            <div
              key={item.id}
              onClick={() => canClick && handleStepClick(item.id)}
              className={`flex items-center space-x-4 relative z-10 ${
                canClick ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                    ? "bg-primary ring-4 ring-primary/20"
                    : "bg-gray-400/50 dark:bg-slate-700"
                }`}
              >
                {isCompleted ? (
                  <CheckmarkIcon />
                ) : (
                  <span
                    className={`font-bold ${
                      isCurrent
                        ? "text-white"
                        : "text-gray-100 dark:text-gray-400"
                    }`}
                  >
                    {item.id}
                  </span>
                )}
              </div>
              <span
                className={`font-semibold transition-colors ${
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                    ? "text-white"
                    : "text-slate-300 dark:text-slate-500"
                }`}
              >
                {item.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Tampilan Mobile (Header)
  const MobileHeader = () => (
    <div className="lg:hidden text-center mb-8">
      <p className="text-sm font-semibold text-primary uppercase tracking-wider">
        🗺️ {t("sidebar.planYourTrip")}
      </p>
      <h2 className="text-4xl font-bold mt-2 font-serif text-white">
        {t("sidebar.title")}
      </h2>
    </div>
  );

  return (
    <>
      <MobileHeader />
      <DesktopStepper />
    </>
  );
};

// --- Komponen Bantuan untuk Ringkasan ---
const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value: string | string[] | undefined | null;
}) => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  )
    return null;
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div className="py-2 border-b border-gray-200 dark:border-slate-700 last:border-b-0">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{displayValue}</p>
    </div>
  );
};

// --- Komponen Input ---
const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  as,
  options = [],
  onCheckboxChange,
  selectPlaceholder,
  description,
}: {
  label: string;
  name: keyof IFormData;
  value: string | string[];
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  placeholder?: string;
  type?: string;
  as?: "select" | "textarea" | "checkbox-group" | "radio-group";
  options?: (string | { value: string; label: string; description?: string })[];
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectPlaceholder?: string;
  description?: string;
}) => {
  const baseInputClasses =
    "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white text-gray-900 dark:text-slate-800 border border-gray-300 dark:border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none transition placeholder:text-gray-400 dark:placeholder:text-slate-400";
  const labelClasses =
    "block text-sm font-semibold text-foreground dark:text-white mb-2";

  if (as === "select") {
    return (
      <div>
        {" "}
        <label className={labelClasses}>{label}</label>{" "}
        {description && (
          <p className="mt-1 mb-2 text-xs text-muted-foreground">
            {" "}
            {description}
          </p>
        )}{" "}
        <select
          name={name}
          value={value as string}
          onChange={onChange}
          className={baseInputClasses}
        >
          {" "}
          <option value="" disabled>
            {selectPlaceholder}
          </option>{" "}
          {options.map((opt) => {
            const val = typeof opt === "string" ? opt : opt.value;
            const lab = typeof opt === "string" ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lab}
              </option>
            );
          })}{" "}
        </select>{" "}
      </div>
    );
  }
  if (as === "textarea") {
    return (
      <div>
        {" "}
        <label className={labelClasses}>{label}</label>{" "}
        <textarea
          name={name}
          value={value as string}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={baseInputClasses}
        />{" "}
      </div>
    );
  }
  if (as === "checkbox-group" || as === "radio-group") {
    return (
      <div>
        <h4 className={labelClasses}>{label}</h4>
        <div className="space-y-3">
          {options.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            const optDescription =
              typeof opt !== "string" ? opt.description : undefined;
            const isCheckbox = as === "checkbox-group";
            const isChecked = isCheckbox
              ? (value as string[]).includes(optValue)
              : value === optValue;

            return (
              <label
                key={optValue}
                className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition ${
                  isChecked
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10"
                }`}
              >
                <input
                  type={isCheckbox ? "checkbox" : "radio"}
                  name={name}
                  value={optValue}
                  checked={isChecked}
                  onChange={isCheckbox ? onCheckboxChange : onChange}
                  className={`h-4 w-4 mt-1 shrink-0 ${
                    isCheckbox ? "rounded" : "rounded-full"
                  } text-primary focus:ring-primary border-gray-400 bg-transparent`}
                />
                <div className="text-sm text-left">
                  <span className="font-bold text-foreground">{optLabel}</span>
                  {optDescription && (
                    <p className="text-muted-foreground mt-1">
                      {optDescription}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div>
      {" "}
      <label className={labelClasses}>{label}</label>{" "}
      <input
        type={type}
        name={name}
        value={value as string}
        onChange={onChange}
        placeholder={placeholder}
        className={baseInputClasses}
      />{" "}
    </div>
  );
};

// --- Komponen Formulir Utama ---
export default function PlannerForm() {
  const t = useTranslations("PlannerForm");
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isStepValid, setIsStepValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [formData, setFormData] = useState<IFormData>({
    type: "",
    tripType: "",
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    brandName: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
    country: "",
    paxAdults: "",
    paxTeens: "",
    paxKids: "",
    paxSeniors: "",
    departureDate: "",
    duration: "",
    budgetPack: "",
    addons: [],
    budgetPriorities: [],
    travelStyle: [],
    otherTravelStyle: "",
    travelPersonality: [],
    otherTravelPersonality: "",
    activityLevel: "",
    mustVisit: "",
    attractionPreference: "",
    foodPreference: [],
    otherFoodPreference: "",
    accommodationPreference: "",
    consent: false,
    isFrequentTraveler: "",
    travelType: "",
  });

  const totalSteps = 10;

  // [NEW] Function to validate if all required fields are filled up to a certain step
  const isFormCompleteUpToStep = useCallback(
    (targetStep: number, data: IFormData): boolean => {
      for (let i = 1; i <= targetStep; i++) {
        let stepIsValid = false;
        switch (i) {
          case 1:
            stepIsValid = !!data.type;
            break;
          case 2:
            if (data.type === "personal")
              stepIsValid = !!data.fullName && !!data.email && !!data.phone;
            else if (data.type === "company")
              stepIsValid = !!data.companyName && !!data.email && !!data.phone;
            break;
          case 3:
            stepIsValid = !!data.tripType;
            break;
          case 4:
            if (data.tripType === "domestic")
              stepIsValid =
                !!data.province &&
                !!data.city &&
                !!data.address &&
                !!data.postalCode;
            else if (data.tripType === "foreign")
              stepIsValid = !!data.country && !!data.city;
            break;
          case 5:
            stepIsValid =
              !!data.travelType &&
              (Number(data.paxAdults) > 0 ||
                Number(data.paxKids) > 0 ||
                Number(data.paxTeens) > 0 ||
                Number(data.paxSeniors) > 0);
            break;
          case 6:
            stepIsValid = !!data.departureDate && !!data.duration;
            break;
          case 7:
            stepIsValid = !!data.budgetPack;
            break;
          case 8:
            stepIsValid =
              data.travelStyle.length > 0 &&
              data.travelPersonality.length > 0 &&
              !!data.activityLevel;
            break;
          case 9:
            stepIsValid = true;
            break; // Step 9 has optional fields
          // No need to validate step 10 itself for completeness check
        }
        if (!stepIsValid) {
          console.log(`Validation failed at step ${i}`); // Debugging
          return false; // If any step fails, the form is not complete
        }
      }
      console.log(`Validation passed up to step ${targetStep}`); // Debugging
      return true; // All steps up to targetStep are valid
    },
    []
  ); // Empty dependency array as this function doesn't depend on component state directly

  // Validate current step whenever step or formData changes
  useEffect(() => {
    const validateCurrentStep = () => {
      switch (step) {
        case 1:
          return !!formData.type;
        case 2:
          if (formData.type === "personal")
            return !!formData.fullName && !!formData.email && !!formData.phone;
          if (formData.type === "company")
            return !!formData.companyName && !!formData.email && !!formData.phone;
          return false;
        case 3:
          return !!formData.tripType;
        case 4:
          if (formData.tripType === "domestic")
            return (
              !!formData.province &&
              !!formData.city &&
              !!formData.address &&
              !!formData.postalCode
            );
          if (formData.tripType === "foreign")
            return !!formData.country && !!formData.city;
          return false;
        case 5:
          return (
            !!formData.travelType &&
            (Number(formData.paxAdults) > 0 ||
              Number(formData.paxKids) > 0 ||
              Number(formData.paxTeens) > 0 ||
              Number(formData.paxSeniors) > 0)
          );
        case 6:
          return !!formData.departureDate && !!formData.duration;
        case 7:
          return !!formData.budgetPack;
        case 8:
          return (
            formData.travelStyle.length > 0 &&
            formData.travelPersonality.length > 0 &&
            !!formData.activityLevel
          );
        case 9:
          return true; // Optional fields
        case 10:
          return true; // Summary step
        default:
          return false;
      }
    };
    setIsStepValid(validateCurrentStep());
  }, [step, formData]);

  // Fetch data on initial load and check completeness
  useEffect(() => {
    const fetchPlannerData = async () => {
      try {
        const response = await api.get("/trip-planner");
        if (response.data) {
          // Sanitize and map data
          // Use a generic string-indexed container so we can safely assign arrays and other shapes coming from the API
          const sanitizedData: {
            [key: string]: string | number | boolean | string[];
          } = {};
          for (const key in response.data) {
            const camelKey = key.replace(/_([a-z])/g, (g) =>
              g[1].toUpperCase()
            ) as string;
            // Ensure array fields are arrays, handle nulls gracefully
            if (
              ([
                "addons",
                "budgetPriorities",
                "travelStyle",
                "travelPersonality",
                "foodPreference",
              ] as string[]).includes(camelKey)
            ) {
              sanitizedData[camelKey] = Array.isArray(response.data[key])
                ? response.data[key]
                : [];
            } else {
              sanitizedData[camelKey] =
                response.data[key] === null ? "" : response.data[key];
            }
          }

          // Merge fetched data with default structure to ensure all keys exist
          const mergedData = { ...formData, ...sanitizedData };
          setFormData(mergedData);

          // [NEW] Check if the loaded data is complete enough to go to the summary
          // We check up to step 9 because step 10 is the summary itself.
          if (isFormCompleteUpToStep(9, mergedData)) {
            console.log("Form is complete, jumping to step 10."); // Debugging
            setStep(10); // Go directly to the summary step
          } else {
            console.log("Form is not complete, staying on step 1."); // Debugging
          }
        }
      } catch (error) {
        console.error("Could not fetch trip planner data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlannerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormCompleteUpToStep]); // Added isFormCompleteUpToStep dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const currentValues =
      (formData[name as keyof IFormData] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);
    setFormData((prev) => ({ ...prev, [name]: newValues }));
  };

  const handleMultiSelectToggle = (name: keyof IFormData, value: string) => {
    const currentValues = (formData[name] as string[]) || [];
    const isSelected = currentValues.includes(value);
    const newValues = isSelected
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    setFormData((prev) => ({ ...prev, [name]: newValues }));
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1)); // Ensure step doesn't go below 1

  const saveData = useCallback(async () => {
    if (!formData.type) return; // Don't save if initial step not done
    setIsSaving(true);
    try {
      const snakeCaseData: { [key: string]: unknown } = {};
      for (const key in formData) {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`
        );
        // Send empty strings for fields that were potentially cleared, don't just filter them
        snakeCaseData[snakeKey] = formData[key as keyof IFormData];
      }
      // No need to filter here, backend should handle updates correctly
      await api.post("/trip-planner", snakeCaseData);
      console.log("Data saved:", snakeCaseData); // Debugging
    } catch (error) {
      console.error("Failed to auto-save trip plan:", error);
      toast.error("Failed to save progress."); // User feedback
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  const handleNext = async () => {
    await saveData(); // Save current step data before moving
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await saveData(); // Ensure latest data is saved on explicit save
    toast.success("Progress saved successfully!");
    console.log("Your trip plan has been saved!");
  };

  // --- [PERUBAHAN] ---
  // Alur handleBookNow diperbarui untuk tidak memicu pembayaran
  const handleBookNow = async () => {
    if (!formData.consent) {
      toast.error("You must agree to the terms and conditions first.");
      return;
    }
    setIsBooking(true);
    try {
      await saveData(); // 1. Pastikan data terbaru disimpan

      // 2. Panggil endpoint untuk membuat pesanan (booking)
      const bookingResponse = await api.post("/trip-planner/book");
      const { order } = bookingResponse.data;
      if (!order || !order.id) {
        throw new Error("Valid order ID was not returned from booking.");
      }

      // 3. [BARU] Tampilkan pesan sukses dan arahkan ke profil
      toast.success(
        "Your trip plan has been booked! Redirecting to your profile..."
      );

      // 4. [BARU] Arahkan pengguna ke halaman profil mereka
      // Pengguna dapat melihat pesanan baru di tab "Purchase History"
      router.push(`/profile`);
      
      // [--- LOGIKA PEMBAYARAN SNAP DIHAPUS DARI SINI ---]

    } catch (error: unknown) {
      // 5. [BARU] Penanganan error yang diperbarui
      console.error("Booking failed:", error);
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ||
        "Booking failed. Please check your details or try again later.";
      toast.error(message);
    } finally {
      setIsBooking(false);
    }
  };
  // --- [AKHIR PERUBAHAN] ---

  const progress = (step / totalSteps) * 100;

  // Memoize options to prevent re-renders unless translations change
  const travelTypes = useMemo(
    () => Object.values(t.raw("options.travelTypes")) as string[],
    [t]
  );
  const budgetPacks = useMemo(
    () =>
      t.raw("options.budgetPacks") as Record<
        string,
        { title: string; description: string }
      >,
    [t]
  );
  const addonOptions = useMemo(
    () => Object.values(t.raw("options.addons")) as string[],
    [t]
  );
  const travelStyles = useMemo(
    () => Object.values(t.raw("options.travelStyles")) as string[],
    [t]
  );
  const travelPersonalities = useMemo(
    () =>
      Object.values(
        t.raw("options.travelPersonalities")
      ) as { value: string; label: string }[],
    [t]
  );
  const foodPreferences = useMemo(
    () => Object.values(t.raw("options.foodPreferences")) as string[],
    [t]
  );
  const travelerRoutines = useMemo(
    () =>
      Object.values(
        t.raw("options.travelerRoutines")
      ) as { value: string; label: string }[],
    [t]
  );
  const activityLevelOptions = useMemo(
    () =>
      Object.values(
        t.raw("options.activityLevels")
      ) as { value: string; label: string }[],
    [t]
  );

  const actionButtons = (
    <div className="mt-auto pt-8 flex flex-col-reverse sm:flex-row gap-4">
      {step > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 dark:bg-slate-600 font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition text-center dark:text-white"
        >
          {t("backButton")}
        </button>
      )}
      <div className="flex-grow"></div>
      {step < totalSteps && (
        <button
          type="button"
          onClick={handleNext}
          disabled={!isStepValid || isSaving}
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          {/* Show Saving... on the next button too */}
          {isSaving ? "Saving..." : `${t("continueButton")} `}
        </button>
      )}
      {step === totalSteps && (
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSaving || isBooking}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-200 text-black font-bold hover:bg-slate-300 transition disabled:opacity-50 text-center"
          >
            {isSaving ? "Saving..." : "Save Progress"}
          </button>
          <button
            type="button"
            onClick={handleBookNow}
            disabled={!formData.consent || isSaving || isBooking}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {/* [PERUBAHAN] Teks tombol diperbarui, tidak lagi menyebut pembayaran */}
            {isBooking ? "Booking..." : "Book Now"}
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        Loading your plan...
      </div>
    );
  }

  // --- RENDER FORM ---
  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundImage: "url(/bg2.webp)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full min-h-screen bg-black/60 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 lg:px-16 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            <div className="lg:col-span-5 w-full">
              <PlannerSidebar
                currentStep={step}
                totalSteps={totalSteps}
                setStep={setStep}
              />
            </div>

            <div className="lg:col-span-7">
              <div className="bg-card/95 dark:bg-card/85 backdrop-blur-lg shadow-xl rounded-2xl w-full">
                <div className="p-6 md:p-10 flex flex-col">
                  {/* Use a key on the form if you want animations between steps */}
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col flex-grow min-h-[500px]"
                  >
                    {/* Progress Bar */}
                    <div className="text-left mb-8">
                      <p className="text-sm text-muted-foreground">
                        {t("stepProgress", { step, totalSteps })}
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-grow">
                      {step === 1 && (
                        <div className="space-y-5">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            👋 {t("step1_title")}
                          </h3>{" "}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {" "}
                            <div
                              onClick={() =>
                                setFormData((p) => ({ ...p, type: "personal" }))
                              }
                              className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${
                                formData.type === "personal"
                                  ? "border-primary bg-primary/10"
                                  : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10"
                              }`}
                            >
                              {" "}
                              <h4 className="font-bold text-lg text-foreground">
                                🧍 {t("step1_personal_title")}
                              </h4>{" "}
                              <p className="text-sm text-muted-foreground">
                                {t("step1_personal_desc")}
                              </p>{" "}
                            </div>{" "}
                            <div
                              onClick={() =>
                                setFormData((p) => ({ ...p, type: "company" }))
                              }
                              className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${
                                formData.type === "company"
                                  ? "border-primary bg-primary/10"
                                  : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10"
                              }`}
                            >
                              {" "}
                              <h4 className="font-bold text-lg text-foreground">
                                🏢 {t("step1_company_title")}
                              </h4>{" "}
                              <p className="text-sm text-muted-foreground">
                                {t("step1_company_desc")}
                              </p>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>
                      )}
                      {step === 2 && (
                        <div className="space-y-5">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            📇 {t("step2_title")}
                          </h3>{" "}
                          {formData.type === "personal" ? (
                            <>
                              {" "}
                              <FormInput
                                label={`📝 ${t("step2_fullName")}`}
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                              />{" "}
                              <FormInput
                                label={`📧 ${t("step2_email")}`}
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                              />{" "}
                              <FormInput
                                label={`📱 ${t("step2_whatsapp")}`}
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                              />{" "}
                            </>
                          ) : (
                            <>
                              {" "}
                              <FormInput
                                label={`🏢 ${t("step2_companyName")}`}
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                              />{" "}
                              <FormInput
                                label={`🏷️ ${t("step2_brandName")}`}
                                name="brandName"
                                value={formData.brandName}
                                onChange={handleChange}
                              />{" "}
                              <FormInput
                                label={`📧 ${t("step2_email")}`}
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email"
                              />{" "}
                              <FormInput
                                label={`📱 ${t("step2_whatsapp")}`}
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                type="tel"
                              />{" "}
                            </>
                          )}{" "}
                        </div>
                      )}
                      {step === 3 && (
                        <div className="space-y-5">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            🌍 {t("step3_title")}
                          </h3>{" "}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {" "}
                            <div
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  tripType: "domestic",
                                }))
                              }
                              className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${
                                formData.tripType === "domestic"
                                  ? "border-primary bg-primary/10"
                                  : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10"
                              }`}
                            >
                              {" "}
                              <h4 className="font-bold text-lg text-foreground">
                                🇮🇩 {t("step3_domestic_title")}
                              </h4>{" "}
                              <p className="text-sm text-muted-foreground">
                                {t("step3_domestic_desc")}
                              </p>{" "}
                            </div>{" "}
                            <div
                              onClick={() =>
                                setFormData((p) => ({
                                  ...p,
                                  tripType: "foreign",
                                }))
                              }
                              className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${
                                formData.tripType === "foreign"
                                  ? "border-primary bg-primary/10"
                                  : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10"
                              }`}
                            >
                              {" "}
                              <h4 className="font-bold text-lg text-foreground">
                                🌐 {t("step3_foreign_title")}
                              </h4>{" "}
                              <p className="text-sm text-muted-foreground">
                                {t("step3_foreign_desc")}
                              </p>{" "}
                            </div>{" "}
                          </div>{" "}
                        </div>
                      )}
                      {step === 4 && (
                        <div className="space-y-5">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            📍 {t("step4_title")}
                          </h3>{" "}
                          {formData.tripType === "domestic" ? (
                            <>
                              {" "}
                              <FormInput
                                label={`🗺️ ${t("step4_province")}`}
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                              />{" "}
                              <FormInput
                                label={`🏙️ ${t("step4_city")}`}
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                              />{" "}
                              <FormInput
                                as="textarea"
                                label={`🏠 ${t("step4_address")}`}
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                              />{" "}
                              <FormInput
                                label={`📮 ${t("step4_postalCode")}`}
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                type="number"
                              />{" "}
                            </>
                          ) : (
                            <>
                              {" "}
                              <FormInput
                                label={`🌍 ${t("step4_country")}`}
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                              />{" "}
                              <FormInput
                                label={`🌆 ${t("step4_cityState")}`}
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                              />{" "}
                            </>
                          )}{" "}
                        </div>
                      )}
                      {step === 5 && (
                        <div className="space-y-5">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            👥 {t("step5_title")}
                          </h3>{" "}
                          <FormInput
                            as="select"
                            label={`✈️ ${t("step5_travelType")}`}
                            name="travelType"
                            options={travelTypes.map((type) => ({
                              label: type,
                              value: type,
                            }))}
                            value={formData.travelType}
                            onChange={handleChange}
                            selectPlaceholder={t("selectPlaceholder")}
                            description={t("step5_travelType_desc")}
                          />{" "}
                          <h4 className="font-semibold text-foreground pt-4">
                            👨‍👩‍👧‍👦 {t("step5_paxTitle")}
                          </h4>{" "}
                          <div className="grid grid-cols-2 gap-4">
                            {" "}
                            <FormInput
                              label={`👧 ${t("step5_paxKids")}`}
                              name="paxKids"
                              value={String(formData.paxKids)}
                              onChange={handleChange}
                              type="number"
                            />{" "}
                            <FormInput
                              label={`🧑 ${t("step5_paxTeens")}`}
                              name="paxTeens"
                              value={String(formData.paxTeens)}
                              onChange={handleChange}
                              type="number"
                            />{" "}
                            <FormInput
                              label={`👩 ${t("step5_paxAdults")}`}
                              name="paxAdults"
                              value={String(formData.paxAdults)}
                              onChange={handleChange}
                              type="number"
                            />{" "}
                            <FormInput
                              label={`👵 ${t("step5_paxSeniors")}`}
                              name="paxSeniors"
                              value={String(formData.paxSeniors)}
                              onChange={handleChange}
                              type="number"
                            />{" "}
                          </div>{" "}
                        </div>
                      )}
                      {step === 6 && (
                        <div className="space-y-5">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            🗓️ {t("step6_title")}
                          </h3>{" "}
                          <FormInput
                            label={`📅 ${t("step6_departureDate")}`}
                            name="departureDate"
                            value={formData.departureDate}
                            onChange={handleChange}
                            type="date"
                          />{" "}
                          <FormInput
                            label={`⏳ ${t("step6_duration")}`}
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder={t("step6_duration_placeholder")}
                          />{" "}
                        </div>
                      )}
                      {step === 7 && (
                        <div className="space-y-8">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            💸 {t("step7_title")}
                          </h3>{" "}
                          <div className="space-y-4">
                            {" "}
                            {Object.keys(budgetPacks).map((packKey) => (
                              <div
                                key={packKey}
                                onClick={() =>
                                  setFormData((p) => ({
                                    ...p,
                                    budgetPack: packKey,
                                  }))
                                }
                                className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                                  formData.budgetPack === packKey
                                    ? "border-primary bg-primary/10"
                                    : "border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10"
                                }`}
                              >
                                {" "}
                                <h4 className="font-bold text-foreground">
                                  💰{" "}
                                  {
                                    budgetPacks[
                                      packKey as keyof typeof budgetPacks
                                    ].title
                                  }
                                </h4>{" "}
                                <p className="text-sm text-muted-foreground mt-1">
                                  {
                                    budgetPacks[
                                      packKey as keyof typeof budgetPacks
                                    ].description
                                  }
                                </p>{" "}
                              </div>
                            ))}{" "}
                          </div>{" "}
                          <FormInput
                            as="checkbox-group"
                            label={`✨ ${t("step7_addonTitle")}`}
                            name="addons"
                            options={addonOptions.map((o) => ({
                              label: o,
                              value: o,
                            }))}
                            value={formData.addons}
                            onCheckboxChange={handleCheckboxChange}
                          />{" "}
                        </div>
                      )}
                      {step === 8 && (
                        <div className="space-y-8">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            🎨 {t("step8_title")}
                          </h3>{" "}
                          <div>
                            {" "}
                            <h4 className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              🚶 {t("step8_travelStyleTitle")}
                            </h4>{" "}
                            <p className="mb-3 text-xs text-muted-foreground">
                              {t("step8_travelStyleDesc")}{" "}
                            </p>{" "}
                            <div className="w-full min-h-[50px] p-2 mb-4 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 flex flex-wrap gap-2 items-center">
                              {" "}
                              {formData.travelStyle.length === 0 ? (
                                <span className="text-sm text-gray-400 dark:text-gray-500 px-2">
                                  {t("step8_selectStylePlaceholder")}
                                </span>
                              ) : (
                                formData.travelStyle.map((style) => (
                                  <button
                                    key={style}
                                    type="button"
                                    onClick={() =>
                                      handleMultiSelectToggle(
                                        "travelStyle",
                                        style
                                      )
                                    }
                                    className="px-3 py-1 rounded-full font-semibold transition text-sm bg-primary text-black flex items-center gap-2"
                                  >
                                    {" "}
                                    {style}{" "}
                                    <span className="font-bold text-lg leading-none">
                                      &times;
                                    </span>{" "}
                                  </button>
                                ))
                              )}{" "}
                            </div>{" "}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              {" "}
                              {travelStyles.map((style) => (
                                <button
                                  key={style}
                                  type="button"
                                  onClick={() =>
                                    handleMultiSelectToggle("travelStyle", style)
                                  }
                                  className={`w-full h-16 flex items-center justify-center text-center px-4 py-2 rounded-lg font-semibold transition text-sm ${
                                    formData.travelStyle.includes(style)
                                      ? "bg-primary text-black"
                                      : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                                  }`}
                                >
                                  {style}
                                </button>
                              ))}{" "}
                            </div>{" "}
                            <div className="mt-4">
                              <FormInput
                                label={`✍️ ${t("step8_otherTravelStyleTitle")}`}
                                name="otherTravelStyle"
                                value={formData.otherTravelStyle}
                                onChange={handleChange}
                                placeholder={t(
                                  "step8_otherTravelStylePlaceholder"
                                )}
                              />
                            </div>{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <h4 className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              😊 {t("step8_personalityTitle")}
                            </h4>{" "}
                            <p className="mb-3 text-xs text-muted-foreground">
                              {t("step8_personalityDesc")}{" "}
                            </p>{" "}
                            <div className="w-full min-h-[50px] p-2 mb-4 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600 flex flex-wrap gap-2 items-center">
                              {" "}
                              {formData.travelPersonality.length === 0 ? (
                                <span className="text-sm text-gray-400 dark:text-gray-500 px-2">
                                  {t("step8_selectPersonalityPlaceholder")}
                                </span>
                              ) : (
                                formData.travelPersonality.map((value) => {
                                  const p = travelPersonalities.find(
                                    (p) => p.value === value
                                  );
                                  return p ? (
                                    <button
                                      key={p.value}
                                      type="button"
                                      onClick={() =>
                                        handleMultiSelectToggle(
                                          "travelPersonality",
                                          p.value
                                        )
                                      }
                                      className="px-3 py-1 rounded-full font-semibold transition text-sm bg-primary text-black flex items-center gap-2"
                                    >
                                      {p.label}
                                      <span className="font-bold text-lg leading-none">
                                        &times;
                                      </span>
                                    </button>
                                  ) : null;
                                })
                              )}{" "}
                            </div>{" "}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                              {" "}
                              {travelPersonalities.map((p) => (
                                <button
                                  key={p.value}
                                  type="button"
                                  onClick={() =>
                                    handleMultiSelectToggle(
                                      "travelPersonality",
                                      p.value
                                    )
                                  }
                                  className={`w-full h-16 flex items-center justify-center text-center px-4 py-2 rounded-lg font-semibold transition text-sm ${
                                    formData.travelPersonality.includes(p.value)
                                      ? "bg-primary text-black"
                                      : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                                  }`}
                                >
                                  {p.label}
                                </button>
                              ))}{" "}
                            </div>{" "}
                            <div className="mt-4">
                              <FormInput
                                label={`✍️ ${t("step8_otherPersonalityTitle")}`}
                                name="otherTravelPersonality"
                                value={formData.otherTravelPersonality}
                                onChange={handleChange}
                                placeholder={t(
                                  "step8_otherPersonalityPlaceholder"
                                )}
                              />
                            </div>{" "}
                          </div>{" "}
                          <div>
                            <FormInput
                              as="select"
                              label={`🤸 ${t("step8_activityLevelTitle")}`}
                              name="activityLevel"
                              value={formData.activityLevel}
                              onChange={handleChange}
                              options={activityLevelOptions}
                              selectPlaceholder={t(
                                "step8_activityLevelPlaceholder"
                              )}
                            />
                          </div>{" "}
                        </div>
                      )}
                      {step === 9 && (
                        <div className="space-y-5">
                          {" "}
                          <h3 className="text-xl font-bold text-foreground">
                            ❤️ {t("step9_title")}
                          </h3>{" "}
                          <FormInput
                            as="textarea"
                            label={`⭐ ${t("step9_mustVisit")}`}
                            name="mustVisit"
                            value={formData.mustVisit}
                            onChange={handleChange}
                            placeholder={t("step9_mustVisit_placeholder")}
                          />{" "}
                          <div>
                            {" "}
                            <FormInput
                              as="checkbox-group"
                              label={`🍔 ${t("step9_foodPreference")}`}
                              name="foodPreference"
                              options={foodPreferences.map((f) => ({
                                label: f,
                                value: f,
                              }))}
                              value={formData.foodPreference}
                              onCheckboxChange={handleCheckboxChange}
                            />{" "}
                            <div className="mt-4">
                              <FormInput
                                label={`📝 ${t(
                                  "step9_otherFoodPreferenceTitle"
                                )}`}
                                name="otherFoodPreference"
                                value={formData.otherFoodPreference}
                                onChange={handleChange}
                                placeholder={t(
                                  "step9_otherFoodPreferencePlaceholder"
                                )}
                              />
                            </div>{" "}
                          </div>{" "}
                          <FormInput
                            as="textarea"
                            label={`🏨 ${t("step9_accommodationPreference")}`}
                            name="accommodationPreference"
                            value={formData.accommodationPreference}
                            onChange={handleChange}
                            placeholder={t(
                              "step9_accommodationPreference_placeholder"
                            )}
                          />{" "}
                        </div>
                      )}

                      {step === 10 && (
                        <div className="space-y-6">
                          <h3 className="text-2xl font-bold text-foreground">
                            ✅ {t("step10_title")}
                          </h3>
                          <p className="text-muted-foreground">
                            {t("sidebar.summary.reviewDescription")}
                          </p>

                          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                            {/* Dynamically generate summary items */}
                            <SummaryItem
                              label={t("step1_title")}
                              value={
                                formData.type === "personal"
                                  ? t("step1_personal_title")
                                  : formData.type === "company"
                                  ? t("step1_company_title")
                                  : ""
                              }
                            />
                            {formData.type === "personal" && (
                              <SummaryItem
                                label={t("step2_fullName")}
                                value={formData.fullName}
                              />
                            )}
                            {formData.type === "company" && (
                              <SummaryItem
                                label={t("step2_companyName")}
                                value={formData.companyName}
                              />
                            )}
                            <SummaryItem
                              label={t("step2_email")}
                              value={formData.email}
                            />
                            <SummaryItem
                              label={t("step2_whatsapp")}
                              value={formData.phone}
                            />
                            <SummaryItem
                              label={t("step3_title")}
                              value={
                                formData.tripType === "domestic"
                                  ? t("step3_domestic_title")
                                  : formData.tripType === "foreign"
                                  ? t("step3_foreign_title")
                                  : ""
                              }
                            />
                            {formData.tripType === "domestic" && (
                              <>
                                <SummaryItem
                                  label={t("step4_province")}
                                  value={formData.province}
                                />
                                <SummaryItem
                                  label={t("step4_city")}
                                  value={formData.city}
                                />
                                <SummaryItem
                                  label={t("step4_address")}
                                  value={formData.address}
                                />
                                <SummaryItem
                                  label={t("step4_postalCode")}
                                  value={formData.postalCode}
                                />
                              </>
                            )}
                            {formData.tripType === "foreign" && (
                              <>
                                <SummaryItem
                                  label={t("step4_country")}
                                  value={formData.country}
                                />
                                <SummaryItem
                                  label={t("step4_cityState")}
                                  value={formData.city}
                                />
                              </>
                            )}
                            <SummaryItem
                              label={t("step5_travelType")}
                              value={formData.travelType}
                            />
                            <SummaryItem
                              label={t("sidebar.summary.participants")}
                              value={t("sidebar.summary.participantsValue", {
                                adults: Number(formData.paxAdults) || 0,
                                kids: Number(formData.paxKids) || 0,
                                teens: Number(formData.paxTeens) || 0,
                                seniors: Number(formData.paxSeniors) || 0,
                              })}
                            />
                            <SummaryItem
                              label={t("step6_departureDate")}
                              value={formData.departureDate}
                            />
                            <SummaryItem
                              label={t("step6_duration")}
                              value={formData.duration}
                            />
                            <SummaryItem
                              label={t("sidebar.summary.budgetPack")}
                              value={
                                budgetPacks[formData.budgetPack]?.title
                              }
                            />
                            <SummaryItem
                              label={t("step7_addonTitle")}
                              value={formData.addons}
                            />
                            <SummaryItem
                              label={t("step8_travelStyleTitle")}
                              value={formData.travelStyle.concat(
                                formData.otherTravelStyle
                                  ? [formData.otherTravelStyle]
                                  : []
                              )}
                            />
                            <SummaryItem
                              label={t("step8_personalityTitle")}
                              value={formData.travelPersonality
                                .map((val) =>
                                  travelPersonalities.find(
                                    (p) => p.value === val
                                  )?.label
                                )
                                .filter(
                                  (v): v is string => typeof v === "string"
                                )
                                .concat(
                                  formData.otherTravelPersonality
                                    ? [formData.otherTravelPersonality]
                                    : []
                                )}
                            />
                            <SummaryItem
                              label={t("step8_activityLevelTitle")}
                              value={activityLevelOptions.find(
                                (opt) => opt.value === formData.activityLevel
                              )?.label}
                            />
                            <SummaryItem
                              label={t("step9_mustVisit")}
                              value={formData.mustVisit}
                            />
                            <SummaryItem
                              label={t("step9_foodPreference")}
                              value={formData.foodPreference.concat(
                                formData.otherFoodPreference
                                  ? [formData.otherFoodPreference]
                                  : []
                              )}
                            />
                            <SummaryItem
                              label={t("step9_accommodationPreference")}
                              value={formData.accommodationPreference}
                            />
                          </div>

                          <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <label className="flex items-start space-x-3 p-4 rounded-lg border-2 border-gray-300 dark:border-slate-600 cursor-pointer">
                              <input
                                type="checkbox"
                                name="consent"
                                checked={formData.consent}
                                onChange={(e) =>
                                  setFormData((p) => ({
                                    ...p,
                                    consent: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 mt-1 rounded text-primary focus:ring-primary border-gray-400 bg-transparent"
                              />
                              <span className="text-sm text-foreground">
                                {t("step10_consent")}
                              </span>
                            </label>
                            <FormInput
                              as="radio-group"
                              label={`🔁 ${t("step10_frequentTraveler")}`}
                              name="isFrequentTraveler"
                              options={travelerRoutines}
                              value={formData.isFrequentTraveler}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {actionButtons}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}