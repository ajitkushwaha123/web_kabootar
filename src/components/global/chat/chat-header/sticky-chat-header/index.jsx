"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPhone, UserAvatar } from "@/helper/transform";

export default function StickyChatHeader({ name, phone }) {
  return (
    <>
      <Card className="border-0 rounded-none shadow-sm bg-white dark:bg-gray-900">
        <CardHeader className="flex flex-row items-center justify-between px-4 cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-full overflow-hidden border">
              {UserAvatar({
                name,
                imageUrl: null,
                size: "md",
              })}
            </div>
            <div>
              <CardTitle className="text-base font-semibold leading-tight">
                {name || "-"}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPhone(phone) || "-"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    </>
  );
}
