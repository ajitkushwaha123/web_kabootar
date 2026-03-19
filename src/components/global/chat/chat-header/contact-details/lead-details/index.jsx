"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Loader2, Edit2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Skeleton while fetching
export const LeadSkeleton = () => (
  <div className="animate-pulse p-6 border rounded-lg shadow-sm bg-card space-y-4">
    <div className="h-6 w-1/2 bg-gray-300 rounded" />
    <div className="h-4 w-full bg-gray-300 rounded" />
    <div className="h-4 w-3/4 bg-gray-300 rounded" />
  </div>
);

// API calls
const leadAPI = {
  fetchLead: async (leadId) => {
    const { data } = await axios.get(`/api/organization/inbox/leads/${leadId}`);
    return data.lead || null;
  },
  updateLead: async (leadId, payload) => {
    const { data } = await axios.put(
      `/api/organization/inbox/leads/${leadId}`,
      payload
    );
    return data.lead;
  },
  markAsLead: async (conversationId, payload) => {
    const { data } = await axios.post(`/api/organization/inbox/leads`, {
      conversationId,
      ...payload,
    });
    return data.lead;
  },
};

// Reusable Lead Form Dialog
function LeadFormDialog({
  initialValues,
  onSubmit,
  open,
  setOpen,
  submitLabel,
}) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().trim().required("Title is required"),
      description: Yup.string().trim(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await onSubmit(values);
        setOpen(false);
      } catch (err) {
        console.error(err);
        toast.error("Action failed");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{submitLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{submitLabel}</DialogTitle>
          <DialogDescription>
            Enter title and description for this lead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loading}
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-red-500">{formik.errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={loading}
            />
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </div>
              ) : (
                submitLabel
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export function LeadDetails({
  isLead,
  leadId,
  conversationId,
  onLeadStatusChange,
}) {
  const [lead, setLead] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [markOpen, setMarkOpen] = useState(false);

  // Fetch lead
  useEffect(() => {
    if (!leadId) {
      setFetching(false);
      return;
    }
    setFetching(true);
    leadAPI
      .fetchLead(leadId)
      .then((data) => setLead(data))
      .catch(() => toast.error("Failed to fetch lead"))
      .finally(() => setFetching(false));
  }, [leadId]);

  if (fetching) return <LeadSkeleton />;

  const handleMarkAsLead = async (values) => {
    const newLead = await leadAPI.markAsLead(conversationId, values);
    setLead(newLead);
    toast.success("Marked as lead successfully");
    onLeadStatusChange(true, newLead._id);
  };

  const handleEditLead = async (values) => {
    const updatedLead = await leadAPI.updateLead(leadId, values);
    setLead(updatedLead);
    toast.success("Lead updated successfully");
  };

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white dark:bg-gray-900 space-y-6">
      {isLead && lead ? (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {lead.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {lead.description || "No description"}
            </p>
          </div>
          <LeadFormDialog
            initialValues={{
              title: lead.title,
              description: lead.description || "",
            }}
            onSubmit={handleEditLead}
            open={editOpen}
            setOpen={setEditOpen}
            submitLabel={
              <span className="flex items-center gap-1">
                <Edit2 className="w-4 h-4" /> Edit
              </span>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
          <Star className="w-12 h-12 text-yellow-500" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            This is not a lead
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-center">
            You can mark this conversation as a lead to track it.
          </p>
          <LeadFormDialog
            initialValues={{ title: "", description: "" }}
            onSubmit={handleMarkAsLead}
            open={markOpen}
            setOpen={setMarkOpen}
            submitLabel="Mark as Lead"
          />
        </div>
      )}
    </div>
  );
}
