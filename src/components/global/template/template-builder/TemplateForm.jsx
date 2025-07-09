"use client";

import React, { useState, useEffect } from "react";
import TemplateHeaderComponent from "./Header/TemplateHeaderComponent";
import TemplateBodyComponent from "./Body/TemplateBodyComponent";
import TemplateButtonComponent from "./Button/TemplateButtonComponent";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LanguageSelect from "../language-picker/LanguagePicker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTemplate } from "@/hooks/useTemplate";
import { Loader2 } from "lucide-react";
import TemplateTitleComponent from "./Title/TemplateTitleComponent";

const TemplateForm = ({ getPayload }) => {
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("en");
  const [headerData, setHeaderData] = useState(null);
  const [bodyData, setBodyData] = useState(null);
  const [footerData, setFooterData] = useState(null);
  const [buttonData, setButtonData] = useState([]);

  const { addTemplate, createLoading, createError } = useTemplate();

  useEffect(() => {
    const payload = generatePayload();
    if (getPayload) getPayload(payload);
  }, [title, language, headerData, bodyData, footerData, buttonData]);

  const handleFooterData = (e) => {
    const value = e.target.value;
    setFooterData(value ? { type: "FOOTER", text: value } : null);
  };

  const generatePayload = () => {
    const components = [];

    if (headerData) components.push(headerData);
    if (bodyData) components.push(bodyData);
    if (footerData) components.push(footerData);
    if (buttonData?.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: buttonData,
      });
    }

    return {
      name: title || "untitled_template",
      language: language || "en",
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
      <TemplateTitleComponent />
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
          value={footerData?.text || ""}
          onChange={handleFooterData}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Generated Payload
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-muted rounded-md text-xs font-mono text-muted-foreground p-4 max-h-[400px] overflow-auto">
          <pre>{JSON.stringify(generatePayload(), null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateForm;
