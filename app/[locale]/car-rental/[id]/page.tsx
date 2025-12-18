// app/[locale]/car-rental/[id]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "sonner";
import "@/styles/calendar.css";
import api from "@/lib/api";
import Link from "next/link";
import { AxiosError } from "axios";
import { 
  Car, Fuel, Luggage, User as UserIcon, Settings, 
  Clock, TicketPercent, Loader2, CheckCircle2, AlertCircle, MapPin,
  ArrowLeft // 1. IMPORT ICON PANAH KIRI
} from 'lucide-react';

// --- Interfaces ---
interface ApiCarImage {
  url: string;
  type: "thumbnail" | "gallery";
}

type AvailabilityStatus = "available" | "booked" | "maintenance";
interface ApiCarAvailabilityMap {
  [date: string]: AvailabilityStatus;
}

interface ApiCar {
  id: number;
  car_model: string;
  brand: string;
  category: "regular" | "exclusive";
  car_type: string | null;
  transmission: string | null;
  fuel_type: string | null;
  capacity: number | null;
  trunk_size: number | null;
  description: string | null;
  features: string[] | null;
  price_per_day: string;
  images: ApiCarImage[];
}

interface ApiCheckPriceResponse {
  discount_amount: number;
  total_amount: number;
  message?: string;
}

