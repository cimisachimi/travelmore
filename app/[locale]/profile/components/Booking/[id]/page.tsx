"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  CreditCard, 
  FileText, 
  User, 
  MapPin, 
  Clock, 
  Plane, 
  Wallet,
  Compass,
  Users,
  Phone,
  Mail,
  Building2,
  Car,
  Luggage,
  Ticket,
  Baby,
  Flag,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

// --- TYPES ---

interface BookingDetails {
  [key: string]: unknown; // Allow index access for flexible property retrieval
  service_name?: string;
  brand?: string;
  car_model?: string;
  pickup_location?: string;
  pickup_time?: string;
  phone_number?: string;
  phone?: string;
  email?: string;
  full_name?: string;
  fullName?: string;
  quantity?: number;
  total_days?: number;
  plate_number?: string;
  flight_number?: string;
  participant_nationality?: string;
  special_request?: string;
  adults?: number;
  children?: number;
  total_pax?: number;
  
  // Trip Planner Specific
  type?: string;
  companyName?: string;
  company_name?: string;
  paxAdults?: string | number;
  pax_adults?: string | number;
  paxKids?: string | number;
  pax_kids?: string | number;
  paxTeens?: string | number;
  pax_teens?: string | number;
  paxSeniors?: string | number;
  pax_seniors?: string | number;
  city?: string;
  province?: string;
  country?: string;
  tripType?: string;
  trip_type?: string;
  travelType?: string;
  travel_type?: string;
  departureDate?: string;
  departure_date?: string;
  duration?: string | number;
  budgetPack?: string;
  budget_pack?: string;
}

interface Bookable {
  [key: string]: unknown;
  name?: string;
  brand?: string;
  car_model?: string;
  transmission?: string;
  fuel_type?: string;
}

interface Booking {
  id: number;
  bookable_type: string;
  details: BookingDetails;
  bookable: Bookable;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  down_payment_amount: number;
  payment_deadline: string;
  total_amount: string | number;
  booking?: Booking;
  // Properties for flat structure fallback
  details?: BookingDetails; 
  bookable?: Bookable; 
  bookable_type?: string; 
}

