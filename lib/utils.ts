// --- Helper Functions ---

export const formatCurrency = (amount: string | number | null) => {
  if (amount === null || amount === undefined) return "N/A";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (date: string | null | undefined) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatDateTime = (date: string | null) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusChip = (status: string) => {
  const s = status?.toLowerCase() || "pending";
  const classes = "px-2 py-1 text-xs font-semibold rounded-full capitalize";
  if (s === "paid" || s === "settlement" || s === "confirmed" || s === "approved")
    return `${classes} bg-green-100 text-green-800`;
  if (s === "pending" || s === "processing")
    return `${classes} bg-yellow-100 text-yellow-800`;
  if (s === "partially_paid")
    return `${classes} bg-blue-100 text-blue-800`;
  return `${classes} bg-red-100 text-red-800`; // Failed, expired, cancelled, rejected
};