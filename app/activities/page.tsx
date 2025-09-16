"use client";

import React, { useState } from "react";

// Reusable Form Input Component (no changes needed)
const FormInput: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  as?: 'textarea';
}> = ({ label, name, value, onChange, placeholder, type = 'text', as }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {as === 'textarea' ? (
      <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4} className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition" />
    ) : (
      <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition" />
    )}
  </div>
);

// --- Main Activity Page Component ---
export default function ActivityPage() {
  const [formData, setFormData] = useState({
    activityName: '',
    date: '',
    participants: '',
    message: '',
    name: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Di sini Anda biasanya akan mengirim data ke backend atau API
    alert("Permintaan pemesanan aktivitas Anda telah dikirim! Kami akan segera menghubungi Anda.");
    console.log(formData);
  };

  return (
    <main>
      <section className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-2">Pemesanan Aktivitas</h2>
            <p className="text-gray-600">Pesan aktivitas wisata favorit Anda dengan mudah. Isi formulir di bawah ini dan kami akan segera mengonfirmasi.</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4 border-b pb-2">Detail Aktivitas</h3>
                <div className="space-y-4">
                  <FormInput label="Nama Aktivitas" name="activityName" value={formData.activityName} onChange={handleChange} placeholder="Contoh: Tiket Masuk Museum, Tur Pantai" />
                  <FormInput label="Tanggal Aktivitas" name="date" value={formData.date} onChange={handleChange} type="date" />
                  <FormInput label="Jumlah Peserta" name="participants" value={formData.participants} onChange={handleChange} placeholder="Contoh: 2 dewasa, 1 anak" />
                  <FormInput label="Pesan Tambahan (opsional)" name="message" value={formData.message} onChange={handleChange} as="textarea" placeholder="Contoh: Kami membutuhkan pemandu berbahasa Inggris" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-black mb-4 border-b pb-2">Informasi Kontak</h3>
                <div className="space-y-4">
                  <FormInput label="Nama Lengkap" name="name" value={formData.name} onChange={handleChange} />
                  <FormInput label="Alamat Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                  <FormInput label="Nomor Telepon (WhatsApp)" name="phone" value={formData.phone} onChange={handleChange} type="tel" />
                </div>
              </div>

              <button type="submit" className="w-full px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:brightness-90 transition-all transform hover:scale-105">
                Pesan Sekarang
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}