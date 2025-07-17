"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useInvitations } from "@/hooks/useInvitation";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useEffect } from "react";

export default function InviteWorkspaceMember({ open, onOpenChange }) {
  const { currentWorkspace } = useWorkspace();
  const { sendInvitations, inviteSendLoading, inviteSendError } =
    useInvitations();

  const formik = useFormik({
    initialValues: {
      email: "",
      role: "member",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email is required"),
      role: Yup.string().oneOf(["member", "admin"]).required(),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!currentWorkspace?._id) return;

      try {
        await sendInvitations({
          payload: {
            email: values.email,
            role: values.role,
          },
          workspaceId: currentWorkspace._id,
        });
        resetForm();
        onOpenChange(false);
      } catch (err) {}
    },
  });

  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white shadow-xl space-y-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Invite Member
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@domain.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={inviteSendLoading}
              className="bg-gray-50 focus:ring-green-500 focus:border-green-500"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500 font-medium">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">
              Role
            </label>
            <Select
              value={formik.values.role}
              onValueChange={(value) => formik.setFieldValue("role", value)}
              disabled={inviteSendLoading}
            >
              <SelectTrigger className="w-full focus:ring-green-500 focus:border-green-500">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {inviteSendError && (
            <p className="text-sm text-red-500 font-medium">
              {inviteSendError}
            </p>
          )}

          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              disabled={!formik.isValid || inviteSendLoading}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-5 py-2"
            >
              {inviteSendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
