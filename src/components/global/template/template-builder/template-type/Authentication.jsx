"use client";

import React, { useMemo, useState, useEffect } from "react";
import TemplateTitleComponent from "../Title/TemplateTitleComponent";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AuthContentOptions from "../main/AuthContentOptions";
import CodeDeliverySetup from "../main/CodeDeliveySetup";

const Authentication = ({ onChange }) => {
  const [titleData, setTitleData] = useState({ title: "", language: "en_US" });
  const [authContent, setAuthContent] = useState({
    addSecurity: true,
    addExpiration: true,
    validity: "600",
    unit: "minutes",
  });
  const [button, setButton] = useState({ text: "Copy Code" });

  const payload = useMemo(() => {
    const components = [
      {
        type: "BODY",
        add_security_recommendation: authContent.addSecurity,
      },
      {
        type: "BUTTONS",
        buttons: [
          {
            type: "OTP",
            otp_type: "COPY_CODE",
            text: button.text,
          },
        ],
      },
    ];

    if (authContent.addExpiration && authContent.validity) {
      components.splice(1, 0, {
        type: "FOOTER",
        code_expiration_minutes: parseInt(authContent.validity),
      });
    }

    return {
      name: titleData.title,
      language: titleData.language,
      category: "AUTHENTICATION",
      components,
    };
  }, [titleData, authContent, button]);

  useEffect(() => {
    onChange?.(payload);
  }, [payload]);

  return (
    <div className="space-y-6">
      <TemplateTitleComponent onChange={setTitleData} />

      <CodeDeliverySetup />

      <AuthContentOptions onChange={setAuthContent} />

      <div className="space-y-2">
        <Label htmlFor="buttonText">Button</Label>
        <Input
          id="buttonText"
          placeholder="Copy Code"
          className="border-gray-300 focus-visible:ring-2 focus-visible:ring-green-500"
          value={button.text}
          onChange={(e) =>
            setButton((prev) => ({ ...prev, text: e.target.value }))
          }
        />
      </div>

      <div className="mt-6 p-4 border rounded-md bg-gray-50 text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-auto">
        {JSON.stringify(payload, null, 2)}
      </div>
    </div>
  );
};

export default Authentication;
