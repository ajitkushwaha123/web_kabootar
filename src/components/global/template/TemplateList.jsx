"use client";

import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import DataTable from "../table/DataTable";

const templates = [
  {
    id: "1",
    name: "order_update",
    status: "approved",
    language: "English",
    category: "Utility",
    updatedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "2",
    name: "promo_offer",
    status: "pending",
    language: "Hindi",
    category: "Marketing",
    updatedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: "3",
    name: "otp_verification",
    status: "rejected",
    language: "English",
    category: "Authentication",
    updatedAt: new Date(Date.now() - 86400000),
  },
];

const statusStyles = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-700",
};

const columns = [
  { header: "Name", accessor: "name" },
  {
    header: "Status",
    render: (t) => (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
          statusStyles[t.status]
        }`}
      >
        {t.status}
      </span>
    ),
  },
  { header: "Language", accessor: "language" },
  { header: "Category", accessor: "category" },
  {
    header: "Updated",
    render: (t) => formatDistanceToNow(t.updatedAt, { addSuffix: true }),
  },
  {
    header: "Actions",
    className: "text-right",
    render: () => (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon">
          <Eye className="w-4 h-4 text-green-600" />
        </Button>
        <Button variant="ghost" size="icon">
          <Pencil className="w-4 h-4 text-yellow-600" />
        </Button>
        <Button variant="ghost" size="icon">
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    ),
  },
];

export default function TemplateList() {
  return <DataTable columns={columns} data={templates} />;
}
