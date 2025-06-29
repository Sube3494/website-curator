import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function WebsiteCardSkeleton() {
  return (
    <Card className="group hover:shadow-xl transition-all duration-200 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function WebsiteGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <WebsiteCardSkeleton key={i} />
      ))}
    </div>
  )
}
