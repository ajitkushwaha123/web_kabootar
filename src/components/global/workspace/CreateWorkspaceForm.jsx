"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useFormik } from "formik";
import slugify from "slugify";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function CreateWorkspaceForm({ open, onOpenChange }) {
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);

  const { addWorkspace, createLoading, createError } = useWorkspace();

  const formik = useFormik({
    initialValues: {
      name: "",
      slug: "",
    },
    onSubmit: async (values, { resetForm }) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("metadata", JSON.stringify({}));
      if (logo) {
        formData.append("logo", logo);
      }

      const result = await addWorkspace(formData);
      if (!createError) {
        resetForm();
        setLogo(null);
        onOpenChange(false);
      }
    },
  });

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setLogo(e.target.files[0]);
    }
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    formik.setFieldValue("name", value);
    formik.setFieldValue(
      "slug",
      slugify(value, { lower: true }).replace(/\./g, "")
    );
  };

  const handleSlugChange = (e) => {
    formik.setFieldValue(
      "slug",
      slugify(e.target.value, { lower: true }).replace(/\./g, "")
    );
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-xl space-y-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Create Workspace
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed cursor-pointer overflow-hidden bg-muted/30 hover:bg-muted transition duration-200">
              {logo ? (
                <img
                  src={URL.createObjectURL(logo)}
                  alt="Logo preview"
                  className="object-cover h-full w-full"
                />
              ) : (
                <UploadCloud className="w-6 h-6 text-muted-foreground" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </label>

            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                1:1 ratio • Max 10MB
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                placeholder="My Workspace"
                name="name"
                value={formik.values.name}
                onChange={handleNameChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <Input
                placeholder="my-workspace"
                name="slug"
                value={formik.values.slug}
                onChange={handleSlugChange}
              />
            </div>

            {createError && (
              <p className="text-sm text-red-500 pt-1">{createError}</p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!formik.values.name.trim() || createLoading}
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Workspace"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
