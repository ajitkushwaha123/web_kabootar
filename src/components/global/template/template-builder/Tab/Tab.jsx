"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Settings,
  ShieldCheck,
  Send,
  List,
  ClipboardList,
  CreditCard,
  RefreshCcw,
  FileText,
  ClipboardCheck,
  KeyRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import TemplateCardPreview from "../../TemplateCardPreview";
import Link from "next/link";

const categories = [
  { label: "MARKETING", icon: Megaphone },
  { label: "UTILITY", icon: Settings },
  { label: "AUTHENTICATION", icon: ShieldCheck },
];

const messageTypesByCategory = {
  MARKETING: [
    {
      label: "CUSTOM",
      desc: "Send promotions or announcements to increase awareness and engagement.",
      icon: Send,
    },
    {
      label: "CATALOG",
      desc: "Send messages about your entire catalog or multiple products from it.",
      icon: List,
    },
    {
      label: "FLOWS",
      desc: "Send a form to capture customer interests, appointment requests, or run surveys.",
      icon: ClipboardList,
    },
    {
      label: "ORDER_DETAILS",
      desc: "Send messages through which customers can pay you.",
      icon: CreditCard,
    },
  ],
  UTILITY: [
    {
      label: "CUSTOM",
      desc: "Send messages about an existing order or account.",
      icon: FileText,
    },
    {
      label: "FLOWS",
      desc: "Send a form to collect feedback, send reminders or manage orders.",
      icon: ClipboardList,
    },
    {
      label: "ORDER_STATUS",
      desc: "Send messages to tell customers about the progress of their orders.",
      icon: RefreshCcw,
    },
    {
      label: "ORDER_DETAILS",
      desc: "Send messages through which customers can pay you.",
      icon: CreditCard,
    },
  ],
  AUTHENTICATION: [
    {
      label: "OTP",
      desc: "Send codes to verify a transaction or login.",
      icon: KeyRound,
    },
  ],
};

export const templateData = [
  {
    type: "CUSTOM",
    name: "limited_time_offer_tuscan_getaway_2023",
    language: "en_US",
    category: "MARKETING",
    components: [
      {
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: ["4::aW..."],
          previewUrl:
            "https://i.pinimg.com/736x/a7/af/00/a7af0032cef31b888e6d08445661fed0.jpg",
        },
      },
      {
        type: "BODY",
        text: "Hi {{1}}! For a limited time only you can get our {{2}} for as low as {{3}}. Tap the Offer Details button for more information.",
        example: {
          body_text: [["Mark", "Tuscan Getaway package", "800"]],
        },
      },
      {
        type: "FOOTER",
        text: "Offer valid until May 31, 2023",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "PHONE_NUMBER",
            text: "Call",
            phone_number: "15550051310",
          },
          {
            type: "URL",
            text: "Shop Now",
            url: "https://www.examplesite.com/shop?promo={{1}}",
            example: ["summer2023"],
          },
        ],
      },
    ],
  },
  {
    type: "CATALOG",
    name: "intro_catalog_offer",
    language: "en_US",
    category: "MARKETING",
    components: [
      {
        type: "BODY",
        text: "Now shop for your favourite products right here on WhatsApp! Get Rs {{1}} off on all orders above {{2}}Rs! Valid for your first {{3}} orders placed on WhatsApp!",
        example: {
          body_text: [["100", "400", "3"]],
        },
      },
      {
        type: "FOOTER",
        text: "Best grocery deals on WhatsApp!",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "CATALOG",
            text: "View catalog",
          },
        ],
      },
    ],
  },

  {
    type: "CUSTOM",
    name: "account_summary_update_2023",
    language: "en_US",
    category: "UTILITY",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Account Update",
      },
      {
        type: "BODY",
        text: "Hi {{1}}, your account {{2}} has been updated. Your current balance is ₹{{3}}. For more details, click below.",
        example: {
          body_text: [["Ajit", "AXIS1234", "5,000"]],
        },
      },
      {
        type: "FOOTER",
        text: "Last updated today",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "View Account",
            url: "https://yourbank.com/account/{{1}}",
            example: ["AXIS1234"],
          },
          {
            type: "PHONE_NUMBER",
            text: "Contact Support",
            phone_number: "+911234567890",
          },
        ],
      },
    ],
  },

  {
    type: "ORDER_STATUS",
    name: "order_update_notification_2023",
    language: "en_US",
    category: "UTILITY",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Order Status Update",
      },
      {
        type: "BODY",
        text: "Hi {{1}}, your order #{{2}} is now {{3}}. Estimated delivery: {{4}}.",
        example: {
          body_text: [["Ajit", "ORD2345", "shipped", "12th July"]],
        },
      },
      {
        type: "FOOTER",
        text: "Track your order below",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Track Order",
            url: "https://yourstore.com/track/{{1}}",
            example: ["ORD2345"],
          },
          {
            type: "PHONE_NUMBER",
            text: "Need Help?",
            phone_number: "+911234567890",
          },
        ],
      },
    ],
  },

  {
    type: "ORDER_DETAILS",
    name: "payment_reminder_utility_2023",
    language: "en_US",
    category: "UTILITY",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Payment Reminder",
      },
      {
        type: "BODY",
        text: "Hello {{1}}, your order #{{2}} totaling ₹{{3}} is pending. Click below to complete the payment.",
        example: {
          body_text: [["Ajit", "ORD2345", "1,299"]],
        },
      },
      {
        type: "FOOTER",
        text: "Thank you for shopping with us!",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Pay Now",
            url: "https://yourstore.com/pay/{{1}}",
            example: ["ORD2345"],
          },
          {
            type: "PHONE_NUMBER",
            text: "Contact Support",
            phone_number: "+911234567890",
          },
        ],
      },
    ],
  },

  {
    type: "OTP",
    name: "login_otp_verification_2023",
    language: "en_US",
    category: "AUTHENTICATION",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Your One-Time Password",
      },
      {
        type: "BODY",
        text: "Hi {{1}}, your OTP for {{2}} is {{3}}. This code is valid for 10 minutes. Do not share it with anyone.",
        example: {
          body_text: [["Ajit", "login", "482193"]],
        },
      },
      {
        type: "FOOTER",
        text: "Your security is our priority.",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "PHONE_NUMBER",
            text: "Contact Support",
            phone_number: "+911234567890",
          },
        ],
      },
    ],
  },

  {
    type: "ORDER_DETAILS",
    name: "exclusive_discount_checkout_reminder_2023",
    language: "en_US",
    category: "MARKETING",
    components: [
      {
        type: "HEADER",
        format: "TEXT",
        text: "Complete Your Order",
      },
      {
        type: "BODY",
        text: "Hi {{1}}, don’t miss out! Complete your checkout now and get ₹{{2}} off your order. Offer valid for the next {{3}} hours.",
        example: {
          body_text: [["Ajit", "150", "2"]],
        },
      },
      {
        type: "FOOTER",
        text: "Hurry! Limited time deal.",
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "URL",
            text: "Complete Checkout",
            url: "https://yourstore.com/checkout/{{1}}",
            example: ["checkout123"],
          },
          {
            type: "PHONE_NUMBER",
            text: "Talk to Sales",
            phone_number: "+911234567890",
          },
        ],
      },
    ],
  },
];

