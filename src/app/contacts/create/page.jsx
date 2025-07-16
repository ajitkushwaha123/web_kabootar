"use client";

import PageHeader from "@/components/global/PageHeader/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useContact } from "@/hooks/useContact";

export default function ContactUploadPage() {
  const [contacts, setContacts] = useState([
    { name: "", customerPhone: "", email: "", tags: "" },
  ]);

  const { uploadLoading, uploadContacts } = useContact();

  const handleAddRow = () => {
    setContacts((prev) => [
      ...prev,
      { name: "", customerPhone: "", email: "", tags: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const handleSubmit = async () => {
    const payload = contacts.map((c) => ({
      ...c,
      tags: c.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }));

    const res = await uploadContacts(payload);

    if (res.meta.requestStatus === "fulfilled") {
      toast.success(`${res.payload.insertedCount} contacts added successfully`);
      setContacts([{ name: "", customerPhone: "", email: "", tags: "" }]);
    } else {
      toast.error(res.payload || "Upload failed");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <PageHeader
        title="Bulk Upload Contacts"
        description="Add multiple contacts at once and organize them with tags."
        showFilter={false}
        showButton={false}
      />

      <div className="rounded-md border border-slate-200 overflow-x-auto shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tags</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((row, index) => (
              <tr key={index} className="border-t border-slate-100">
                <td className="px-4 py-2">
                  <Input
                    value={row.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    placeholder="Name"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={row.customerPhone}
                    onChange={(e) =>
                      handleChange(index, "customerPhone", e.target.value)
                    }
                    placeholder="+91..."
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={row.email}
                    onChange={(e) =>
                      handleChange(index, "email", e.target.value)
                    }
                    placeholder="email@example.com"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={row.tags}
                    onChange={(e) =>
                      handleChange(index, "tags", e.target.value)
                    }
                    placeholder="lead, vip"
                  />
                </td>
                <td className="px-2 py-2 text-right">
                  {contacts.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-4 items-center">
        <Button variant="outline" onClick={handleAddRow}>
          <Plus className="w-4 h-4 mr-1" />
          Add Row
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={uploadLoading}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
        >
          <Upload className="w-4 h-4" />
          {uploadLoading ? "Uploading..." : "Upload Contacts"}
        </Button>
      </div>
    </div>
  );
}