export default function CarDetailPage() {
  const t = useTranslations("carDetail");
  const params = useParams();
  const locale = useLocale();
  const { user } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const [car, setCar] = useState<ApiCar | null>(null);
  const [availabilities, setAvailabilities] = useState<ApiCarAvailabilityMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [activeImage, setActiveImage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupTime, setPickupTime] = useState("09:00");
  
  // Discount States
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Theme Logic
  const isExclusive = theme === "exclusive";
  const mainBgClass = isExclusive ? "bg-black" : "bg-background";
  const textClass = isExclusive ? "text-white" : "text-foreground";
  const textMutedClass = isExclusive ? "text-gray-400" : "text-foreground/70";
  const accentColorClass = isExclusive ? "text-yellow-500" : "text-primary";
  const cardBgClass = isExclusive ? "bg-gray-900 border-gray-800" : "bg-card shadow-lg";
  const inputBgClass = isExclusive ? "bg-gray-950 border-gray-800 text-white" : "bg-background border-gray-300";
  const buttonClass = isExclusive ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-primary text-primary-foreground hover:bg-primary/90";

  // 2. LOGIKA WARNA KALENDER
  // Kita override variabel CSS rdp (React Day Picker) sesuai tema
  const calendarStyle = {
    "--rdp-accent-color": isExclusive ? "#eab308" : "var(--primary, #000000)", // Kuning jika exclusive, atau gunakan variable primary
    "--rdp-background-color": isExclusive ? "#1f2937" : "#e5e7eb", // Warna background range middle
  } as React.CSSProperties;

  const formatDateLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAvailability = async () => {
    if (!id) return;
    try {
      const availabilityResponse = await api.get(
        `/public/car-rentals/${id}/availability`
      );
      setAvailabilities(availabilityResponse.data);
    } catch (err) {
      console.error("Failed to refetch availability:", err);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchCarAndAvailability = async () => {
      try {
        setLoading(true);
        setError(null);
        const [carResponse, availabilityResponse] = await Promise.all([
          api.get(`/public/car-rentals/${id}`, { params: { locale } }),
          api.get(`/public/car-rentals/${id}/availability`),
        ]);
        const data: ApiCar = carResponse.data;
        setCar(data);
        
        setTheme(data.category || "regular");

        setAvailabilities(availabilityResponse.data);
        const firstImage = data.images?.[0]?.url
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${data.images[0].url}`
          : "/cars/placeholder.jpg";
        setActiveImage(firstImage);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message?: string }>;
        if (error.response && error.response.status === 404) {
          setError(t("notFound"));
        } else {
          setError(error.message || "An error occurred.");
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCarAndAvailability();
  }, [id, locale, t, setTheme]);

  useEffect(() => {
    return () => {
      setTheme("regular");
    };
  }, [setTheme]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      // @ts-expect-error: phone exists on user object
      setPhone(user.phone || user.phone_number || "");
    }
  }, [user]);

  // --- CALCULATIONS ---
  const totalDays = useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) return 0;
    const start = selectedRange.from;
    const end = selectedRange.to;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [selectedRange]);

  const { baseTotal, grandTotal } = useMemo(() => {
    if (!car) return { baseTotal: 0, grandTotal: 0 };
    const price = parseFloat(car.price_per_day);
    const base = price * totalDays;
    const total = Math.max(0, base - appliedDiscount);
    return { baseTotal: base, grandTotal: total };
  }, [totalDays, car, appliedDiscount]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  // --- HANDLERS ---

  const handleApplyCode = async () => {
    if (!discountCode.trim()) return;
    if (!selectedRange?.from || !selectedRange?.to) {
        setDiscountMessage({ type: 'error', text: "Please select dates first." });
        return;
    }

    setIsCheckingCode(true);
    setDiscountMessage(null);
    setAppliedDiscount(0);

    try {
      const response = await api.post<ApiCheckPriceResponse>('/booking/check-price', {
        type: 'car_rental',
        id: car?.id,
        discount_code: discountCode,
        start_date: formatDateLocal(selectedRange.from),
        end_date: formatDateLocal(selectedRange.to),
      });

      if (response.data.discount_amount > 0) {
        setAppliedDiscount(response.data.discount_amount);
        setDiscountMessage({ 
          type: 'success', 
          text: `Applied! You saved ${formatCurrency(response.data.discount_amount)}` 
        });
      } else {
        setDiscountMessage({ type: 'error', text: "Code valid but no discount applicable." });
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{message: string}>;
      setAppliedDiscount(0);
      setDiscountMessage({ 
        type: 'error', 
        text: error.response?.data?.message || "Invalid or expired discount code." 
      });
    } finally {
      setIsCheckingCode(false);
    }
  };

  useEffect(() => {
    if (appliedDiscount > 0 && discountCode && selectedRange?.from && selectedRange?.to) {
      const timer = setTimeout(() => {
        handleApplyCode();
      }, 500); 
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car || !selectedRange?.from || !selectedRange?.to) {
      toast.error("Please select a valid start and end date.");
      return;
    }
    if (!user) {
      toast.error("Please log in to book a car.");
      return;
    }
    if (!phone || !pickupLocation || !pickupTime) {
      toast.error("Please fill in all booking details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post(`/car-rentals/${car.id}/book`, {
        start_date: formatDateLocal(selectedRange.from),
        end_date: formatDateLocal(selectedRange.to),
        phone_number: phone,
        pickup_location: pickupLocation,
        pickup_time: pickupTime,
        discount_code: appliedDiscount > 0 ? discountCode : null, 
      });

      if (response.status === 201) {
        toast.success(`Booking created! Please complete payment in your profile.`);
        setBookingSuccess(true);
        fetchAvailability();
      }
    } catch (err: unknown) {
      let message = "Booking failed. Please try again.";
      if (typeof err === "object" && err !== null && "response" in err) {
        // @ts-expect-error: err may have response property
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { availableDays, bookedDays, maintenanceDays } = useMemo(() => {
    const available: Date[] = [];
    const booked: Date[] = [];
    const maintenance: Date[] = [];

    Object.keys(availabilities).forEach((dateString) => {
      const date = new Date(dateString + "T00:00:00");
      const status = availabilities[dateString];

      if (status === "available") available.push(date);
      else if (status === "booked") booked.push(date);
      else if (status === "maintenance") maintenance.push(date);
    });

    return { availableDays: available, bookedDays: booked, maintenanceDays: maintenance };
  }, [availabilities]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0); 
    return d;
  }, []);

  const disabledDays = useMemo(() => {
    return [{ before: today }, ...bookedDays, ...maintenanceDays];
  }, [bookedDays, maintenanceDays, today]);

  if (loading) return <div className={`p-10 text-center min-h-screen ${mainBgClass} ${textMutedClass}`}>Loading...</div>;
  if (error || !car) return <div className={`p-10 text-center min-h-screen ${mainBgClass} text-red-500`}>{error || t("notFound")}</div>;

  const carName = `${car.brand} ${car.car_model}`;
  const price = parseFloat(car.price_per_day);
  const gallery = car.images?.map((img) => ({
      full: `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img.url}`,
  })) || [];

  return (
    <div className={`${mainBgClass} ${textClass} min-h-screen transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-8">
        
        {/* 3. TOMBOL BACK KE HALAMAN SEBELUMNYA */}
        <Link 
            href="/car-rental" 
            className={`inline-flex items-center gap-2 mb-6 text-sm font-medium hover:underline transition-all ${textMutedClass} hover:${isExclusive ? "text-yellow-500" : "text-primary"}`}
        >
            <ArrowLeft size={20} />
            {t('backToCars', { defaultMessage: "Back to Car List" })} 
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* --- LEFT: Gallery + Info --- */}
          <div>
            <div className={`relative w-full h-80 rounded-lg overflow-hidden shadow-lg mb-4 ${isExclusive ? "bg-gray-800 border border-gray-700" : "bg-muted"}`}>
              <Image
                src={activeImage}
                alt={carName}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {gallery.map((img, index) => (
                  <div
                    key={index}
                    className={`relative w-20 h-20 rounded-lg cursor-pointer border-2 flex-shrink-0 ${img.full === activeImage ? (isExclusive ? "border-yellow-500" : "border-primary") : "border-transparent"}`}
                    onClick={() => setActiveImage(img.full)}
                  >
                    <Image src={img.full} alt={`${carName} ${index}`} fill className="object-cover rounded-lg" sizes="5rem" />
                  </div>
                ))}
              </div>
            )}
            <h2 className="text-3xl font-bold mt-6">{carName}</h2>
            <p className={`mt-2 ${textMutedClass}`}>{car.description || "No description available."}</p>

            {/* --- Car Details --- */}
            <div className={`mt-8 border-t pt-6 ${isExclusive ? "border-gray-800" : "border-border"}`}>
              <h3 className="text-xl font-bold mb-4">{t('details.title')}</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {car.car_type && <div className="flex items-center gap-2"><Car size={16} className={accentColorClass}/><span className={textMutedClass}>{t('details.type')}:</span><span className="font-semibold">{car.car_type}</span></div>}
                {car.transmission && <div className="flex items-center gap-2"><Settings size={16} className={accentColorClass}/><span className={textMutedClass}>{t('details.transmission')}:</span><span className="font-semibold">{car.transmission}</span></div>}
                {car.fuel_type && <div className="flex items-center gap-2"><Fuel size={16} className={accentColorClass}/><span className={textMutedClass}>{t('details.fuel')}:</span><span className="font-semibold">{car.fuel_type}</span></div>}
                {car.capacity && <div className="flex items-center gap-2"><UserIcon size={16} className={accentColorClass}/><span className={textMutedClass}>{t('details.capacity')}:</span><span className="font-semibold">{car.capacity} {t('details.seats')}</span></div>}
                {car.trunk_size && <div className="flex items-center gap-2"><Luggage size={16} className={accentColorClass}/><span className={textMutedClass}>{t('details.trunk')}:</span><span className="font-semibold">{car.trunk_size} {t('details.bags')}</span></div>}
              </div>
            </div>

            {car.features && car.features.length > 0 && (
              <div className={`mt-8 border-t pt-6 ${isExclusive ? "border-gray-800" : "border-border"}`}>
                <h3 className="text-xl font-bold mb-4">{t('details.features')}</h3>
                <ul className={`list-disc list-inside space-y-1 ${textMutedClass}`}>
                  {car.features.map((feature, index) => <li key={index}>{feature}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* --- RIGHT: Booking Form --- */}
          <div className={`${cardBgClass} rounded-lg p-6 sticky top-8 h-fit`}>
            <h3 className="text-xl font-bold mb-4">{t("form.title")}</h3>
            <div className={`mb-4 p-4 border rounded-lg ${isExclusive ? "bg-black border-gray-800" : "bg-background"}`}>
              <span className={`text-2xl font-bold ${accentColorClass}`}>{formatCurrency(price)}</span>
              <span className={textMutedClass}> /day</span>
            </div>

            {/* 4. PENERAPAN STYLE KALENDER */}
            <div className="calendar-container mb-6 flex justify-center" style={calendarStyle}>
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
                disabled={disabledDays}
                modifiers={{ available: availableDays, booked: bookedDays, maintenance: maintenanceDays }}
                modifiersClassNames={{ available: "rdp-day_available", booked: "rdp-day_booked", maintenance: "rdp-day_maintenance" }}
                // Tambahan: Force styling menggunakan Tailwind classes jika variabel CSS tidak cukup
                classNames={{
                    day_selected: isExclusive 
                        ? "!bg-yellow-500 !text-black hover:!bg-yellow-400" 
                        : "!bg-primary !text-white hover:!bg-primary/90",
                    day_range_middle: isExclusive
                        ? "!bg-yellow-500/20 !text-yellow-500"
                        : "!bg-gray-100 !text-black",
                }}
              />
            </div>

            {user ? (
              bookingSuccess ? (
                <div className={`text-center p-6 rounded-lg border ${isExclusive ? "bg-green-900/20 border-green-800 text-green-200" : "bg-green-50 border-green-200 text-green-800"}`}>
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-bold text-lg">Booking Successful!</h4>
                  <p className="mt-1 mb-4">Your car is reserved. Please proceed to payment.</p>
                  <button onClick={() => router.push('/profile')} className={`w-full font-bold py-3 rounded-lg ${buttonClass}`}>
                    Go to My Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Contact Info */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                        <input type="text" value={name} disabled className={`w-full border rounded-lg px-4 py-2 opacity-70 cursor-not-allowed ${inputBgClass}`} />
                        <input type="email" value={email} disabled className={`w-full border rounded-lg px-4 py-2 opacity-70 cursor-not-allowed ${inputBgClass}`} />
                    </div>
                    <input type="tel" placeholder={t("form.phone")} value={phone} onChange={(e) => setPhone(e.target.value)} required className={`w-full border rounded-lg px-4 py-2 focus:ring-2 outline-none ${isExclusive ? "bg-black border-gray-700 focus:ring-yellow-500" : "bg-background focus:ring-primary"}`} />
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={`w-full border rounded-lg pl-10 pr-2 py-2 focus:ring-2 outline-none ${isExclusive ? "bg-black border-gray-700 focus:ring-yellow-500" : "bg-background focus:ring-primary"}`} />
                            </div>
                        </div>
                        <div className="col-span-2">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input type="text" placeholder={t("form.pickup")} value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} required className={`w-full border rounded-lg pl-10 pr-4 py-2 focus:ring-2 outline-none ${isExclusive ? "bg-black border-gray-700 focus:ring-yellow-500" : "bg-background focus:ring-primary"}`} />
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* DISCOUNT CODE */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1">
                        <TicketPercent size={14} /> Discount Code
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="SALE10"
                            value={discountCode}
                            onChange={(e) => {
                                setDiscountCode(e.target.value.toUpperCase());
                                setAppliedDiscount(0);
                                setDiscountMessage(null);
                            }}
                            className={`w-full border rounded-lg px-3 py-2 outline-none uppercase ${isExclusive ? "bg-black border-gray-700 focus:ring-2 focus:ring-yellow-500" : "bg-background border-gray-300 focus:ring-2 focus:ring-primary"}`}
                        />
                        <button
                            type="button"
                            onClick={handleApplyCode}
                            disabled={!discountCode.trim() || isCheckingCode || !selectedRange?.from}
                            className={`font-bold px-4 rounded-lg disabled:opacity-50 min-w-[80px] flex items-center justify-center transition-colors ${buttonClass}`}
                        >
                            {isCheckingCode ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
                        </button>
                    </div>
                    {discountMessage && (
                        <div className={`mt-2 text-xs flex items-center gap-1.5 ${discountMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                            {discountMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />} 
                            {discountMessage.text}
                        </div>
                    )}
                  </div>

                  {/* PRICE SUMMARY */}
                  <div className={`p-4 rounded-lg border space-y-2 ${isExclusive ? "bg-black/50 border-gray-800" : "bg-muted/30 border-border"}`}>
                    <div className="flex justify-between text-sm">
                        <span className={textMutedClass}>Duration</span>
                        <span>{totalDays} Days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className={textMutedClass}>Rate</span>
                        <span>{formatCurrency(price)}/day</span>
                    </div>
                    <div className={`flex justify-between text-sm font-medium pt-2 border-t border-dashed ${isExclusive ? "border-gray-800" : "border-border"}`}>
                        <span>Subtotal</span>
                        <span>{formatCurrency(baseTotal)}</span>
                    </div>
                    {appliedDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-500 font-bold">
                            <span>Discount</span>
                            <span>- {formatCurrency(appliedDiscount)}</span>
                        </div>
                    )}
                    <div className={`flex justify-between text-lg font-bold pt-2 border-t mt-2 ${accentColorClass} ${isExclusive ? "border-gray-800" : "border-border"}`}>
                        <span>Total Payment</span>
                        <span>{formatCurrency(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedRange?.from || !selectedRange?.to || isSubmitting}
                    className={`w-full font-bold py-3 rounded-lg disabled:opacity-50 transition-all shadow-md ${buttonClass}`}
                  >
                    {isSubmitting ? <span className="flex items-center justify-center gap-2"><Loader2 size={18} className="animate-spin"/> Processing...</span> : t("form.button")}
                  </button>
                </form>
              )
            ) : (
              <div className={`mt-6 text-center p-4 rounded-lg border ${isExclusive ? "bg-yellow-900/20 border-yellow-800 text-yellow-200" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
                <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm">
                  Please <Link href="/login" className="font-bold underline">log in</Link> to book this car.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}