"use client";
import FilterSidebar from "@/components/global/sidebar/FilterSidebar";
import TemplateLibraryHeader from "@/components/global/template/TemplateLibraryHeader";
import React, { useState } from "react";

const filterData = [
  // {
  //   id: "CATEGORY",
  //   title: "Category",
  //   items: [
  //     { id: "UTILITY", label: "Utility", count: 87 },
  //     { id: "AUTHENTICATION", label: "Authentication", count: 12 },
  //   ],
  // },
  // {
  //   id: "INDUSTRY",
  //   title: "Industry",
  //   items: [
  //     { id: "ECOMMERCE", label: "E-commerce", count: 51 },
  //     { id: "FINANCIAL_SERVICES", label: "Financial services", count: 48 },
  //   ],
  // },
  {
    id: "ACCOUNT_UPDATES",
    title: "Account updates",
    items: [
      {
        id: "ACCOUNT_CREATION",
        label: "Account creation confirmation",
        count: 1,
      },
    ],
  },
  {
    id: "CUSTOMER_FEEDBACK",
    title: "Customer Feedback",
    items: [{ id: "FEEDBACK_SURVEY", label: "Feedback survey", count: 3 }],
  },
  {
    id: "EVENT_REMINDER",
    title: "Event reminder",
    items: [
      { id: "EVENT_DETAILS", label: "Event details reminder", count: 2 },
      {
        id: "EVENT_RSVP_CONFIRMATION",
        label: "Event RSVP confirmation",
        count: 2,
      },
      { id: "EVENT_RSVP_REMINDER", label: "Event RSVP reminder", count: 2 },
    ],
  },
  {
    id: "ORDER_MANAGEMENT",
    title: "Order management",
    items: [
      { id: "DELIVERY_CONFIRMATION", label: "Delivery confirmation", count: 4 },
      { id: "DELIVERY_FAILED", label: "Delivery failed", count: 2 },
      { id: "DELIVERY_UPDATE", label: "Delivery update", count: 6 },
      { id: "ORDER_ACTION_NEEDED", label: "Order action needed", count: 2 },
      { id: "ORDER_CANCEL", label: "Order or transaction cancel", count: 4 },
      { id: "ORDER_DELAY", label: "Order delay", count: 2 },
      { id: "ORDER_CONFIRMATION", label: "Order confirmation", count: 6 },
      { id: "ORDER_PICKUP", label: "Order pick up", count: 4 },
      { id: "ORDER_REFUND", label: "Order refund", count: 1 },
      { id: "RETURN_CONFIRMATION", label: "Return confirmation", count: 2 },
      { id: "SHIPMENT_CONFIRMATION", label: "Shipment confirmation", count: 4 },
    ],
  },
  {
    id: "PAYMENTS",
    title: "Payments",
    items: [
      { id: "AUTO_PAY_REMINDER", label: "Auto pay reminder", count: 3 },
      { id: "TRANSACTION_ALERT", label: "Transaction alert", count: 3 },
      { id: "FRAUD_ALERT", label: "Fraud alert", count: 4 },
      { id: "LOW_BALANCE", label: "Low balance warning", count: 2 },
      {
        id: "PAYMENT_ACTION_REQUIRED",
        label: "Payment action required",
        count: 3,
      },
      { id: "PAYMENT_CONFIRMATION", label: "Payment confirmation", count: 4 },
      { id: "PAYMENT_FAILED", label: "Payment reject/fail", count: 3 },
      { id: "PAYMENT_NOTICE", label: "Payment notice", count: 3 },
      { id: "PAYMENT_OVERDUE", label: "Payment overdue", count: 3 },
      { id: "PAYMENT_DUE_REMINDER", label: "Payment due reminder", count: 4 },
      { id: "PAYMENT_SCHEDULED", label: "Payment scheduled", count: 3 },
      { id: "RECEIPT_ATTACHMENT", label: "Receipt attachment", count: 3 },
      { id: "STATEMENT_AVAILABLE", label: "Statement available", count: 2 },
    ],
  },
];
  

const layout = ({ children }) => {
  const [checked, setChecked] = useState();

  return (
    <div>
      <TemplateLibraryHeader />
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <div className="sticky"><FilterSidebar
          sections={filterData}
          selected={checked}
          onChange={(id, isOn) => setChecked((s) => ({ ...s, [id]: isOn }))}
        /></div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default layout;
