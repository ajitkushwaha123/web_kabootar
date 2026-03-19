"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { FileQuestion, PlusCircle } from "lucide-react";

export function EmptyState({
  title = "No content available",
  description = "There’s nothing to display right now.",
  buttonLabel = "Add New",
  onClick,
  icon,
  gifSrc,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4 p-6 h-full w-full text-muted-foreground",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-center"
      >
        {gifSrc ? (
          <img
            src={gifSrc}
            alt="Empty State"
            className="h-32 w-32 object-contain opacity-80"
          />
        ) : (
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {icon || (
              <FileQuestion className="h-14 w-14 text-muted-foreground/70" />
            )}
          </motion.div>
        )}
      </motion.div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {onClick && (
        <Button onClick={onClick} className="mt-2 flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {buttonLabel}
        </Button>
      )}
    </div>
  );
}
