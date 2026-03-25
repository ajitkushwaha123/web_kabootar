"use client";

import React, { useEffect, useState } from "react";
import { Timer, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow, addHours, isAfter } from "date-fns";

export const WhatsAppWindowTimer = ({ lastCustomerMessageAt }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!lastCustomerMessageAt) return;

    const calculateTime = () => {
      if (!lastCustomerMessageAt || isNaN(new Date(lastCustomerMessageAt).getTime())) {
        setIsExpired(false);
        setTimeLeft("Ready");
        return;
      }
      const expiryTime = addHours(new Date(lastCustomerMessageAt), 24);
      const now = new Date();
      
      if (isAfter(now, expiryTime)) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }

      const diff = expiryTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      
      setIsExpired(false);
      setTimeLeft(`${hours}h ${minutes}m left`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // update every min

    return () => clearInterval(interval);
  }, [lastCustomerMessageAt]);

  if (!lastCustomerMessageAt) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm transition-all duration-300 ${
      isExpired 
        ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" 
        : "bg-emerald-50 text-emerald-700 border-emerald-100"
    }`}>
      {isExpired ? (
        <>
          <AlertCircle className="w-3 h-3" />
          <span>Window Expired — Template Needed</span>
        </>
      ) : (
        <>
          <Clock className="w-3 h-3 animate-spin-slow" />
          <span>Free Window: {timeLeft}</span>
        </>
      )}
    </div>
  );
};
