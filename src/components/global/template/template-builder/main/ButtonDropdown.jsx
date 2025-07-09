"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Phone,
  Clipboard,
  ChevronDown,
  ArrowRightLeft,
  FolderDownIcon,
  BotMessageSquare,
} from "lucide-react";

export default function ButtonDropdown({ onChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          + Add button
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 mt-2">
        <DropdownMenuItem
          onClick={() => onChange("CUSTOM")}
          className="flex items-center gap-2"
        >
          <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
          Custom
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onChange("URL")}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground" />
          Visit website
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onChange("PHONE_NUMBER")}
          className="flex items-center gap-2"
        >
          <Phone className="w-4 h-4 text-muted-foreground" />
          Call phone number
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onChange("COPY_CODE")}
          className="flex items-center gap-2"
        >
          <Clipboard className="w-4 h-4 text-muted-foreground" />
          Copy offer code
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onChange("FLOW")}
          className="flex items-center gap-2"
        >
          <FolderDownIcon className="w-4 h-4 text-muted-foreground" />
          FLOW
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onChange("MPM")}
          className="flex items-center gap-2"
        >
          <BotMessageSquare className="w-4 h-4 text-muted-foreground" />
          MPM
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
