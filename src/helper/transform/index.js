import React from "react";

export function formatToINR(value) {
  if (value == null || isNaN(value)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPhone(phone) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

export const UserAvatar = ({ name = "", imageUrl = "", size = "md" }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  const sizeClasses =
    size === "sm"
      ? "h-8 w-8 text-sm"
      : size === "lg"
      ? "h-14 w-14 text-xl"
      : size === "xl"
      ? "h-40 w-40 text-5xl"
      : "h-10 w-10 text-base";

  if (imageUrl) {
    return (
      <div
        className={`relative ${sizeClasses} rounded-full overflow-hidden border`}
      >
        <img src={imageUrl} alt={name} className="object-cover h-full w-full" />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold rounded-full ${sizeClasses}`}
    >
      {initials}
    </div>
  );
};
