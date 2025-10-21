// app/[locale]/planner/PlannerForm.tsx
"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
} from "react"; // Tambahkan useMemo
import { useTranslations } from "next-intl";
import api from "@/lib/api";

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
  budgetPriorities: string[];
  travelStyle: string[];
  otherTravelStyle: string;
  travelPersonality: string[];
  otherTravelPersonality: string;
  activityLevel: string;
  mustVisit: string;
  attractionPreference: string;
  foodPreference: string[];
  otherFoodPreference: string;
  accommodationPreference: string;
  consent: boolean;
  isFrequentTraveler: string;
  travelType: string; // Ini akan jadi value dari radio button (e.g., 'family', 'couple')
}

// --- Define type for Midtrans Snap to avoid 'any' ---
interface Snap {
  pay(
    token: string,
    options: {
      onSuccess: (result: unknown) => void;
      onPending: (result: unknown) => void;
      onError: (result: unknown) => void;
      onClose: () => void; // Tambahkan onClose
    }
  ): void;
}

// --- Komponen Bantuan untuk Ringkasan ---
const SummaryItem = ({
  label,
  value,
}: {
  label: string;
  value: string | string[] | undefined | null;
}) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800">{displayValue}</p>
    </div>
  );
};

// --- Komponen Input yang Dimodifikasi ---
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
}) => {
  const baseInputClasses =
    "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white text-gray-900 dark:text-slate-800 border border-gray-300 dark:border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none transition placeholder:text-gray-400 dark:placeholder:text-slate-400";
  if (as === "select") {
    /* ... kode select ... */
  }
  if (as === "textarea") {
    /* ... kode textarea ... */
  }
  if (as === "checkbox-group" || as === "radio-group") {
    return (
      <div>
        <h4 className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </h4>
        <div className="space-y-3">
          {options.map((opt) => {
            const optValue = typeof opt === "string" ? opt : opt.value;
            const optLabel = typeof opt === "string" ? opt : opt.label;
            const optDescription =
              typeof opt !== "string" ? opt.description : undefined;
            const isCheckbox = as === "checkbox-group";
            // Cek apakah value (array untuk checkbox) mengandung optValue
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
                  // Gunakan onCheckboxChange untuk checkbox, onChange untuk radio
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
  // Input standar
  return (
    <div>
      {" "}
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>{" "}
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
  const [step, setStep] = useState(1);
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

  useEffect(() => {
    const fetchPlannerData = async () => {
      try {
        const response = await api.get("/trip-planner");
        if (response.data) {
          const sanitizedData: { [key: string]: unknown } = {};
          for (const key in response.data) {
            const camelKey = key.replace(/_([a-z])/g, (g) =>
              g[1].toUpperCase()
            );
            if (response.data[key] === null) {
              sanitizedData[camelKey] = ""; // Sanitize nulls
            } else {
              sanitizedData[camelKey] = response.data[key];
            }
          }
          setFormData((prev) => ({
            ...prev,
            ...sanitizedData,
            addons: (sanitizedData.addons as string[]) || [],
            budgetPriorities:
              (sanitizedData.budgetPriorities as string[]) || [],
            travelStyle: (sanitizedData.travelStyle as string[]) || [],
            travelPersonality:
              (sanitizedData.travelPersonality as string[]) || [],
            foodPreference: (sanitizedData.foodPreference as string[]) || [],
          }));
        }
      } catch (error) {
        console.error("Could not fetch trip planner data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlannerData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    const currentValues = (formData[name as keyof IFormData] as string[]) || [];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((item) => item !== value);
    setFormData((prev) => ({ ...prev, [name]: newValues }));
  };

  const handleBack = () => setStep((prev) => prev - 1);

  // --- BACKEND CONNECTION ---
  const saveData = useCallback(async () => {
    if (!formData.type) return;

    setIsSaving(true);
    try {
      const snakeCaseData: { [key: string]: unknown } = {};
      for (const key in formData) {
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`
        );
        snakeCaseData[snakeKey] = formData[key as keyof IFormData];
      }
      // Kirim hanya data yang tidak kosong atau null atau array kosong
      const filteredData = Object.entries(snakeCaseData).reduce(
        (acc, [key, value]) => {
          if (
            value !== "" &&
            value !== null &&
            (!Array.isArray(value) || value.length > 0)
          ) {
            // @ts-expect-error: Index signature issue
            acc[key] = value;
          }
          return acc;
        },
        {}
      );
      await api.post("/trip-planner", filteredData); // Kirim data yang sudah difilter
    } catch (error) {
      console.error("Failed to auto-save trip plan:", error);
      alert(
        "Could not save your progress. Please check your connection and try again."
      );
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  // --- Saves data on every "next" click ---
  const handleNext = async () => {
    await saveData();
    setStep((prev) => prev + 1);
  };

  // --- Saves data on final "Save Progress" click ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await saveData();
    setStep(totalSteps); // Pindah ke step terakhir (ringkasan) setelah save
    alert("Your trip plan has been saved!");
  };

  // --- BACKEND CONNECTION (Booking) ---
  const handleBookNow = async () => {
    if (!formData.consent) {
      alert("Please agree to the terms and conditions first.");
      return;
    }
    setIsBooking(true);
    try {
      await saveData(); // Save the latest data first
      const bookingResponse = await api.post("/trip-planner/book");
      const newBooking = bookingResponse.data;
      if (!newBooking || !newBooking.id) {
        throw new Error("Booking ID was not returned from the server.");
      }
      const paymentResponse = await api.post("/payment/token", {
        booking_id: newBooking.id,
      });
      const { snap_token } = paymentResponse.data;

      if (snap_token && (window as Window & { snap?: Snap }).snap) {
        (window as Window & { snap?: Snap }).snap?.pay(snap_token, {
          onSuccess: (result: unknown) => {
            alert("Payment success!");
            console.log(result);
          },
          onPending: (result: unknown) => {
            alert("Waiting for your payment!");
            console.log(result);
          },
          onError: (result: unknown) => {
            alert("Payment failed!");
            console.log(result);
          },
          onClose: () => {
            console.log("Payment popup closed."); // Tambahkan log atau notifikasi jika diperlukan
          },
        });
      } else {
        console.error("Snap token received but window.snap is not available.");
        alert(
          "Payment gateway could not be loaded. Please try refreshing the page."
        );
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert(
        "Something went wrong during the booking process. Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  };

  const totalSteps = 10;
  const progress = (step / totalSteps) * 100;

  // --- Translation/Options Data ---
  // Mengambil data travelTypes dengan struktur baru
  const travelTypesOptions = useMemo(() => {
    // Asumsi struktur di JSON: { "family": { "title": "...", "description": "..." }, ... }
    const rawTypes = t.raw("options.travelTypes") as Record<
      string,
      { title: string; description: string }
    >;
    return Object.entries(rawTypes).map(([key, value]) => ({
      value: key, // Menggunakan key (e.g., "family") sebagai value
      label: value.title,
      description: value.description,
    }));
  }, [t]);

  const budgetPacks = t.raw("options.budgetPacks") as Record<
    string,
    { title: string; description: string }
  >;
  const addonOptions = Object.values(t.raw("options.addons")) as string[];
  const travelPersonalities = Object.values(
    t.raw("options.travelPersonalities")
  ) as { value: string; label: string }[];
  const foodPreferences = Object.values(
    t.raw("options.foodPreferences")
  ) as string[];
  const travelerRoutines = Object.values(t.raw("options.travelerRoutines")) as {
    value: string;
    label: string;
  }[];
  const activityLevelOptions = Object.values(
    t.raw("options.activityLevels")
  ) as { value: string; label: string }[];

  // --- Summary Helper Functions ---
  const getTravelTypeLabel = () =>
    travelTypesOptions.find((opt) => opt.value === formData.travelType)?.label;
  const getTravelPersonalityLabels = () => {
    if (!formData.travelPersonality) return [];
    return formData.travelPersonality
      .map((value) => travelPersonalities.find((p) => p.value === value)?.label)
      .filter((l): l is string => Boolean(l));
  };
  const getActivityLevelLabel = () =>
    activityLevelOptions.find((opt) => opt.value === formData.activityLevel)
      ?.label;
  const getFrequentTravelerLabel = () =>
    travelerRoutines.find((opt) => opt.value === formData.isFrequentTraveler)
      ?.label;

  // --- Action Buttons (Dynamic based on step) ---
  const actionButtons = (
    <div className="mt-auto pt-8 flex flex-col-reverse sm:flex-row gap-4">
      {step > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 dark:bg-slate-600 font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition text-center dark:text-white"
        >
          ⬅️ {t("backButton")}
        </button>
      )}
      <div className="flex-grow"></div>
      {step < totalSteps && (
        <button
          type="button"
          onClick={handleNext}
          disabled={
            (step === 1 && (!formData.type || !formData.tripType)) || isSaving
          }
          className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
        >
          {isSaving ? "Saving..." : `${t("continueButton")} ➡️`}
        </button>
      )}
      {step === totalSteps && (
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          {/* Tombol Save Progress diganti menjadi Submit Biasa (karena auto-save) */}
          <button
            type="submit"
            disabled={isSaving || isBooking}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-200 text-black font-bold hover:bg-slate-300 transition disabled:opacity-50 text-center"
          >
            {isSaving ? "Saving..." : "Save Progress"}{" "}
            {/* Atau ganti teksnya jika perlu */}
          </button>
          <button
            type="button"
            onClick={handleBookNow}
            disabled={!formData.consent || isSaving || isBooking}
            className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            {isBooking ? "Processing..." : "Book Now 💳"}
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading your plan...
      </div>
    );
  }

  return (
    <div className="bg-background w-full">
      <div className="w-full px-4 sm:px-6 lg:px-16 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* --- Sidebar / Summary --- */}
          <div className="lg:col-span-5 lg:sticky lg:top-16">
            {step === 1 ? (
              <div className="flex flex-col h-full">
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                    🗺️ {t("sidebar.planYourTrip")}
                  </p>
                  <h2 className="text-4xl lg:text-5xl font-bold mt-2 font-serif text-slate-800 dark:text-white">
                    {t("sidebar.title")}
                  </h2>
                  <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                    {t("sidebar.description")}
                  </p>
                </div>
                <div className="mt-12 border-t pt-8 border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white">
                    {" "}
                    {t("sidebar.needHelp")}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {t("sidebar.contactUs")}{" "}
                    <a
                      href="mailto:info@travelmore.travel"
                      className="text-primary font-semibold hover:underline"
                    >
                      info@travelmore.travel
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-inner">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wider">
                    📋 {t("sidebar.summary.summaryTitle")}
                  </p>
                  {isSaving && (
                    <p className="text-sm text-slate-500 animate-pulse">
                      Saving...
                    </p>
                  )}
                </div>
                <h2 className="text-3xl font-bold mt-2 font-serif text-slate-800 dark:text-white">
                  🔍{" "}
                  {step === totalSteps
                    ? t("sidebar.summary.reviewTitle")
                    : "Your Plan So Far"}
                </h2>
                <p className="mt-4 mb-6 text-slate-600 dark:text-slate-300">
                  ✅{" "}
                  {step === totalSteps
                    ? t("sidebar.summary.reviewDescription")
                    : "Here's a preview of your selections."}
                </p>
                <div className="flex-grow space-y-4 overflow-y-auto pr-2 border-l-2 border-primary/20 pl-4 max-h-[40vh]">
                  {" "}
                  {/* Batasi tinggi dan beri scroll */}
                  <SummaryItem
                    label={t("sidebar.summary.contactPerson")}
                    value={formData.fullName || formData.companyName}
                  />
                  {/* Menampilkan label Trip Type yang dipilih */}
                  <SummaryItem
                    label={t("sidebar.summary.tripType")}
                    value={getTravelTypeLabel()}
                  />
                  <SummaryItem
                    label={t("sidebar.summary.destination")}
                    value={formData.city || formData.country}
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
                    label={t("sidebar.summary.departure")}
                    value={formData.departureDate}
                  />
                  <SummaryItem
                    label={t("sidebar.summary.duration")}
                    value={formData.duration}
                  />
                  <SummaryItem
                    label={t("sidebar.summary.budgetPack")}
                    value={budgetPacks[formData.budgetPack]?.title}
                  />
                  <SummaryItem
                    label={t("sidebar.summary.addons")}
                    value={formData.addons}
                  />
                  {/* <SummaryItem label={t("sidebar.summary.travelStyle")} value={formData.travelStyle} /> */}
                  {/* Menampilkan label Personality yang dipilih */}
                  {/* <SummaryItem label="Personality" value={getTravelPersonalityLabels()} /> */}
                  {/* Menampilkan label Activity Level yang dipilih */}
                  {/* <SummaryItem label="Activity Level" value={getActivityLevelLabel()} /> */}
                  {/* Menampilkan label Frequent Traveler yang dipilih */}
                  {/* <SummaryItem label="Frequent Traveler" value={getFrequentTravelerLabel()} /> */}
                </div>
              </div>
            )}
          </div>

          {/* --- Form Area --- */}
          <div className="lg:col-span-7">
            <div className="bg-card shadow-xl rounded-2xl w-full">
              <div className="p-6 md:p-10 flex flex-col">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col flex-grow min-h-[500px]"
                >
                  {/* --- Progress Bar --- */}
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

                  {/* --- Dynamic Step Content --- */}
                  <div className="flex-grow">
                    {step === 1 /* ... Step 1 content ... */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            👋 {t("step1_title")}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              <h4 className="font-bold text-lg text-foreground">
                                🧍 {t("step1_personal_title")}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {t("step1_personal_desc")}
                              </p>
                            </div>
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
                              <h4 className="font-bold text-lg text-foreground">
                                🏢 {t("step1_company_title")}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {t("step1_company_desc")}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            🌍 {t("step3_title")}
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              <h4 className="font-bold text-lg text-foreground">
                                🇮🇩 {t("step3_domestic_title")}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {t("step3_domestic_desc")}
                              </p>
                            </div>
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
                              <h4 className="font-bold text-lg text-foreground">
                                🌐 {t("step3_foreign_title")}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {t("step3_foreign_desc")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 2 /* ... Step 2 content ... */ && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-foreground">
                          📇 {t("step2_title")}
                        </h3>
                        {formData.type === "personal" ? (
                          <>
                            <FormInput
                              label={`📝 ${t("step2_fullName")}`}
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                            />
                            <FormInput
                              label={`📧 ${t("step2_email")}`}
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              type="email"
                            />
                            <FormInput
                              label={`📱 ${t("step2_whatsapp")}`}
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              type="tel"
                            />
                          </>
                        ) : (
                          <>
                            <FormInput
                              label={`🏢 ${t("step2_companyName")}`}
                              name="companyName"
                              value={formData.companyName}
                              onChange={handleChange}
                            />
                            <FormInput
                              label={`🏷️ ${t("step2_brandName")}`}
                              name="brandName"
                              value={formData.brandName}
                              onChange={handleChange}
                            />
                            <FormInput
                              label={`📧 ${t("step2_email")}`}
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              type="email"
                            />
                            <FormInput
                              label={`📱 ${t("step2_whatsapp")}`}
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              type="tel"
                            />
                          </>
                        )}
                      </div>
                    )}
                    {step === 3 /* ... Step 3 content ... */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            📍 {t("step4_title")}
                          </h3>
                          {formData.tripType === "domestic" ? (
                            <div className="space-y-5">
                              <FormInput
                                label={`🗺️ ${t("step4_province")}`}
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                              />
                              <FormInput
                                label={`🏙️ ${t("step4_city")}`}
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                              />
                              {/* Opsi: Address & Postal Code jika perlu */}
                              {/* <FormInput label={`🏠 ${t('step4_address')}`} name="address" value={formData.address} onChange={handleChange} /> */}
                              {/* <FormInput label={`📬 ${t('step4_postalCode')}`} name="postalCode" value={formData.postalCode} onChange={handleChange} /> */}
                            </div>
                          ) : (
                            <div className="space-y-5">
                              <FormInput
                                label={`🌍 ${t("step4_country")}`}
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                              />
                              <FormInput
                                label={`🌆 ${t("step4_cityState")}`}
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {step === 4 /* ... Step 4 content ... */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            🗓️ {t("step6_title")}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormInput
                              label={`📅 ${t("step6_departureDate")}`}
                              name="departureDate"
                              value={formData.departureDate}
                              onChange={handleChange}
                              type="date"
                            />
                            <FormInput
                              label={`⏳ ${t("step6_duration")}`}
                              name="duration"
                              value={formData.duration}
                              onChange={handleChange}
                              placeholder={t("step6_duration_placeholder")}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 5 /* ... Step 5 content ... */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground">
                            👥 {t("step5_paxTitle")}
                          </h3>
                          <div className="space-y-5 mt-4">
                            {/* <h4 className="font-semibold text-foreground pt-4">👨‍👩‍👧‍👦 {t('step5_paxTitle')}</h4> */}
                            <div className="grid grid-cols-2 gap-4">
                              <FormInput
                                label={`👩 ${t("step5_paxAdults")}`}
                                name="paxAdults"
                                value={String(formData.paxAdults)}
                                onChange={handleChange}
                                type="number"
                              />
                              <FormInput
                                label={`🧑 ${t("step5_paxTeens")}`}
                                name="paxTeens"
                                value={String(formData.paxTeens)}
                                onChange={handleChange}
                                type="number"
                              />
                              <FormInput
                                label={`👧 ${t("step5_paxKids")}`}
                                name="paxKids"
                                value={String(formData.paxKids)}
                                onChange={handleChange}
                                type="number"
                              />
                              <FormInput
                                label={`👵 ${t("step5_paxSeniors")}`}
                                name="paxSeniors"
                                value={String(formData.paxSeniors)}
                                onChange={handleChange}
                                type="number"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {step ===
                      6 /* --- STEP 6: Travel Type (Radio Card) & Activity Level --- */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            🎨 {t("step8_title")}
                          </h3>
                          <div className="space-y-5">
                            {/* --- Travel Type (Radio Card) --- */}
                            <FormInput
                              as="radio-group"
                              label={`✈️ ${t("step5_travelType")}`} // Mengambil label dari step 5
                              name="travelType" // Tetap gunakan name="travelType"
                              options={travelTypesOptions} // Gunakan options yang sudah disiapkan
                              value={formData.travelType}
                              onChange={handleChange}
                            />
                            {/* --- Activity Level (Select) --- */}
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
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 7 /* ... Step 7 content ... */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            💸 {t("step7_title")}
                          </h3>
                          <div className="space-y-4">
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
                                <h4 className="font-bold text-foreground">
                                  💰{" "}
                                  {
                                    budgetPacks[
                                      packKey as keyof typeof budgetPacks
                                    ].title
                                  }
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {
                                    budgetPacks[
                                      packKey as keyof typeof budgetPacks
                                    ].description
                                  }
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 8 /* ... Step 8 content ... */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            ✨ {t("step7_addonTitle")}
                          </h3>
                          <FormInput
                            as="checkbox-group"
                            label=""
                            name="addons"
                            options={addonOptions}
                            value={formData.addons}
                            onCheckboxChange={handleCheckboxChange}
                          />
                        </div>
                      </div>
                    )}
                    {step === 9 /* ... Step 9 content ... */ && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-4">
                            ❤️ {t("step9_title")}
                          </h3>
                          <div className="space-y-5">
                            <FormInput
                              as="textarea"
                              label={`⭐ ${t("step9_mustVisit")}`}
                              name="mustVisit"
                              value={formData.mustVisit}
                              onChange={handleChange}
                              placeholder={t("step9_mustVisit_placeholder")}
                            />
                            <FormInput
                              as="checkbox-group"
                              label={`🍔 ${t("step9_foodPreference")}`}
                              name="foodPreference"
                              options={foodPreferences}
                              value={formData.foodPreference}
                              onCheckboxChange={handleCheckboxChange}
                            />
                            <FormInput
                              as="textarea"
                              label={`🏨 ${t("step9_accommodationPreference")}`}
                              name="accommodationPreference"
                              value={formData.accommodationPreference}
                              onChange={handleChange}
                              placeholder={t(
                                "step9_accommodationPreference_placeholder"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {step === 10 /* ... Step 10 content ... */ && (
                      <div className="space-y-5">
                        <h3 className="text-xl font-bold text-foreground">
                          ✅ {t("step10_title")}
                        </h3>
                        <label className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-primary/10 border border-gray-200 dark:border-slate-600">
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
                            className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-400 bg-transparent"
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
                    )}
                  </div>

                  {/* --- Renders Back/Next/Submit buttons --- */}
                  {actionButtons}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
