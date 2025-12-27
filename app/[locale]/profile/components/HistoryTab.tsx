// app/[locale]/profile/components/HistoryTab.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Order } from "../types"; 
import { toast } from "sonner";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";
import OrderPaymentActions from "./OrderPaymentActions";
import { AxiosError } from "axios";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
  Plane,
  Car,
  Clock,
  Calendar,
  Wallet,
  Compass,
  Users,
  Luggage,
  Ticket,
  FileText,
  Flag,
  Briefcase
} from "lucide-react";

// --- LOCAL TYPES FOR SAFETY ---
interface BookingDetails {
  // Common
  name?: string | null; 
  brand?: string | null;
  car_model?: string | null;
  plate_number?: string | null;
  total_days?: number | null;
  pickup_location?: string | null;
  pickup_time?: string | null;
  phone_number?: string | null;
  email?: string | null;
  full_name?: string | null;
  
  // Trip Planner & Packages & Open Trip
  type?: string | null;
  company_name?: string | null;
  brand_name?: string | null;
  trip_type?: string | null;
  city?: string | null;
  destination?: string | null; 
  province?: string | null;
  country?: string | null;
  travel_type?: string | null;
  
  // VARIABEL TANGGAL
  departure_date?: string | null;
  booking_date?: string | null; 
  start_date?: string | null;    
  end_date?: string | null;      
  date?: string | null;          
  time?: string | null;
  
  duration?: string | number | null;
  days?: string | number | null;
  budget_pack?: string | null;
  addons?: string[] | string | null;
  must_visit?: string | null;
  
  // Pax Info
  adults?: number | null;
  children?: number | null;
  pax_adults?: string | number | null;
  pax_teens?: string | number | null;
  pax_kids?: string | number | null;
  pax_seniors?: string | number | null;
  total_pax?: number | null;
  participant_nationality?: string | null;
  
  // Flights & Activities & Services
  flight_number?: string | null;
  special_request?: string | null;
  quantity?: number | null;
  activity_time?: string | null;
  service_name?: string | null;
  notes?: string | null;
  
  
  [key: string]: any;
}

