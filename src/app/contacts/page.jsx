"use client";

import React, { useEffect, useRef, useCallback } from "react";
import PageHeader from "@/components/global/PageHeader/page";
import DataTable from "@/components/global/table/DataTable";
import { useContact } from "@/hooks/useContact";

export default function ContactTablePage() {
  const { contacts, loadContacts, loading, error, hasMore, nextCursor } =
    useContact();

  const observer = useRef();

  const lastContactRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadContacts({ cursor: nextCursor });
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, nextCursor]
  );

  useEffect(() => {
    loadContacts(); // initial load
  }, []);

  const contactColumns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Phone",
      accessor: "customerPhone",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Tags",
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {row.tags?.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Location",
      render: (row) =>
        `${row.location?.city || ""}, ${row.location?.state || ""}, ${
          row.location?.country || ""
        }`,
    },
  ];

  return (
    <div className="p-6 mx-auto">
      <PageHeader
        title="All Contacts"
        description="Manage and organize your saved contact list."
        filterOptions={["All", "Lead", "VIP", "New"]}
        onFilterChange={(val) => console.log("Selected:", val)}
        buttonText="Add New Contact"
        buttonLink="/contacts/create"
      />

      {loading && contacts.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">Loading contacts...</p>
      )}

      {error && contacts.length === 0 && (
        <p className="text-red-500 text-sm mt-4">Error: {error}</p>
      )}

      {!loading && !error && contacts.length === 0 && (
        <p className="text-gray-500 text-sm mt-4">No contacts found.</p>
      )}

      {contacts.length > 0 && (
        <>
          <DataTable
            columns={contactColumns}
            data={contacts}
            rowKey={(row) => row._id}
          />

          {hasMore && (
            <div
              ref={lastContactRef}
              className="h-12 flex justify-center items-center mt-4"
            >
              <p className="text-gray-500 text-sm">Loading more...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
