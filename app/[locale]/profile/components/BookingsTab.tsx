"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link"; 
import { useLocale } from "next-intl"; 
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
  RefreshCcw,
  Calendar,
  Car,
  Map,
  Ticket,
  LucideIcon,
} from "lucide-react";

// Import Shared Types
import { SimpleBooking } from "../types";

// Import Modal
import RefundModal from "./RefundModal"; 

// --- 1. LOCAL TYPES (Database Alignment) ---
// This interface matches the 'details' JSON column in your 'bookings' table
interface BookingDetailsJSON {
  // ✅ FIX: Added service_name here so TypeScript knows it's a string
  service_name?: string;
  
  // Common
  full_name?: string;
  phone_number?: string;
  email?: string;
  special_request?: string;

  // Car Rental
  pickup_location?: string;
  pickup_time?: string;
  return_location?: string;
  return_time?: string;
  driver_details?: string;

  // Activity / Open Trip / Package
  quantity?: number;
  num_participants?: number;
  adults?: number;
  children?: number;
  meeting_point?: string;
  
  // Trip Planner
  destination?: string;
  budget?: string;
  trip_type?: string;

  [key: string]: unknown;
}

// --- 2. HELPER COMPONENTS ---
interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  value?: string | number | null;
}

const DetailRow = ({ icon: Icon, label, value }: DetailRowProps) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="min-w-[20px] text-primary">
        <Icon size={16} />
      </div>
      <span className="text-foreground/70 text-xs uppercase font-bold tracking-wider">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
};

// --- 3. SERVICE HANDLER FUNCTION ---
function ServiceSpecificDetails({ booking }: { booking: SimpleBooking }) {
  const details = booking.details as unknown as BookingDetailsJSON;
  const { bookable_type, bookable } = booking;
  
  const type = bookable_type?.split('\\').pop() || "";

  // A. Car Rental
  if (type === "CarRental") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed border-border/50">
           <Car size={18} className="text-blue-500" />
           <span className="font-semibold text-blue-700">Vehicle Rental</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <DetailRow icon={Car} label="Car Model" value={`${bookable?.brand || ''} ${bookable?.car_model || ''}`} />
             <DetailRow icon={Phone} label="Contact" value={details?.phone_number} />
             <DetailRow icon={MapPin} label="Pickup" value={details?.pickup_location} />
             <DetailRow icon={Clock} label="Pickup Time" value={details?.pickup_time} />
        </div>
      </div>
    );
  }

  // B. Activity
  if (type === "Activity") {
    return (
      <div className="space-y-3">
         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed border-border/50">
           <Ticket size={18} className="text-orange-500" />
           <span className="font-semibold text-orange-700">Activity / Ticket</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DetailRow icon={Ticket} label="Activity Name" value={bookable?.name} />
            <DetailRow icon={Users} label="Participants" value={details?.quantity || details?.num_participants} />
            <DetailRow icon={MapPin} label="Meeting Point" value={details?.meeting_point || details?.pickup_location} />
            <DetailRow icon={Calendar} label="Date" value={formatDate(booking.start_date)} />
        </div>
      </div>
    );
  }

  // C. Holiday Package & Open Trip
  if (type === "HolidayPackage" || type === "OpenTrip") {
    const paxCount = (details?.adults || 0) + (details?.children || 0) + (details?.num_participants || 0);
    return (
      <div className="space-y-3">
         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed border-border/50">
           <Package size={18} className="text-emerald-500" />
           <span className="font-semibold text-emerald-700">{type === "OpenTrip" ? "Open Trip" : "Holiday Package"}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             <DetailRow icon={Map} label="Destination" value={bookable?.name} />
             <DetailRow icon={Users} label="Travelers" value={`${paxCount} Pax`} />
             <DetailRow icon={MapPin} label="Meeting Point" value={details?.meeting_point || "See Voucher"} />
        </div>
      </div>
    );
  }

  // D. Trip Planner (Custom)
  if (type === "TripPlanner") {
    return (
      <div className="space-y-3">
         <div className="flex items-center gap-2 mb-2 pb-2 border-b border-dashed border-border/50">
           <Plane size={18} className="text-purple-500" />
           <span className="font-semibold text-purple-700">Custom Trip Plan</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DetailRow icon={Map} label="Destination" value={details?.destination || booking?.bookable?.name || "Custom"} />
            <DetailRow icon={User} label="Booked For" value={details?.full_name} />
            <DetailRow icon={Plane} label="Trip Type" value={details?.trip_type} />
            <DetailRow icon={RefreshCcw} label="Budget" value={details?.budget} />
        </div>
      </div>
    );
  }

  return <p className="text-sm text-foreground/60 italic">Service details not available.</p>;
}

