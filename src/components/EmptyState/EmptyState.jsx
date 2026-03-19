"use client";

import { Button } from "@/components/ui/button";
import { FilePlus } from "lucide-react";
import Link from "next/link";

export default function EmptyState({ url = "#" }) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-md shadow-sm border border-gray-100">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <FilePlus className="w-8 h-8 text-green-500" />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        No Templates Found
      </h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        It looks like you haven’t created any message templates yet. Start by
        creating a new one and manage your customer communication efficiently.
      </p>

      <Link href={url}>
        <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 text-sm rounded-md">
          Create New Template
        </Button>
      </Link>
    </div>
  );
}
