import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";

const TemplateFooterComponent = ({ onChange, footerType }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="footer">
        Footer <span className="text-gray-500">(optional)</span>
      </Label>

      <Input
        id="footer"
        placeholder="e.g. Kabootar.ai"
        className="border-gray-300 focus-visible:ring-2 focus-visible:ring-green-500"
        // value={footerData?.text || ""}
        // onChange={handleFooterData}
      />
    </div>
  );
};

export default TemplateFooterComponent;
