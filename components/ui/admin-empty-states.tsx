import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AdminEmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function AdminEmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className = "" 
}: AdminEmptyStateProps) {
  return (
    <Card className={`border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-8 text-center">
        {icon && (
          <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
            {icon}
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md text-sm">
          {description}
        </p>
        {action && (
          <Button 
            onClick={action.onClick}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// 网站管理空状态
export function NoWebsitesFound({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur p-12 text-center">
      <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 inline-block">
        <span className="text-2xl">🔍</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        没有找到匹配的网站
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        尝试调整搜索关键词或筛选条件来查看更多结果
      </p>
      <Button 
        onClick={onClear}
        variant="outline"
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl"
      >
        清除筛选
      </Button>
    </div>
  )
}

export function NoWebsites() {
  return (
    <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur p-12 text-center">
      <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 inline-block">
        <span className="text-2xl">🌐</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        还没有网站
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        开始添加网站来构建您的收藏
      </p>
    </div>
  )
}

// 分类管理空状态
export function NoCategoriesFound({ onClear }: { onClear: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 inline-block">
        <span className="text-2xl">🔍</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        没有找到匹配的分类
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        尝试调整搜索关键词来查看更多结果
      </p>
      <Button 
        onClick={onClear}
        variant="outline"
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl"
      >
        清除搜索
      </Button>
    </div>
  )
}

export function NoCategories() {
  return (
    <div className="p-12 text-center">
      <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 inline-block">
        <span className="text-2xl">🏷️</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        还没有分类
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        创建分类来组织您的网站收藏
      </p>
    </div>
  )
}

// 用户管理空状态
export function NoUsersFound({ onClear }: { onClear: () => void }) {
  return (
    <div className="p-12 text-center">
      <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 inline-block">
        <span className="text-2xl">🔍</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        没有找到匹配的用户
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
        尝试调整搜索关键词来查看更多结果
      </p>
      <Button 
        onClick={onClear}
        variant="outline"
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl"
      >
        清除搜索
      </Button>
    </div>
  )
}

export function NoUsers() {
  return (
    <div className="p-12 text-center">
      <div className="mb-4 p-3 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 inline-block">
        <span className="text-2xl">👥</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        还没有用户
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        等待用户注册加入平台
      </p>
    </div>
  )
}
