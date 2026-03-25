import { PipelineBoard } from "@/components/global/pipeline/board";
import { PermissionGuard } from "@/components/global/PermissionGuard";

export default function PipelinePage() {
  return (
    <PermissionGuard permission="pipeline">
       <div className="h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
          <PipelineBoard />
       </div>
    </PermissionGuard>
  );
}
