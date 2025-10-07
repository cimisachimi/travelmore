"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

// 🔹 Reusable Form Input Component
const FormInput: React.FC<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  as?: "textarea";
  readOnly?: boolean;
}> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  as,
  readOnly = false,
}) => (
  <div>
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    {as === "textarea" ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
        readOnly={readOnly}
      />
    ) : (
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 rounded-md bg-gray-100 text-black border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
        readOnly={readOnly}
      />
    )}
  </div>
);

// 🔹 Booking Form Component
const BookingForm = () => {
  const t = useTranslations("booking");
  const searchParams = useSearchParams();
  const activityTitle = searchParams.get("activity") || "";

  const [formData, setFormData] = useState({
    activityName: "",
    date: "",
    participants: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (activityTitle) {
      setFormData((prev) => ({ ...prev, activityName: activityTitle }));
    }
  }, [activityTitle]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t("alert"));
    console.log(formData);
  };

  return (
    <main>
      <section className="bg-gray-50 py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-2">
              {t("title")}
            </h2>
            <p className="text-gray-600">{t("subtitle")}</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-black mb-4 border-b pb-2">
                  {t("orderDetails")}
                </h3>
                <div className="space-y-4">
                  <FormInput
                    label={t("fields.activity")}
                    name="activityName"
                    value={formData.activityName}
                    onChange={handleChange}
                    readOnly
                  />
                  <FormInput
                    label={t("fields.date")}
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    type="date"
                  />
                  <FormInput
                    label={t("fields.participants")}
                    name="participants"
                    value={formData.participants}
                    onChange={handleChange}
                    placeholder={t("placeholders.participants")}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-black mb-4 border-b pb-2">
                  {t("contactInfo")}
                </h3>
                <div className="space-y-4">
                  <FormInput
                    label={t("fields.name")}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <FormInput
                    label={t("fields.email")}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                  />
                  <FormInput
                    label={t("fields.phone")}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel"
                  />
                  <FormInput
                    label={t("fields.address")}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t("placeholders.address")}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-8 py-3 rounded-lg bg-blue-600 text-white font-bold hover:brightness-90 transition-all transform hover:scale-105"
              >
                {t("button")}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

// 🔹 Wrapper for Suspense (recommended for useSearchParams)
export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingForm />
    </Suspense>
  );
}
