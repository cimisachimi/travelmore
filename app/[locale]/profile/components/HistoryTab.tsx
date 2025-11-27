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
  Mail,
  User,
  Plane,
  Flag,
  Car,
  Clock,
  Calendar,
  Wallet,
  Compass,
  Building2,
  Users,
  Luggage,
  Baby,
  Ticket, 
  FileText
} from "lucide-react";

// --- TYPES ---
// Defined locally to ensure type safety regardless of global types.ts state
interface BookingDetails {
  brand?: string;
  car_model?: string;
  plate_number?: string;
  total_days?: number;
  pickup_location?: string;
  pickup_time?: string;
  phone_number?: string;
  phone?: string;
  email?: string;
  type?: string;
  company_name?: string;
  companyName?: string;
  brand_name?: string;
  brandName?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  pax_adults?: string | number;
  paxAdults?: string | number;
  pax_teens?: string | number;
  paxTeens?: string | number;
  pax_kids?: string | number;
  paxKids?: string | number;
  pax_seniors?: string | number;
  paxSeniors?: string | number;
  trip_type?: string;
  tripType?: string;
  city?: string;
  province?: string;
  country?: string;
  travel_type?: string;
  travelType?: string;
  departure_date?: string;
  departureDate?: string;
  start_date?: string;
  duration?: string | number;
  days?: string | number;
  budget_pack?: string;
  budgetPack?: string;
  addons?: string[] | string;
  must_visit?: string;
  mustVisit?: string;
  adults?: number;
  children?: number;
  participant_nationality?: string;
  total_pax?: number;
  flight_number?: string;
  special_request?: string;
  quantity?: number;
  service_name?: string;
  [key: string]: unknown;
}