// --- HELPER: SERVICE TYPE BADGE ---
const ServiceTypeBadge = ({ type }: { type: string }) => {
  let config = { 
    label: "Service", 
    color: "bg-gray-100 text-gray-700 border-gray-200", 
    icon: FileText 
  };

  if (type?.includes("CarRental")) {
    config = { 
      label: "Car Rental", 
      color: "bg-blue-50 text-blue-700 border-blue-200", 
      icon: Car 
    };
  } else if (type?.includes("TripPlanner")) {
    config = { 
      label: "Trip Planner", 
      color: "bg-purple-50 text-purple-700 border-purple-200", 
      icon: Compass 
    };
  } else if (type?.includes("HolidayPackage")) {
    config = { 
      label: "Holiday Package", 
      color: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      icon: Luggage 
    };
  } else if (type?.includes("Activity")) {
    config = { 
      label: "Activity", 
      color: "bg-orange-50 text-orange-700 border-orange-200", 
      icon: Ticket 
    };
  }

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color} w-fit shadow-sm`}>
      <Icon size={12} /> {config.label}
    </span>
  );
};

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [booking, setBooking] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchDetail = async () => {
      setLoading(true);
      try {
        try {
           const response = await api.get(`/my-orders/${id}`); 
           setBooking(response.data);
        } catch {
           // Fallback: Fetch all and find
           const response = await api.get("/my-orders");
           const allOrders = response.data;
           const foundOrder = allOrders.find((o: Order) => String(o.id) === String(id) || String(o.booking?.id) === String(id));
           
           if (foundOrder) {
             setBooking(foundOrder);
           } else {
             throw new Error("Order not found");
           }
        }
      } catch (error) {
        console.error("Failed to fetch booking detail", error);
        toast.error("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleDownloadInvoice = async () => {
    if (!booking) return;
    setDownloading(true);
    try {
      const response = await api.get(`/bookings/${booking.booking?.id || booking.id}/invoice`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${booking.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download invoice.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading booking details...</div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-red-500">Booking not found.</div>;

  // --- Helper Data Parser ---
  const actualBooking = booking.booking || booking; 
  const details: BookingDetails = actualBooking.details || {};
  const bookable: Bookable = actualBooking.bookable || {};
  const bookableType = actualBooking.bookable_type || "";
  
  const serviceName = 
    details.service_name || 
    bookable.name || 
    (bookable.brand ? `${bookable.brand} ${bookable.car_model}` : null) ||
    (bookableType?.includes("TripPlanner") ? "Custom Trip Plan" : "Service");

  const getVal = (key: string, ...alts: string[]) => {
    const keys = [key, ...alts];
    for (const k of keys) {
        if (details[k] !== undefined && details[k] !== null && details[k] !== "") {
            return details[k] as string;
        }
        const snakeKey = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        if (details[snakeKey] !== undefined && details[snakeKey] !== null) {
            return details[snakeKey] as string;
        }
    }
    return null;
  };
  
  // --- RENDERERS ---

  const renderTripPlanner = () => {
      const type = getVal('type') || 'personal';
      const contactName = type === 'company' ? getVal('companyName', 'company_name') : getVal('fullName', 'full_name');
      const adults = parseInt((getVal('paxAdults', 'pax_adults') || "0") as string);
      const totalPax = adults 
        + parseInt((getVal('paxKids', 'pax_kids') || "0") as string)
        + parseInt((getVal('paxTeens', 'pax_teens') || "0") as string) 
        + parseInt((getVal('paxSeniors', 'pax_seniors') || "0") as string);
      
      const city = getVal('city');
      const tripType = getVal('tripType', 'trip_type');
      let location = city;
      if (tripType === 'domestic') location = `🇮🇩 ${city}, ${getVal('province')}`;
      if (tripType === 'foreign') location = `🌐 ${city}, ${getVal('country')}`;

      return (
        <div className="bg-muted/20 rounded-lg p-5 space-y-4 text-sm border border-border/50">
          <div className="grid md:grid-cols-2 gap-6">
             <div>
                <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Trip Overview</span>
                <div className="space-y-2">
                    <div className="font-medium flex items-center gap-2"><Compass size={14} className="text-primary"/> {location || '-'}</div>
                    <div className="font-medium flex items-center gap-2"><Plane size={14} className="text-primary"/> {(getVal('travelType', 'travel_type') || '-').replace(/_/g, ' ')}</div>
                    <div className="font-medium flex items-center gap-2"><Calendar size={14} className="text-primary"/> {getVal('departureDate', 'departure_date') || '-'} ({getVal('duration') || '-'})</div>
                    <div className="font-medium flex items-center gap-2"><Wallet size={14} className="text-primary"/> {(getVal('budgetPack', 'budget_pack') || '-').toUpperCase()}</div>
                </div>
             </div>
             
             <div>
                <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Organizer</span>
                <div className="space-y-2">
                    <div className="font-medium flex items-center gap-2">
                        {type === 'company' ? <Building2 size={14} className="text-primary"/> : <User size={14} className="text-primary"/>} 
                        {contactName || '-'}
                    </div>
                    <div className="text-sm text-muted-foreground flex flex-col gap-1 pl-6">
                        <span>{getVal('email')}</span>
                        <span>{getVal('phone', 'phone_number')}</span>
                    </div>
                </div>
                
                <div className="mt-4">
                     <div className="font-medium flex items-center gap-2"><Users size={14} className="text-primary"/> {totalPax} Participants</div>
                </div>
             </div>
          </div>
        </div>
      );
  };

  const renderCarRental = () => {
    return (
        <div className="bg-muted/20 rounded-lg p-5 text-sm border border-border/50">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Vehicle Info */}
                <div>
                    <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Vehicle Information</span>
                    <div className="space-y-3">
                         <div className="flex items-start gap-3">
                            <Car size={16} className="text-primary mt-0.5" />
                            <div>
                                <p className="font-semibold text-base">{bookable.brand} {bookable.car_model}</p>
                                <p className="text-xs text-muted-foreground">{bookable.transmission} • {bookable.fuel_type}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-2 pl-7">
                            <Clock size={14} className="text-muted-foreground"/>
                            <span>Duration: {details.total_days || 1} Day(s)</span>
                         </div>
                    </div>
                </div>

                {/* Pickup & Contact */}
                <div>
                     <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Pickup & Contact</span>
                     <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground">Location</span>
                            <div className="font-medium flex items-center gap-2">
                                <MapPin size={14} className="text-primary"/> {details.pickup_location || '-'}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                             <span className="text-xs text-muted-foreground">Time</span>
                             <div className="font-medium flex items-center gap-2">
                                <Clock size={14} className="text-primary"/> {details.pickup_time || '-'}
                             </div>
                        </div>
                        <div className="flex flex-col gap-1">
                             <span className="text-xs text-muted-foreground">Driver/Renter Contact</span>
                             <div className="font-medium flex items-center gap-2">
                                <Phone size={14} className="text-primary"/> {details.phone_number || '-'}
                             </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
  };

  const renderHolidayPackage = () => {
      const adults = details.adults || 0;
      const children = details.children || 0;
      const totalPax = details.total_pax || (adults + children);

      return (
        <div className="bg-muted/20 rounded-lg p-5 text-sm border border-border/50">
             <div className="grid md:grid-cols-2 gap-6">
                {/* Guest Info */}
                <div>
                     <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Guest Information</span>
                     <div className="space-y-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Lead Guest</span>
                            <span className="font-medium text-base">{details.full_name}</span>
                            <span className="text-xs flex items-center gap-1 text-muted-foreground"><Flag size={10}/> {details.participant_nationality}</span>
                        </div>
                        
                        <div>
                             <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                                <Users size={12}/> Participants ({totalPax})
                             </span>
                             <div className="flex gap-2">
                                <span className="bg-background px-2 py-1 rounded border border-border text-xs font-medium">Adults: {adults}</span>
                                {children > 0 && (
                                    <span className="bg-background px-2 py-1 rounded border border-border text-xs font-medium flex items-center gap-1">
                                        <Baby size={12}/> Children: {children}
                                    </span>
                                )}
                             </div>
                        </div>

                        <div className="text-xs text-muted-foreground space-y-1">
                             <div className="flex items-center gap-2"><Mail size={12}/> {details.email}</div>
                             <div className="flex items-center gap-2"><Phone size={12}/> {details.phone_number}</div>
                        </div>
                     </div>
                </div>

                {/* Logistics */}
                <div>
                     <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Travel Logistics</span>
                     <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                             <span className="text-xs text-muted-foreground">Pickup Location</span>
                             <div className="font-medium flex items-center gap-2">
                                <MapPin size={14} className="text-primary"/> {details.pickup_location || '-'}
                             </div>
                        </div>
                        {details.flight_number && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground">Flight Number</span>
                                <div className="font-medium flex items-center gap-2">
                                    <Plane size={14} className="text-primary"/> {details.flight_number}
                                </div>
                            </div>
                        )}
                        {details.special_request && (
                            <div className="bg-background p-3 rounded border border-dashed border-border mt-2">
                                <span className="text-xs text-muted-foreground block mb-1">Special Request</span>
                                <p className="italic text-foreground flex gap-2">
                                    <MessageSquare size={14} className="mt-0.5 shrink-0"/> &quot;{details.special_request}&quot;
                                </p>
                            </div>
                        )}
                     </div>
                </div>
             </div>
        </div>
      );
  };

  const renderActivity = () => {
    return (
        <div className="bg-muted/20 rounded-lg p-5 text-sm border border-border/50">
             <div className="grid md:grid-cols-2 gap-6">
                <div>
                     <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Activity Info</span>
                     <div className="space-y-3">
                         <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Guest Name</span>
                            <span className="font-medium text-base">{details.full_name}</span>
                        </div>
                        <div className="flex flex-col">
                             <span className="text-xs text-muted-foreground">Tickets / Quantity</span>
                             <div className="font-medium flex items-center gap-2 mt-1">
                                <Ticket size={16} className="text-primary"/> 
                                <span className="text-lg font-bold">{details.quantity || 1}</span> Pax
                             </div>
                        </div>
                     </div>
                </div>

                <div>
                     <span className="block text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-2">Logistics</span>
                     <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                             <span className="text-xs text-muted-foreground">Pickup Location</span>
                             <div className="font-medium flex items-center gap-2">
                                <MapPin size={14} className="text-primary"/> {details.pickup_location || '-'}
                             </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                             <div className="flex items-center gap-2"><Mail size={12}/> {details.email}</div>
                             <div className="flex items-center gap-2"><Phone size={12}/> {details.phone_number}</div>
                        </div>
                        {details.special_request && (
                            <div className="bg-background p-3 rounded border border-dashed border-border mt-2">
                                <span className="text-xs text-muted-foreground block mb-1">Special Request</span>
                                <p className="italic text-foreground">&quot;{details.special_request}&quot;</p>
                            </div>
                        )}
                     </div>
                </div>
             </div>
        </div>
    );
  };

  // --- MAIN RENDER SWITCH ---
  const renderSpecificDetails = () => {
      if (bookableType?.includes("TripPlanner")) return renderTripPlanner();
      if (bookableType?.includes("CarRental")) return renderCarRental();
      if (bookableType?.includes("HolidayPackage")) return renderHolidayPackage();
      if (bookableType?.includes("Activity")) return renderActivity();

      // Fallback
      return (
        <div className="bg-muted/20 rounded-lg p-5 text-center italic text-muted-foreground">
            No specific details available for this service type.
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        
        <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to History
        </button>

        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            
            {/* HEADER (Updated with Service Badge) */}
            <div className="bg-muted/30 p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5">
                    {/* ✅ VISUAL TAG ADDED HERE */}
                    <ServiceTypeBadge type={bookableType || "Unknown"} />
                    
                    <h1 className="text-2xl font-bold text-primary">{serviceName}</h1>
                    <p className="text-sm text-muted-foreground">Order ID: #{booking.order_number}</p>
                </div>
                <div className="flex gap-2">
                    <span className={getStatusChip(booking.status)}>{booking.status.replace(/_/g, " ")}</span>
                </div>
            </div>

            {/* BODY CONTENT */}
            <div className="p-6 space-y-8">
                
                {/* Section 1: Detailed Data (Rendered based on type) */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                         {bookableType?.includes("Holiday") ? <Luggage size={16}/> : 
                          bookableType?.includes("Car") ? <Car size={16}/> : 
                          bookableType?.includes("Activity") ? <Ticket size={16}/> : 
                          <FileText size={16} />} 
                         Service Details
                    </h3>
                    {renderSpecificDetails()}
                </div>

                <hr className="border-border/50" />

                {/* Section 2: Payment Summary */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard size={16} /> Payment Summary
                    </h3>
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-primary/5 p-4 rounded-lg border border-primary/10 gap-4 sm:gap-0">
                        <div className="w-full sm:w-auto">
                            <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-foreground capitalize">{booking.status}</span></p>
                            {booking.down_payment_amount > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">DP: {formatCurrency(booking.down_payment_amount)}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">Deadline: {booking.payment_deadline ? formatDate(booking.payment_deadline) : 'N/A'}</p>
                        </div>
                        <div className="text-right w-full sm:w-auto border-t sm:border-t-0 border-dashed border-primary/20 pt-3 sm:pt-0">
                            <span className="block text-xs text-muted-foreground">Total Amount</span>
                            <span className="text-xl font-bold text-primary">{formatCurrency(booking.total_amount)}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* FOOTER ACTIONS */}
            <div className="bg-muted/30 p-6 border-t border-border flex justify-end gap-3">
                <button 
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium text-sm"
                >
                    Close
                </button>
                <button 
                    onClick={handleDownloadInvoice}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all disabled:opacity-50 text-sm"
                >
                    {downloading ? "Downloading..." : "Download Invoice"} 
                    {!downloading && <Download size={16} />}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}