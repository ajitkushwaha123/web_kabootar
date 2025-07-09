"use client";

import TemplateGallery from "@/components/global/template/TemplateGallery";
import { useTemplate } from "@/hooks/useTemplate";
import { useTemplateFilter } from "@/hooks/useTemplateFilter";
import React, { useEffect, useState } from "react";

const page = () => {
  const { getTemplateLibrary, templateLibrary, libraryLoading, libraryError } =
    useTemplate();

  const { filters } = useTemplateFilter();

  useEffect(() => {
    getTemplateLibrary(filters);
  }, [filters]);

  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-sm">
      <TemplateGallery
        templates={templateLibrary}
        library={true}
        loading={libraryLoading}
        error={libraryError}
      />
    </div>
  );
};

export default page;
