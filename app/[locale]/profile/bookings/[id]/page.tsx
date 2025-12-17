"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";
import { 
  ArrowLeft, Calendar, CreditCard, FileText, User, MapPin, Clock, Plane, Wallet,
  Compass, Users, Phone, Mail, Building2, Car, Luggage, Ticket, Map, MessageSquare,
  CheckCircle2, Hash, AlertCircle, HelpCircle, MessageCircle
} from "lucide-react";
import { toast } from "sonner";

// --- TYPES ---
interface BookingDetails {
  [key: string]: unknown;
  service_name?: string;
  brand?: string;
  car_model?: string;
  pickup_location?: string;
  pickup_time?: string;
  return_location?: string;
  return_time?: string;
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
  num_participants?: number;
  meeting_point?: string;
  type?: string;
  companyName?: string;
  paxAdults?: string | number;
  paxTeens?: string | number;
  paxKids?: string | number;
  paxSeniors?: string | number;
  city?: string;
  province?: string;
  country?: string;
  tripType?: string;
  travelType?: string;
  departureDate?: string;
  duration?: string | number;
  budgetPack?: string;
}

interface Bookable {
  name?: string;
  brand?: string;
  car_model?: string;
  transmission?: string;
  fuel_type?: string;
  seats?: number;
  luggage?: number;
  destination?: string;
  meeting_point?: string;
  [key: string]: unknown;
}

interface Booking {
  id: number;
  bookable_type: string;
  details: BookingDetails;
  bookable: Bookable;
  start_date: string | null;
  end_date: string | null;
  status: string;
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
  // Fallbacks
  details?: BookingDetails; 
  bookable?: Bookable; 
  bookable_type?: string; 
}

// --- HELPER COMPONENTS ---
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
      <div className="mt-0.5 text-primary/80 shrink-0 bg-primary/10 p-1.5 rounded-full">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm font-medium text-foreground break-words leading-snug">{value}</div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
    <div className="text-primary">{icon}</div>
    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{title}</h3>
  </div>
);

