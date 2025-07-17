"use client";

import React from "react";
import { Bell, Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import WorkspaceSwitcher from "../workspace/WorkspaceSwitcher";

export default function DashboardHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
        Dashboard
      </h1>

      <div className="flex items-center gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm">
          <Plus size={16} />
          Add Template
        </button>

        <div className="relative">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </div>

        <WorkspaceSwitcher />

        <div className="w-9 h-9 flex items-center justify-center bg-indigo-500 rounded-full overflow-hidden">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
