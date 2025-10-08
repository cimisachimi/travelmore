"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

// --- Tipe Data (Tidak ada perubahan) ---
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

// ✅ DIUBAH: Komponen Sidebar sekarang menerima `t` sebagai prop
const FormSidebar = ({ step, formData, t }: { step: number; formData: IFormData; t: any }) => {
    const SummaryItem = ({ label, value }: { label: string; value: string | string[] | undefined | null }) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return null;
        const displayValue = Array.isArray(value) ? value.join(', ') : value;
        return (
            <div>
                <p className="text-sm text-slate-400">{label}</p>
                <p className="font-semibold text-white">{displayValue}</p>
            </div>
        );
    };

    return (
        <div className="lg:w-[40%] bg-slate-800 text-white p-8 lg:p-12 flex flex-col rounded-t-xl lg:rounded-tr-none lg:rounded-l-xl">
            {step < 10 ? (
                <>
                    <div className="flex-grow">
                        {/* ✅ DIUBAH: Menggunakan `t` */}
                        <p className="text-sm font-semibold text-primary uppercase tracking-wider">{t("sidebar.planYourTrip")}</p>
                        <h2 className="text-3xl font-bold mt-2 font-serif">
                            {t("sidebar.title")}
                        </h2>
                        <p className="mt-4 text-slate-300 leading-relaxed">
                           {t("sidebar.description")}
                        </p>
                    </div>
                    <div className="mt-12 border-t border-slate-700 pt-8">
                        <h3 className="font-semibold text-white">{t("sidebar.needHelp")}</h3>
                        <p className="text-slate-300">{t("sidebar.contactUs")} <a href="mailto:info@travelmore.travel" className="text-primary hover:underline">info@travelmore.travel</a></p>
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-full">
                    {/* ✅ DIUBAH: Menggunakan `t` */}
                    <p className="text-sm font-semibold text-primary uppercase tracking-wider">{t("sidebar.summary.summaryTitle")}</p>
                    <h2 className="text-3xl font-bold mt-2 font-serif">{t("sidebar.summary.reviewTitle")}</h2>
                    <p className="mt-4 mb-6 text-slate-300">{t("sidebar.summary.reviewDescription")}</p>
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                        <SummaryItem label={t("sidebar.summary.contactPerson")} value={formData.fullName || formData.companyName} />
                        <SummaryItem label={t("sidebar.summary.tripType")} value={formData.tripType} />
                        <SummaryItem label={t("sidebar.summary.destination")} value={formData.city || formData.country} />
                        <SummaryItem 
                            label={t("sidebar.summary.participants")} 
                            value={t('sidebar.summary.participantsValue', {
                                adults: Number(formData.paxAdults) || 0,
                                kids: Number(formData.paxKids) || 0,
                                teens: Number(formData.paxTeens) || 0,
                                seniors: Number(formData.paxSeniors) || 0,
                            })} 
                        />
                        <SummaryItem label={t("sidebar.summary.departure")} value={formData.departureDate} />
                        <SummaryItem label={t("sidebar.summary.duration")} value={formData.duration} />
                        <SummaryItem label={t("sidebar.summary.budgetPack")} value={formData.budgetPack} />
                        <SummaryItem label={t("sidebar.summary.addons")} value={formData.addons} />
                        <SummaryItem label={t("sidebar.summary.travelStyle")} value={formData.travelStyle} />
                    </div>
                </div>
            )}
        </div>
    );
};


