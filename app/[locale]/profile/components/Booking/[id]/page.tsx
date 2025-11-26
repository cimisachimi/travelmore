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
  Building2
} from "lucide-react";
import { toast } from "sonner";

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // ---------------------------------------------------------------------------
        // ⚠️ SOLUSI FRONTEND (Agar tidak 404 jika Backend belum ada route /id)
        // 1. Ambil semua data booking
        const response = await api.get("/my-bookings");
        const allBookings = response.data;

        // 2. Cari manual di sini berdasarkan ID
        const foundBooking = allBookings.find((b: any) => String(b.id) === String(id));

        if (foundBooking) {
          setBooking(foundBooking);
        } else {
          console.error(`Booking with ID ${id} not found in list.`);
          toast.error("Booking not found.");
        }
        // ---------------------------------------------------------------------------

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
      const response = await api.get(`/bookings/${booking.id}/invoice`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${booking.order_number || booking.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download invoice. Please try again later.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading booking details...</div>;
  if (!booking) return <div className="min-h-screen flex items-center justify-center text-red-500">Booking not found.</div>;

  // --- Helper Data Parser (Sama seperti di HistoryTab) ---
  const details = booking.details || {};
  const bookable = booking.bookable || {};
  const bookableType = booking.bookable_type || "";
  
  const serviceName = details.service_name || bookable.name || (bookableType.includes("TripPlanner") ? "Custom Trip Plan" : "Service");

  // Helper Helper untuk Trip Planner
  const getVal = (key: string) => {
    if (details[key]) return details[key];
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    return details[snakeKey];
  };
  
  // Render Logic Khusus Trip Planner
  const renderSpecificDetails = () => {
    if (bookableType.includes("TripPlanner")) {
      const type = getVal('type') || 'personal';
      const contactName = type === 'company' ? getVal('companyName') : getVal('fullName');
      const adults = parseInt(getVal('paxAdults') || 0);
      const totalPax = adults + parseInt(getVal('paxKids') || 0) + parseInt(getVal('paxTeens') || 0) + parseInt(getVal('paxSeniors') || 0);
      
      const city = getVal('city');
      const tripType = getVal('tripType');
      let location = city;
      if (tripType === 'domestic') location = `🇮🇩 ${city}, ${getVal('province')}`;
      if (tripType === 'foreign') location = `🌐 ${city}, ${getVal('country')}`;

      return (
        <div className="bg-muted/20 rounded-lg p-5 space-y-4 text-sm">
          <div className="grid md:grid-cols-2 gap-4">
             <div>
                <span className="block text-muted-foreground text-xs mb-1">Destination & Type</span>
                <div className="font-medium flex items-center gap-2"><Compass size={14}/> {location || '-'}</div>
                <div className="font-medium flex items-center gap-2 mt-1"><Plane size={14}/> {(getVal('travelType') || '-').replace(/_/g, ' ')}</div>
             </div>
             <div>
                <span className="block text-muted-foreground text-xs mb-1">Dates & Budget</span>
                <div className="font-medium flex items-center gap-2"><Calendar size={14}/> {getVal('departureDate') || '-'} ({getVal('duration') || '-'})</div>
                <div className="font-medium flex items-center gap-2 mt-1"><Wallet size={14}/> {(getVal('budgetPack') || '-').toUpperCase()}</div>
             </div>
          </div>
          
          <hr className="border-border/40"/>

          <div className="grid md:grid-cols-2 gap-4">
             <div>
                <span className="block text-muted-foreground text-xs mb-1">Contact Person ({type})</span>
                <div className="font-medium flex items-center gap-2"><User size={14}/> {contactName || '-'}</div>
                <div className="text-xs text-muted-foreground mt-1">{getVal('email')} • {getVal('phone')}</div>
             </div>
             <div>
                <span className="block text-muted-foreground text-xs mb-1">Participants ({totalPax})</span>
                <div className="font-medium flex items-center gap-2"><Users size={14}/> {totalPax > 0 ? `${totalPax} People` : 'No details'}</div>
             </div>
          </div>
        </div>
      );
    }

    // Default Render (Car/Activity/Package)
    return (
        <div className="bg-muted/20 rounded-lg p-5 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {details.pickup_location && (
                <div>
                    <span className="block text-muted-foreground text-xs mb-1 flex items-center gap-1"><MapPin size={12}/> Pickup Location</span>
                    <span className="font-medium">{details.pickup_location}</span>
                </div>
            )}
            {details.pickup_time && (
                <div>
                    <span className="block text-muted-foreground text-xs mb-1 flex items-center gap-1"><Clock size={12}/> Pickup Time</span>
                    <span className="font-medium">{details.pickup_time}</span>
                </div>
            )}
            {/* Tambahkan field lain sesuai kebutuhan */}
            {details.phone_number && (
                <div>
                     <span className="block text-muted-foreground text-xs mb-1 flex items-center gap-1"><Phone size={12}/> Contact</span>
                    <span className="font-medium">{details.phone_number}</span>
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        
        {/* Tombol Kembali */}
        <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to History
        </button>

        {/* Kartu Utama */}
        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            
            {/* Header */}
            <div className="bg-muted/30 p-6 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">Order ID: #{booking.order_number}</p>
                    <h1 className="text-2xl font-bold text-primary">{serviceName}</h1>
                </div>
                <div className="flex gap-2">
                    <span className={getStatusChip(booking.status)}>{booking.status}</span>
                </div>
            </div>

            {/* Body Content */}
            <div className="p-6 space-y-8">
                
                {/* Section 1: Detail Layanan */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FileText size={16} /> Service Details
                    </h3>
                    {renderSpecificDetails()}
                </div>

                <hr className="border-border/50" />

                {/* Section 2: Payment Summary */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CreditCard size={16} /> Payment Summary
                    </h3>
                    <div className="flex justify-between items-center bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <div>
                            <p className="text-sm text-muted-foreground">Status: <span className="font-semibold text-foreground capitalize">{booking.payment_status.replace('_', ' ')}</span></p>
                            {booking.down_payment_amount && (
                                <p className="text-xs text-muted-foreground mt-1">DP: {formatCurrency(booking.down_payment_amount)}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="block text-xs text-muted-foreground">Total Amount</span>
                            <span className="text-xl font-bold text-primary">{formatCurrency(booking.total_amount)}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="bg-muted/30 p-6 border-t border-border flex justify-end gap-3">
                <button 
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                >
                    Close
                </button>
                <button 
                    onClick={handleDownloadInvoice}
                    disabled={downloading}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all disabled:opacity-50"
                >
                    {downloading ? "Downloading..." : "Download Invoice"} 
                    {!downloading && <Download size={18} />}
                </button>
            </div>

        </div>
      </div>
    </div>
  );
}