// --- HELPER: SERVICE TYPE BADGE ---
const ServiceTypeBadge = ({ type }: { type: string }) => {
  let config = { 
    label: "Service", 
    color: "bg-gray-100 text-gray-700 border-gray-200", 
    icon: FileText 
  };

  if (type.includes("CarRental")) {
    config = { 
      label: "Car Rental", 
      color: "bg-blue-50 text-blue-700 border-blue-200", 
      icon: Car 
    };
  } else if (type.includes("TripPlanner")) {
    config = { 
      label: "Trip Planner", 
      color: "bg-purple-50 text-purple-700 border-purple-200", 
      icon: Compass 
    };
  } else if (type.includes("HolidayPackage")) {
    config = { 
      label: "Holiday Package", 
      color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      icon: Luggage 
    };
  } else if (type.includes("Activity")) {
    config = { 
      label: "Activity", 
      color: "bg-orange-50 text-orange-700 border-orange-200", 
      icon: Ticket 
    };
  }

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} mb-1 w-fit`}>
      <Icon size={12} /> {config.label}
    </span>
  );
};

// --- 1. Detail untuk Car Rental ---
const CarRentalDetails = ({ details }: { details: BookingDetails }) => {
  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Car size={16} /> Car Rental Details
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Car Info */}
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Vehicle</span>
            <span className="font-medium text-base">
              {details.brand} {details.car_model}
            </span>
            {details.plate_number && (
               <span className="text-xs text-muted-foreground">{details.plate_number}</span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Duration</span>
            <span className="font-medium flex items-center gap-1">
              <Clock size={12} /> {details.total_days} Day(s)
            </span>
          </div>
        </div>

        {/* Pickup Info */}
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pickup Location</span>
            <span className="font-medium flex items-center gap-1">
              <MapPin size={12} /> {details.pickup_location || "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pickup Time</span>
            <span className="font-medium flex items-center gap-1">
              <Clock size={12} /> {details.pickup_time || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-muted/30 p-3 rounded-lg border border-border mt-2">
         <span className="text-xs text-muted-foreground block mb-1 font-semibold">Contact Driver / Renter</span>
         <div className="flex items-center gap-2 text-xs">
            <Phone size={12} /> {details.phone_number || "-"}
         </div>
      </div>
    </div>
  );
};

// --- 2. Detail untuk Trip Planner ---
const TripPlannerDetails = ({ details }: { details: BookingDetails }) => {
  const get = (...keys: string[]) => {
    if (!details) return null;
    for (const k of keys) {
      if (details[k] !== undefined && details[k] !== null && details[k] !== "") {
        return details[k] as string;
      }
    }
    return null;
  };

  const safeInt = (...keys: string[]) => {
    const val = get(...keys);
    const parsed = parseInt(val || "0");
    return isNaN(parsed) ? 0 : parsed;
  };

  const type = get('type') || 'personal'; 
  const email = get('email');
  const phone = get('phone', 'phone_number', 'whatsapp'); 
  
  let contactName = "-";
  let brandName = null;
  
  if (type === 'company') {
    contactName = get('company_name', 'companyName') || "-";
    brandName = get('brand_name', 'brandName');
  } else {
    contactName = get('full_name', 'fullName', 'name') || "-";
  }

  const adults = safeInt('pax_adults', 'paxAdults');
  const teens = safeInt('pax_teens', 'paxTeens');
  const kids = safeInt('pax_kids', 'paxKids');
  const seniors = safeInt('pax_seniors', 'paxSeniors');
  const totalPax = adults + teens + kids + seniors;

  const tripType = get('trip_type', 'tripType'); 
  const city = get('city');
  const province = get('province');
  const country = get('country');

  let locationDisplay = "-";
  if (city) {
    if (tripType === "domestic") {
      locationDisplay = `🇮🇩 ${city}${province ? `, ${province}` : ''}`;
    } else if (tripType === "foreign") {
      locationDisplay = `🌐 ${city}${country ? `, ${country}` : ''}`;
    } else {
      locationDisplay = city;
    }
  }

  const travelType = get('travel_type', 'travelType') || "-";
  const departureDate = get('departure_date', 'departureDate', 'start_date') || "-";
  const duration = get('duration', 'days');
  const budgetPack = get('budget_pack', 'budgetPack') || "-";
  
  const addons = details.addons;
  const mustVisit = get('must_visit', 'mustVisit');

  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Compass size={16} /> Custom Trip Plan Details
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Destination</span>
            <span className="font-medium text-base capitalize">{locationDisplay}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Date & Duration</span>
            <span className="font-medium flex items-center gap-1">
              <Calendar size={14} /> {departureDate}
              {duration && duration !== "-" && <span className="text-muted-foreground text-xs ml-1">({duration})</span>}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Travel Type</span>
            <span className="font-medium capitalize flex items-center gap-1">
              <Plane size={14} /> {travelType.replace(/_/g, " ")}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Budget Pack</span>
            <span className="font-medium capitalize flex items-center gap-1">
              <Wallet size={14} /> {budgetPack.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-muted/30 p-3 rounded-lg border border-border mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground block mb-1 font-semibold flex items-center gap-1">
              {type === 'company' ? <Building2 size={12}/> : <User size={12}/>}
              Contact Person ({type})
            </span>
            <div className="font-medium text-sm truncate" title={contactName}>
              {contactName}
            </div>
            {type === 'company' && brandName && (
               <div className="text-xs text-muted-foreground italic">Brand: {brandName}</div>
            )}
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <div className="flex items-center gap-1"><Mail size={10}/> {email || '-'}</div>
              <div className="flex items-center gap-1"><Phone size={10}/> {phone || '-'}</div>
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground block mb-1 font-semibold flex items-center gap-1">
              <Users size={12}/> Participants ({totalPax})
            </span>
            {totalPax > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs mt-1">
                {adults > 0 && <span className="bg-background px-2 py-1 rounded border border-border">Adults: {adults}</span>}
                {teens > 0 && <span className="bg-background px-2 py-1 rounded border border-border">Teens: {teens}</span>}
                {kids > 0 && <span className="bg-background px-2 py-1 rounded border border-border">Kids: {kids}</span>}
                {seniors > 0 && <span className="bg-background px-2 py-1 rounded border border-border">Seniors: {seniors}</span>}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">No participant details found</span>
            )}
          </div>
        </div>
      </div>

      {( (Array.isArray(addons) && addons.length > 0) || mustVisit ) && (
        <div className="text-xs space-y-2 pt-2 border-t border-dashed border-border mt-2">
          {Array.isArray(addons) && addons.length > 0 && (
            <div>
              <span className="text-muted-foreground font-semibold">Add-ons: </span>
              <span>{addons.join(", ")}</span>
            </div>
          )}
          {mustVisit && (
            <div>
              <span className="text-muted-foreground font-semibold">Must Visit: </span>
              <span className="italic">&quot;{mustVisit}&quot;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 3. Detail untuk Holiday Package ---
const HolidayPackageDetails = ({ details }: { details: BookingDetails }) => {
  const adults = details.adults || 0;
  const children = details.children || 0;
  const totalPax = details.total_pax || (adults + children);

  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Luggage size={16} /> Holiday Package Details
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kolom Kiri: Tamu & Peserta */}
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Lead Guest</span>
            <span className="font-medium">{details.full_name || "-"}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Flag size={10} /> {details.participant_nationality || "-"}
            </span>
          </div>

          <div className="flex flex-col">
             <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Users size={12}/> Participants ({totalPax})
             </span>
             <div className="flex gap-2">
                <span className="bg-background px-2 py-1 rounded border border-border text-xs">
                  Adults: {adults}
                </span>
                {children > 0 && (
                  <span className="bg-background px-2 py-1 rounded border border-border text-xs flex items-center gap-1">
                    <Baby size={12}/> Children: {children}
                  </span>
                )}
             </div>
          </div>
        </div>

        {/* Kolom Kanan: Logistik */}
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pickup Location</span>
            <span className="font-medium flex items-center gap-1">
              <MapPin size={12} /> {details.pickup_location || "-"}
            </span>
          </div>

          {details.flight_number && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Flight Information</span>
              <span className="font-medium flex items-center gap-1">
                <Plane size={12} /> {details.flight_number}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Kontak & Request */}
      <div className="bg-muted/30 p-3 rounded-lg border border-border mt-2 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
             <Mail size={12} className="text-muted-foreground"/> {details.email}
          </div>
          <div className="flex items-center gap-2">
             <Phone size={12} className="text-muted-foreground"/> {details.phone_number}
          </div>
        </div>

        {details.special_request && (
          <div className="pt-2 border-t border-dashed border-border">
             <span className="text-xs text-muted-foreground block mb-0.5">Special Request:</span>
             <span className="text-sm italic">&quot;{details.special_request}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 4. Detail untuk Activity ---
const ActivityDetails = ({ details }: { details: BookingDetails }) => {
  const quantity = details.quantity || 1;

  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Ticket size={16} /> Activity Details
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kolom Kiri: Tamu & Quantity */}
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Lead Guest</span>
            <span className="font-medium">{details.full_name || "-"}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Flag size={10} /> {details.participant_nationality || "-"}
            </span>
          </div>

          <div className="flex flex-col">
             <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Users size={12}/> Tickets / Pax
             </span>
             <span className="bg-background w-fit px-2 py-1 rounded border border-border text-xs font-medium">
                Quantity: {quantity}
             </span>
          </div>
        </div>

        {/* Kolom Kanan: Logistik */}
        <div className="space-y-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pickup Location</span>
            <span className="font-medium flex items-center gap-1">
              <MapPin size={12} /> {details.pickup_location || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Kontak & Request */}
      <div className="bg-muted/30 p-3 rounded-lg border border-border mt-2 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
             <Mail size={12} className="text-muted-foreground"/> {details.email}
          </div>
          <div className="flex items-center gap-2">
             <Phone size={12} className="text-muted-foreground"/> {details.phone_number}
          </div>
        </div>

        {details.special_request && (
          <div className="pt-2 border-t border-dashed border-border">
             <span className="text-xs text-muted-foreground block mb-0.5">Special Request:</span>
             <span className="text-sm italic">&quot;{details.special_request}&quot;</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Fallback Component ---
const GeneralBookingDetails = () => {
  return (
    <div className="text-sm text-muted-foreground italic">
      No additional details available for this service.
    </div>
  );
};


// --- MAIN COMPONENT ---

export default function HistoryTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  useMidtransSnap(); 

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersResponse = await api.get("/my-orders");
      setOrders(ordersResponse.data);
    } catch (err) {
      setError("Failed to fetch history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleDetails = (orderId: number) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handlePayment = async (
    order: Order,
    paymentOption: "down_payment" | "full_payment"
  ) => {
    if (isPaying) return;
    setIsPaying(true);

    if (!window.snap) {
      toast.error("Payment service is not loaded. Please refresh.");
      setIsPaying(false);
      return;
    }

    try {
      const response = await api.post(`/payment/create-transaction`, {
        order_id: order.id,
        payment_option: paymentOption,
      });

      const { snap_token } = response.data;

      if (!snap_token) {
        toast.error("Could not get payment token.");
        setIsPaying(false);
        return;
      }

      let paymentInProgress = true;

      window.snap.pay(snap_token, {
        onSuccess: () => {
          paymentInProgress = false;
          toast.success("Payment successful!");
          fetchData();
          setIsPaying(false);
        },
        onPending: () => {
          paymentInProgress = false;
          toast.info("Waiting for your payment.");
          setIsPaying(false);
        },
        onError: () => {
          paymentInProgress = false;
          toast.error("Payment failed. Please try again.");
          setIsPaying(false);
        },
        onClose: () => {
          setIsPaying(false);
          if (paymentInProgress) {
            toast.info("Payment popup closed.");
          }
        },
      });
    } catch (err: unknown) {
      console.error("Payment initiation error:", err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const message =
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        "Could not initiate payment.";
      toast.error(message);
      setIsPaying(false);
    }
  };

  const renderOrderList = () =>
    !orders || orders.length === 0 ? (
      <p>You have no orders yet.</p>
    ) : (
      orders.map((order) => {
        const { booking } = order;
        // ✅ FIX: Correct initialization of bookable. 
        // DO NOT use || {} because empty object has no properties (causes TypeScript error)
        const bookable = booking?.bookable; 
        const bookableType = booking?.bookable_type || "";
        
        const snapshotDetails = booking?.details || {};
        
        // ✅ FIX: Handle null bookable when merging
        // If bookable is null/undefined, fallback to {} for the merge
        const combinedDetails: BookingDetails = { ...(bookable || {}), ...snapshotDetails };

        // Determine Service Name
        const serviceName =
          combinedDetails.service_name || 
          bookable?.name || // Now safe because bookable is Bookable | undefined
          (bookable?.brand ? `${bookable.brand} ${bookable.car_model}` : null) || 
          (bookableType.includes("TripPlanner") ? "Custom Trip Plan" : "Service Details Unavailable");

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;
        const isExpanded = expandedOrderId === order.id;

        return (
          <div
            key={order.id}
            className="bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md mb-4"
          >
            {/* --- Header Section (UPDATED WITH BADGE) --- */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col gap-1">
                {/* ✅ VISUAL TAG HERE */}
                <ServiceTypeBadge type={bookableType} />
                
                <div className="flex items-center gap-2">
                   <p className="font-bold text-lg">Order #{order.order_number}</p>
                </div>
                <p className="text-xs text-foreground/60">
                  Ordered on {formatDate(order.created_at)}
                </p>
              </div>
              <span className={getStatusChip(order.status)}>
                {order.status.replace("_", " ")}
              </span>
            </div>

            {/* --- Main Info --- */}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-semibold text-base">{serviceName}</span>
                <span className="text-foreground/60 text-right">
                  {startDate
                    ? `${formatDate(startDate)} ${endDate && endDate !== startDate ? `- ${formatDate(endDate)}` : ""}`
                    : "Date: See Details"}
                </span>
              </div>

              {/* --- Toggle Detail Button --- */}
              <button
                onClick={() => toggleDetails(order.id)}
                className="flex items-center text-sm text-primary font-medium hover:underline mb-3 focus:outline-none"
              >
                {isExpanded ? "Hide Details" : "View Details"}
                {isExpanded ? (
                  <ChevronUp size={16} className="ml-1" />
                ) : (
                  <ChevronDown size={16} className="ml-1" />
                )}
              </button>

              {/* --- DYNAMIC DETAIL RENDERING --- */}
              {isExpanded && (
                <div className="bg-muted/30 rounded-md p-4 mb-4 border border-border animate-fadeIn">
                  {bookableType.includes("CarRental") ? (
                    <CarRentalDetails details={combinedDetails} />
                  ) : bookableType.includes("TripPlanner") ? (
                    <TripPlannerDetails details={combinedDetails} />
                  ) : bookableType.includes("HolidayPackage") ? (
                    <HolidayPackageDetails details={combinedDetails} />
                  ) : bookableType.includes("Activity") ? (
                    <ActivityDetails details={combinedDetails} />
                  ) : (
                    <GeneralBookingDetails />
                  )}
                </div>
              )}

              {/* Total Amount & Actions */}
              <div className="flex justify-between items-center font-bold text-lg pt-3 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>

              <OrderPaymentActions
                order={order}
                onPay={handlePayment}
                isPaying={isPaying}
              />
            </div>
          </div>
        );
      })
    );

  if (loading) return <p>Loading your history...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Bookings</h2>
      </div>
      <div className="space-y-4">{renderOrderList()}</div>
    </div>
  );
}