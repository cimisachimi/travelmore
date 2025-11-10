// --- Type Definitions ---

export interface Bookable {
  id: number;
  brand?: string;
  car_model?: string;
  name?: string; // For other types like HolidayPackage
}

export interface SimpleBooking {
  id: number;
  total_price: string;
  status: "pending" | "confirmed" | "cancelled" | "processing";
  payment_status: "unpaid" | "pending" | "partial" | "paid";
  start_date: string | null;
  end_date: string | null;
  bookable: Bookable | null;
}

export interface Transaction {
  id: number;
  payment_type: string;
  status: "pending" | "settlement" | "failed" | "expire";
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
  | "cancelled";

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

// --- Midtrans Global Type ---
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