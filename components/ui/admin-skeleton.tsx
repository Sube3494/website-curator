import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 统计卡片骨架屏
export function StatsCardSkeleton() {
  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  )
}

// 网站管理表格骨架屏
export function WebsiteTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-gray-700">
            <TableHead className="font-semibold">Website</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Submitted By</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 rounded-full" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// 分类管理表格骨架屏
export function CategoryTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-200 dark:border-gray-700">
          <TableHead className="font-semibold">Category</TableHead>
          <TableHead className="font-semibold">Color Preview</TableHead>
          <TableHead className="font-semibold">Websites</TableHead>
          <TableHead className="font-semibold">Created</TableHead>
          <TableHead className="font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800">
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// 用户管理表格骨架屏
export function UserTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-gray-200 dark:border-gray-700">
          <TableHead className="font-semibold">User</TableHead>
          <TableHead className="font-semibold">Role</TableHead>
          <TableHead className="font-semibold">Joined</TableHead>
          <TableHead className="font-semibold">Status</TableHead>
          <TableHead className="font-semibold">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i} className="border-b border-gray-100 dark:border-gray-800">
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
