// app/planner/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

// --- Tipe Data ---
type TripStyle = "hemat" | "eksklusif" | "backpacker" | "";
type Interest = "culture" | "adventure" | "culinary" | "nature";

// --- Komponen Utama Halaman Planner ---
export default function PlannerPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    tripStyle: "" as TripStyle,
    participants: "",
    duration: "",
    interests: [] as Interest[],
    accommodation: "",
    specificRequests: "", // State baru untuk permintaan spesifik
    name: "",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTripStyleSelect = (style: TripStyle) => {
    setFormData((prev) => ({ ...prev, tripStyle: style }));
    nextStep();
  };

  const handleInterestToggle = (interest: Interest) => {
    setFormData((prev) => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      return { ...prev, interests: newInterests };
    });
  };

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Permintaan Anda telah dikirim! Tim kami akan segera menghubungi Anda melalui WhatsApp.");
    console.log("Final Form Data:", formData);
  };

  // --- Komponen yang Dapat Digunakan Kembali ---
  const FormInput: React.FC<{ label: string; name: string; placeholder?: string; type?: string; as?: 'textarea' }> = ({ label, name, placeholder, type = "text", as }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {as === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={formData[name as keyof typeof formData] as string}
          onChange={handleChange}
          placeholder={placeholder}
          rows={5}
          className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition"
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={formData[name as keyof typeof formData] as string}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition"
          required={name === 'name' || name === 'phone'} // Hanya wajibkan kolom kontak
        />
      )}
    </div>
  );

  const InterestButton = ({ icon, label, value }: { icon: string, label: string, value: Interest }) => (
    <button
      type="button"
      onClick={() => handleInterestToggle(value)}
      className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${formData.interests.includes(value)
          ? "bg-primary/20 border-primary shadow-lg"
          : "bg-gray-50 hover:bg-gray-100"
        }`}
    >
      <Image src={icon} alt={label} width={32} height={32} />
      <span className="mt-2 font-semibold text-sm">{label}</span>
    </button>
  );

  // --- Komponen Langkah ---
  const Step1_TripStyle = () => (
    <div>
      <h3 className="text-2xl font-semibold text-center text-black mb-6">Pilih Gaya Perjalanan Anda</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => handleTripStyleSelect("hemat")} className="p-6 bg-white rounded-lg shadow-md border-2 border-transparent hover:border-primary transition-all cursor-pointer text-center">
          <h4 className="text-xl font-bold">Hemat</h4>
          <p className="text-gray-600 mt-2">Pilihan ramah anggaran tanpa mengurangi keseruan.</p>
          <p className="mt-4 font-semibold text-primary">Rp 200rb - 500rb / hari</p>
        </div>
        <div onClick={() => handleTripStyleSelect("eksklusif")} className="p-6 bg-white rounded-lg shadow-md border-2 border-transparent hover:border-primary transition-all cursor-pointer text-center">
          <h4 className="text-xl font-bold">Eksklusif</h4>
          <p className="text-gray-600 mt-2">Kenyamanan premium, tur pribadi, dan pengalaman pilihan.</p>
          <p className="mt-4 font-semibold text-primary">Rp 500rb - 3jt+ / hari</p>
        </div>
        <div onClick={() => handleTripStyleSelect("backpacker")} className="p-6 bg-white rounded-lg shadow-md border-2 border-transparent hover:border-primary transition-all cursor-pointer text-center">
          <h4 className="text-xl font-bold">Backpacker</h4>
          <p className="text-gray-600 mt-2">Fleksibel, penuh petualangan, dan fokus pada eksplorasi otentik.</p>
          <p className="mt-4 font-semibold text-primary">Anggaran Fleksibel</p>
        </div>
      </div>
    </div>
  );

  const Step2_TripDetails = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-center text-black mb-6">Ceritakan Tentang Perjalanan Anda</h3>
      <FormInput label="Jumlah Peserta" name="participants" placeholder="Contoh: 2 dewasa, 1 anak" />
      <FormInput label="Durasi Perjalanan" name="duration" placeholder="Contoh: 3 hari 2 malam" />
    </div>
  );

  const Step3_Interests = () => (
    <div>
      <h3 className="text-2xl font-semibold text-center text-black mb-6">Apa Minat Anda?</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InterestButton icon="/culture-icon.svg" label="Budaya" value="culture" />
        <InterestButton icon="/adventure-icon.svg" label="Petualangan" value="adventure" />
        <InterestButton icon="/culinary-icon.svg" label="Kuliner" value="culinary" />
        <InterestButton icon="/tour-icon.svg" label="Alam" value="nature" />
      </div>
    </div>
  );

  const Step4_Accommodation = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-center text-black mb-6">Preferensi Akomodasi</h3>
      <FormInput label="Tipe Akomodasi" name="accommodation" placeholder="Contoh: Hotel bintang 4, Villa, Homestay" />
    </div>
  );

  const Step5_SpecificRequests = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-center text-black mb-6">Permintaan Khusus</h3>
      <FormInput label="Tempat spesifik atau permintaan lain (opsional)" name="specificRequests" as="textarea" placeholder="Contoh: Ingin mengunjungi Candi Ijo, butuh kursi bayi di mobil, dll." />
    </div>
  );

  const Step6_Contact = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-semibold text-center text-black mb-6">Hampir Selesai! Bagaimana Kami Bisa Menghubungi Anda?</h3>
      <FormInput label="Nama Lengkap" name="name" />
      <FormInput label="Nomor Telepon (WhatsApp)" name="phone" type="tel" />
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1_TripStyle />;
      case 2: return <Step2_TripDetails />;
      case 3: return <Step3_Interests />;
      case 4: return <Step4_Accommodation />;
      case 5: return <Step5_SpecificRequests />;
      case 6: return <Step6_Contact />;
      default: return null;
    }
  };

  const totalSteps = 6;

  return (
    <main>
      <section className="bg-gray-50 py-16 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">Konsultasi Perencana Perjalanan</h2>
            <p className="text-gray-600">Mari rencanakan perjalanan sempurna Anda dalam {totalSteps} langkah mudah.</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="relative h-2 bg-gray-200 rounded-full">
                <div
                  className="absolute top-0 left-0 h-2 bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep - 1) / (totalSteps - 1) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-center mt-2 text-gray-500">Langkah {currentStep} dari {totalSteps}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="min-h-[300px] flex flex-col justify-center">
                {renderStep()}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-8 mt-8 border-t">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2 rounded-lg bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kembali
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all"
                  >
                    Lanjut
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-all"
                  >
                    Kirim Permintaan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}