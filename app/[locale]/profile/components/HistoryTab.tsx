"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Order } from "../types";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
  getStatusChip,
} from "@/lib/utils";
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
  MessageSquare,
  Flag,
  Car,
  Clock,
  Calendar,
  Wallet,
  Compass,
  Briefcase,
  Building2,
  Users,
} from "lucide-react";

// --- 1. Detail untuk Car Rental ---
const CarRentalDetails = ({ details }: { details: any }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
      <div className="col-span-full font-semibold text-primary border-b border-border pb-1 mb-1 flex items-center gap-2">
        <Car size={16} /> Rental Information
      </div>
      
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

      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">Contact Phone</span>
        <span className="font-medium flex items-center gap-1">
          <Phone size={12} /> {details.phone_number || "-"}
        </span>
      </div>
    </div>
  );
};

// --- 2. Detail untuk Trip Planner (FIXED & MATCHING PLANNER FORM) ---
const TripPlannerDetails = ({ details }: { details: any }) => {
  // Debugging: Cek console browser (F12) untuk melihat data asli
  console.log("Trip Details Received:", details);

  // Helper Kuat: Mencari data berdasarkan variasi nama key
  // Prioritas: snake_case (dari DB/Laravel) -> camelCase (Fallback)
  const get = (...keys: string[]) => {
    if (!details) return null;
    for (const k of keys) {
      if (details[k] !== undefined && details[k] !== null && details[k] !== "") {
        return details[k];
      }
    }
    return null;
  };

  const safeInt = (...keys: string[]) => {
    const val = get(...keys);
    const parsed = parseInt(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // --- A. Mapping Data Kontak ---
  // PlannerForm mengirim: 'type', 'full_name', 'company_name', 'email', 'phone'
  const type = get('type') || 'personal'; 
  const email = get('email');
  const phone = get('phone', 'phone_number', 'whatsapp'); 
  
  let contactName = "-";
  let brandName = null;
  
  if (type === 'company') {
    contactName = get('company_name', 'companyName');
    brandName = get('brand_name', 'brandName');
  } else {
    contactName = get('full_name', 'fullName', 'name');
  }

  // --- B. Mapping Data Peserta ---
  // PlannerForm mengirim: 'pax_adults', 'pax_teens', dst
  const adults = safeInt('pax_adults', 'paxAdults');
  const teens = safeInt('pax_teens', 'paxTeens');
  const kids = safeInt('pax_kids', 'paxKids');
  const seniors = safeInt('pax_seniors', 'paxSeniors');
  const totalPax = adults + teens + kids + seniors;

  // --- C. Mapping Lokasi ---
  // PlannerForm mengirim: 'trip_type', 'city', 'province', 'country'
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

  // --- D. Mapping Waktu & Detail ---
  // PlannerForm mengirim: 'travel_type', 'departure_date', 'duration', 'budget_pack'
  const travelType = get('travel_type', 'travelType') || "-";
  const departureDate = get('departure_date', 'departureDate', 'start_date') || "-";
  const duration = get('duration', 'days');
  const budgetPack = get('budget_pack', 'budgetPack') || "-";
  
  // --- E. Tambahan ---
  const addons = get('addons');
  const mustVisit = get('must_visit', 'mustVisit');

  return (
    <div className="space-y-4 text-sm animate-fadeIn">
      <div className="font-semibold text-primary border-b border-border pb-1 flex items-center gap-2">
        <Compass size={16} /> Custom Trip Plan Details
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* KIRI: Destinasi & Waktu */}
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

        {/* KANAN: Tipe & Budget */}
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

      {/* SECTION KONTAK & PESERTA */}
      <div className="bg-muted/30 p-3 rounded-lg border border-border mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Kolom Kontak */}
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

          {/* Kolom Peserta */}
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

      {/* Tambahan (Add-ons & Notes) */}
      {( (addons && addons.length > 0) || mustVisit ) && (
        <div className="text-xs space-y-2 pt-2 border-t border-dashed border-border mt-2">
          {addons && addons.length > 0 && (
            <div>
              <span className="text-muted-foreground font-semibold">Add-ons: </span>
              <span>{Array.isArray(addons) ? addons.join(", ") : addons}</span>
            </div>
          )}
          {mustVisit && (
            <div>
              <span className="text-muted-foreground font-semibold">Must Visit: </span>
              <span className="italic">"{mustVisit}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- 3. Detail Umum (Activity & Package) ---
const GeneralBookingDetails = ({ details }: { details: any }) => {
  return (
    <div className="space-y-3 text-sm">
      {/* Section: Guest Info */}
      <div>
        <div className="font-semibold text-primary border-b border-border pb-1 mb-2 flex items-center gap-2">
          <User size={16} /> Guest Information
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Name</span>
            <span className="font-medium">{details.full_name || "-"}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Nationality</span>
            <span className="font-medium flex items-center gap-1">
              <Flag size={12} /> {details.participant_nationality || "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Contact</span>
            <span className="font-medium flex items-center gap-1">
              <Phone size={12} /> {details.phone_number || "-"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Email</span>
            <span className="font-medium flex items-center gap-1">
              <Mail size={12} /> {details.email || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Section: Logistics */}
      <div>
        <div className="font-semibold text-primary border-b border-border pb-1 mb-2 mt-3 flex items-center gap-2">
          <MapPin size={16} /> Logistics & Requests
        </div>
        <div className="space-y-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Pickup Location</span>
            <span className="font-medium">{details.pickup_location || "-"}</span>
          </div>
          
          {details.flight_number && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Flight Number</span>
              <span className="font-medium flex items-center gap-1">
                <Plane size={12} /> {details.flight_number}
              </span>
            </div>
          )}

          {details.special_request && (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Special Request</span>
              <span className="font-medium italic flex items-start gap-1">
                <MessageSquare size={12} className="mt-0.5" /> "{details.special_request}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pax Info */}
      <div className="text-right text-xs font-medium text-muted-foreground border-t border-dashed pt-2 mt-2">
        Total Participants: {(details.adults || 0) + (details.children || 0) + (details.quantity || 0)}
      </div>
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
        const bookable = booking?.bookable;
        const bookableType = booking?.bookable_type || "";
        
       
        const details = booking?.details || {}; 

        const serviceName =
          bookable?.name || // Activity / Package Name
          (bookable?.brand ? `${bookable.brand} ${bookable.car_model}` : null) || // Car Name
          (bookableType.includes("TripPlanner") ? "Custom Trip Plan" : "Service Details Unavailable");

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;
        const isExpanded = expandedOrderId === order.id;

        return (
          <div
            key={order.id}
            className="bg-card border border-border rounded-lg p-4 transition-all hover:shadow-md"
          >
            {/* --- Header Section --- */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-lg">Order #{order.order_number}</p>
                <p className="text-sm text-foreground/60">
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
                  {/* SWITCH CASE LOGIC BERDASARKAN TIPE LAYANAN */}
                  {bookableType.includes("CarRental") ? (
                    <CarRentalDetails details={details} />
                  ) : bookableType.includes("TripPlanner") ? (
                    <TripPlannerDetails details={details} />
                  ) : (
                    // Default untuk Activity & HolidayPackage
                    <GeneralBookingDetails details={details} />
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