import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function BusinessCard() {
  return (
    <Card className="flex p-4 gap-4 shadow-sm hover:shadow-md rounded-xs">
      {/* Image Section */}
      <div className="w-[150px] h-[120px] shrink-0">
        <Skeleton className="w-full h-full rounded-md" />
      </div>

      {/* Text Section */}
      <div className="flex flex-col justify-between flex-1 py-1">
        {/* Business Name */}
        <Skeleton className="h-5 w-1/2" />

        {/* Rating */}
        <div className="flex gap-2 items-center mt-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded-full" />
            ))}
          </div>
          <Skeleton className="h-4 w-6" />
          <Skeleton className="h-4 w-10" />
        </div>

        {/* Location */}
        <div className="flex gap-2 items-center mt-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 mt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </Card>
  );
}

export default function BusinessCardGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 py-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <BusinessCard key={index} />
      ))}
    </div>
  );
}