// --- MAIN COMPONENT ---

export default function BookingsTab() {
  const locale = useLocale();
  const [bookings, setBookings] = useState<SimpleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<SimpleBooking | null>(null);

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

  const handleOpenRefund = (booking: SimpleBooking) => {
    setSelectedBookingForRefund(booking);
    setIsRefundModalOpen(true);
  };

  const renderBookingList = () =>
    !bookings || bookings.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
          <Calendar size={48} className="mb-4 opacity-20" />
          <p>You have no active bookings.</p>
          <p className="text-xs">Your confirmed trips and services will appear here.</p>
      </div>
    ) : (
      bookings.map((booking) => {
        const bookable = booking?.bookable;
        const details = booking.details as unknown as BookingDetailsJSON;
        
        // --- Smart Name Resolution ---
        // ✅ FIX: TypeScript now knows 'details.service_name' is a string | undefined
        // We explicitly cast the whole expression to string for safety.
        const serviceName = (
          details?.service_name ||
          bookable?.name ||
          (bookable?.brand ? `${bookable.brand} ${bookable.car_model}` : null) ||
          "Service Booking"
        ) as string;

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;
        
        let dateDisplay = "Date Not Set";
        if (startDate) {
          dateDisplay = formatDate(startDate);
          if (endDate && endDate !== startDate) {
            dateDisplay += ` - ${formatDate(endDate)}`;
          }
        }

        const detailUrl = `/${locale}/profile/bookings/${booking.id}`;
        
        const canRefund = 
            booking.status === 'confirmed' || 
            booking.status === 'pending';

        return (
          <div
            key={booking.id}
            className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:shadow-md flex flex-col"
          >
            {/* 1. Header with Status */}
            <div className="p-4 flex justify-between items-start bg-muted/20 border-b border-border/50">
              <div>
                <h3 className="font-bold text-lg text-foreground">{serviceName}</h3>
                <p className="text-sm text-foreground/60 flex items-center gap-1 mt-1">
                   <Clock size={14}/> {dateDisplay}
                </p>
              </div>
              <span className={getStatusChip(booking.status)}>
                {booking.status.toUpperCase()}
              </span>
            </div>

            {/* 2. Dynamic Service Details */}
            <div className="p-4">
                 <ServiceSpecificDetails booking={booking} />
            </div>

            {/* 3. Footer Actions */}
            <div className="bg-muted/10 p-4 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col w-full sm:w-auto text-left">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Price</span>
                    <span className="font-bold text-lg text-primary">{formatCurrency(booking.total_price)}</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Refund Button */}
                    {canRefund && (
                      <button 
                          onClick={() => handleOpenRefund(booking)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-border bg-background text-foreground text-sm font-semibold rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
                      >
                          <RefreshCcw size={16} /> Request Refund
                      </button>
                    )}

                    {/* View Voucher / Details Button */}
                    <Link 
                        href={detailUrl}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:brightness-110 shadow-sm transition-all"
                    >
                        View Voucher <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
          </div>
        );
      })
    );

  if (loading) return (
     <div className="flex justify-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded-full"></div>
            <span className="text-muted-foreground text-sm">Loading bookings...</span>
        </div>
     </div>
  );
  
  if (error) return (
    <div className="text-center py-10">
        <p className="text-red-500 mb-2">{error}</p>
        <button onClick={() => fetchData()} className="text-sm underline">Try Again</button>
    </div>
  );

  return (
    <div className="animate-fadeIn space-y-6 relative">
      <div className="flex justify-between items-center border-b border-border pb-4">
        {/* Updated Title to reflect intent */}
        <h2 className="text-2xl font-bold">My Bookings</h2>
        <span className="text-xs text-muted-foreground hidden sm:block">
           Manage your trips and vouchers
        </span>
      </div>
      <div className="space-y-4">{renderBookingList()}</div>

      {selectedBookingForRefund && (
        <RefundModal 
          isOpen={isRefundModalOpen}
          onClose={() => setIsRefundModalOpen(false)}
          booking={selectedBookingForRefund}
          onSuccess={() => {
              fetchData(); 
          }}
        />
      )}
    </div>
  );
}