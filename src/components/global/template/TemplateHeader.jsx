"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const statusOptions = ["All", "APPROVED", "PENDING", "REJECTED"];

export default function TemplateHeader({ onChangeStatus }) {
  const [selectedStatus, setSelectedStatus] = useState("All");

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    if (onChangeStatus) {
      onChangeStatus(status);
    }
  };

  return (
    <div className="bg-green-50 border border-green-100 rounded-xl px-6 py-5 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-green-700">
            WhatsApp Message Templates
          </h1>
          <p className="text-sm text-green-600">
            Manage and preview all your approved or pending message templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-green-300 text-green-700 hover:bg-green-100"
              >
                <Filter className="w-4 h-4" />
                <span>{selectedStatus}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => handleStatusChange(status)}
                >
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href={"/template/template-builder"}>
            <Button className="flex cursor-pointer items-center gap-2 bg-green-500 hover:bg-green-600 text-white shadow-md">
              <Plus className="w-4 h-4" />
              Create New Template
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
