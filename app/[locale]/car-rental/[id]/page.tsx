"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import "@/styles/calendar.css";
import api from "@/lib/api";
import Link from "next/link";
import { differenceInDays } from 'date-fns'; // Helper to calculate days

// --- Interfaces ---
interface ApiCarImage { url: string; type: "thumbnail" | "gallery"; }
interface ApiCarAvailability { date: string; status: "available" | "booked" | "maintenance"; }
interface ApiCar {
  id: number; car_model: string; brand: string; car_type: string | null;
  transmission: string | null; fuel_type: string | null; capacity: number | null;
  trunk_size: number | null; description: string | null; features: string[] | null;
  price_per_day: string; images: ApiCarImage[]; availabilities: ApiCarAvailability[];
}

export default function CarDetailPage() {
  const t = useTranslations("carDetail");
  const params = useParams();
  const locale = useLocale();
  const { user } = useAuth();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const [car, setCar] = useState<ApiCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [activeImage, setActiveImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchCar = async () => {
      try {
        const response = await api.get(`/public/car-rentals/${id}`, { params: { locale } });
        const data: ApiCar = response.data;
        setCar(data);
        const firstImage = data.images?.[0]?.url ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${data.images[0].url}` : "/cars/placeholder.jpg";
        setActiveImage(firstImage);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, locale]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

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

    setIsSubmitting(true);

    // Calculate the total number of days (inclusive)
    const numberOfDays = differenceInDays(selectedRange.to, selectedRange.from) + 1;
    const totalPrice = numberOfDays * parseFloat(car.price_per_day);

    try {
      // Send the request to the correct route with the correct payload
      const response = await api.post(`/car-rentals/${car.id}/book`, {
        start_date: selectedRange.from.toISOString().split("T")[0],
        end_date: selectedRange.to.toISOString().split("T")[0],
        total_price: totalPrice,
      });

      if (response.status === 201) {
        toast.success(`Booking created successfully!`);
        setBookingSuccess(true);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Booking failed. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);

  const disabledDays = useMemo(() => {
    if (!car?.availabilities) return [];
    return car.availabilities
      .filter(day => day.status === 'booked' || day.status === 'maintenance')
      .map(day => new Date(day.date));
  }, [car]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !car) return <div className="p-10 text-center text-red-500">{t("notFound")}</div>;

  const carName = `${car.brand} ${car.car_model}`;
  const price = parseFloat(car.price_per_day);
  const gallery = car.images?.map((img) => ({ full: `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img.url}` })) || [];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* --- LEFT: Gallery + Info --- */}
          <div>
            <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg mb-4">
              <Image src={activeImage} alt={carName} fill className="object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">{gallery.map((img, index) => (<div key={index} className={`relative w-20 h-20 rounded-lg cursor-pointer border-2 ${img.full === activeImage ? "border-primary" : "border-transparent"}`} onClick={() => setActiveImage(img.full)}><Image src={img.full} alt={`${carName} ${index}`} fill className="object-cover rounded-lg" /></div>))}</div>
            )}
            <h2 className="text-3xl font-bold mt-6">{carName}</h2>
            <p className="mt-2 text-foreground/70">{car.description || "No description."}</p>
            <div className="grid grid-cols-2 gap-3 mt-6 text-sm">
              <p><strong>Type:</strong> {car.car_type || "-"}</p>
              <p><strong>Transmission:</strong> {car.transmission || "-"}</p>
              <p><strong>Fuel:</strong> {car.fuel_type || "-"}</p>
              <p><strong>Capacity:</strong> {car.capacity || "-"} Seats</p>
              <p><strong>Trunk:</strong> {car.trunk_size || "-"} Bags</p>
            </div>
            {car.features && car.features.length > 0 && (
              <div className="mt-6 p-4 bg-card rounded-lg border"><h3 className="font-semibold mb-2">Features</h3><ul className="list-disc pl-5 space-y-1">{car.features.map((f, i) => <li key={i}>{f}</li>)}</ul></div>
            )}
          </div>

          {/* --- RIGHT: Booking Form --- */}
          <div className="bg-card shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">{t("form.title")}</h3>
            <div className="mb-4 p-4 bg-background border rounded-lg"><span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span><span className="text-foreground/60"> /day</span></div>

            <div className="calendar-container">
              <DayPicker mode="range" selected={selectedRange} onSelect={setSelectedRange} disabled={[{ before: new Date() }, ...disabledDays]} />
            </div>

            {user ? (
              bookingSuccess ? (
                <div className="mt-6 text-center p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg">
                  <h4 className="font-bold text-lg text-green-800 dark:text-green-200">Booking Successful!</h4>
                  <p className="text-green-700 dark:text-green-300">Your booking is pending. Please complete the payment to confirm.</p>
                  {/* You can add the PaymentButton here in the future */}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input type="text" placeholder={t("form.name")} value={name} required readOnly disabled className="w-full border rounded-lg px-4 py-2 bg-muted/50 cursor-not-allowed" />
                  <input type="email" placeholder={t("form.email")} value={email} required readOnly disabled className="w-full border rounded-lg px-4 py-2 bg-muted/50 cursor-not-allowed" />
                  <input type="tel" placeholder={t("form.phone")} value={phone} onChange={e => setPhone(e.target.value)} required className="w-full border rounded-lg px-4 py-2 bg-background" />
                  <input type="text" placeholder={t("form.pickup")} value={pickupLocation} onChange={e => setPickupLocation(e.target.value)} required className="w-full border rounded-lg px-4 py-2 bg-background" />
                  <button type="submit" disabled={!selectedRange?.from || !selectedRange?.to || isSubmitting} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:opacity-50">
                    {isSubmitting ? 'Submitting Booking...' : t("form.button")}
                  </button>
                </form>
              )
            ) : (
              <div className="mt-6 text-center p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">Please <Link href="/login" className="font-bold underline">log in</Link> to book this car.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}