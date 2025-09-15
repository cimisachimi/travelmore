"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cars } from "@/data/cars";

export default function CarDetailPage() {
  const { id } = useParams();
  const car = cars.find((c) => c.id.toString() === id);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupLocation: "",
  });

  if (!car) {
    return <div className="p-10 text-center">Car not found.</div>;
  }

  // ⬅️ Tanggal yang dibooking admin (jadi merah & tidak bisa diklik)
  const bookedDays = car.bookedDates.map((d) => new Date(d));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Booking submitted:\n
      Name: ${formData.name}\n
      Email: ${formData.email}\n
      Phone: ${formData.phone}\n
      Pickup Location: ${formData.pickupLocation}\n
      Date: ${selectedDate}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left: Car info */}
        <div>
          <div className="relative w-full h-72 rounded-lg overflow-hidden">
            <Image
              src={car.image}
              alt={car.name}
              fill
              className="object-cover"
            />
          </div>
          <h2 className="text-3xl font-bold mt-6">{car.name}</h2>
          <p className="mt-2 text-gray-600">{car.description}</p>

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold mb-2">Cakupan Layanan:</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Area layanan: Yogyakarta & Jawa Tengah</li>
              <li>Sudah termasuk driver</li>
              <li>Bensin sudah include</li>
            </ul>
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Booking Mobil</h3>

          {/* Kalender */}
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={bookedDays}
            defaultMonth={new Date()} // hanya tampilkan bulan berjalan, tanpa auto pilih
            className="custom-daypicker rounded-lg p-4 bg-gray-50"
          />

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-white border mr-2 rounded"></div>{" "}
              Available
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 mr-2 rounded"></div> Selected
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 mr-2 rounded"></div> Rented
            </div>
          </div>

          {/* Form Booking */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              placeholder="Nama"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <input
              type="tel"
              placeholder="No HP"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Lokasi Penjemputan"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.pickupLocation}
              onChange={(e) =>
                setFormData({ ...formData, pickupLocation: e.target.value })
              }
              required
            />
            <button
              type="submit"
              disabled={!selectedDate}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/80 disabled:opacity-50"
            >
              Pesan Sekarang
            </button>
          </form>
        </div>
      </div>

      {/* ✅ Styling khusus kalender */}
      <style jsx global>{`
        .custom-daypicker .rdp-day {
          border: none !important; /* buang garis abu-abu */
          background: transparent !important;
          color: #111827 !important; /* teks hitam */
          border-radius: 6px;
        }

        .custom-daypicker .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
          background-color: #e5e7eb !important;
          cursor: pointer;
        }

        .custom-daypicker .rdp-day_selected {
          background-color: #2563eb !important; /* biru */
          color: white !important;
        }

        .custom-daypicker .rdp-day_disabled {
          background-color: #ef4444 !important; /* merah */
          color: white !important;
          cursor: not-allowed !important;
        }

        .custom-daypicker .rdp-day_today {
          color: #111827 !important; /* hari ini = normal */
          font-weight: normal !important;
        }
      `}</style>
    </div>
  );
}