const ServiceTypeBadge = ({ type }: { type: string }) => {
  let config = { 
    label: "Service", 
    color: "bg-gray-100 text-gray-700 border-gray-200", 
    icon: FileText 
  };

  if (type?.includes("CarRental")) config = { label: "Car Rental", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Car };
  else if (type?.includes("TripPlanner")) config = { label: "Trip Planner", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Compass };
  else if (type?.includes("HolidayPackage")) config = { label: "Holiday Package", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Luggage };
  else if (type?.includes("Activity")) config = { label: "Activity", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Ticket };
  else if (type?.includes("OpenTrip")) config = { label: "Open Trip", color: "bg-teal-50 text-teal-700 border-teal-200", icon: Map };

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${config.color} w-fit shadow-sm`}>
      <Icon size={12} /> {config.label}
    </span>
  );
};

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id; // This is the BOOKING ID from the URL

  const [booking, setBooking] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCHING LOGIC ---
  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const response = await api.get("/my-orders");
        const allOrders = response.data;
        
        // Find order by matching inner booking ID
        const foundOrder = allOrders.find((o: Order) => 
           String(o.booking?.id) === String(id)
        );

        if (foundOrder) {
            setBooking(foundOrder);
        } else {
            throw new Error("Booking not found in your orders.");
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

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse">Loading details...</div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-red-500 flex-col gap-2"><AlertCircle size={32}/> Booking not found.</div>;

  // --- DATA NORMALIZATION ---
  const actualBooking = (booking.booking || booking) as unknown as Booking; 
  if (!actualBooking) return <div className="p-8 text-center">Booking data is incomplete.</div>;

  const details: BookingDetails = actualBooking.details || booking.details || {};
  const bookable: Bookable = actualBooking.bookable || booking.bookable || {};
  const bookableType = actualBooking.bookable_type || booking.bookable_type || "";
  
  const startDate = actualBooking.start_date;
  const endDate = actualBooking.end_date;
  let dateDisplay = (details.departure_date as string) || (details.departureDate as string) || "-";
  
  if (startDate) {
      dateDisplay = formatDate(startDate);
      if (endDate && endDate !== startDate) {
          dateDisplay += ` - ${formatDate(endDate)}`;
      }
  }

  const serviceName = details.service_name || 
                      bookable.name || 
                      (bookable.brand ? `${bookable.brand} ${bookable.car_model}` : null) || 
                      (bookableType?.includes("TripPlanner") ? "Custom Trip Plan" : "Service Details");

  // Helper for JSON key access
  const getVal = (key: string, ...alts: string[]) => {
    const keys = [key, ...alts];
    for (const k of keys) {
       if (details[k] !== undefined && details[k] !== null && details[k] !== "" && details[k] !== "null") return details[k] as string;
    }
    return null;
  };

  // ✅ WHATSAPP HELPER FUNCTION
  const openWhatsApp = (reason: string) => {
    const phoneNumber = "6282224291148"; 

    const bookingRef = `Booking ID: #${actualBooking.id} (Order: ${booking.order_number})`;
    const text = `Hello Admin, I need help with my booking.\n\n` +
                 `📌 *${bookingRef}*\n` +
                 `🛎️ *Service:* ${serviceName}\n\n` +
                 `⚠️ *Issue:* ${reason}\n` +
                 `--------------------------\n` +
                 `[Please explain your issue in detail here...]`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- RENDERERS ---

  // ✅ FIX: Improved Trip Planner Renderer
  const renderTripPlanner = () => {
      const type = getVal('type') || 'personal';
      const contactName = type === 'company' ? getVal('companyName', 'company_name') : getVal('fullName', 'full_name');
      
      // Calculate Total Pax from all categories
      const adults = parseInt((getVal('paxAdults', 'pax_adults') || "0") as string);
      const teens = parseInt((getVal('paxTeens', 'pax_teens') || "0") as string);
      const kids = parseInt((getVal('paxKids', 'pax_kids') || "0") as string);
      const seniors = parseInt((getVal('paxSeniors', 'pax_seniors') || "0") as string);
      
      const totalPax = (adults + teens + kids + seniors) || details.quantity || 1;

      // Handle Location Nulls
      const city = getVal('city');
      const province = getVal('province');
      const country = getVal('country');
      const tripType = getVal('tripType', 'trip_type');
      const destinationLegacy = getVal('destination');

      let location = "Custom Destination"; // Fallback text

      if (city) {
          if (tripType === 'domestic') {
             location = `🇮🇩 ${city}${province ? `, ${province}` : ''}`;
          } else {
             location = `🌐 ${city}${country ? `, ${country}` : ''}`;
          }
      } else if (destinationLegacy) {
          location = destinationLegacy;
      }

      // Handle Duration & Budget defaults
      const durationVal = getVal('duration');
      const durationDisplay = durationVal ? `${durationVal} Days` : "1 Day";
      
      const budgetVal = getVal('budgetPack', 'budget_pack');
      const budgetDisplay = budgetVal ? budgetVal.toUpperCase() : "STANDARD";

      return (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
               <SectionTitle icon={<Compass size={18}/>} title="Trip Overview" />
               <div className="space-y-1">
                  <InfoRow icon={<MapPin size={14}/>} label="Destination" value={location} />
                  <InfoRow icon={<Calendar size={14}/>} label="Dates" value={`${dateDisplay} (${durationDisplay})`} />
                  <InfoRow icon={<Plane size={14}/>} label="Travel Type" value={(getVal('travelType', 'travel_type') || 'Personal').replace(/_/g, ' ')} />
                  <InfoRow icon={<Wallet size={14}/>} label="Budget Pack" value={budgetDisplay} />
               </div>
            </div>
            <div>
               <SectionTitle icon={<User size={18}/>} title="Organizer" />
               <div className="space-y-1">
                  <InfoRow icon={type === 'company' ? <Building2 size={14}/> : <User size={14}/>} label="Contact Name" value={contactName} />
                  <InfoRow icon={<Mail size={14}/>} label="Email" value={getVal('email')} />
                  <InfoRow icon={<Phone size={14}/>} label="Phone" value={getVal('phone', 'phone_number')} />
                  <InfoRow icon={<Users size={14}/>} label="Total Participants" value={`${totalPax} Pax`} />
               </div>
            </div>
        </div>
      );
  };

  const renderCarRental = () => {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <SectionTitle icon={<Car size={18}/>} title="Vehicle Details" />
                <div className="space-y-1">
                    <InfoRow icon={<Car size={14}/>} label="Vehicle" value={`${bookable.brand || ''} ${bookable.car_model || ''}`} />
                    <InfoRow icon={<Compass size={14}/>} label="Transmission" value={bookable.transmission || "-"} />
                    <InfoRow icon={<Wallet size={14}/>} label="Fuel Type" value={bookable.fuel_type || "-"} />
                    <InfoRow icon={<Clock size={14}/>} label="Duration" value={`${details.total_days || 1} Day(s)`} />
                </div>
            </div>
            <div>
                <SectionTitle icon={<MapPin size={18}/>} title="Rental Logistics" />
                <div className="space-y-1">
                    <InfoRow icon={<Calendar size={14}/>} label="Rental Dates" value={dateDisplay} />
                    <InfoRow icon={<MapPin size={14}/>} label="Pickup" value={`${details.pickup_location || '-'} (${details.pickup_time || '-'})`} />
                    {details.return_location && (
                        <InfoRow icon={<MapPin size={14}/>} label="Return" value={`${details.return_location} (${details.return_time || '-'})`} />
                    )}
                    <InfoRow icon={<Phone size={14}/>} label="Driver Contact" value={details.phone_number as string} />
                </div>
            </div>
        </div>
    );
  };

  const renderHolidayPackage = () => {
      const adults = (details.adults as number) || 0;
      const children = (details.children as number) || 0;
      const totalPax = (details.total_pax as number) || (adults + children);

      return (
        <div className="grid md:grid-cols-2 gap-8">
             <div>
                <SectionTitle icon={<Users size={18}/>} title="Guest Info" />
                <div className="space-y-1">
                    <InfoRow icon={<User size={14}/>} label="Lead Guest" value={`${details.full_name} (${details.participant_nationality || '-'})`} />
                    <InfoRow icon={<Users size={14}/>} label="Travelers" value={`${totalPax} Pax (${adults} Adult, ${children} Child)`} />
                    <InfoRow icon={<Mail size={14}/>} label="Email" value={details.email as string} />
                    <InfoRow icon={<Phone size={14}/>} label="Phone" value={details.phone_number as string} />
                </div>
             </div>
             <div>
                <SectionTitle icon={<Luggage size={18}/>} title="Package Details" />
                <div className="space-y-1">
                    <InfoRow icon={<MapPin size={14}/>} label="Destination" value={bookable.name} />
                    <InfoRow icon={<Calendar size={14}/>} label="Schedule" value={dateDisplay} />
                    <InfoRow icon={<MapPin size={14}/>} label="Meeting Point" value={(details.meeting_point as string) || (details.pickup_location as string) || "Check Voucher"} />
                    {details.flight_number && <InfoRow icon={<Plane size={14}/>} label="Flight Info" value={details.flight_number as string} />}
                </div>
             </div>
        </div>
      );
  };

  const renderOpenTrip = () => {
    const pax = details.num_participants || details.quantity || 1;
    return (
      <div className="grid md:grid-cols-2 gap-8">
           <div>
              <SectionTitle icon={<Map size={18}/>} title="Trip Info" />
              <div className="space-y-1">
                  <InfoRow icon={<Map size={14}/>} label="Trip Name" value={bookable.name} />
                  <InfoRow icon={<MapPin size={14}/>} label="Destination" value={bookable.destination || "Multiple Locations"} />
                  <InfoRow icon={<Calendar size={14}/>} label="Schedule" value={dateDisplay} />
                  <InfoRow icon={<MapPin size={14}/>} label="Meeting Point" value={(details.meeting_point as string) || (bookable.meeting_point as string) || "TBA"} />
              </div>
           </div>
           <div>
              <SectionTitle icon={<Users size={18}/>} title="Booking Details" />
              <div className="space-y-1">
                  <InfoRow icon={<User size={14}/>} label="Booked By" value={details.full_name as string} />
                  <InfoRow icon={<Users size={14}/>} label="Seats" value={`${pax} Person(s)`} />
                  <InfoRow icon={<Phone size={14}/>} label="Contact" value={details.phone_number as string} />
                  {details.special_request && (
                      <InfoRow icon={<MessageSquare size={14}/>} label="Notes" value={details.special_request as string} />
                  )}
              </div>
           </div>
      </div>
    );
  };

  const renderActivity = () => {
    return (
        <div className="grid md:grid-cols-2 gap-8">
             <div>
                <SectionTitle icon={<Ticket size={18}/>} title="Ticket Holder" />
                <div className="space-y-1">
                    <InfoRow icon={<User size={14}/>} label="Name" value={details.full_name as string} />
                    <InfoRow icon={<Ticket size={14}/>} label="Quantity" value={`${details.quantity || 1} Ticket(s)`} />
                    <InfoRow icon={<Mail size={14}/>} label="Email" value={details.email as string} />
                    <InfoRow icon={<Phone size={14}/>} label="Phone" value={details.phone_number as string} />
                </div>
             </div>
             <div>
                <SectionTitle icon={<MapPin size={18}/>} title="Activity Info" />
                <div className="space-y-1">
                    <InfoRow icon={<Ticket size={14}/>} label="Activity" value={bookable.name} />
                    <InfoRow icon={<Calendar size={14}/>} label="Date" value={dateDisplay} />
                    <InfoRow icon={<MapPin size={14}/>} label="Location" value={(details.pickup_location as string) || "On Site"} />
                    {details.special_request && (
                        <InfoRow icon={<MessageSquare size={14}/>} label="Special Request" value={details.special_request as string} />
                    )}
                </div>
             </div>
        </div>
    );
  };

  const renderSpecificDetails = () => {
      if (bookableType?.includes("TripPlanner")) return renderTripPlanner();
      if (bookableType?.includes("CarRental")) return renderCarRental();
      if (bookableType?.includes("HolidayPackage")) return renderHolidayPackage();
      if (bookableType?.includes("OpenTrip")) return renderOpenTrip();
      if (bookableType?.includes("Activity")) return renderActivity();
      return <p className="text-muted-foreground italic p-4 text-center">Service details are available in the attached invoice.</p>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors group"
        >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Bookings
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* HEADER */}
            <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-white">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                         <ServiceTypeBadge type={bookableType || "Unknown"} />
                         <span className="flex items-center gap-1 text-xs font-mono text-gray-400">
                             <Hash size={12} /> {booking.order_number}
                         </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
                        {serviceName}
                    </h1>
                </div>
                <div className="shrink-0">
                     <span className={`${getStatusChip(actualBooking.status || booking.status)} px-3 py-1 text-sm font-bold capitalize flex items-center gap-2`}>
                        {(actualBooking.status === 'pending') && <Clock size={14}/>}
                        {(actualBooking.status === 'confirmed' || actualBooking.status === 'completed') && <CheckCircle2 size={14}/>}
                        {(actualBooking.status || booking.status).replace(/_/g, " ")}
                     </span>
                </div>
            </div>

            {/* BODY */}
            <div className="p-6 md:p-8">
                {/* 1. Service Details Section */}
                <div className="mb-10">
                    {renderSpecificDetails()}
                </div>

                {/* 2. Payment Summary Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-8">
                     <SectionTitle icon={<CreditCard size={18}/>} title="Payment Summary" />
                     
                     <div className="flex flex-col md:flex-row justify-between items-end gap-4 mt-4">
                         <div className="space-y-2 text-sm text-gray-600">
                             <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Order Status:</span>
                                <span className="font-semibold text-gray-900 capitalize">{booking.status}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-semibold text-gray-900 capitalize">{booking.payment_status}</span>
                             </div>
                             {booking.payment_deadline && booking.status === 'pending' && (
                                <p className="text-xs text-red-500 mt-2 flex items-center gap-1 bg-red-50 px-2 py-1 rounded w-fit">
                                    <Clock size={12}/> Pay before: {formatDate(booking.payment_deadline)}
                                </p>
                             )}
                         </div>

                         <div className="text-right">
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                             <p className="text-2xl font-bold text-primary">
                                {formatCurrency(booking.total_amount)}
                             </p>
                             {booking.down_payment_amount > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    (Down Payment: {formatCurrency(booking.down_payment_amount)})
                                </p>
                             )}
                         </div>
                     </div>
                </div>

                {/* 3. HELP / CONTACT ADMIN SECTION */}
                <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600 hidden sm:block">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-900 flex items-center gap-2">
                                <MessageCircle className="sm:hidden" size={18} /> 
                                Need help with this booking?
                            </h3>
                            <p className="text-sm text-blue-700 mt-1 max-w-md">
                                If you spot an error in the schedule, wrong details, or have a question, contact us directly via WhatsApp.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end shrink-0 w-full md:w-auto">
                         <button 
                           onClick={() => openWhatsApp("Wrong Schedule")}
                           className="px-4 py-2 text-xs font-semibold bg-white text-blue-700 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                         >
                           Wrong Schedule?
                         </button>
                         <button 
                           onClick={() => openWhatsApp("Incorrect Details")}
                           className="px-4 py-2 text-xs font-semibold bg-white text-blue-700 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                         >
                           Wrong Info?
                         </button>
                         <button 
                           onClick={() => openWhatsApp("General Inquiry")}
                           className="px-5 py-2 text-sm font-bold bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md flex items-center gap-2 transition-all hover:shadow-lg"
                         >
                           <MessageCircle size={16} /> Chat Admin
                         </button>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}