const FormInput = ({ label, name, value, onChange, placeholder, type = "text", as, options = [], onCheckboxChange, selectPlaceholder }: {
    label: string; name: keyof IFormData; value: string | string[];
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    placeholder?: string; type?: string; as?: 'select' | 'textarea' | 'checkbox-group' | 'radio-group';
    options?: (string | { value: string; label: string })[];
    onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectPlaceholder?: string;
}) => {
    
    const baseInputClasses = "w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500";
    if (as === 'select') { return ( <div> <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label> <select name={name} value={value as string} onChange={onChange} className={baseInputClasses}> <option value="" disabled>{selectPlaceholder}</option> {options.map(opt => { const val = typeof opt === 'string' ? opt : opt.value; const lab = typeof opt === 'string' ? opt : opt.label; return <option key={val} value={val}>{lab}</option>; })} </select> </div> ); }
    if (as === 'textarea') { return ( <div> <label className="block text-sm font-semibold text-gray-700 dark:text-gray-700 mb-2">{label}</label> <textarea name={name} value={value as string} onChange={onChange} placeholder={placeholder} rows={4} className={baseInputClasses} /> </div> ); }
    if (as === 'checkbox-group' || as === 'radio-group') { const isCheckbox = as === 'checkbox-group'; return ( <div> <h4 className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</h4> <div className="space-y-2"> {options.map(opt => { const optValue = typeof opt === 'string' ? opt : opt.value; const optLabel = typeof opt === 'string' ? opt : opt.label; return ( <label key={optValue} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-primary/10 border-gray-200 dark:border-slate-600"> <input type={isCheckbox ? "checkbox" : "radio"} name={name} value={optValue} checked={isCheckbox ? (value as string[]).includes(optValue) : value === optValue} onChange={isCheckbox ? onCheckboxChange : onChange} className={`h-4 w-4 ${isCheckbox ? 'rounded' : 'rounded-full'} text-primary focus:ring-primary border-gray-400 bg-transparent`} /> <span className="text-sm text-foreground">{optLabel}</span> </label> ); })} </div> </div> ); }
    return ( <div> <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label> <input type={type} name={name} value={value as string} onChange={onChange} placeholder={placeholder} className={baseInputClasses} /> </div> );
};

export default function PlannerForm() {
    const t = useTranslations("PlannerForm");
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<IFormData>({
        type: "", tripType: "", fullName: "", email: "", phone: "", companyName: "",
        brandName: "", province: "", city: "", address: "", postalCode: "", country: "",
        paxAdults: "", paxTeens: "", paxKids: "", paxSeniors: "", departureDate: "",
        duration: "", budgetPack: "", addons: [], budgetPriorities: [], travelStyle: [],
        travelPersonality: [], mustVisit: "", attractionPreference: "", foodPreference: [],
        accommodationPreference: "", consent: false, isFrequentTraveler: "", travelType: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        const currentValues = (formData[name as keyof IFormData] as string[]) || [];
        const newValues = checked ? [...currentValues, value] : currentValues.filter(item => item !== value);
        setFormData(prev => ({ ...prev, [name]: newValues }));
    };
    const handleBack = () => setStep(prev => prev - 1);
    const handleNext = () => setStep(prev => prev + 1);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); alert(t("submissionAlert")); };
    
    const totalSteps = 10;
    const progress = (step / totalSteps) * 100;
    
    const travelTypes = Object.values(t.raw("options.travelTypes")) as string[];
    const budgetPacks = t.raw("options.budgetPacks") as Record<string, { title: string; description: string }>;
    const addonOptions = Object.values(t.raw("options.addons")) as string[];
    const travelStyles = Object.values(t.raw("options.travelStyles")) as string[];
    const travelPersonalities = Object.values(t.raw("options.travelPersonalities")) as { value: string; label: string }[];
    const foodPreferences = Object.values(t.raw("options.foodPreferences")) as string[];
    const travelerRoutines = Object.values(t.raw("options.travelerRoutines")) as { value: string; label: string }[];
    
    const actionButtons = (
        <div className="mt-auto pt-6 flex flex-col-reverse sm:flex-row gap-4">
            {step > 1 ? (
                <button 
                    type="button" 
                    onClick={handleBack} 
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-200 dark:bg-slate-600 text-foreground font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition text-center"
                >
                    {t("backButton")}
                </button>
            ) : <div className="sm:mr-auto"></div>}

            <div className="flex-grow"></div>

            {step < totalSteps && (
                <button 
                    type="button" 
                    onClick={handleNext} 
                    disabled={(step === 1 && !formData.type) || (step === 3 && !formData.tripType)}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                    {t("continueButton")}
                </button>
            )}
            
            {step === totalSteps && (
                 <button 
                    type="submit" 
                    disabled={!formData.consent}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                    {t("submitButton")}
                </button>
            )}
        </div>
    );

    return (
        <div className="bg-background w-full flex items-center justify-center min-h-screen lg:py-12">
            <div className="container mx-auto px-4">
                <div className="w-full max-w-7xl mx-auto bg-card shadow-2xl rounded-xl flex flex-col lg:flex-row">
                    
                    {/* ✅ DIUBAH: Mengirim `t` ke FormSidebar */}
                    <FormSidebar step={step} formData={formData} t={t} />

                    <div className="lg:w-[60%] p-8 lg:p-12 flex flex-col">
                        <form onSubmit={handleSubmit} className="flex flex-col flex-grow">
                            <div className="text-left mb-8">
                                <p className="text-sm text-muted-foreground">{t("stepProgress", { step, totalSteps })}</p>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="flex-grow">
                                {step === 1 && (
                                    <div className="space-y-5">
                                        <h3 className="text-xl font-bold text-foreground">{t("step1_title")}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div onClick={() => setFormData(p => ({ ...p, type: "personal" }))} className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${ formData.type === 'personal' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10' }`}>
                                                <h4 className="font-bold text-lg text-foreground">{t("step1_personal_title")}</h4>
                                                <p className="text-sm text-muted-foreground">{t("step1_personal_desc")}</p>
                                            </div>
                                            <div onClick={() => setFormData(p => ({ ...p, type: "company" }))}  className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${ formData.type === 'company' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10' }`}>
                                                <h4 className="font-bold text-lg text-foreground">{t("step1_company_title")}</h4>
                                                <p className="text-sm text-muted-foreground">{t("step1_company_desc")}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {step === 2 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step2_title")}</h3> {formData.type === 'personal' ? ( <> <FormInput label={t("step2_fullName")} name="fullName" value={formData.fullName} onChange={handleChange} /> <FormInput label={t("step2_email")} name="email" value={formData.email} onChange={handleChange} type="email" /> <FormInput label={t("step2_whatsapp")} name="phone" value={formData.phone} onChange={handleChange} type="tel" /> </> ) : ( <> <FormInput label={t("step2_companyName")} name="companyName" value={formData.companyName} onChange={handleChange} /> <FormInput label={t("step2_brandName")} name="brandName" value={formData.brandName} onChange={handleChange} /> <FormInput label={t("step2_email")} name="email" value={formData.email} onChange={handleChange} type="email" /> <FormInput label={t("step2_whatsapp")} name="phone" value={formData.phone} onChange={handleChange} type="tel" /> </> )} </div> )}
                                
                                {step === 3 && ( 
                                    <div className="space-y-5">
                                        <h3 className="text-xl font-bold text-foreground">{t("step3_title")}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div onClick={() => setFormData(p => ({ ...p, tripType: 'domestic' }))} className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${ formData.tripType === 'domestic' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10' }`}>
                                                <h4 className="font-bold text-lg text-foreground">{t("step3_domestic_title")}</h4>
                                                <p className="text-sm text-muted-foreground">{t("step3_domestic_desc")}</p>
                                            </div>
                                            <div onClick={() => setFormData(p => ({ ...p, tripType: 'foreign' }))} className={`p-6 text-left border-2 rounded-lg shadow-sm cursor-pointer transition ${ formData.tripType === 'foreign' ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-primary/10' }`}>
                                                <h4 className="font-bold text-lg text-foreground">{t("step3_foreign_title")}</h4>
                                                <p className="text-sm text-muted-foreground">{t("step3_foreign_desc")}</p>
                                            </div>
                                        </div>
                                    </div> 
                                )}
                                {step === 4 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step4_title")}</h3> {formData.tripType === 'domestic' ? ( <> <FormInput label={t("step4_province")} name="province" value={formData.province} onChange={handleChange} /> <FormInput label={t("step4_city")} name="city" value={formData.city} onChange={handleChange} /> </> ) : ( <> <FormInput label={t("step4_country")} name="country" value={formData.country} onChange={handleChange} /> <FormInput label={t("step4_cityState")} name="city" value={formData.city} onChange={handleChange} /> </> )} </div> )}
                                {step === 5 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step5_title")}</h3> <FormInput as="select" label={t("step5_travelType")} name="travelType" options={travelTypes} value={formData.travelType} onChange={handleChange} selectPlaceholder={t("selectPlaceholder")} /> <h4 className="font-semibold text-foreground pt-4">{t("step5_paxTitle")}</h4> <div className="grid grid-cols-2 gap-4"> <FormInput label={t("step5_paxKids")} name="paxKids" value={String(formData.paxKids)} onChange={handleChange} type="number" /> <FormInput label={t("step5_paxTeens")} name="paxTeens" value={String(formData.paxTeens)} onChange={handleChange} type="number" /> <FormInput label={t("step5_paxAdults")} name="paxAdults" value={String(formData.paxAdults)} onChange={handleChange} type="number" /> <FormInput label={t("step5_paxSeniors")} name="paxSeniors" value={String(formData.paxSeniors)} onChange={handleChange} type="number" /> </div> </div> )}
                                {step === 6 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step6_title")}</h3> <FormInput label={t("step6_departureDate")} name="departureDate" value={formData.departureDate} onChange={handleChange} type="date" /> <FormInput label={t("step6_duration")} name="duration" value={formData.duration} onChange={handleChange} placeholder={t("step6_duration_placeholder")} /> </div> )}
                                {step === 7 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step7_title")}</h3> <div className="space-y-4"> {Object.keys(budgetPacks).map(packKey => ( <div key={packKey} onClick={() => setFormData(p => ({ ...p, budgetPack: packKey }))} className={`p-4 border-2 rounded-lg cursor-pointer transition ${formData.budgetPack === packKey ? 'border-primary bg-primary/10' : 'border-gray-300 dark:primary/10 hover:bg-gray-50 dark:hover:bg-primary/10'}`}> <h4 className="font-bold text-foreground">{budgetPacks[packKey as keyof typeof budgetPacks].title}</h4> <p className="text-sm text-muted-foreground mt-1">{budgetPacks[packKey as keyof typeof budgetPacks].description}</p> </div> ))} </div> <FormInput as="checkbox-group" label={t("step7_addonTitle")} name="addons" options={addonOptions} value={formData.addons} onCheckboxChange={handleCheckboxChange} /> </div> )}
                                {step === 8 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step8_title")}</h3> <FormInput as="checkbox-group" label={t("step8_travelStyleTitle")} name="travelStyle" options={travelStyles} value={formData.travelStyle} onCheckboxChange={handleCheckboxChange} /> <FormInput as="checkbox-group" label={t("step8_personalityTitle")} name="travelPersonality" options={travelPersonalities} value={formData.travelPersonality} onCheckboxChange={handleCheckboxChange} /> </div> )}
                                {step === 9 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step9_title")}</h3> <FormInput as="textarea" label={t("step9_mustVisit")} name="mustVisit" value={formData.mustVisit} onChange={handleChange} placeholder={t("step9_mustVisit_placeholder")} /> <FormInput as="checkbox-group" label={t("step9_foodPreference")} name="foodPreference" options={foodPreferences} value={formData.foodPreference} onCheckboxChange={handleCheckboxChange} /> <FormInput as="textarea" label={t("step9_accommodationPreference")} name="accommodationPreference" value={formData.accommodationPreference} onChange={handleChange} placeholder={t("step9_accommodationPreference_placeholder")} /> </div> )}
                                {step === 10 && ( <div className="space-y-5"> <h3 className="text-xl font-bold text-foreground">{t("step10_title")}</h3> <label className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600"> <input type="checkbox" name="consent" checked={formData.consent} onChange={e => setFormData(p => ({ ...p, consent: e.target.checked }))} className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-400 bg-transparent" /> <span className="text-sm text-foreground">{t("step10_consent")}</span> </label> <FormInput as="radio-group" label={t("step10_frequentTraveler")} name="isFrequentTraveler" options={travelerRoutines} value={formData.isFrequentTraveler} onChange={handleChange} /> </div> )}
                            </div>
                            
                            {actionButtons}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}