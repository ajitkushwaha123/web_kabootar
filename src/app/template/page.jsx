"use client";
import TemplateGallery from "@/components/global/template/TemplateGallery";
import TemplateHeader from "@/components/global/template/TemplateHeader";
import { useTemplate } from "@/hooks/useTemplate";
import React, { useEffect } from "react";

const page = () => {
  const { templates, fetchLoading, fetchError, getTemplates } = useTemplate();

  useEffect(() => {
    getTemplates();
  }, []);

  return (
    <div>
      <TemplateHeader />
      <TemplateGallery
        templates={templates}
        loading={fetchLoading}
        error={fetchError}
      />
    </div>
  );
};

export default page;
