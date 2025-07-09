"use client";

import React, { useMemo, useState } from "react";
import TemplateCardPreview from "@/components/global/template/TemplateCardPreview";
import Tab from "@/components/global/template/template-builder/Tab/Tab";
import { useSearchParams } from "next/navigation";
import Authentication from "@/components/global/template/template-builder/template-type/Authentication";
import { Button } from "@/components/ui/button";
import { useTemplate } from "@/hooks/useTemplate";
import Utility from "@/components/global/template/template-builder/template-type/Utility";

const validCategories = ["MARKETING", "UTILITY", "AUTHENTICATION"];
const validTypes = [
  "CUSTOM",
  "CATALOG",
  "FLOWS",
  "ORDER_DETAILS",
  "ORDER_STATUS",
  "OTP",
];

const Page = () => {
  const [payload, setPayload] = useState(null);
  const searchParams = useSearchParams();
  const { addTemplate, createLoading, createError } = useTemplate();

  const type = searchParams.get("type");
  const category = searchParams.get("category");

  const isValid = useMemo(() => {
    return (
      type &&
      category &&
      validCategories.includes(category) &&
      validTypes.includes(type)
    );
  }, [type, category]);

  const handleSubmit = () => {
    if (!payload?.name || !payload?.components?.length) {
      alert("Payload is incomplete.");
      return;
    }

    addTemplate(payload);
  };

  const updatedPayload = useMemo(() => {
    if (!payload) return null;

    const updatedComponents = [...(payload.components || [])];

    const bodyIndex = updatedComponents.findIndex(
      (comp) => comp.type === "BODY"
    );

    if (bodyIndex !== -1) {
      const bodyComponent = updatedComponents[bodyIndex];

      if (!bodyComponent.text) {
        updatedComponents[bodyIndex] = {
          ...bodyComponent,
          text: "{{1}} is your verification code. For your security, do not share this code.",
        };
      }
    }

    return {
      ...payload,
      components: updatedComponents,
    };
  }, [payload]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {!isValid ? (
        <Tab />
      ) : (
        <>
          <div className="w-full md:w-[55%] p-4 bg-white rounded-xl space-y-6">
            {category === "AUTHENTICATION" && (
              <Authentication onChange={(data) => setPayload(data)} />
            )}

            {category === "UTILITY" && (
              <Utility getPayload={(data) => setPayload(data)} />
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border border-green-100 bg-white/90 rounded-xl shadow-sm">
              <Button
                onClick={handleSubmit}
                disabled={createLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm"
              >
                {createLoading ? "Submitting..." : "Submit"}
              </Button>
              {createError && (
                <p className="text-red-600 text-sm">{createError.message}</p>
              )}
            </div>
          </div>

          <div className="w-full md:w-[45%]">
            <div className="sticky top-0 overflow-y-auto p-4 bg-gray-50 rounded-xl shadow-inner">
              <TemplateCardPreview template={updatedPayload} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
