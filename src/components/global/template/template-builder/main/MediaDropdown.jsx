"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Image, Video, FileText, MapPin, Ban } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function MediaDropdown({ onChange }) {
  const [selected, setSelected] = useState("none");

  const handleChange = (value) => {
    setSelected(value);
    onChange?.(value);
  };

  const options = [
    { label: "None", value: "none", icon: <Ban className="w-4 h-4 mr-2" /> },
    {
      label: "Image",
      value: "image",
      icon: <Image className="w-4 h-4 mr-2" />,
    },
    {
      label: "Video",
      value: "video",
      icon: <Video className="w-4 h-4 mr-2" />,
    },
    {
      label: "Document",
      value: "document",
      icon: <FileText className="w-4 h-4 mr-2" />,
    },
    {
      label: "Location",
      value: "location",
      icon: <MapPin className="w-4 h-4 mr-2" />,
    },
  ];

  return (
    <div className="space-y-1">
      <Label htmlFor="media-type" className="text-sm font-medium">
        Media sample <span className="text-gray-400">(Optional)</span>
      </Label>
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="w-full border-gray-300">
          <SelectValue placeholder="Select Media Type" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              <div className="flex items-center">
                {opt.icon}
                {opt.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
