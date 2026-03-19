import { Card, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ChatHeaderSkeleton() {
  return (
    <Card className="border-0 rounded-none shadow-sm bg-white dark:bg-gray-900 animate-pulse">
      <CardHeader className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </CardHeader>
    </Card>
  );
}