// --- HELPER: Service Type Badge ---
const ServiceTypeBadge = ({ type }: { type: string }) => {
  let config = { 
    label: "Service", 
    color: "bg-gray-100 text-gray-700 border-gray-200", 
    icon: FileText 
  };

  if (type?.includes("CarRental")) {
    config = { label: "Car Rental", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Car };
  } else if (type?.includes("TripPlanner")) {
    config = { label: "Trip Planner", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Compass };
  } else if (type?.includes("HolidayPackage")) {
    config = { label: "Holiday Package", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Luggage };
  } else if (type?.includes("Activity")) {
    config = { label: "Activity", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Ticket };
  } else if (type?.includes("OpenTrip")) {
    config = { label: "Open Trip", color: "bg-teal-50 text-teal-700 border-teal-200", icon: Flag };
  } else if (type?.includes("Service")) {
    config = { label: "Service", color: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: Briefcase };
  }

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} mb-2 w-fit`}>
      <Icon size={12} /> {config.label}
    </span>
  );
};

// --- SUB-COMPONENTS FOR DETAILS ---

const CarRentalDetails = ({ details }: { details: BookingDetails }) => (
  <div className="space-y-4 text-sm animate-fadeIn">
    <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
      <Car size={16} /> Car Rental Details
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div>
          <span className="text-xs text-muted-foreground block">Vehicle</span>
          <span className="font-medium">{details.brand} {details.car_model}</span>
          {details.plate_number && <div className="text-xs text-muted-foreground">{details.plate_number}</div>}
        </div>

        {/* --- Bagian Tanggal Sewa --- */}
        <div>
           <span className="text-xs text-muted-foreground block">Rental Dates</span>
           <span className="font-medium flex items-center gap-1">
              <Calendar size={12} /> 
              {details.start_date ? formatDate(details.start_date) : "-"} 
              {details.end_date ? ` - ${formatDate(details.end_date)}` : ""}
           </span>
        </div>
        {/* --------------------------- */}

        <div>
          <span className="text-xs text-muted-foreground block">Duration</span>
          <span className="font-medium flex items-center gap-1"><Clock size={12} /> {details.total_days} Day(s)</span>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <span className="text-xs text-muted-foreground block">Pickup</span>
          <span className="font-medium flex items-center gap-1"><MapPin size={12} /> {details.pickup_location || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Time</span>
          <span className="font-medium flex items-center gap-1"><Clock size={12} /> {details.pickup_time || "-"}</span>
        </div>
      </div>
    </div>
  </div>
);

const TripPlannerDetails = ({ details }: { details: BookingDetails }) => {
    const safeInt = (val: string | number | undefined | null) => {
        const parsed = parseInt(String(val || "0"));
        return isNaN(parsed) ? 0 : parsed;
    };

    const type = details.type || 'personal';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalPax = safeInt(details.pax_adults) + safeInt(details.pax_teens) + safeInt(details.pax_kids) + safeInt(details.pax_seniors);
    
    let location = details.city || "-";
    if (details.trip_type === "domestic") location = `🇮🇩 ${details.city}, ${details.province}`;
    if (details.trip_type === "foreign") location = `🌐 ${details.city}, ${details.country}`;

    const durationDisplay = details.duration || details.days || "";
    const displayDate = details.departure_date || details.start_date || details.booking_date || details.date || "-";

    return (
        <div className="space-y-4 text-sm animate-fadeIn">
            <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
                <Compass size={16} /> Custom Trip Details
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div>
                        <span className="text-xs text-muted-foreground block">Destination</span>
                        <span className="font-medium capitalize">{location}</span>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground block">Date & Duration</span>
                        <span className="font-medium flex items-center gap-1">
                             <Calendar size={12}/> {displayDate !== "-" ? formatDate(displayDate) : "-"} ({durationDisplay} days)
                        </span>
                    </div>
                </div>
                <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Budget & Type</span>
                        <span className="font-medium capitalize flex items-center gap-1">
                             <Wallet size={12}/> {String(details.budget_pack || "").replace("_", " ")}
                        </span>
                         <div className="text-xs text-muted-foreground capitalize flex items-center gap-1 mt-0.5">
                             <Plane size={10}/> {String(details.travel_type || "").replace("_", " ")}
                         </div>
                    </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Contact ({type})</span>
                        <span className="font-medium truncate block max-w-[150px]">
                            {type === 'company' ? details.company_name : details.full_name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HOLIDAY PACKAGE DETAILS ---
const HolidayPackageDetails = ({ details }: { details: BookingDetails }) => {
  const totalPax = details.total_pax || (Number(details.adults || 0) + Number(details.children || 0));
  
  const displayDate = details.date || details.start_date || details.departure_date || details.booking_date || "-";

  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Luggage size={16} /> Package Details
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground block">Schedule</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar size={12} /> {displayDate !== "-" ? formatDate(displayDate) : "-"}
            </span>
            {details.duration && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock size={10} /> {details.duration} Days
              </span>
            )}
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Participants</span>
            <span className="font-medium flex items-center gap-1">
              <Users size={12} /> {totalPax || details.quantity || 1} Pax
            </span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground block">Contact Info</span>
            <span className="font-medium flex items-center gap-1">
              <User size={12} /> {details.full_name}
            </span>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Phone size={10} /> {details.phone_number || "-"}
            </div>
             {details.pickup_location && (
               <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {details.pickup_location}
               </div>
            )}
          </div>
          {details.special_request && (
            <div>
              <span className="text-xs text-muted-foreground block">Special Request</span>
              <span className="font-medium italic text-xs">&quot;{details.special_request}&quot;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ACTIVITY DETAILS ---
const ActivityDetails = ({ details }: { details: BookingDetails }) => {
  const displayDate = details.booking_date || details.start_date || details.date || details.departure_date || "-";

  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Ticket size={16} /> Activity Details
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground block">Date & Time</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar size={12} /> {displayDate !== "-" ? formatDate(displayDate) : "-"}
            </span>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock size={10} /> {details.activity_time || details.pickup_time || details.time || "TBA"}
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Participants</span>
            <span className="font-medium flex items-center gap-1">
              <Users size={12} /> {details.quantity} Pax
            </span>
            {details.participant_nationality && (
                <span className="text-xs text-muted-foreground block mt-0.5">
                  ({details.participant_nationality})
                </span>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground block">Pickup Location</span>
            <span className="font-medium flex items-center gap-1">
              <MapPin size={12} /> {details.pickup_location || "Meeting Point"}
            </span>
          </div>
          {details.special_request && (
            <div>
              <span className="text-xs text-muted-foreground block">Special Request</span>
              <span className="font-medium italic text-xs">&quot;{details.special_request}&quot;</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- OPEN TRIP DETAILS ---
const OpenTripDetails = ({ details }: { details: BookingDetails }) => {
  const displayDate = details.start_date || details.departure_date || details.booking_date || details.date || "-";
  
  const displayLocation = details.destination || details.city || details.pickup_location || "-";
  
  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Flag size={16} /> Open Trip Details
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground block">Destination / Meeting Point</span>
            <span className="font-medium flex items-center gap-1">
              <MapPin size={12} /> {displayLocation}
            </span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground block">Schedule</span>
            <div className="font-medium flex items-center gap-1">
              <Calendar size={12} /> {displayDate !== "-" ? formatDate(displayDate) : "-"}
            </div>
            {details.end_date && (
               <div className="text-xs text-muted-foreground mt-0.5 ml-4">
                  to {formatDate(details.end_date)}
               </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-muted-foreground block">Participants</span>
            <span className="font-medium flex items-center gap-1">
              <Users size={12} /> {details.quantity || (Number(details.adults || 0) + Number(details.children || 0)) || 1} Pax
            </span>
          </div>
          {details.full_name && (
            <div>
              <span className="text-xs text-muted-foreground block">Contact</span>
              <span className="font-medium flex items-center gap-1">
                <User size={12} /> {details.full_name}
              </span>
               <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone size={10} /> {details.phone_number || "-"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ServiceDetails = ({ details }: { details: BookingDetails }) => (
  <div className="space-y-4 text-sm animate-fadeIn">
    <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
      <Briefcase size={16} /> Service Details
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div>
          <span className="text-xs text-muted-foreground block">Service Name</span>
          <span className="font-medium">{details.service_name || details.name || "Custom Service"}</span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Booking Date</span>
          <span className="font-medium flex items-center gap-1">
            <Calendar size={12} /> {details.booking_date || details.departure_date || "-"}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {details.notes && (
          <div>
            <span className="text-xs text-muted-foreground block">Notes</span>
            <span className="font-medium text-xs italic">{details.notes}</span>
          </div>
        )}
        <div>
          <span className="text-xs text-muted-foreground block">Contact</span>
          <span className="font-medium flex items-center gap-1">
            <User size={12} /> {details.full_name || "-"}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export default function HistoryTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Initialize Midtrans Snap Script
  useMidtransSnap(); 

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersResponse = await api.get("/my-orders");
      setOrders(ordersResponse.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load your purchase history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handlePayment = async (order: Order, paymentOption: "down_payment" | "full_payment") => {
    if (isPaying) return;
    setIsPaying(true);

    if (!window.snap) {
      toast.error("Payment gateway is loading. Please try again in a moment.");
      setIsPaying(false);
      return;
    }

    try {
      const response = await api.post(`/payment/create-transaction`, {
        order_id: order.id,
        payment_option: paymentOption,
      });

      const { snap_token } = response.data;
      if (!snap_token) throw new Error("No payment token received");

      window.snap.pay(snap_token, {
        onSuccess: () => {
          toast.success("Payment successful!");
          fetchData();
          setIsPaying(false);
        },
        onPending: () => {
          toast.info("Waiting for payment...");
          setIsPaying(false);
        },
        onError: () => {
          toast.error("Payment failed.");
          setIsPaying(false);
        },
        onClose: () => setIsPaying(false),
      });
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message || "Payment initiation failed.");
      setIsPaying(false);
    }
  };

  if (loading) return (
      <div className="flex justify-center py-12">
          <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
              <span className="text-muted-foreground text-sm">Loading history...</span>
          </div>
      </div>
  );
  
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-2xl font-bold">Purchase History</h2>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
          <Wallet size={48} className="mb-4 opacity-20" />
          <p className="font-medium">No orders found.</p>
          <p className="text-sm">Your transaction history will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const { booking } = order;
            const bookable = booking?.bookable;
            const bookableType = booking?.bookable_type || "";
            
            // --- GABUNGKAN 3 SUMBER DATA (Booking, Bookable, Details) ---
            const details: BookingDetails = { 
                ...(booking || {}),          // Data Induk (Root)
                ...(bookable || {}),         // Data Produk
                ...(booking?.details || {})  // Data Detail
            };
            
            // Determine Service Name display
            const serviceName = details.service_name || 
                                bookable?.name || 
                                (bookable?.brand ? `${bookable.brand} ${bookable.car_model}` : null) ||
                                "Service Details";

            const isExpanded = expandedOrderId === order.id;

            return (
              <div key={order.id} className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-md">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <ServiceTypeBadge type={bookableType} />
                    <h3 className="font-bold text-lg leading-tight">Order #{order.order_number}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                       Ordered on {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className={getStatusChip(order.status)}>
                    {order.status.replace("_", " ")}
                  </span>
                </div>

                {/* Content */}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-sm">{serviceName}</span>
                      <button
                        onClick={() => toggleDetails(order.id)}
                        className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
                      >
                        {isExpanded ? "Less Details" : "More Details"}
                        {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      </button>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="bg-muted/40 rounded-lg p-4 mb-4 border border-border/50">
                        {bookableType.includes("CarRental") && <CarRentalDetails details={details} />}
                        {bookableType.includes("TripPlanner") && <TripPlannerDetails details={details} />}
                        {bookableType.includes("HolidayPackage") && <HolidayPackageDetails details={details} />}
                        {bookableType.includes("Activity") && <ActivityDetails details={details} />}
                        {bookableType.includes("OpenTrip") && <OpenTripDetails details={details} />}
                        {bookableType.includes("Service") && <ServiceDetails details={details} />}
                        
                        {/* Fallback for others */}
                        {!bookableType.includes("CarRental") && 
                         !bookableType.includes("TripPlanner") && 
                         !bookableType.includes("HolidayPackage") && 
                         !bookableType.includes("Activity") && 
                         !bookableType.includes("OpenTrip") &&
                         !bookableType.includes("Service") && (
                             <div className="text-sm text-muted-foreground italic">
                                  Specific details for this service type are not yet supported in this view.
                             </div>
                        )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-border gap-4 sm:gap-0">
                      <div className="text-left w-full sm:w-auto">
                          <p className="text-xs text-muted-foreground">Total Amount</p>
                          <p className="font-bold text-lg text-primary">{formatCurrency(order.total_amount)}</p>
                      </div>
                      
                      <div className="w-full sm:w-auto">
                        <OrderPaymentActions
                            order={order}
                            onPay={handlePayment}
                            isPaying={isPaying}
                        />
                      </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}