export default function Tab() {
  const [category, setCategory] = useState("MARKETING");
  const [type, setType] = useState(
    messageTypesByCategory["MARKETING"][0].label
  );

  const currentTypes = messageTypesByCategory[category] || [];

  const handleCategoryChange = (label) => {
    const firstType = messageTypesByCategory[label][0]?.label || "";
    setCategory(label);
    setType(firstType);
  };

  const handleTypeChange = (value) => {
    setType(value);
  };

  const template = templateData.find(
    (template) => template.type === type && template.category === category
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="flex flex-col gap-8 min-h-screen w-full md:w-[65%]">
        <div className="bg-white/90 backdrop-blur-md shadow-sm rounded-md p-6">
          <h2 className="text-2xl font-semibold text-green-700 mb-2">
            Set up your template
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Choose the category that best describes your message template. Then
            select the type of message you want to send.{" "}
            <a href="#" className="text-green-600 underline">
              Learn more about categories
            </a>
            .
          </p>

          <div className="flex flex-wrap gap-4 mb-6">
            {categories.map(({ label, icon: Icon }) => (
              <Button
                key={label}
                onClick={() => handleCategoryChange(label)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${
                  category === label
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "border border-green-300 text-green-700 hover:bg-green-50"
                }`}
                variant={category === label ? "default" : "outline"}
              >
                <Icon size={16} />
                {label}
              </Button>
            ))}
          </div>

          <RadioGroup
            value={type}
            onValueChange={handleTypeChange}
            className="space-y-4"
          >
            {currentTypes.map(({ label, desc, icon: Icon }) => (
              <div
                key={label}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                  type === label
                    ? "bg-green-50 ring-2 ring-green-300"
                    : "hover:bg-green-50"
                }`}
              >
                <RadioGroupItem value={label} id={label} />
                <label htmlFor={label} className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-2 font-medium text-green-800">
                    <Icon size={16} />
                    {label.split("_").join(" ")}
                  </div>
                  <p className="text-gray-600">{desc}</p>
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 border border-green-100 bg-white/90 rounded-2xl shadow-sm">
          <Link
            href={`/template/template-builder?type=${type}&category=${category}`}
          >
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm">
              Continue
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 border border-green-100 bg-white/90 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5021/5021915.png"
              alt="Templates"
              className="w-20 h-20 object-contain rounded-xl"
            />
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                Start with pre-approved templates
              </h3>
              <p className="text-sm text-gray-600 mt-1 max-w-md">
                Save time and effort by using pre-approved templates from our
                Template Library. Build professional templates without starting
                from scratch.
              </p>
            </div>
          </div>

          <Link href="/template/template-library">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm">
              Go to template library
            </Button>
          </Link>
        </div>
      </div>

      <div className="w-full md:w-[35%]">
        <div className="sticky top-0 p-4 bg-gray-50 rounded-xl shadow-inner h-fit">
          <TemplateCardPreview template={template} />
        </div>
      </div>
    </div>
  );
}
