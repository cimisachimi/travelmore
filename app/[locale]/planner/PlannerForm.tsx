// app/[locale]/planner/PlannerForm.tsx
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

// --- Custom Font from Google Fonts ---
const PoppinsFont = () => (
  <style jsx global>{`
    @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");
    .font-poppins {
      font-family: "Poppins", sans-serif;
    }
  `}</style>
);

// --- Tipe Data (Tetap sama) ---
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
  travelPersonality: string[];
  mustVisit: string;
  attractionPreference: string;
  foodPreference: string[];
  accommodationPreference: string;
  consent: boolean;
  isFrequentTraveler: string;
  travelType: string;
}

interface FormInputProps {
  label: string;
  name: keyof IFormData;
  value: string | string[];
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  placeholder?: string;
  type?: string;
  as?: "select" | "textarea" | "checkbox-group" | "radio-group";
  options?: (string | { value: string; label: string })[];
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectPlaceholder?: string; // Tambahkan prop ini
}

// --- Komponen Input yang Diterjemahkan ---
const FormInput: React.FC<FormInputProps> = ({
  label, name, value, onChange, placeholder, type = "text", as, options = [], onCheckboxChange, selectPlaceholder
}) => {
  // ... (Isi komponen FormInput tetap sama, hanya perlu menerima `selectPlaceholder`)
  if (as === 'select') {
    return (
      <div className="font-poppins">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select id={name} name={name} value={value as string} onChange={onChange} className="w-full p-3 rounded-lg bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition">
          <option value="" disabled>{selectPlaceholder}</option>
          {options.map((opt: string | { value: string; label: string }) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  // ... (Sisa kode FormInput tidak berubah)
  if (as === 'checkbox-group') {
    return (
      <div className="font-poppins">
        <h4 className="font-semibold text-gray-700">{label}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {options.map((opt: string | { value: string; label: string }) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <label key={optValue} className="flex items-center space-x-2 border border-gray-300 p-2 rounded-lg cursor-pointer transition-all hover:bg-gray-100">
                <input type="checkbox" name={name} value={optValue} checked={(value as string[]).includes(optValue)} onChange={onCheckboxChange} className="h-4 w-4 text-primary rounded focus:ring-primary" />
                <span className="text-sm text-gray-600">{optLabel}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  if (as === 'radio-group') {
    return (
      <div className="font-poppins">
        <h4 className="font-semibold text-gray-700 mb-2">{label}</h4>
        <div className="flex flex-col md:flex-row gap-4">
          {options.map((opt: string | { value: string; label: string }) => {
            const optValue = typeof opt === 'string' ? opt : opt.value;
            const optLabel = typeof opt === 'string' ? opt : opt.label;
            return (
              <label key={optValue} className="flex items-center space-x-2">
                <input type="radio" name={name} value={optValue} checked={value === optValue} onChange={onChange} className="h-4 w-4 text-primary rounded-full focus:ring-primary" />
                <span className="text-sm text-gray-600">{optLabel}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  }
  return (
    <div className="font-poppins">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {as === 'textarea' ? (
        <textarea id={name} name={name} value={value as string} onChange={onChange} placeholder={placeholder} rows={4} className="w-full p-3 rounded-lg bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition" />
      ) : (
        <input id={name} type={type} name={name} value={value as string} onChange={onChange} placeholder={placeholder} className="w-full p-3 rounded-lg bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition" />
      )}
    </div>
  );
};

// --- Komponen Formulir Utama ---
export default function PlannerForm() {
  const t = useTranslations("PlannerForm");
  const [step, setStep] = useState(1);
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
    travelPersonality: [],
    mustVisit: "",
    attractionPreference: "",
    foodPreference: [],
    accommodationPreference: "",
    consent: false,
    isFrequentTraveler: "",
    travelType: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = e.target;
    const currentValues =
      (formData[name as keyof IFormData] as string[]) || [];

    if (checked) {
      setFormData((prev) => ({ ...prev, [name]: [...currentValues, value] }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: currentValues.filter((item) => item !== value),
      }));
    }
  };

  const handleBack = () => setStep(step - 1);
  const handleNext = () => setStep(step + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("submissionAlert"));
    console.log(formData);
  };

  const totalSteps = 10;
  const progress = (step / totalSteps) * 100;
  
  // Ambil data opsi dari JSON
  const travelTypes = Object.values(t.raw("options.travelTypes")) as string[];
  const budgetPacks = t.raw("options.budgetPacks") as Record<string, { title: string; description: string }>;
  const addonOptions = Object.values(t.raw("options.addons")) as string[];
  const travelStyles = Object.values(t.raw("options.travelStyles")) as string[];
  const travelPersonalities = Object.values(t.raw("options.travelPersonalities")) as { value: string; label: string }[];
  const foodPreferences = Object.values(t.raw("options.foodPreferences")) as string[];
  const travelerRoutines = Object.values(t.raw("options.travelerRoutines")) as { value: string; label: string }[];
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto font-poppins">
      <PoppinsFont />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
          <p className="text-sm text-gray-500">{t("stepProgress", { step, totalSteps })}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* --- TAHAP 1 --- */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-gray-800">{t("step1_title")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => { setFormData((prev) => ({ ...prev, type: "personal" })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                <h4 className="font-bold text-lg text-gray-900">{t("step1_personal_title")}</h4>
                <p className="text-sm text-gray-600">{t("step1_personal_desc")}</p>
              </div>
              <div onClick={() => { setFormData((prev) => ({ ...prev, type: "company" })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                <h4 className="font-bold text-lg text-gray-900">{t("step1_company_title")}</h4>
                <p className="text-sm text-gray-600">{t("step1_company_desc")}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAHAP 2 --- */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step2_title")}</h3>
            {formData.type === "personal" ? (
              <>
                <FormInput label={t("step2_fullName")} name="fullName" value={formData.fullName} onChange={handleChange} />
                <FormInput label={t("step2_email")} name="email" value={formData.email} onChange={handleChange} type="email" />
                <FormInput label={t("step2_whatsapp")} name="phone" value={formData.phone} onChange={handleChange} type="tel" />
              </>
            ) : (
              <>
                <FormInput label={t("step2_companyName")} name="companyName" value={formData.companyName} onChange={handleChange} />
                <FormInput label={t("step2_brandName")} name="brandName" value={formData.brandName} onChange={handleChange} />
                <FormInput label={t("step2_email")} name="email" value={formData.email} onChange={handleChange} type="email" />
                <FormInput label={t("step2_whatsapp")} name="phone" value={formData.phone} onChange={handleChange} type="tel" />
              </>
            )}
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">{t("continueButton")}</button>
          </div>
        )}

        {/* --- TAHAP 3 --- */}
        {step === 3 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2 text-center">{t("step3_title")}</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => { setFormData((prev) => ({ ...prev, tripType: 'domestic' })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                        <h4 className="font-bold text-lg text-gray-900">{t("step3_domestic_title")}</h4>
                        <p className="text-sm text-gray-600">{t("step3_domestic_desc")}</p>
                    </div>
                    <div onClick={() => { setFormData((prev) => ({ ...prev, tripType: 'foreign' })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                        <h4 className="font-bold text-lg text-gray-900">{t("step3_foreign_title")}</h4>
                        <p className="text-sm text-gray-600">{t("step3_foreign_desc")}</p>
                    </div>
                </div>
            </div>
        )}

        {/* --- TAHAP 4 --- */}
        {step === 4 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step4_title")}</h3>
                {formData.tripType === 'domestic' ? (
                    <>
                        <FormInput label={t("step4_province")} name="province" value={formData.province} onChange={handleChange} />
                        <FormInput label={t("step4_city")} name="city" value={formData.city} onChange={handleChange} />
                        <FormInput label={t("step4_address")} name="address" value={formData.address} onChange={handleChange} />
                        <FormInput label={t("step4_postalCode")} name="postalCode" value={formData.postalCode} onChange={handleChange} />
                    </>
                ) : (
                    <>
                        <FormInput label={t("step4_country")} name="country" value={formData.country} onChange={handleChange} />
                        <FormInput label={t("step4_cityState")} name="city" value={formData.city} onChange={handleChange} />
                    </>
                )}
                <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">{t("continueButton")}</button>
            </div>
        )}

        {/* --- TAHAP 5 --- */}
        {step === 5 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step5_title")}</h3>
                <FormInput as="select" label={t("step5_travelType")} name="travelType" options={travelTypes} value={formData.travelType} onChange={handleChange} selectPlaceholder={t("selectPlaceholder")} />
                <h4 className="font-semibold text-gray-700 mt-6">{t("step5_paxTitle")}</h4>
                <FormInput label={t("step5_paxKids")} name="paxKids" value={String(formData.paxKids)} onChange={handleChange} type="number" />
                <FormInput label={t("step5_paxTeens")} name="paxTeens" value={String(formData.paxTeens)} onChange={handleChange} type="number" />
                <FormInput label={t("step5_paxAdults")} name="paxAdults" value={String(formData.paxAdults)} onChange={handleChange} type="number" />
                <FormInput label={t("step5_paxSeniors")} name="paxSeniors" value={String(formData.paxSeniors)} onChange={handleChange} type="number" />
                <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">{t("continueButton")}</button>
            </div>
        )}

        {/* --- TAHAP 6 --- */}
        {step === 6 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step6_title")}</h3>
                <FormInput label={t("step6_departureDate")} name="departureDate" value={formData.departureDate} onChange={handleChange} type="date" />
                <FormInput label={t("step6_duration")} name="duration" value={formData.duration} onChange={handleChange} placeholder={t("step6_duration_placeholder")} />
                <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">{t("continueButton")}</button>
            </div>
        )}

        {/* --- TAHAP 7 --- */}
        {step === 7 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step7_title")}</h3>
                <div className="space-y-4">
                    {Object.keys(budgetPacks).map(packKey => (
                        <div key={packKey} onClick={() => setFormData((prev) => ({ ...prev, budgetPack: packKey }))} className={`p-4 border-2 rounded-lg shadow-sm cursor-pointer transition duration-300 transform hover:-translate-y-1 ${formData.budgetPack === packKey ? 'bg-secondary border-primary shadow-lg' : 'border-gray-300 hover:bg-gray-100'}`}>
                            <h4 className="font-bold text-gray-900">{budgetPacks[packKey].title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{budgetPacks[packKey].description}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                    <h4 className="font-semibold text-gray-700">{t("step7_addonTitle")}</h4>
                    <FormInput as="checkbox-group" label="" name="addons" options={addonOptions} value={formData.addons} onCheckboxChange={handleCheckboxChange} />
                </div>
                <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">{t("continueButton")}</button>
            </div>
        )}
        
        {/* --- TAHAP 8 --- */}
        {step === 8 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step8_title")}</h3>
                {formData.budgetPack !== 'Exclusive' && (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700">{t("step8_budgetPriorityTitle")}</h4>
                        <p className="text-sm text-gray-500">{t("step8_budgetPriorityDesc")}</p>
                        <div className="p-4 border border-dashed rounded-lg text-center text-gray-500 bg-gray-100 min-h-[150px] flex items-center justify-center">
                            {t("step8_dragDropPlaceholder")}
                        </div>
                    </div>
                )}
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">{t("step8_travelStyleTitle")}</h4>
                    <FormInput as="checkbox-group" label="" name="travelStyle" options={travelStyles} value={formData.travelStyle} onCheckboxChange={handleCheckboxChange} />
                </div>
                <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700">{t("step8_personalityTitle")}</h4>
                    <FormInput as="checkbox-group" label="" name="travelPersonality" options={travelPersonalities} value={formData.travelPersonality} onCheckboxChange={handleCheckboxChange} />
                </div>
                <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">{t("continueButton")}</button>
            </div>
        )}

        {/* --- TAHAP 9 --- */}
        {step === 9 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step9_title")}</h3>
                <FormInput label={t("step9_mustVisit")} name="mustVisit" value={formData.mustVisit} onChange={handleChange} as="textarea" placeholder={t("step9_mustVisit_placeholder")} />
                <FormInput label={t("step9_attractionPreference")} name="attractionPreference" value={formData.attractionPreference} onChange={handleChange} as="textarea" placeholder={t("step9_attractionPreference_placeholder")} />
                <FormInput as="checkbox-group" label={t("step9_foodPreference")} name="foodPreference" options={foodPreferences} value={formData.foodPreference} onCheckboxChange={handleCheckboxChange} />
                <FormInput label={t("step9_accommodationPreference")} name="accommodationPreference" value={formData.accommodationPreference} onChange={handleChange} as="textarea" placeholder={t("step9_accommodationPreference_placeholder")} />
                <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">{t("continueButton")}</button>
            </div>
        )}

        {/* --- TAHAP 10 --- */}
        {step === 10 && (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">{t("step10_title")}</h3>
                <div className="flex items-center space-x-2">
                    <input type="checkbox" name="consent" checked={formData.consent} onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))} className="h-4 w-4 text-primary rounded" />
                    <span className="text-sm text-gray-600">{t("step10_consent")}</span>
                </div>
                <FormInput as="radio-group" label={t("step10_frequentTraveler")} name="isFrequentTraveler" options={travelerRoutines} value={formData.isFrequentTraveler} onChange={handleChange} />
                <button type="submit" className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition-all transform hover:scale-105 mt-6">
                    {t("submitButton")}
                </button>
            </div>
        )}

        {/* --- Tombol Kembali --- */}
        {step > 1 && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleBack}
              className="w-full text-center text-sm text-gray-600 hover:underline"
            >
              {t("backButton")}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}