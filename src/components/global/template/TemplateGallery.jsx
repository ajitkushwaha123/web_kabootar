"use client";

import TemplateCardPreview from "./TemplateCardPreview";
import { AlertTriangle } from "lucide-react";
import TemplateCardLibraryPreview from "./TemplateLibraryCardPreview";
import Loader from "@/components/ui/loader";

export default function TemplateGallery({
  templates,
  loading,
  error,
  library = false,
}) {
  const renderLoader = () => (
    <div className="w-full col-span-full flex justify-center items-center min-h-[300px]">
      <Loader size={32} />
    </div>
  );

  const renderError = () => (
    <div className="w-full col-span-full text-center bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl flex flex-col items-center justify-center gap-2">
      <AlertTriangle className="w-6 h-6" />
      <p className="text-sm font-medium">Failed to load templates.</p>
      <p className="text-xs text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5 p-4">
      {loading && renderLoader()}
      {!loading && error && renderError()}
      {!loading &&
        !error &&
        templates?.map((t) => (
          <div
            key={t.id}
            className="transition-transform rounded-2xl hover:scale-[1.01] hover:shadow-md flex flex-col bg-white"
          >
            {library ? (
              <TemplateCardLibraryPreview template={t} />
            ) : (
              <TemplateCardPreview template={t} />
            )}
          </div>
        ))}
    </div>
  );
}
