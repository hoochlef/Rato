import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesSliderSkeleton(){
    return (
        <div className="relative w-full overflow-hidden">
        <div className="flex overflow-x-auto pb-4 hide-scrollbar gap-2 px-1">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 border border-stone-200 bg-stone-100"
            >
              <Skeleton className="h-6 w-6 rounded-full bg-stone-300" />
              <Skeleton className="h-4 w-20 bg-stone-300" />
            </div>
          ))}
        </div>
      </div>
    )
}