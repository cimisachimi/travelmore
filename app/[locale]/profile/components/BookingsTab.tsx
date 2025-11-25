// app/[locale]/profile/components/BookingsTab.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";
import {
  User,
  Phone,
  MapPin,
  Clock,
  Users,
  Package,
  Plane,
} from "lucide-react";

// --- 1. DEFINE THE SHAPE OF 'details' ---
interface BookingDetailsShape {
  service_name?: string;
  original_subtotal?: number;
  discount_applied?: number;
  
  // Car Rental
  phone_number?: string;
  pickup_location?: string;
  pickup_time?: string;
  total_days?: number;

  // Activity
  num_participants?: number;
  quantity?: number;
  activity_time?: string;
  price_per_person?: number;

  // Holiday Package
  adults?: number;
  children?: number;
  num_travelers?: number;
  price_tier?: string;
  
  // Trip Planner
  full_name?: string;
  trip_type?: string;
}

// --- 2. UPDATE SimpleBooking INTERFACE ---
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

// --- BookingDetails Component ---
const DetailRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => {
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
        <DetailRow
          icon={Phone}
          label="Phone"
          value={details?.phone_number}
        />
        <DetailRow
          icon={MapPin}
          label="Pickup"
          value={details?.pickup_location}
        />
        <DetailRow
          icon={Clock}
          label="Pickup Time"
          value={details?.pickup_time}
        />
      </div>
    );
  }

  if (bookable_type?.includes("Activity")) {
    return (
      <div className="space-y-2">
        <DetailRow
          icon={Users}
          label="Participants"
          value={details?.num_participants || details?.quantity}
        />
        <DetailRow
          icon={Clock}
          label="Time"
          value={details?.activity_time}
        />
      </div>
    );
  }

  if (bookable_type?.includes("HolidayPackage")) {
    const travelers = [
      details?.adults ? `${details.adults} Adults` : "",
      details?.children ? `${details.children} Children` : "",
    ]
      .filter(Boolean)
      .join(", ");

    return (
      <div className="space-y-2">
        <DetailRow
          icon={Users}
          label="Travelers"
          value={travelers || details?.num_travelers}
        />
        <DetailRow
          icon={Package}
          label="Package Tier"
          value={details?.price_tier}
        />
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

  return (
    <p className="text-sm text-foreground/60 italic">
      No additional details available for this booking.
    </p>
  );
}

// --- Main BookingsTab Component ---

export default function BookingsTab() {
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
      setError("Failed to fetch your bookings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestChange = (bookingId: number) => {
    console.log("Requesting change for booking:", bookingId);
    // TODO: Implement your modal logic here
    alert("Request Change button clicked for booking " + bookingId);
  };

  const renderBookingList = () =>
    !bookings || bookings.length === 0 ? (
      <p>You have no active bookings.</p>
    ) : (
      bookings.map((booking) => {
        const bookable = booking?.bookable;

        // Improved Service Name Logic
        const serviceName =
          booking.details?.service_name || 
          bookable?.name || 
          `${bookable?.brand || ""} ${bookable?.car_model || ""}`.trim() || 
          (booking.bookable_type?.includes("TripPlanner")
            ? "Custom Trip Plan"
            : "Service Details Unavailable");

        // Improved Date Display Logic
        const startDate = booking?.start_date;
        const endDate = booking?.end_date;
        let dateDisplay = "N/A";
        if (startDate) {
          dateDisplay = formatDate(startDate);
          if (endDate && endDate !== startDate) {
            dateDisplay += ` - ${formatDate(endDate)}`;
          }
        }

        return (
          <div
            key={booking.id}
            className="bg-card border border-border rounded-lg p-4 transition-shadow hover:shadow-md"
          >
            {/* --- Header --- */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-lg">{serviceName}</p>
                <p className="text-sm text-foreground/60">{dateDisplay}</p>
              </div>
              <span className={getStatusChip(booking.status)}>
                {booking.status}
              </span>
            </div>

            {/* --- Body (General & Specific Details) --- */}
            <div className="border-t border-border pt-3 space-y-4">
              {/* Specific Details Section */}
              <BookingDetails booking={booking} />

              {/* --- General Details --- */}
              <div className="space-y-2 pt-4 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/80">Booking Status:</span>
                  <span className="font-semibold capitalize">
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-foreground/80">Payment Status:</span>
                  <span className="font-semibold capitalize">
                    {booking.payment_status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-foreground/80">Total Price:</span>
                  <span className="font-semibold">
                    {formatCurrency(booking.total_price)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* --- Footer with Action Button --- */}
            <div className="border-t border-border pt-4 mt-4 flex justify-end">
              <button
                onClick={() => handleRequestChange(booking.id)}
                className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80"
              >
                Request Change
              </button>
            </div>

          </div>
        );
      })
    );

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        {/* ✅ JUDUL DIUBAH KE PURCHASE HISTORY (atau bisa "Service History") */}
        <h2 className="text-2xl font-bold">Purchase History</h2>
      </div>
      <div className="space-y-4">{renderBookingList()}</div>
    </div>
  );
}