"use client";

import React, { useState, useEffect, useCallback } from "react";
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
    travelType: string;
}

// ✅ --- FIX: Define type for Midtrans Snap to avoid 'any' ---
interface Snap {
    pay(
        token: string,
        options: {
            onSuccess: (result: unknown) => void;
            onPending: (result: unknown) => void;
            onError: (result: unknown) => void;
        }
    ): void;
}

// --- Komponen Bantuan untuk Ringkasan ---
const SummaryItem = ({ label, value }: { label: string; value: string | string[] | undefined | null }) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    const displayValue = Array.isArray(value) ? value.join(', ') : value;
    return (
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="font-semibold text-slate-800">{displayValue}</p>
        </div>
    );
};

// --- Komponen Input ---
const FormInput = ({ label, name, value, onChange, placeholder, type = "text", as, options = [], onCheckboxChange, selectPlaceholder }: {
    label: string; name: keyof IFormData; value: string | string[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    placeholder?: string; type?: string; as?: 'select' | 'textarea' | 'checkbox-group' | 'radio-group';
    options?: (string | { value: string; label: string })[];
    onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectPlaceholder?: string;
}) => {
    const baseInputClasses = "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white text-gray-900 dark:text-slate-800 border border-gray-300 dark:border-slate-300 focus:ring-2 focus:ring-primary focus:outline-none transition placeholder:text-gray-400 dark:placeholder:text-slate-400";
    if (as === 'select') { return (<div> <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label> <select name={name} value={value as string} onChange={onChange} className={baseInputClasses}> <option value="" disabled>{selectPlaceholder}</option> {options.map(opt => { const val = typeof opt === 'string' ? opt : opt.value; const lab = typeof opt === 'string' ? opt : opt.label; return <option key={val} value={val}>{lab}</option>; })} </select> </div>); }
    if (as === 'textarea') { return (<div> <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label> <textarea name={name} value={value as string} onChange={onChange} placeholder={placeholder} rows={4} className={baseInputClasses} /> </div>); }
    if (as === 'checkbox-group' || as === 'radio-group') { return (<div> <h4 className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</h4> <div className="space-y-2"> {options.map(opt => { const optValue = typeof opt === 'string' ? opt : opt.value; const optLabel = typeof opt === 'string' ? opt : opt.label; const isCheckbox = as === 'checkbox-group'; return (<label key={optValue} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-primary/10 border-gray-200 dark:border-slate-600"> <input type={isCheckbox ? "checkbox" : "radio"} name={name} value={optValue} checked={isCheckbox ? (value as string[]).includes(optValue) : value === optValue} onChange={isCheckbox ? onCheckboxChange : onChange} className={`h-4 w-4 ${isCheckbox ? 'rounded' : 'rounded-full'} text-primary focus:ring-primary border-gray-400 bg-transparent`} /> <span className="text-sm text-foreground">{optLabel}</span> </label>); })} </div> </div>); }
    return (<div> <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label> <input type={type} name={name} value={value as string} onChange={onChange} placeholder={placeholder} className={baseInputClasses} /> </div>);
};


// --- Komponen Formulir Utama ---
export default function PlannerForm() {
    const t = useTranslations("PlannerForm");
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [formData, setFormData] = useState<IFormData>({
        type: "", tripType: "", fullName: "", email: "", phone: "", companyName: "",
        brandName: "", province: "", city: "", address: "", postalCode: "", country: "",
        paxAdults: "", paxTeens: "", paxKids: "", paxSeniors: "", departureDate: "",
        duration: "", budgetPack: "", addons: [], budgetPriorities: [],
        travelStyle: [], otherTravelStyle: "", travelPersonality: [], otherTravelPersonality: "",
        activityLevel: "", mustVisit: "", attractionPreference: "", foodPreference: [],
        otherFoodPreference: "", accommodationPreference: "", consent: false,
        isFrequentTraveler: "", travelType: "",
    });

    useEffect(() => {
        const fetchPlannerData = async () => {
            try {
                const response = await api.get('/trip-planner');
                if (response.data) {
                    // ✅ --- FIX: Replaced 'any' with 'unknown' ---
                    const sanitizedData: { [key: string]: unknown } = {};
                    // ✅ --- NEW: Convert incoming snake_case keys to camelCase ---
                    for (const key in response.data) {
                        const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
                        if (response.data[key] === null) {
                            sanitizedData[camelKey] = ""; // Sanitize nulls
                        } else {
                            sanitizedData[camelKey] = response.data[key];
                        }
                    }
                    setFormData(prev => ({
                        ...prev, ...sanitizedData,
                        // ✅ --- FIX: Add type assertions for 'unknown' properties ---
                        addons: (sanitizedData.addons as string[]) || [],
                        budgetPriorities: (sanitizedData.budgetPriorities as string[]) || [],
                        travelStyle: (sanitizedData.travelStyle as string[]) || [],
                        travelPersonality: (sanitizedData.travelPersonality as string[]) || [],
                        foodPreference: (sanitizedData.foodPreference as string[]) || [],
                    }));
                }
            } catch (error) { console.error("Could not fetch trip planner data:", error); }
            finally { setIsLoading(false); }
        };
        fetchPlannerData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        const currentValues = (formData[name as keyof IFormData] as string[]) || [];
        const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
        setFormData(prev => ({ ...prev, [name]: newValues }));
    };

    // ✅ --- FIX: Removed unused function 'handleMultiSelectToggle' ---

    const handleBack = () => setStep(prev => prev - 1);

    // ✅ --- THIS IS THE FIX ---
    // This function now converts all form data keys from camelCase to snake_case
    // before sending it to the Laravel backend.
    const saveData = useCallback(async () => {
        if (!formData.type) return;

        setIsSaving(true);
        try {
            // ✅ --- FIX: Replaced 'any' with 'unknown' ---
            const snakeCaseData: { [key: string]: unknown } = {};
            for (const key in formData) {
                const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                snakeCaseData[snakeKey] = formData[key as keyof IFormData];
            }
            await api.post('/trip-planner', snakeCaseData);
        } catch (error) {
            console.error("Failed to auto-save trip plan:", error);
            alert("Could not save your progress. Please check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    }, [formData]);

    const handleNext = async () => {
        await saveData();
        setStep(prev => prev + 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveData();
        setStep(totalSteps);
        alert("Your trip plan has been saved!");
    };

    const handleBookNow = async () => {
        if (!formData.consent) {
            alert("Please agree to the terms and conditions first.");
            return;
        }
        setIsBooking(true);
        try {
            await saveData();
            const bookingResponse = await api.post('/trip-planner/book');
            const newBooking = bookingResponse.data;
            if (!newBooking || !newBooking.id) {
                throw new Error("Booking ID was not returned from the server.");
            }
            const paymentResponse = await api.post('/payment/token', { booking_id: newBooking.id });
            const { snap_token } = paymentResponse.data;

            // ✅ --- FIX: Replaced 'any' with specific 'Snap' type and 'unknown' for results ---
            if (snap_token && (window as Window & { snap?: Snap }).snap) {
                (window as Window & { snap?: Snap }).snap?.pay(snap_token, {
                    onSuccess: (result: unknown) => { alert("Payment success!"); console.log(result); },
                    onPending: (result: unknown) => { alert("Waiting for your payment!"); console.log(result); },
                    onError: (result: unknown) => { alert("Payment failed!"); console.log(result); },
                });
            }
        } catch (error) {
            console.error("Booking failed:", error);
            alert("Something went wrong during the booking process. Please try again.");
        } finally {
            setIsBooking(false);
        }
    };

    const totalSteps = 6;
    const progress = (step / totalSteps) * 100;

    const travelTypes = Object.values(t.raw("options.travelTypes")) as string[];
    const budgetPacks = t.raw("options.budgetPacks") as Record<string, { title: string; description: string }>;
    const addonOptions = Object.values(t.raw("options.addons")) as string[];
    // ✅ --- FIX: Removed unused variable 'travelStyles' ---
    const travelPersonalities = Object.values(t.raw("options.travelPersonalities")) as { value: string; label: string }[];
    const foodPreferences = Object.values(t.raw("options.foodPreferences")) as string[];
    const travelerRoutines = Object.values(t.raw("options.travelerRoutines")) as { value: string; label: string }[];
    const activityLevelOptions = Object.values(t.raw("options.activityLevels")) as { value: string; label: string }[];

    const getTravelPersonalityLabels = () => {
        if (!formData.travelPersonality) return [];
        return formData.travelPersonality.map(value => travelPersonalities.find(p => p.value === value)?.label).filter((l): l is string => Boolean(l));
    };
    const getActivityLevelLabel = () => activityLevelOptions.find(opt => opt.value === formData.activityLevel)?.label;
    const getFrequentTravelerLabel = () => travelerRoutines.find(opt => opt.value === formData.isFrequentTraveler)?.label;

    const actionButtons = (
        <div className="mt-auto pt-8 flex flex-col-reverse sm:flex-row gap-4">
            {step > 1 && (
                <button type="button" onClick={handleBack} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 dark:bg-slate-600 font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition text-center dark:text-white">
                    ⬅️ {t("backButton")}
                </button>
            )}
            <div className="flex-grow"></div>
            {step < totalSteps && (
                <button type="button" onClick={handleNext} disabled={(step === 1 && (!formData.type || !formData.tripType)) || isSaving} className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-center">
                    {isSaving ? "Saving..." : `${t("continueButton")} ➡️`}
                </button>
            )}
            {step === totalSteps && (
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
                    <button type="submit" disabled={isSaving || isBooking} className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-200 text-black font-bold hover:bg-slate-300 transition disabled:opacity-50 text-center">
                        {isSaving ? "Saving..." : "Save Progress"}
                    </button>
                    <button type="button" onClick={handleBookNow} disabled={!formData.consent || isSaving || isBooking} className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-center">
                        {isBooking ? "Processing..." : "Book Now 💳"}
                    </button>
                </div>
            )}
        </div>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">Loading your plan...</div>;
    }

    return (
        <div className="bg-background w-full">
            <div className="w-full px-4 sm:px-6 lg:px-16 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    <div className="lg:col-span-5 lg:sticky lg:top-16">
                        {step === 1 ? (
                            <div className="flex flex-col h-full">
                                <div className="flex-grow">
                                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">🗺️ {t("sidebar.planYourTrip")}</p>
                                    <h2 className="text-4xl lg:text-5xl font-bold mt-2 font-serif text-slate-800">
                                        {t("sidebar.title")}
                                    </h2>
                                    <p className="mt-4 text-slate-600 leading-relaxed max-w-lg">
                                        {t("sidebar.description")}
                                    </p>
                                </div>
                                <div className="mt-12 border-t pt-8">
                                    <h3 className="font-semibold text-slate-800"> {t("sidebar.needHelp")}</h3>
                                    <p className="text-slate-600">{t("sidebar.contactUs")} <a href="mailto:info@travelmore.travel" className="text-primary font-semibold hover:underline">info@travelmore.travel</a></p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">📋 Your Plan Summary</p>
                                    {isSaving && <p className="text-sm text-slate-500 animate-pulse">Saving...</p>}
                                </div>
                                <h2 className="text-3xl font-bold mt-2 font-serif">🔍 {step === totalSteps ? "Review Your Plan" : "Your Plan So Far"}</h2>
                                {/* ✅ --- FIX: Replaced ' with &apos; --- */}
                                <p className="mt-4 mb-6 text-slate-600">✅ {step === totalSteps ? "Please review the details before booking." : "Here&apos;s a preview of your selections."}</p>
                                <div className="flex-grow space-y-4 overflow-y-auto pr-2 border-l-2 border-primary/20 pl-4">
                                    <SummaryItem label="Contact Person" value={formData.fullName || formData.companyName} />
                                    <SummaryItem label="Trip Type" value={formData.tripType} />
                                    <SummaryItem label="Destination" value={formData.city || formData.country} />
                                    <SummaryItem label="Participants" value={t('sidebar.summary.participantsValue', { adults: Number(formData.paxAdults) || 0, kids: Number(formData.paxKids) || 0, teens: Number(formData.paxTeens) || 0, seniors: Number(formData.paxSeniors) || 0, })} />
                                    <SummaryItem label="Departure" value={formData.departureDate} />
                                    <SummaryItem label="Duration" value={formData.duration} />
                                    <SummaryItem label="Budget" value={budgetPacks[formData.budgetPack]?.title} />
                                    <SummaryItem label="Add-ons" value={formData.addons} />
                                    <SummaryItem label="Travel Style" value={formData.travelStyle} />
                                    <SummaryItem label="Personality" value={getTravelPersonalityLabels()} />
                                    <SummaryItem label="Activity Level" value={getActivityLevelLabel()} />
                                    <SummaryItem label="Frequent Traveler" value={getFrequentTravelerLabel()} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-7">
                        <div className="bg-card shadow-xl rounded-2xl w-full">
                            <div className="p-6 md:p-10 flex flex-col">
                                <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-[500px]">
                                    <div className="text-left mb-8">
                                        <p className="text-sm text-muted-foreground">{t("stepProgress", { step, totalSteps })}</p>
                                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                                            <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        {/* --- NEW STEP 1: Trip Basics --- */}
                                        {step === 1 && (
                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground mb-4">👋 Let&apos;s Plan Your Trip!</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div onClick={() => setFormData(p => ({ ...p, type: "personal" }))} className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${formData.type === 'personal' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10'}`}>
                                                            <h4 className="font-bold text-lg text-foreground">🧍 Personal</h4>
                                                            <p className="text-sm text-muted-foreground">For you, friends, or family.</p>
                                                        </div>
                                                        <div onClick={() => setFormData(p => ({ ...p, type: "company" }))} className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${formData.type === 'company' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10'}`}>
                                                            <h4 className="font-bold text-lg text-foreground">🏢 Company</h4>
                                                            <p className="text-sm text-muted-foreground">For corporate or business trips.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground mb-4">🌍 Where are you headed?</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div onClick={() => setFormData(p => ({ ...p, tripType: 'domestic' }))} className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${formData.tripType === 'domestic' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10'}`}>
                                                            <h4 className="font-bold text-lg text-foreground">🇮🇩 Domestic</h4>
                                                            <p className="text-sm text-muted-foreground">Exploring destinations within Indonesia.</p>
                                                        </div>
                                                        <div onClick={() => setFormData(p => ({ ...p, tripType: 'foreign' }))} className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${formData.tripType === 'foreign' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10'}`}>
                                                            <h4 className="font-bold text-lg text-foreground">🌐 International</h4>
                                                            <p className="text-sm text-muted-foreground">Traveling to another country.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* --- NEW STEP 2: Traveler Details --- */}
                                        {step === 2 && (
                                            <div className="space-y-5">
                                                <h3 className="text-xl font-bold text-foreground">📇 Contact Information</h3>
                                                {formData.type === 'personal' ? (
                                                    <>
                                                        <FormInput label="📝 Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                                                        <FormInput label="📧 Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                                                        <FormInput label="📱 WhatsApp Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <FormInput label="🏢 Company Name" name="companyName" value={formData.companyName} onChange={handleChange} />
                                                        <FormInput label="🏷️ Brand Name (Optional)" name="brandName" value={formData.brandName} onChange={handleChange} />
                                                        <FormInput label="📧 Company Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                                                        <FormInput label="📱 Company Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {/* --- NEW STEP 3: Trip Details --- */}
                                        {step === 3 && (
                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground mb-4">📍 Destination Details</h3>
                                                    {formData.tripType === 'domestic' ? (
                                                        <div className="space-y-5">
                                                            <FormInput label="🗺️ Province" name="province" value={formData.province} onChange={handleChange} />
                                                            <FormInput label="🏙️ City" name="city" value={formData.city} onChange={handleChange} />
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-5">
                                                            <FormInput label="🌍 Country" name="country" value={formData.country} onChange={handleChange} />
                                                            <FormInput label="🌆 City / State" name="city" value={formData.city} onChange={handleChange} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground mb-4">🗓️ When & How Long?</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                        <FormInput label="📅 Departure Date" name="departureDate" value={formData.departureDate} onChange={handleChange} type="date" />
                                                        <FormInput label="⏳ Duration (e.g., 7 days)" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 7 days, 2 weeks" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* --- NEW STEP 4: Traveler Preferences --- */}
                                        {step === 4 && (
                                            <div className="space-y-8">
                                                <div>
                                                    {/* ✅ --- FIX: Replaced ' with &apos; --- */}
                                                    <h3 className="text-xl font-bold text-foreground">👥 Who&apos;s Traveling?</h3>
                                                    <div className="space-y-5">
                                                        <FormInput as="select" label="✈️ Trip Type" name="travelType" options={travelTypes} value={formData.travelType} onChange={handleChange} selectPlaceholder="Select a travel type" />
                                                        <h4 className="font-semibold text-foreground pt-4">👨‍👩‍👧‍👦 Number of Travelers</h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormInput label="👩 Adults" name="paxAdults" value={String(formData.paxAdults)} onChange={handleChange} type="number" />
                                                            <FormInput label="🧑 Teens (13-17)" name="paxTeens" value={String(formData.paxTeens)} onChange={handleChange} type="number" />
                                                            <FormInput label="👧 Kids (0-12)" name="paxKids" value={String(formData.paxKids)} onChange={handleChange} type="number" />
                                                            <FormInput label="👵 Seniors (65+)" name="paxSeniors" value={String(formData.paxSeniors)} onChange={handleChange} type="number" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {/* ✅ --- FIX: Replaced ' with &apos; --- */}
                                                    <h3 className="text-xl font-bold text-foreground mb-4">🎨 What&apos;s Your Style?</h3>
                                                    <FormInput as="select" label="🤸 Activity Level" name="activityLevel" value={formData.activityLevel} onChange={handleChange} options={activityLevelOptions} selectPlaceholder="Select an activity level" />
                                                </div>
                                            </div>
                                        )}
                                        {/* --- NEW STEP 5: Budget and Preferences --- */}
                                        {step === 5 && (
                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground mb-4">💸 Budget & Extras</h3>
                                                    <div className="space-y-4">
                                                        {Object.keys(budgetPacks).map(packKey => (
                                                            <div key={packKey} onClick={() => setFormData(p => ({ ...p, budgetPack: packKey }))} className={`p-4 border-2 rounded-lg cursor-pointer transition ${formData.budgetPack === packKey ? 'border-primary bg-primary/10' : 'border-gray-300 dark:primary/10 hover:bg-gray-50 dark:hover:bg-primary/10'}`}>
                                                                <h4 className="font-bold text-foreground">💰 {budgetPacks[packKey as keyof typeof budgetPacks].title}</h4>
                                                                <p className="text-sm text-muted-foreground mt-1">{budgetPacks[packKey as keyof typeof budgetPacks].description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-6">
                                                        <FormInput as="checkbox-group" label="✨ Optional Add-ons" name="addons" options={addonOptions} value={formData.addons} onCheckboxChange={handleCheckboxChange} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground mb-4">❤️ Your Preferences</h3>
                                                    <div className="space-y-5">
                                                        <FormInput as="textarea" label="⭐ Must-Visit Places" name="mustVisit" value={formData.mustVisit} onChange={handleChange} placeholder="List any specific spots you want to see" />
                                                        <FormInput as="checkbox-group" label="🍔 Food Preferences" name="foodPreference" options={foodPreferences} value={formData.foodPreference} onCheckboxChange={handleCheckboxChange} />
                                                        <FormInput as="textarea" label="🏨 Accommodation Preferences" name="accommodationPreference" value={formData.accommodationPreference} onChange={handleChange} placeholder="e.g., Hotel with a pool, beachfront villa" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* --- NEW STEP 6: Finalize & Book --- */}
                                        {step === 6 && (
                                            <div className="space-y-5">
                                                <h3 className="text-xl font-bold text-foreground">✅ Almost Done!</h3>
                                                <label className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-primary/10 border border-gray-200 dark:border-slate-600">
                                                    <input type="checkbox" name="consent" checked={formData.consent} onChange={e => setFormData(p => ({ ...p, consent: e.target.checked }))} className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-400 bg-transparent" />
                                                    <span className="text-sm text-foreground">{t("step10_consent")}</span>
                                                </label>
                                                <FormInput as="radio-group" label="🔁 Have you traveled with us before?" name="isFrequentTraveler" options={travelerRoutines} value={formData.isFrequentTraveler} onChange={handleChange} />
                                            </div>
                                        )}
                                    </div>
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