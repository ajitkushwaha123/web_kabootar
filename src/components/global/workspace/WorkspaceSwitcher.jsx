"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CreateWorkspaceForm from "./CreateWorkspaceForm";
import { useWorkspace } from "@/hooks/useWorkspace";

export default function WorkspaceSwitcher() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    workspaces,
    currentWorkspace,
    getWorkspace,
    selectWorkspace,
    fetchLoading,
    createLoading,
  } = useWorkspace();

  useEffect(() => {
    getWorkspace();
  }, []);

  useEffect(() => {
    if (Array.isArray(workspaces) && workspaces.length > 0) {
      const storedId = localStorage.getItem("currentWorkspaceId");
      const exists = workspaces.find((ws) => ws._id === storedId);
      if (storedId && exists) {
        selectWorkspace(storedId);
      } else {
        selectWorkspace(workspaces[0]._id);
      }
    }
  }, [workspaces]);

  const handleSelect = (id) => {
    selectWorkspace(id);
    localStorage.setItem("currentWorkspaceId", id);
  };

  const selected =
    currentWorkspace || (Array.isArray(workspaces) ? workspaces[0] : null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-3 px-3 py-2 border-2 border-gray-300 hover:bg-muted transition rounded-lg"
          >
            {selected ? (
              <>
                {selected.logo ? (
                  <img
                    src={selected.logo}
                    alt={selected.name}
                    className="w-6 h-6 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-slate-200 flex items-center justify-center text-xs font-semibold text-gray-700 uppercase">
                    {selected.name?.[0] || "?"}
                  </div>
                )}
                <span className="font-medium text-sm max-w-[120px] truncate">
                  {selected.name}
                </span>
              </>
            ) : (
              <span className="font-medium text-sm text-muted-foreground">
                No workspace selected
              </span>
            )}
            <ChevronDown className="w-4 h-4 opacity-60" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          sideOffset={8}
          className="w-[280px] rounded-xl mr-[30px] shadow-lg p-2 bg-white border border-slate-100"
        >
          <AnimatePresence>
            {fetchLoading ? (
              <motion.div
                className="flex items-center justify-center p-6 text-muted-foreground text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </motion.div>
            ) : (
              Array.isArray(workspaces) &&
              workspaces.map((space) => (
                <motion.div
                  key={space._id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  <DropdownMenuItem
                    onClick={() => handleSelect(space._id)}
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition cursor-pointer"
                  >
                    {space.logo ? (
                      <img
                        src={space.logo}
                        alt={space.name}
                        className="w-8 h-8 rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-slate-200 flex items-center justify-center text-sm font-semibold text-gray-700 uppercase">
                        {space.name?.[0] || "?"}
                      </div>
                    )}
                    <div className="flex flex-col max-w-[160px]">
                      <p className="text-sm font-medium truncate">
                        {space.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {space.role || "member"}
                      </p>
                    </div>
                  </DropdownMenuItem>
                </motion.div>
              ))
            )}

            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <DropdownMenuItem
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-3 p-3 text-sm font-medium rounded-md cursor-pointer hover:bg-slate-50 mt-1 border-t pt-3"
              >
                <div className="flex items-center justify-center w-6 h-6 border border-dashed rounded-sm text-muted-foreground">
                  <Plus className="w-4 h-4" />
                </div>
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create new workspace"
                )}
              </DropdownMenuItem>
            </motion.div>
          </AnimatePresence>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceForm
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </>
  );
}
