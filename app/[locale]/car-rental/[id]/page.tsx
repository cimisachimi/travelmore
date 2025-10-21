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
import { differenceInDays } from "date-fns";
import { AxiosError } from "axios";
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

// ✅ REMOVED: BookingOrder interface no longer needed here

export default function CarDetailPage() {
  const t = useTranslations("carDetail");
  const params = useParams();
  const locale = useLocale();
  const { user } = useAuth();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const [car, setCar] = useState<ApiCar | null>(null);
  const [availabilities, setAvailabilities] = useState<ApiCarAvailabilityMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();
  const [activeImage, setActiveImage] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // ✅ REMOVED: Payment-related states
  // const [isPaying, setIsPaying] = useState(false);
  // const [newOrder, setNewOrder] = useState<BookingOrder | null>(null);

  // Form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");

  // Re-usable function to fetch availability
  const fetchAvailability = async () => {
    // ... (this function is unchanged)
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
    // ... (this function is unchanged)
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
  }, [id, locale, t]);

  useEffect(() => {
    // ... (this function is unchanged)
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // ✅ REMOVED: Midtrans Snap script loader useEffect

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
    const numberOfDays =
      differenceInDays(selectedRange.to, selectedRange.from) + 1;
    const totalPrice = numberOfDays * parseFloat(car.price_per_day);

    try {
      const response = await api.post(`/car-rentals/${car.id}/book`, {
        start_date: selectedRange.from.toISOString().split("T")[0],
        end_date: selectedRange.to.toISOString().split("T")[0],
        total_price: totalPrice,
      });

      if (response.status === 201) {
        // ✅ MODIFIED: Simplified success flow
        toast.success(
          `Booking created! Please complete payment in your profile.`
        );
        setBookingSuccess(true);
        // ✅ REMOVED: setNewOrder(order);

        // Refetch availability and clear selection
        fetchAvailability();
        setSelectedRange(undefined);
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

  // ✅ REMOVED: handlePayment function

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);

  const { availableDays, bookedDays, maintenanceDays } = useMemo(() => {
    // ... (this function is unchanged)
    const available: Date[] = [];
    const booked: Date[] = [];
    const maintenance: Date[] = [];

    Object.keys(availabilities).forEach((dateString) => {
      const date = new Date(dateString + "T00:00:00");
      const status = availabilities[dateString];

      if (status === "available") {
        available.push(date);
      } else if (status === "booked") {
        booked.push(date);
      } else if (status === "maintenance") {
        maintenance.push(date);
      }
    });

    return {
      availableDays: available,
      bookedDays: booked,
      maintenanceDays: maintenance,
    };
  }, [availabilities]);

  const disabledDays = useMemo(() => {
    return [...bookedDays, ...maintenanceDays];
  }, [bookedDays, maintenanceDays]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error || !car)
    return (
      <div className="p-10 text-center text-red-500">
        {error || t("notFound")}
      </div>
    );

  const carName = `${car.brand} ${car.car_model}`;
  const price = parseFloat(car.price_per_day);
  const gallery =
    car.images?.map((img) => ({
      full: `${process.env.NEXT_PUBLIC_API_BASE_URL}/storage/${img.url}`,
    })) || [];

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* --- LEFT: Gallery + Info --- */}
          <div>
            {/* ... (gallery and info section is unchanged) ... */}
            <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-lg mb-4">
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
                    className={`relative w-20 h-20 rounded-lg cursor-pointer border-2 ${img.full === activeImage
                      ? "border-primary"
                      : "border-transparent"
                      }`}
                    onClick={() => setActiveImage(img.full)}
                  >
                    <Image
                      src={img.full}
                      alt={`${carName} ${index}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="5rem"
                    />
                  </div>
                ))}
              </div>
            )}
            <h2 className="text-3xl font-bold mt-6">{carName}</h2>
            <p className="mt-2 text-foreground/70">
              {car.description || "No description."}
            </p>
            {/* ... (car details are unchanged) ... */}
          </div>

          {/* --- RIGHT: Booking Form --- */}
          <div className="bg-card shadow-lg rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">{t("form.title")}</h3>
            <div className="mb-4 p-4 bg-background border rounded-lg">
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(price)}
              </span>
              <span className="text-foreground/60"> /day</span>
            </div>

            <div className="calendar-container">
              {/* ... (DayPicker is unchanged) ... */}
              <DayPicker
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
                disabled={[{ before: new Date() }, ...disabledDays]}
                modifiers={{
                  available: availableDays,
                  booked: bookedDays,
                  maintenance: maintenanceDays,
                }}
                modifiersClassNames={{
                  available: "rdp-day_available",
                  booked: "rdp-day_booked",
                  maintenance: "rdp-day_maintenance",
                }}
              />
            </div>

            {user ? (
              // ✅ MODIFIED: Show simple success message, not payment options
              bookingSuccess ? (
                <div className="mt-6 text-center p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg">
                  <h4 className="font-bold text-lg text-green-800 dark:text-green-200">
                    Booking Successful!
                  </h4>
                  <p className="text-green-700 dark:text-green-300">
                    Your booking is reserved. You can now complete the payment
                    in your profile.
                  </p>
                  <Link
                    href="/profile" // ✅ ADDED: Link to profile page
                    className="mt-4 inline-block bg-primary text-primary-foreground font-bold py-2 px-4 rounded-lg hover:bg-primary/90"
                  >
                    Go to My Profile
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <input
                    type="text"
                    placeholder={t("form.name")}
                    value={name}
                    required
                    readOnly
                    disabled
                    className="w-full border rounded-lg px-4 py-2 bg-muted/50 cursor-not-allowed"
                  />
                  <input
                    type="email"
                    placeholder={t("form.email")}
                    value={email}
                    required
                    readOnly
                    disabled
                    className="w-full border rounded-lg px-4 py-2 bg-muted/50 cursor-not-allowed"
                  />
                  <input
                    type="tel"
                    placeholder={t("form.phone")}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2 bg-background"
                  />
                  <input
                    type="text"
                    placeholder={t("form.pickup")}
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2 bg-background"
                  />
                  <button
                    type="submit"
                    disabled={
                      !selectedRange?.from || !selectedRange?.to || isSubmitting
                    }
                    className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting Booking..." : t("form.button")}
                  </button>
                </form>
              )
            ) : (
              <div className="mt-6 text-center p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Please{" "}
                  <Link href="/login" className="font-bold underline">
                    log in
                  </Link>{" "}
                  to book this car.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}