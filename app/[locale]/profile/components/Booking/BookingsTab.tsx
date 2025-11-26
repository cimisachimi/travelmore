// app/[locale]/profile/components/BookingsTab.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link"; // ✅ Ganti useRouter dengan Link
import { useLocale } from "next-intl"; // ✅ Import useLocale
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";
import {
  User,
  Phone,
  MapPin,
  Clock,
  Users,
  Package,
  Plane,
  ArrowRight,
} from "lucide-react";

// --- Interface (Sama seperti sebelumnya) ---
interface BookingDetailsShape {
  service_name?: string;
  original_subtotal?: number;
  discount_applied?: number;
  phone_number?: string;
  pickup_location?: string;
  pickup_time?: string;
  total_days?: number;
  num_participants?: number;
  quantity?: number;
  activity_time?: string;
  price_per_person?: number;
  adults?: number;
  children?: number;
  num_travelers?: number;
  price_tier?: string;
  full_name?: string;
  trip_type?: string;
}

interface SimpleBooking {
  id: number;
  status: string;
  payment_status: string;
  total_price: number;
  start_date?: string | null;
  end_date?: string | null;
  bookable_type: string;
  details: BookingDetailsShape;
  bookable?: {
    name?: string;
    brand?: string;
    car_model?: string;
  } | null;
}

// --- BookingDetails Component (Sama seperti sebelumnya) ---
const DetailRow = ({ icon: Icon, label, value }: any) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <Icon size={16} className="text-primary" />
      <span className="text-foreground/80">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

function BookingDetails({ booking }: { booking: SimpleBooking }) {
  const { details, bookable_type } = booking;

  if (bookable_type?.includes("CarRental")) {
    return (
      <div className="space-y-2">
        <DetailRow icon={Phone} label="Phone" value={details?.phone_number} />
        <DetailRow icon={MapPin} label="Pickup" value={details?.pickup_location} />
        <DetailRow icon={Clock} label="Pickup Time" value={details?.pickup_time} />
      </div>
    );
  }
  if (bookable_type?.includes("Activity")) {
    return (
      <div className="space-y-2">
        <DetailRow icon={Users} label="Participants" value={details?.num_participants || details?.quantity} />
        <DetailRow icon={Clock} label="Time" value={details?.activity_time} />
      </div>
    );
  }
  if (bookable_type?.includes("HolidayPackage")) {
    const travelers = [
      details?.adults ? `${details.adults} Adults` : "",
      details?.children ? `${details.children} Children` : "",
    ].filter(Boolean).join(", ");
    return (
      <div className="space-y-2">
        <DetailRow icon={Users} label="Travelers" value={travelers || details?.num_travelers} />
        <DetailRow icon={Package} label="Package Tier" value={details?.price_tier} />
      </div>
    );
  }
  if (bookable_type?.includes("TripPlanner")) {
    return (
      <div className="space-y-2">
        <DetailRow icon={User} label="Name" value={details?.full_name} />
        <DetailRow icon={Plane} label="Trip Type" value={details?.trip_type} />
      </div>
    );
  }
  return <p className="text-sm text-foreground/60 italic">No details available.</p>;
}

// --- MAIN COMPONENT ---

export default function BookingsTab() {
  const locale = useLocale(); // ✅ Ambil locale aktif (id/en)
  const [bookings, setBookings] = useState<SimpleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/my-bookings");
      setBookings(response.data);
    } catch (err) {
      setError("Failed to fetch purchase history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderBookingList = () =>
    !bookings || bookings.length === 0 ? (
      <p>You have no active purchase history.</p>
    ) : (
      bookings.map((booking) => {
        const bookable = booking?.bookable;
        const serviceName =
          booking.details?.service_name ||
          bookable?.name ||
          `${bookable?.brand || ""} ${bookable?.car_model || ""}`.trim() ||
          (booking.bookable_type?.includes("TripPlanner")
            ? "Custom Trip Plan"
            : "Service Details Unavailable");

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;
        let dateDisplay = "N/A";
        if (startDate) {
          dateDisplay = formatDate(startDate);
          if (endDate && endDate !== startDate) {
            dateDisplay += ` - ${formatDate(endDate)}`;
          }
        }

        // ✅ URL Detail yang Benar
        // Sesuai struktur folder kamu: app/[locale]/profile/components/Booking/[id]/page.tsx
        const detailUrl = `/${locale}/profile/components/Booking/${booking.id}`;

        return (
          <div
            key={booking.id}
            className="bg-card border border-border rounded-lg p-4 transition-shadow hover:shadow-md flex flex-col gap-4"
          >
            {/* --- Header --- */}
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{serviceName}</p>
                <p className="text-sm text-foreground/60 flex items-center gap-1">
                   <Clock size={14}/> {dateDisplay}
                </p>
              </div>
              <span className={getStatusChip(booking.status)}>
                {booking.status}
              </span>
            </div>

            {/* --- Body --- */}
            <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                 <BookingDetails booking={booking} />
            </div>

            {/* --- Footer --- */}
            <div className="flex justify-between items-center border-t border-dashed pt-3 mt-1">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">Total Price</span>
                    <span className="font-bold text-lg">{formatCurrency(booking.total_price)}</span>
                </div>

                {/* ✅ TOMBOL MENGGUNAKAN LINK (Lebih Stabil) */}
                <Link 
                    href={detailUrl}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:brightness-110 transition-all"
                >
                    View Details <ArrowRight size={16} />
                </Link>
            </div>
          </div>
        );
      })
    );

  if (loading) return <p>Loading history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase History</h2>
      </div>
      <div className="space-y-4">{renderBookingList()}</div>
    </div>
  );
}