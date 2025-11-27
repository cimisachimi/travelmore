// app/[locale]/profile/types.ts

export interface Bookable {
  id: number;
  brand?: string;
  car_model?: string;
  name?: string;
  transmission?: string;
  fuel_type?: string;
}

export interface BookingDetails {
  // Common
  service_name?: string;
  email?: string;
  phone_number?: string;
  phone?: string;
  full_name?: string;
  fullName?: string;
  
  // Car Rental
  brand?: string;
  car_model?: string;
  plate_number?: string;
  total_days?: number;
  pickup_location?: string;
  pickup_time?: string;
  
  // Trip Planner
  type?: string;
  company_name?: string;
  companyName?: string;
  brand_name?: string;
  brandName?: string;
  pax_adults?: string | number;
  paxAdults?: string | number;
  pax_kids?: string | number;
  paxKids?: string | number;
  pax_teens?: string | number;
  paxTeens?: string | number;
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
  duration?: string | number;
  days?: string | number;
  budget_pack?: string;
  budgetPack?: string;
  addons?: string[] | string;
  must_visit?: string;
  mustVisit?: string;
  travel_style?: string[] | string;
  
  // Holiday Package / Activity
  adults?: number;
  children?: number;
  participant_nationality?: string;
  total_pax?: number;
  flight_number?: string;
  special_request?: string;
  quantity?: number;
  num_participants?: number;
  activity_time?: string;
  price_tier?: string;
  num_travelers?: number;

  [key: string]: unknown;
}

export interface SimpleBooking {
  id: number;
  total_price: string;
  // ✅ FIXED: Added 'refunded', 'paid', 'failed' to status union type
  status: "pending" | "confirmed" | "cancelled" | "processing" | "refunded" | "paid" | "failed";
  payment_status: "unpaid" | "pending" | "partial" | "paid" | "refund"; // Added 'refund' here too just in case
  start_date: string | null;
  end_date: string | null;

  bookable_type: string;
  details: BookingDetails; 

  bookable: Bookable | null;
}

export interface Transaction {
  id: number;
  payment_type: string;
  status: "pending" | "settlement" | "failed" | "expire" | "refund"; // Added 'refund'
  notes: string | null;
  gross_amount: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "partially_paid"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "refunded"; // ✅ Added 'refunded'

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  total_amount: string;
  down_payment_amount: string | null;
  payment_deadline: string | null;
  created_at: string;
  booking: SimpleBooking | null;
  transactions: Transaction[];
}

export type RefundStatus = "pending" | "approved" | "rejected";

export interface RefundRequest {
  id: number;
  order_number: string;
  status: RefundStatus;
  requested_at: string;
  amount: string;
  reason: string;
  service_name: string;
}

interface MidtransResult {
  order_id?: string;
  transaction_status?: string;
  transaction_id?: string;
  payment_type?: string;
  gross_amount?: string;
  status_message?: string;
}

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: MidtransResult) => void;
          onPending?: (result: MidtransResult) => void;
          onError?: (result: MidtransResult) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}