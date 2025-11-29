// app/[locale]/open-trip/[id]/OpenTripBookingModal.tsx
"use client";

import React, { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import { X, CalendarDays, Users, TicketPercent, MapPin } from "lucide-react"; // Ganti icon Camera jadi MapPin biar relevan
import { AxiosError } from "axios";
import { useTheme } from "@/components/ThemeProvider";

// Sesuaikan interface dengan struktur data Anda
// Kita asumsikan ada field 'meeting_points' di data package Open Trip
interface MeetingPoint {
  id: number;
  name: string;
  time?: string;
  notes?: string;
}

interface OpenTripPackage {
  id: number;
  name: string;
  price_tiers: { min_pax: number; max_pax: number; price: number }[];
  starting_from_price: number | null;
  addons?: { name: string; price: number }[];
  // [NEW] Data Meeting Points dari API
  meeting_points?: MeetingPoint[]; 
}

interface OpenTripBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: OpenTripPackage;
  user: any; // Sesuaikan tipe user auth Anda
  t: any; // Fungsi translate
}

const OpenTripBookingModal: React.FC<OpenTripBookingModalProps> = ({
  isOpen,
  onClose,
  pkg,
  user,
  t,
}) => {
  const router = useRouter();
  const { theme } = useTheme();

  // --- STATES ---
  const [startDate, setStartDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [discountCode, setDiscountCode] = useState("");
  
  // States Standard
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // [NEW] State Meeting Point
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFullName(user?.name || "");
      setEmail(user?.email || "");
      setPhone(user?.phone || ""); // Sederhanakan logic phone untuk contoh ini
      // Reset
      setStartDate("");
      setAdults(1);
      setSelectedMeetingPoint("");
      setErrors({});
    }
  }, [isOpen, user]);

  // --- CALCULATIONS (Sama seperti paket wisata) ---
  const { pricePerPax, totalPax } = useMemo(() => {
    const totalPax = adults + children;
    // Logic harga sederhana
    let foundPrice = pkg.starting_from_price || 0;
    // ... (masukkan logic price tier Anda di sini jika perlu)
    return { pricePerPax: foundPrice, totalPax };
  }, [adults, children, pkg]);

  const grandTotal = (pricePerPax * totalPax); // + addons jika ada

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = t("booking.errors.noDate");
    if (!selectedMeetingPoint) newErrors.meetingPoint = "Please select a meeting point."; // Custom error msg
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) {
        toast.error(t("booking.errors.notLoggedIn"));
        return;
    }

    setIsSubmitting(true);
    try {
      // POST ke endpoint booking Open Trip
      const response = await api.post(`/open-trips/${pkg.id}/book`, {
        start_date: startDate,
        adults,
        children,
        full_name: fullName,
        email,
        phone_number: phone,
        participant_nationality: nationality,
        // [NEW] Kirim Meeting Point sebagai ganti Pickup Location
        pickup_location: selectedMeetingPoint, 
        special_request: specialRequest,
        discount_code: discountCode
      });

      if (response.status === 201) {
        toast.success(t("booking.success.message"));
        router.push("/profile");
        onClose();
      }
    } catch (err) {
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Styles
  const modalBg = theme === "regular" ? "bg-white" : "bg-gray-800";
  const textColor = theme === "regular" ? "text-gray-900" : "text-white";
  const inputClass = `w-full p-2 rounded border ${theme === "regular" ? "bg-gray-50 border-gray-300" : "bg-gray-700 border-gray-600 text-white"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`${modalBg} rounded-xl shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto`}>
        <button onClick={onClose} className="absolute top-4 right-4"><X /></button>
        
        <h2 className={`text-2xl font-bold mb-1 ${textColor}`}>{t("booking.title")}</h2>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">OPEN TRIP</span>
        <p className="text-sm text-gray-500 mb-6">{pkg.name}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Date Picker */}
          <div>
            <label className={`block text-sm font-medium ${textColor}`}>Select Date</label>
            <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className={inputClass} 
                min={new Date().toISOString().split("T")[0]}
            />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>

          {/* Pax Input (Sama seperti sebelumnya) */}
          <div className="flex gap-4">
            <div className="flex-1">
                <label className={`block text-sm font-medium ${textColor}`}>Adults</label>
                <input type="number" min={1} value={adults} onChange={(e) => setAdults(Number(e.target.value))} className={inputClass} />
            </div>
            <div className="flex-1">
                <label className={`block text-sm font-medium ${textColor}`}>Children</label>
                <input type="number" min={0} value={children} onChange={(e) => setChildren(Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          {/* --- SECTION PENTING: MEETING POINT --- */}
          <div>
            <label className={`block text-sm font-medium ${textColor} flex items-center gap-1`}>
                <MapPin size={14} /> Meeting Point (Titik Kumpul)
            </label>
            
            {pkg.meeting_points && pkg.meeting_points.length > 0 ? (
                // Jika ada list meeting point dari API
                <select 
                    value={selectedMeetingPoint} 
                    onChange={(e) => setSelectedMeetingPoint(e.target.value)}
                    className={inputClass}
                >
                    <option value="">-- Select Meeting Point --</option>
                    {pkg.meeting_points.map((mp) => (
                        <option key={mp.id} value={`${mp.name} (${mp.time || ''})`}>
                            {mp.name} {mp.time ? `- ${mp.time}` : ""}
                        </option>
                    ))}
                </select>
            ) : (
                // Fallback jika data meeting point fix (hanya 1) atau manual input
                <input 
                    type="text" 
                    placeholder="e.g. Stasiun Tugu Yogyakarta"
                    value={selectedMeetingPoint}
                    onChange={(e) => setSelectedMeetingPoint(e.target.value)}
                    className={inputClass}
                />
            )}
            
            <p className="text-xs text-gray-500 mt-1">
                *Peserta wajib berkumpul di titik ini sesuai jam yang ditentukan.
            </p>
            {errors.meetingPoint && <p className="text-red-500 text-xs mt-1">{errors.meetingPoint}</p>}
          </div>

          {/* Contact Info (Name, Email, Phone - Ringkas Saja) */}
          <div>
            <label className={`block text-sm font-medium ${textColor}`}>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={`block text-sm font-medium ${textColor}`}>WhatsApp Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>

          {/* Total Price */}
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex justify-between items-center">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Total Price</span>
            <span className="text-xl font-bold text-primary">{formatPrice(grandTotal)}</span>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition"
          >
            {isSubmitting ? "Booking..." : "Join Open Trip"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default OpenTripBookingModal;