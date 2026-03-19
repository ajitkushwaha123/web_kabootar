"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTemplate } from "@/hooks/useTemplate";
import { Loader2 } from "lucide-react";
import TemplateBodyComponent from "../Body/TemplateBodyComponent";
import TemplateButtonComponent from "../Button/TemplateButtonComponent";
import TemplateHeaderComponent from "../Header/TemplateHeaderComponent";
import TemplateTitleComponent from "../Title/TemplateTitleComponent";

const Utility = ({ getPayload }) => {
  const [titleData, setTitleData] = useState({ title: "", language: "en_US" });
  const [headerData, setHeaderData] = useState(null);
  const [bodyData, setBodyData] = useState(null);
  const [footerText, setFooterText] = useState("");
  const [buttonData, setButtonData] = useState([]);

  const { addTemplate, createLoading, createError } = useTemplate();

  useEffect(() => {
    const payload = generatePayload();
    if (getPayload) getPayload(payload);
  }, [titleData, headerData, bodyData, footerText, buttonData]);

  const generatePayload = () => {
    const components = [];

    if (headerData) components.push(headerData);
    if (bodyData) components.push(bodyData);
    if (footerText?.trim()) {
      components.push({ type: "FOOTER", text: footerText.trim() });
    }
    if (buttonData?.length > 0) {
      components.push({ type: "BUTTONS", buttons: buttonData });
    }

    return {
      name: titleData.title || "untitled_template",
      language: titleData.language || "en_US",
      category: "UTILITY",
      components,
    };
  };

  const handleTemplateCreation = async () => {
    const payload = generatePayload();

    const cleanPayload = {
      ...payload,
      components: payload.components.map((component) => {
        if (component.example) {
          const { previewUrl, ...restExample } = component.example;
          return { ...component, example: restExample };
        }
        return component;
      }),
    };

    addTemplate(cleanPayload);
  };

  return (
    <div className="space-y-8">
      <TemplateTitleComponent onChange={setTitleData} />
      <TemplateHeaderComponent setData={setHeaderData} />
      <TemplateBodyComponent onChange={setBodyData} />

      <div className="space-y-2">
        <Label htmlFor="footer">
          Footer <span className="text-gray-500">(optional)</span>
        </Label>
        <Input
          id="footer"
          placeholder="e.g. Kabootar.ai"
          className="border-gray-300 focus-visible:ring-2 focus-visible:ring-green-500"
          value={footerText}
          onChange={(e) => setFooterText(e.target.value)}
        />
      </div>

      <TemplateButtonComponent onChange={setButtonData} />

      <div>
        <Button
          onClick={handleTemplateCreation}
          disabled={createLoading}
          className="w-full md:w-auto"
        >
          {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Template
        </Button>
        {createError && (
          <p className="text-red-500 text-sm mt-2">{createError}</p>
        )}
      </div>

      {/* <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Generated Payload
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-muted rounded-md text-xs font-mono text-muted-foreground p-4 max-h-[400px] overflow-auto">
          <pre>{JSON.stringify(generatePayload(), null, 2)}</pre>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default Utility;
