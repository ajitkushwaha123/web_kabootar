"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const AuthContentOptions = ({ onChange }) => {
  const [addSecurity, setAddSecurity] = useState(true);
  const [addExpiration, setAddExpiration] = useState(true);
  const [validity, setValidity] = useState("10");
  const [unit, setUnit] = useState("minutes");

  useEffect(() => {
    onChange?.({
      addSecurity,
      addExpiration,
      validity: addExpiration ? validity : null,
      unit: addExpiration ? unit : null,
    });
  }, [addSecurity, addExpiration, validity, unit, onChange]);

  return (
    <div className="space-y-6 border border-green-100 p-6 rounded-md bg-white shadow-sm">
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-gray-600">Content</h3>
        <p className="text-sm text-gray-600">
          Content for authentication message templates can't be edited. You can
          add additional content from the options below.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="security-recommendation"
            checked={addSecurity}
            onCheckedChange={setAddSecurity}
            className={"border-green-300 focus-visible:ring-2 focus-visible:ring-green-500"}
          />
          <Label
            htmlFor="security-recommendation"
            className="text-sm text-gray-800"
          >
            Add security recommendation
          </Label>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="expiration-time"
            checked={addExpiration}
            onCheckedChange={setAddExpiration}
            className={"border-green-300 focus-visible:ring-2 focus-visible:ring-green-500"}
          />
          <Label htmlFor="expiration-time" className="text-sm text-gray-800">
            Add expiration time for the code
          </Label>
        </div>

        {addExpiration && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-3">
            <Label
              htmlFor="validity"
              className="text-sm font-medium text-green-800"
            >
              Expires in
            </Label>

            <div className="flex gap-3 items-center">
              <Input
                type="number"
                id="validity"
                min={1}
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                className="w-24 border-green-300 focus-visible:ring-2 focus-visible:ring-green-500"
                placeholder="10"
                max={90}
              />

              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="w-36 border-green-300 focus-visible:ring-2 focus-visible:ring-green-500">
                  <SelectValue placeholder="minutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthContentOptions;
