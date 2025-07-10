"use client";
import TemplateGallery from "@/components/global/template/TemplateGallery";
import TemplateHeader from "@/components/global/template/TemplateHeader";
import { useTemplate } from "@/hooks/useTemplate";
import React, { useEffect, useState } from "react";

const page = () => {
  const { templates, fetchLoading, fetchError, getTemplates } = useTemplate();

  useEffect(() => {
    getTemplates({ status: "ALL" });
  }, []);

  const handleStatusChange = (status) => {
    if (status === "ALL") {
      getTemplates({ status });
    } else {
      getTemplates({ status });
    }
  };

  return (
    <div>
      <TemplateHeader onChangeStatus={(status) => handleStatusChange(status)} />
      <TemplateGallery
        templates={templates}
        loading={fetchLoading}
        error={fetchError}
      />
    </div>
  );
};

export default page;
