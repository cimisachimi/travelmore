"use client";

import React, { useState } from "react";


// --- Custom Font from Google Fonts ---
const PoppinsFont = () => (
  <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        .font-poppins {
            font-family: 'Poppins', sans-serif;
        }
    `}</style>
);

// --- [FIXED] Define a strong type for the form data ---
interface IFormData {
  type: 'personal' | 'company' | '';
  tripType: 'domestic' | 'foreign' | '';
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

// --- [FIXED] Define strong types for the FormInput props ---
interface FormInputProps {
  label: string;
  name: keyof IFormData;
  value: string | string[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  type?: string;
  as?: 'select' | 'textarea' | 'checkbox-group' | 'radio-group';
  options?: (string | { value: string; label: string })[];
  onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// --- Komponen Input Formulir yang dapat digunakan kembali ---
const FormInput: React.FC<FormInputProps> = ({ label, name, value, onChange, placeholder, type = 'text', as, options = [], onCheckboxChange }) => {
  if (as === 'select') {
    return (
      <div className="font-poppins">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select id={name} name={name} value={value as string} onChange={onChange} className="w-full p-3 rounded-lg bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition">
          <option value="" disabled>Pilih salah satu</option>
          {options.map((opt: string | { value: string; label: string }) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
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
                <input
                  type="checkbox"
                  name={name}
                  value={optValue}
                  checked={(value as string[]).includes(optValue)}
                  onChange={onCheckboxChange}
                  className="h-4 w-4 text-primary rounded focus:ring-primary"
                />
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
                <input
                  type="radio"
                  name={name}
                  value={optValue}
                  checked={value === optValue}
                  onChange={onChange}
                  className="h-4 w-4 text-primary rounded-full focus:ring-primary"
                />
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
  const [step, setStep] = useState(1);
  // --- [FIXED] Use the strong type for the form state ---
  const [formData, setFormData] = useState<IFormData>({
    type: '',
    tripType: '',
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    brandName: '',
    province: '',
    city: '',
    address: '',
    postalCode: '',
    country: '',
    paxAdults: '',
    paxTeens: '',
    paxKids: '',
    paxSeniors: '',
    departureDate: '',
    duration: '',
    budgetPack: '',
    addons: [],
    budgetPriorities: ['Hotel/Akomodasi', 'Kuliner', 'Transportasi', 'Tempat wisata dan activity'],
    travelStyle: [],
    travelPersonality: [],
    mustVisit: '',
    attractionPreference: '',
    foodPreference: [],
    accommodationPreference: '',
    consent: false,
    isFrequentTraveler: '',
    travelType: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, value } = e.target;
    const currentValues = formData[name as keyof IFormData] as string[] || [];

    if (checked) {
      setFormData((prev) => ({ ...prev, [name]: [...currentValues, value] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: currentValues.filter((item) => item !== value) }));
    }
  };

  const handleBack = () => setStep(step - 1);
  const handleNext = () => setStep(step + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Permintaan konsultasi Anda telah dikirim!");
    console.log(formData);
  };

  const totalSteps = 10; // Adjusted total steps to 10
  const progress = (step / totalSteps) * 100;

  const travelTypes = ["Family Trip", "Couple/Honeymoon", "Solo Traveler", "Group"];
  const budgetPacks = {
    'Backpacker Pack': "Cocok buat kamu yang suka eksplorasi dengan cara simpel, hemat dan efisien. Semua kebutuhan dasar perjalanan tetap aman terpenuhi, tanpa bikin kantong jebol. Fokusnya: pengalaman, bukan kemewahan.",
    'Traveler Pack': "Pilihan paling seimbang buat kamu yang mau kenyamanan tanpa ribet, tapi tetap nggak over budget. Aktivitas, akomodasi, dan pengalaman dirancang pas untuk traveler yang mau full enjoy.",
    'Exclusive Pack': "Buat kamu yang pengen liburan dengan kualitas terbaik dan layanan tanpa kompromi. Semua detail dibuat premium, dari transportasi, akomodasi, sampai pengalaman eksklusif yang nggak semua orang bisa rasakan."
  };
  const addonOptions = ["Photographer", "Videographer", "Drone"];
  const travelStyles = ["Nature & Adventure", "Culture & Heritage", "Culinary & Lifestyle", "Wellness & Healing", "City & Urban Life", "Photography & Instagrammable", "Religious/Spiritual Travel", "Local Village & Green Travel", "Festival & Events", "Sports & Outdoor"];
  const travelPersonalities = [{ value: "The Explorer", label: "The Explorer" }, { value: "The Culture Seeker", label: "The Culture Seeker" }, { value: "Food Lovers", label: "Food Lovers" }, { value: "Chill and Heal", label: "Chill and Heal" }, { value: "The Social", label: "The Social" }];
  const foodPreferences = ["halal", "vegan", "spicy", "local", "western"];
  const travelerRoutines = [{ value: "Casual Traveler", label: "Casual Traveler (<3x setahun)" }, { value: "Frequent Traveler", label: "Frequent Traveler (>3x setahun)" }];

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto font-poppins">
      <PoppinsFont />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Trip Planner</h2>
          <p className="text-sm text-gray-500">Langkah {step} dari {totalSteps}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* --- TAHAP 1: PILIH TIPE PENGGUNA --- */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center text-gray-800">Pilih Tipe Anda</h3>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => { setFormData((prev) => ({ ...prev, type: 'personal' })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                <h4 className="font-bold text-lg text-gray-900">Personal</h4>
                <p className="text-sm text-gray-600">Untuk individu atau grup kecil</p>
              </div>
              <div onClick={() => { setFormData((prev) => ({ ...prev, type: 'company' })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                <h4 className="font-bold text-lg text-gray-900">Company</h4>
                <p className="text-sm text-gray-600">Untuk acara atau perjalanan perusahaan</p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAHAP 2: FORMULIR DATA KONTAK --- */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Informasi Kontak</h3>
            {formData.type === 'personal' ? (
              <>
                <FormInput label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} />
                <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                <FormInput label="Nomor WhatsApp" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
              </>
            ) : (
              <>
                <FormInput label="Company" name="companyName" value={formData.companyName} onChange={handleChange} />
                <FormInput label="Brand Name (optional)" name="brandName" value={formData.brandName} onChange={handleChange} />
                <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                <FormInput label="Nomor WhatsApp" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
              </>
            )}
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">Lanjutkan</button>
          </div>
        )}

        {/* --- TAHAP 3: PILIH TIPE PERJALANAN (DOMESTIC/FOREIGN) --- */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2 text-center">Tipe Perjalanan Anda</h3>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => { setFormData((prev) => ({ ...prev, tripType: 'domestic' })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                <h4 className="font-bold text-lg text-gray-900">Domestic</h4>
                <p className="text-sm text-gray-600">Dalam negeri</p>
              </div>
              <div onClick={() => { setFormData((prev) => ({ ...prev, tripType: 'foreign' })); handleNext(); }} className="p-6 text-center border-2 border-gray-300 rounded-lg shadow-md cursor-pointer hover:bg-blue-50 hover:border-primary transition duration-300 transform hover:-translate-y-1">
                <h4 className="font-bold text-lg text-gray-900">Foreign</h4>
                <p className="text-sm text-gray-600">Luar negeri</p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAHAP 4: FORMULIR LOKASI --- */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Destinasi Perjalanan</h3>
            {formData.tripType === 'domestic' ? (
              <>
                <FormInput label="Provinsi" name="province" value={formData.province} onChange={handleChange} />
                <FormInput label="Kota/Kabupaten" name="city" value={formData.city} onChange={handleChange} />
                <FormInput label="Alamat" name="address" value={formData.address} onChange={handleChange} />
                <FormInput label="Kode Pos" name="postalCode" value={formData.postalCode} onChange={handleChange} />
              </>
            ) : (
              <>
                <FormInput label="Negara" name="country" value={formData.country} onChange={handleChange} />
                <FormInput label="Kota/States/Provinsi" name="city" value={formData.city} onChange={handleChange} />
              </>
            )}
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">Lanjutkan</button>
          </div>
        )}

        {/* --- TAHAP 5: TIPE PERJALANAN & PAX --- */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Tipe Perjalanan & Peserta</h3>
            <FormInput as="select" label="Tipe Perjalanan" name="travelType" options={travelTypes} value={formData.travelType} onChange={handleChange} />
            <h4 className="font-semibold text-gray-700 mt-6">Jumlah Peserta (Menurut Kelompok Usia)</h4>
            <FormInput label="Anak-anak (0-12)" name="paxKids" value={String(formData.paxKids)} onChange={handleChange} type="number" />
            <FormInput label="Remaja (13-17)" name="paxTeens" value={String(formData.paxTeens)} onChange={handleChange} type="number" />
            <FormInput label="Dewasa (18-40)" name="paxAdults" value={String(formData.paxAdults)} onChange={handleChange} type="number" />
            <FormInput label="Senior (40+)" name="paxSeniors" value={String(formData.paxSeniors)} onChange={handleChange} type="number" />
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">Lanjutkan</button>
          </div>
        )}

        {/* --- TAHAP 6: WAKTU DAN DURASI --- */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Waktu & Durasi</h3>
            <FormInput label="Tanggal Keberangkatan" name="departureDate" value={formData.departureDate} onChange={handleChange} type="date" />
            <FormInput label="Durasi Perjalanan" name="duration" value={formData.duration} onChange={handleChange} placeholder="Contoh: 3 Hari 2 Malam" />
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">Lanjutkan</button>
          </div>
        )}

        {/* --- TAHAP 7: PILIHAN BUDGET & ADDONS --- */}
        {step === 7 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Pilihan Budget</h3>
            <div className="space-y-4">
              {Object.keys(budgetPacks).map(pack => (
                <div key={pack} onClick={() => setFormData((prev) => ({ ...prev, budgetPack: pack }))} className={`p-4 border-2 rounded-lg shadow-sm cursor-pointer transition duration-300 transform hover:-translate-y-1 ${formData.budgetPack === pack ? 'bg-secondary border-primary shadow-lg' : 'border-gray-300 hover:bg-gray-100'}`}>
                  <h4 className="font-bold text-gray-900">{pack}</h4>
                  <p className="text-sm text-gray-600 mt-1">{budgetPacks[pack as keyof typeof budgetPacks]}</p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-gray-700">Add-on (Dokumentasi)</h4>
              <FormInput as="checkbox-group" label="" name="addons" options={addonOptions} value={formData.addons} onCheckboxChange={handleCheckboxChange} />
            </div>
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">Lanjutkan</button>
          </div>
        )}

        {/* --- TAHAP 8: PRIORITAS BUDGET & GAYA PERJALANAN --- */}
        {step === 8 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Prioritas & Gaya Perjalanan</h3>
            {formData.budgetPack !== 'Exclusive Pack' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Prioritas Budget (Drag & Drop)</h4>
                <p className="text-sm text-gray-500">Silakan atur prioritas Anda dengan fitur drag & drop.</p>
                <div className="p-4 border border-dashed rounded-lg text-center text-gray-500 bg-gray-100 min-h-[150px] flex items-center justify-center">
                  Fitur Drag & Drop (Placeholder)
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Gaya Perjalanan</h4>
              <FormInput as="checkbox-group" label="" name="travelStyle" options={travelStyles} value={formData.travelStyle} onCheckboxChange={handleCheckboxChange} />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-700">Kepribadian Anda</h4>
              <FormInput as="checkbox-group" label="" name="travelPersonality" options={travelPersonalities} value={formData.travelPersonality} onCheckboxChange={handleCheckboxChange} />
            </div>
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">Lanjutkan</button>
          </div>
        )}

        {/* --- TAHAP 9: PREFERENSI --- */}
        {step === 9 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Preferensi Tambahan</h3>
            <FormInput label="Tempat yang Wajib Dikunjungi" name="mustVisit" value={formData.mustVisit} onChange={handleChange} as="textarea" placeholder="Contoh: Borobudur, Malioboro" />
            <FormInput label="Preferensi Atraksi" name="attractionPreference" value={formData.attractionPreference} onChange={handleChange} as="textarea" placeholder="Contoh: Museum, Pantai, Situs Sejarah" />
            <FormInput as="checkbox-group" label="Preferensi Makanan" name="foodPreference" options={foodPreferences} value={formData.foodPreference} onCheckboxChange={handleCheckboxChange} />
            <FormInput label="Preferensi Akomodasi" name="accommodationPreference" value={formData.accommodationPreference} onChange={handleChange} as="textarea" placeholder="Contoh: Glamping di alam, Villa di pantai" />
            <button type="button" onClick={handleNext} className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition">Lanjutkan</button>
          </div>
        )}

        {/* --- TAHAP 10: PERSETUJUAN & FOLLOW-UP --- */}
        {step === 10 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Persetujuan & Informasi Tambahan</h3>
            <div className="flex items-center space-x-2">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={(e) => setFormData(prev => ({ ...prev, consent: e.target.checked }))} className="h-4 w-4 text-primary rounded" />
              <span className="text-sm text-gray-600">Saya setuju dikirimkan rekomendasi itinerary dan harga lewat WhatsApp.</span>
            </div>
            <FormInput as="radio-group" label="Apakah Anda traveler rutin?" name="isFrequentTraveler" options={travelerRoutines} value={formData.isFrequentTraveler} onChange={handleChange} />
            <button type="submit" className="w-full px-8 py-3 rounded-lg bg-primary text-gray-900 font-bold hover:brightness-90 transition-all transform hover:scale-105 mt-6">
              Submit & Dapatkan Itinerary Rekomendasi
            </button>
          </div>
        )}

        {/* Tombol Kembali (kecuali di tahap pertama) */}
        {step > 1 && (
          <div className="mt-6">
            <button type="button" onClick={handleBack} className="w-full text-center text-sm text-gray-600 hover:underline">
              ← Kembali
            </button>
          </div>
        )}
      </form>
    </div>
  );
}