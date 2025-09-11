// app/planner/page.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

// --- Tipe Data untuk State ---
type ServiceType =
  | "Konsultasi Umum"
  | "Konsultasi Eksklusif"
  | "Konsultasi Backpacker"
  | "Paket Wisata"
  | "Aktivitas"
  | "Sewa Kendaraan"
  | null;

interface ConsultationData {
  participants: string;
  duration: string;
  budget: string;
  accommodation: string;
  interests: string[];
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

// --- Komponen-Komponen yang Dapat Digunakan Kembali ---

const ServiceCard: React.FC<{ title: string; description: string; onSelect: () => void }> = ({ title, description, onSelect }) => (
  <button
    onClick={onSelect}
    className="w-full text-left p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-xl hover:border-primary transition-all duration-300 transform hover:-translate-y-1"
  >
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
  </button>
);

const FormInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; placeholder?: string; type?: string; as?: 'textarea' }> = ({ label, name, value, onChange, placeholder, type = 'text', as }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {as === 'textarea' ? (
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4} className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition" />
    ) : (
      <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none transition" />
    )}
  </div>
);

// --- Komponen untuk Setiap Langkah Alur ---

// Langkah 1: Universal untuk semua
const Step1_SelectService: React.FC<{ onSelect: (service: ServiceType) => void }> = ({ onSelect }) => {
  const services = [
    { name: "Konsultasi Umum", desc: "Konsultasi untuk perjalanan wisata reguler." },
    { name: "Konsultasi Eksklusif", desc: "Untuk Anda yang menginginkan layanan premium dan privat." },
    { name: "Konsultasi Backpacker", desc: "Perencanaan fleksibel untuk petualang solo atau grup kecil." },
    { name: "Paket Wisata", desc: "Pilih dari berbagai paket wisata yang telah kami siapkan." },
    { name: "Aktivitas", desc: "Pesan aktivitas atau tur harian tanpa paket menginap." },
    { name: "Sewa Kendaraan", desc: "Sewa mobil atau motor dengan atau tanpa sopir." },
  ];

  return (
    <div>
      <h3 className="text-2xl font-semibold text-black mb-6">Apa yang Anda butuhkan?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map(service => (
          <ServiceCard
            key={service.name as string}
            title={service.name}
            description={service.desc}
            onSelect={() => onSelect(service.name as ServiceType)}
          />
        ))}
      </div>
    </div>
  );
};

// Langkah-langkah untuk Alur Konsultasi
const Consultation_Step2_Details: React.FC<{ data: ConsultationData; setData: React.Dispatch<React.SetStateAction<ConsultationData>> }> = ({ data, setData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-black mb-4">Detail Perjalanan Anda</h3>
      <FormInput label="Jumlah Peserta" name="participants" value={data.participants} onChange={handleChange} placeholder="Contoh: 2 dewasa, 1 anak" />
      <FormInput label="Durasi Perjalanan" name="duration" value={data.duration} onChange={handleChange} placeholder="Contoh: 3 hari 2 malam" />
      <FormInput label="Anggaran (opsional)" name="budget" value={data.budget} onChange={handleChange} placeholder="Contoh: Rp 5.000.000" />
      <FormInput label="Preferensi Akomodasi" name="accommodation" value={data.accommodation} onChange={handleChange} placeholder="Contoh: Hotel bintang 4, Villa dengan kolam renang" />
    </div>
  );
};

const Consultation_Step3_Contact: React.FC<{ data: ContactInfo; setData: React.Dispatch<React.SetStateAction<ContactInfo>> }> = ({ data, setData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-black mb-4">Informasi Kontak</h3>
      <FormInput label="Nama Lengkap" name="name" value={data.name} onChange={handleChange} />
      <FormInput label="Alamat Email" name="email" value={data.email} onChange={handleChange} type="email" />
      <FormInput label="Nomor Telepon (WhatsApp)" name="phone" value={data.phone} onChange={handleChange} type="tel" />
    </div>
  );
};


// --- Komponen Utama Halaman Planner ---
export default function PlannerPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType>(null);

  // State untuk data form
  const [consultationData, setConsultationData] = useState<ConsultationData>({ participants: '', duration: '', budget: '', accommodation: '', interests: [] });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({ name: '', email: '', phone: '' });

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const resetPlanner = () => {
    setCurrentStep(1);
    setSelectedService(null);
  };

  const renderCurrentStep = () => {
    if (currentStep === 1) {
      return <Step1_SelectService onSelect={handleServiceSelect} />;
    }

    if (selectedService?.startsWith("Konsultasi")) {
      switch (currentStep) {
        case 2: return <Consultation_Step2_Details data={consultationData} setData={setConsultationData} />;
        case 3: return <Consultation_Step3_Contact data={contactInfo} setData={setContactInfo} />;
        case 4: return <div>Langkah 4: Ringkasan & Konfirmasi</div>;
        default: return <p>Langkah tidak valid.</p>;
      }
    }

    // Placeholder untuk alur lain
    return <div>Alur untuk "{selectedService}" sedang dalam pengembangan.</div>;
  };

  const getTotalSteps = () => {
    if (selectedService?.startsWith("Konsultasi")) return 4;
    // Tambahkan total langkah untuk alur lain di sini
    return 1;
  }

  return (
    <main>
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-2">Rencanakan Perjalanan Anda</h2>
            <p className="text-gray-600">Pilih layanan yang Anda butuhkan untuk memulai.</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg min-h-[400px]">
            {currentStep > 1 && (
              <button onClick={resetPlanner} className="text-sm text-primary hover:underline mb-6 block">
                ‹ Kembali & Pilih Layanan Lain
              </button>
            )}

            {renderCurrentStep()}

            {/* Tombol Navigasi Dinamis */}
            {currentStep > 1 && (
              <div className="flex justify-between items-center pt-8 mt-8 border-t">
                <button onClick={prevStep} disabled={currentStep <= 2} className="px-6 py-2 rounded-lg bg-gray-200 text-black font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Kembali
                </button>

                {currentStep < getTotalSteps() ? (
                  <button onClick={nextStep} className="px-6 py-2 rounded-lg bg-primary text-black font-bold hover:brightness-90 transition-all">
                    Langkah Selanjutnya
                  </button>
                ) : (
                  <button className="px-6 py-2 rounded-lg bg-green-500 text-white font-bold hover:bg-green-600 transition-all">
                    Kirim Permintaan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}