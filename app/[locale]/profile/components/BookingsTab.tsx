"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { SimpleBooking } from "../types";
import { formatCurrency, formatDate, getStatusChip } from "@/lib/utils";

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

  const renderBookingList = () =>
    !bookings || bookings.length === 0 ? (
      <p>You have no active bookings.</p>
    ) : (
      bookings.map((booking) => {
        const bookable = booking?.bookable;
        const serviceName =
          bookable?.name || // For Holiday Packages
          `${bookable?.brand || ""} ${bookable?.car_model || ""}`.trim() || // For Cars
          "Service Details Unavailable";

        const startDate = booking?.start_date;
        const endDate = booking?.end_date;

        return (
          <div
            key={booking.id}
            className="bg-card border border-border rounded-lg p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-lg">{serviceName}</p>
                <p className="text-sm text-foreground/60">
                  {startDate
                    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
                    : "N/A"}
                </p>
              </div>
              <span className={getStatusChip(booking.status)}>
                {booking.status}
              </span>
            </div>
            <div className="border-t border-border pt-3 space-y-2">
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
        );
      })
    );

  if (loading) return <p>Loading your bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Bookings</h2>
      </div>
      <div className="space-y-4">{renderBookingList()}</div>
    </div>
  );
}