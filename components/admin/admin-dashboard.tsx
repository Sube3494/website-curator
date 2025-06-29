"use client"

import { useState, useMemo, useCallback, useEffect } from "react"

// 简单的防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null
  return ((...args: any[]) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}
import {
  Search,
  Users,
  Globe,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Plus,
  Activity,
  Zap,
  Palette,
  Tag,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSupabaseAuth } from "@/lib/supabase-auth-context"
import {
  useAllWebsites,
  useCategories,
  useAddWebsite,
  useUpdateWebsite,
  useDeleteWebsite,
  useCategoriesWithUsage,
  useAddCategory,
  useUpdateCategory,
  useDeleteCategory
} from "@/lib/hooks/use-websites"
import {
  useAllUsers,
  useUpdateUser,
  useUpdateUserStatus,
  useUpdateUserRole,
  useRefreshUsers
} from "@/lib/hooks/use-users"
import { SystemSettingsPage } from "@/components/settings/system-settings-page"
import { Website as SupabaseWebsite, Category, CategoryWithUsage, User } from "@/lib/supabase"
import {
  WebsiteTableSkeleton,
  CategoryTableSkeleton,
  UserTableSkeleton,
  StatsCardSkeleton
} from "@/components/ui/admin-skeleton"
import {
  NoWebsitesFound,
  NoWebsites,
  NoCategoriesFound,
  NoCategories,
  NoUsersFound,
  NoUsers
} from "@/components/ui/admin-empty-states"
import { toast } from "sonner"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// 预设颜色组合 - 按主题分组
const COLOR_PRESETS = {
  warm: [
    { name: "Red to Pink", from: "red-500", to: "pink-500", fromHex: "#ef4444", toHex: "#ec4899" },
    { name: "Rose to Red", from: "rose-500", to: "red-600", fromHex: "#f43f5e", toHex: "#dc2626" },
    { name: "Orange to Amber", from: "orange-500", to: "amber-500", fromHex: "#f97316", toHex: "#f59e0b" },
    { name: "Amber to Yellow", from: "amber-500", to: "yellow-400", fromHex: "#f59e0b", toHex: "#facc15" },
    { name: "Yellow to Orange", from: "yellow-400", to: "orange-400", fromHex: "#facc15", toHex: "#fb923c" },
  ],
  cool: [
    { name: "Blue to Cyan", from: "blue-500", to: "cyan-500", fromHex: "#3b82f6", toHex: "#06b6d4" },
    { name: "Cyan to Teal", from: "cyan-500", to: "teal-500", fromHex: "#06b6d4", toHex: "#14b8a6" },
    { name: "Teal to Emerald", from: "teal-500", to: "emerald-500", fromHex: "#14b8a6", toHex: "#10b981" },
    { name: "Emerald to Green", from: "emerald-500", to: "green-500", fromHex: "#10b981", toHex: "#22c55e" },
    { name: "Green to Lime", from: "green-500", to: "lime-400", fromHex: "#22c55e", toHex: "#a3e635" },
  ],
  purple: [
    { name: "Purple to Violet", from: "purple-500", to: "violet-500", fromHex: "#a855f7", toHex: "#8b5cf6" },
    { name: "Violet to Indigo", from: "violet-500", to: "indigo-500", fromHex: "#8b5cf6", toHex: "#6366f1" },
    { name: "Indigo to Blue", from: "indigo-500", to: "blue-500", fromHex: "#6366f1", toHex: "#3b82f6" },
    { name: "Pink to Purple", from: "pink-500", to: "purple-500", fromHex: "#ec4899", toHex: "#a855f7" },
    { name: "Fuchsia to Pink", from: "fuchsia-500", to: "pink-400", fromHex: "#d946ef", toHex: "#f472b6" },
  ],
  neutral: [
    { name: "Gray to Slate", from: "gray-500", to: "slate-600", fromHex: "#6b7280", toHex: "#475569" },
    { name: "Slate to Gray", from: "slate-500", to: "gray-600", fromHex: "#64748b", toHex: "#4b5563" },
    { name: "Zinc to Stone", from: "zinc-500", to: "stone-600", fromHex: "#71717a", toHex: "#57534e" },
    { name: "Stone to Neutral", from: "stone-500", to: "neutral-600", fromHex: "#78716c", toHex: "#525252" },
  ],
  special: [
    { name: "Sunset", from: "orange-400", to: "pink-500", fromHex: "#fb923c", toHex: "#ec4899" },
    { name: "Ocean", from: "blue-400", to: "teal-500", fromHex: "#60a5fa", toHex: "#14b8a6" },
    { name: "Forest", from: "green-400", to: "emerald-600", fromHex: "#4ade80", toHex: "#059669" },
    { name: "Aurora", from: "purple-400", to: "cyan-400", fromHex: "#c084fc", toHex: "#22d3ee" },
    { name: "Fire", from: "red-400", to: "orange-500", fromHex: "#f87171", toHex: "#f97316" },
    { name: "Sky", from: "sky-400", to: "blue-500", fromHex: "#38bdf8", toHex: "#3b82f6" },
  ]
}

interface Website {
  id: string
  title: string
  url: string
  description: string
  category: string
  tags: string[]
  dateAdded: string
  userId: string
  userName: string
  userEmail: string
  favicon?: string
  status: "pending" | "approved" | "rejected"
}



const mockWebsites: Website[] = [
  {
    id: "1",
    title: "GitHub",
    url: "https://github.com",
    description: "The world's leading software development platform where millions of developers collaborate on code.",
    category: "Development",
    tags: ["code", "git", "collaboration"],
    dateAdded: "2024-01-15",
    userId: "1",
    userName: "Admin User",
    userEmail: "admin@example.com",
    favicon: "https://github.com/favicon.ico",
    status: "approved",
  },
  {
    id: "2",
    title: "Figma",
    url: "https://figma.com",
    description: "Collaborative interface design tool for creating beautiful user interfaces and prototypes.",
    category: "Design",
    tags: ["design", "ui", "collaboration"],
    dateAdded: "2024-01-14",
    userId: "1",
    userName: "Admin User",
    userEmail: "admin@example.com",
    favicon: "https://static.figma.com/app/icon/1/favicon.png",
    status: "approved",
  },
  {
    id: "3",
    title: "Stack Overflow",
    url: "https://stackoverflow.com",
    description: "The largest online community for programmers to learn, share knowledge, and build careers.",
    category: "Development",
    tags: ["programming", "help", "community"],
    dateAdded: "2024-01-13",
    userId: "1",
    userName: "Admin User",
    userEmail: "admin@example.com",
    favicon: "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico",
    status: "approved",
  },
]



export function AdminDashboard() {
  const { user } = useSupabaseAuth()

  // 标签页状态管理
  const [activeTab, setActiveTab] = useState("websites")

  // 使用 React Query hooks
  const { data: supabaseWebsites = [], isLoading: websitesLoading } = useAllWebsites()
  const { data: categories = [] } = useCategories()
  const addWebsiteMutation = useAddWebsite()
  const updateWebsiteMutation = useUpdateWebsite()
  const deleteWebsiteMutation = useDeleteWebsite()

  // 分类管理相关 hooks
  const { data: categoriesWithUsage = [], isLoading: categoriesLoading } = useCategoriesWithUsage()
  const addCategoryMutation = useAddCategory()
  const updateCategoryMutation = useUpdateCategory()
  const deleteCategoryMutation = useDeleteCategory()

  // 用户管理相关 hooks
  const { data: supabaseUsers = [], isLoading: usersLoading } = useAllUsers()
  const updateUserStatusMutation = useUpdateUserStatus()
  const updateUserRoleMutation = useUpdateUserRole()
  const refreshUsers = useRefreshUsers()

  // 搜索和过滤状态
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [debouncedUserSearchQuery, setDebouncedUserSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // 分页状态
  const [websitesPage, setWebsitesPage] = useState(1)
  const [categoriesPage, setCategoriesPage] = useState(1)
  const [usersPage, setUsersPage] = useState(1)
  const itemsPerPage = 10 // 每页显示的数量

  // 批量选择和删除状态
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(new Set())
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [bulkDeleteType, setBulkDeleteType] = useState<'websites' | 'categories' | 'users'>('websites')

  const [deletingWebsites, setDeletingWebsites] = useState<Set<string>>(new Set())
  const [deletingCategories, setDeletingCategories] = useState<Set<string>>(new Set())
  const [editingWebsite, setEditingWebsite] = useState<SupabaseWebsite | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newWebsite, setNewWebsite] = useState({
    title: "",
    url: "",
    description: "",
    category_id: "",
    tags: "",
    icon: "",
  })

  // 分类管理相关状态
  const [editingCategory, setEditingCategory] = useState<CategoryWithUsage | null>(null)
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    color_from: "orange-500",
    color_to: "amber-500",
    custom_from_hex: "#f97316",
    custom_to_hex: "#f59e0b",
    is_custom: false,
  })
  const [categorySearchQuery, setCategorySearchQuery] = useState("")
  const [debouncedCategorySearchQuery, setDebouncedCategorySearchQuery] = useState("")

  // 本地颜色状态，用于实时显示
  const [localFromColor, setLocalFromColor] = useState('#f97316')
  const [localToColor, setLocalToColor] = useState('#f59e0b')
  const [editLocalFromColor, setEditLocalFromColor] = useState('#f97316')
  const [editLocalToColor, setEditLocalToColor] = useState('#f59e0b')

  // 防抖更新函数
  const debouncedUpdateNewCategory = useCallback(
    debounce((fromColor: string, toColor: string) => {
      setNewCategory(prev => ({
        ...prev,
        custom_from_hex: fromColor,
        custom_to_hex: toColor,
        color_from: fromColor,
        color_to: toColor,
      }))
    }, 100),
    []
  )

  const debouncedUpdateEditCategory = useCallback(
    debounce((fromColor: string, toColor: string) => {
      setEditingCategory(prev => prev ? {
        ...prev,
        custom_from_hex: fromColor,
        custom_to_hex: toColor,
        color_from: fromColor,
        color_to: toColor,
        is_custom: true,
      } : null)
    }, 100),
    []
  )

  // 优化的颜色变化处理函数
  const handleColorChange = useCallback((colorType: 'from' | 'to', value: string) => {
    if (colorType === 'from') {
      setLocalFromColor(value)
      debouncedUpdateNewCategory(value, localToColor)
    } else {
      setLocalToColor(value)
      debouncedUpdateNewCategory(localFromColor, value)
    }
  }, [localFromColor, localToColor, debouncedUpdateNewCategory])

  // 编辑分类的颜色变化处理函数
  const handleEditColorChange = useCallback((colorType: 'from' | 'to', value: string) => {
    if (colorType === 'from') {
      setEditLocalFromColor(value)
      debouncedUpdateEditCategory(value, editLocalToColor)
    } else {
      setEditLocalToColor(value)
      debouncedUpdateEditCategory(editLocalFromColor, value)
    }
  }, [editLocalFromColor, editLocalToColor, debouncedUpdateEditCategory])

  // 同步本地状态
  useEffect(() => {
    if (newCategory.is_custom) {
      setLocalFromColor(newCategory.custom_from_hex)
      setLocalToColor(newCategory.custom_to_hex)
    }
  }, [newCategory.is_custom])

  useEffect(() => {
    if (editingCategory?.is_custom) {
      setEditLocalFromColor(editingCategory.custom_from_hex || editingCategory.color_from)
      setEditLocalToColor(editingCategory.custom_to_hex || editingCategory.color_to)
    }
  }, [editingCategory?.is_custom])

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategorySearchQuery(categorySearchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [categorySearchQuery])

  // 用户搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserSearchQuery(userSearchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearchQuery])

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K 聚焦搜索框
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        // 根据当前活动的标签页聚焦对应的搜索框
        if (activeTab === 'websites') {
          const searchInput = document.querySelector('input[placeholder*="搜索网站"]') as HTMLInputElement
          searchInput?.focus()
        } else if (activeTab === 'categories') {
          const searchInput = document.querySelector('input[placeholder*="搜索分类"]') as HTMLInputElement
          searchInput?.focus()
        } else if (activeTab === 'users') {
          const searchInput = document.querySelector('input[placeholder*="搜索用户"]') as HTMLInputElement
          searchInput?.focus()
        }
      }

      // Escape 清除搜索
      if (event.key === 'Escape') {
        if (activeTab === 'websites' && searchQuery) {
          setSearchQuery("")
        } else if (activeTab === 'categories' && categorySearchQuery) {
          setCategorySearchQuery("")
        } else if (activeTab === 'users' && userSearchQuery) {
          setUserSearchQuery("")
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery, categorySearchQuery, userSearchQuery, activeTab])

  // 过滤网站、分类和用户数据
  const filteredWebsites = useMemo(() => {
    return supabaseWebsites.filter((website) => {
      const matchesSearch =
        website.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        website.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        website.category?.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || website.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [supabaseWebsites, debouncedSearchQuery, statusFilter])

  const filteredCategories = useMemo(() => {
    return categoriesWithUsage.filter((category) => {
      return category.name.toLowerCase().includes(debouncedCategorySearchQuery.toLowerCase())
    })
  }, [categoriesWithUsage, debouncedCategorySearchQuery])

  const filteredUsers = useMemo(() => {
    return supabaseUsers.filter((user) => {
      const query = debouncedUserSearchQuery.toLowerCase()
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      )
    })
  }, [supabaseUsers, debouncedUserSearchQuery])

  // 计算分页后的数据
  const paginatedWebsites = useMemo(() => {
    const startIndex = (websitesPage - 1) * itemsPerPage
    return filteredWebsites.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredWebsites, websitesPage, itemsPerPage])

  const paginatedCategories = useMemo(() => {
    const startIndex = (categoriesPage - 1) * itemsPerPage
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredCategories, categoriesPage, itemsPerPage])

  const paginatedUsers = useMemo(() => {
    const startIndex = (usersPage - 1) * itemsPerPage
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredUsers, usersPage, itemsPerPage])

  // 计算总页数
  const totalWebsitesPages = Math.max(1, Math.ceil(filteredWebsites.length / itemsPerPage))
  const totalCategoriesPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage))
  const totalUsersPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))

  // 重置分页当过滤条件改变时
  useEffect(() => {
    setWebsitesPage(1)
  }, [debouncedSearchQuery, statusFilter])

  useEffect(() => {
    setCategoriesPage(1)
  }, [debouncedCategorySearchQuery])

  useEffect(() => {
    setUsersPage(1)
  }, [debouncedUserSearchQuery])

  const handleStatusChange = useCallback(async (websiteId: string, newStatus: SupabaseWebsite["status"]) => {
    try {
      await updateWebsiteMutation.mutateAsync({ id: websiteId, updates: { status: newStatus } })
    } catch (error) {
      console.error('Error updating website status:', error)
    }
  }, [updateWebsiteMutation])

  const handleEditWebsite = useCallback(async () => {
    if (editingWebsite) {
      try {
        await updateWebsiteMutation.mutateAsync({
          id: editingWebsite.id,
          updates: {
            title: editingWebsite.title,
            url: editingWebsite.url,
            description: editingWebsite.description,
            category_id: editingWebsite.category_id,
            favicon: editingWebsite.favicon,
            status: editingWebsite.status
          }
        })
        toast.success(`网站 "${editingWebsite.title}" 更新成功！`)
        setEditingWebsite(null)
        setIsEditDialogOpen(false)
      } catch (error) {
        console.error('Error updating website:', error)
        toast.error('更新网站失败，请重试')
      }
    }
  }, [editingWebsite, updateWebsiteMutation])

  const handleDeleteWebsite = useCallback(async (id: string) => {
    try {
      // 立即添加到删除状态，显示视觉反馈
      setDeletingWebsites(prev => new Set(prev).add(id))

      // 立即显示删除成功的Toast，不等待API响应
      toast.success('网站删除成功！')

      // 异步执行删除操作
      deleteWebsiteMutation.mutate(id, {
        onError: (error) => {
          console.error('Error deleting website:', error)
          // 如果删除失败，显示错误Toast并移除删除状态
          toast.error('删除网站失败，请重试')
          setDeletingWebsites(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
          })
        },
        onSettled: () => {
          // 无论成功失败，都移除删除状态
          setDeletingWebsites(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
          })
        }
      })
    } catch (error) {
      console.error('Error deleting website:', error)
      toast.error('删除网站失败，请重试')
      setDeletingWebsites(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }, [deleteWebsiteMutation])

  // 批量删除处理函数
  const handleBulkDelete = useCallback(async () => {
    try {
      if (bulkDeleteType === 'websites' && selectedWebsites.size > 0) {
        // 显示批量删除中的提示
        toast.loading(`正在删除 ${selectedWebsites.size} 个网站...`)

        // 将所有选中的网站ID添加到删除状态
        setDeletingWebsites(prev => {
          const newSet = new Set(prev)
          selectedWebsites.forEach(id => newSet.add(id))
          return newSet
        })

        // 逐个删除网站
        const promises = Array.from(selectedWebsites).map(id =>
          deleteWebsiteMutation.mutateAsync(id)
        )

        await Promise.all(promises)
        toast.dismiss()
        toast.success(`成功删除 ${selectedWebsites.size} 个网站`)

        // 清空选择
        setSelectedWebsites(new Set())
      } else if (bulkDeleteType === 'categories' && selectedCategories.size > 0) {
        // 显示批量删除中的提示
        toast.loading(`正在删除 ${selectedCategories.size} 个分类...`)

        // 将所有选中的分类ID添加到删除状态
        setDeletingCategories(prev => {
          const newSet = new Set(prev)
          selectedCategories.forEach(id => newSet.add(id))
          return newSet
        })

        // 逐个删除分类
        const promises = Array.from(selectedCategories).map(id =>
          deleteCategoryMutation.mutateAsync(id)
        )

        await Promise.all(promises)
        toast.dismiss()
        toast.success(`成功删除 ${selectedCategories.size} 个分类`)

        // 清空选择
        setSelectedCategories(new Set())
      }

      // 关闭对话框
      setIsBulkDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error bulk deleting:', error)
      toast.dismiss()
      toast.error('批量删除失败，请重试')

      // 清空删除状态
      if (bulkDeleteType === 'websites') {
        setDeletingWebsites(new Set())
      } else if (bulkDeleteType === 'categories') {
        setDeletingCategories(new Set())
      }
    }
  }, [bulkDeleteType, selectedWebsites, selectedCategories, deleteWebsiteMutation, deleteCategoryMutation])

  // 批量禁用用户处理函数
  const handleBulkDisableUsers = useCallback(async () => {
    try {
      if (selectedUsers.size > 0) {
        // 显示批量禁用中的提示
        toast.loading(`正在禁用 ${selectedUsers.size} 个用户...`)

        // 逐个禁用用户
        const promises = Array.from(selectedUsers).map(id =>
          updateUserStatusMutation.mutateAsync({
            id,
            status: 'inactive'
          })
        )

        await Promise.all(promises)
        toast.dismiss()
        toast.success(`成功禁用 ${selectedUsers.size} 个用户`)

        // 清空选择
        setSelectedUsers(new Set())
      }

      // 关闭对话框
      setIsBulkDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error bulk disabling users:', error)
      toast.dismiss()
      toast.error('批量禁用用户失败，请重试')
    }
  }, [selectedUsers, updateUserStatusMutation])

  // 处理分类选择
  const handleCategorySelection = useCallback((id: string, isSelected: boolean) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }, [])

  // 处理全选/取消全选分类
  const handleSelectAllCategories = useCallback((selectAll: boolean) => {
    if (selectAll) {
      const newSet = new Set<string>()
      filteredCategories.forEach(category => newSet.add(category.id))
      setSelectedCategories(newSet)
    } else {
      setSelectedCategories(new Set())
    }
  }, [filteredCategories])

  // 处理用户选择
  const handleUserSelection = useCallback((id: string, isSelected: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }, [])

  // 处理全选/取消全选用户
  const handleSelectAllUsers = useCallback((selectAll: boolean) => {
    if (selectAll) {
      const newSet = new Set<string>()
      filteredUsers.forEach(user => newSet.add(user.id))
      setSelectedUsers(newSet)
    } else {
      setSelectedUsers(new Set())
    }
  }, [filteredUsers])

  const handleAddWebsite = useCallback(async () => {
    // 验证必填字段
    const missingFields = []
    if (!newWebsite.title.trim()) missingFields.push('标题')
    if (!newWebsite.url.trim()) missingFields.push('URL')
    if (!newWebsite.category_id) missingFields.push('分类')
    if (!newWebsite.description.trim()) missingFields.push('描述')

    if (missingFields.length > 0) {
      toast.error(`请填写以下必填字段：${missingFields.join('、')}`)
      return
    }

    // 验证URL格式
    try {
      new URL(newWebsite.url)
    } catch {
      toast.error('请输入有效的URL格式（如：https://example.com）')
      return
    }

    if (!user) {
      toast.error('用户信息不存在，请重新登录')
      return
    }

    try {
      const websiteData = {
        title: newWebsite.title.trim(),
        url: newWebsite.url.trim(),
        description: newWebsite.description.trim(),
        category_id: newWebsite.category_id,
        favicon: newWebsite.icon?.trim() || undefined,
        status: "approved" as const,
        submitted_by: user.id
      }

      await addWebsiteMutation.mutateAsync(websiteData)
      toast.success(`网站 "${newWebsite.title.trim()}" 添加成功！`)
      setNewWebsite({ title: "", url: "", description: "", category_id: "", tags: "", icon: "" })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding website:', error)
      toast.error('添加网站失败，请重试')
    }
  }, [newWebsite, addWebsiteMutation, user])

  const handleUserStatusChange = useCallback(async (userId: string, newStatus: "active" | "inactive") => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: userId,
        status: newStatus
      })
      toast.success(`用户状态已更新为${newStatus === 'active' ? '活跃' : '禁用'}`)
    } catch (error) {
      console.error('Error updating user status:', error)
      toast.error('更新用户状态失败，请重试')
    }
  }, [updateUserStatusMutation])

  const handleUserRoleChange = useCallback(async (userId: string, newRole: "user" | "admin" | "super_admin") => {
    try {
      await updateUserRoleMutation.mutateAsync({
        id: userId,
        role: newRole
      })
      const roleText = newRole === 'super_admin' ? '超级管理员' : newRole === 'admin' ? '管理员' : '普通用户'
      toast.success(`用户角色已更新为${roleText}`)
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('更新用户角色失败，请重试')
    }
  }, [updateUserRoleMutation])

  // 检查用户是否可以被操作（保护逻辑）
  const canModifyUser = useCallback((targetUser: User) => {
    if (!user) return false

    // 不能操作自己
    if (targetUser.id === user.id) return false

    // 超级管理员不能被操作（除非操作者也是超级管理员）
    if (targetUser.role === 'super_admin' && user.role !== 'super_admin') return false

    // 普通管理员不能操作其他管理员
    if (user.role === 'admin' && targetUser.role === 'admin') return false

    return true
  }, [user])

  // 检查是否可以修改用户状态
  const canModifyUserStatus = useCallback((targetUser: User) => {
    if (!canModifyUser(targetUser)) return false

    // 超级管理员不能被禁用
    if (targetUser.role === 'super_admin') return false

    return true
  }, [canModifyUser])

  // 检查是否可以修改用户角色
  const canModifyUserRole = useCallback((targetUser: User) => {
    if (!canModifyUser(targetUser)) return false

    // 只有超级管理员可以进行角色提权操作
    if (user?.role !== 'super_admin') return false

    // 超级管理员可以修改任何用户的角色（除了自己）
    return true
  }, [canModifyUser, user])

  const handleEditClick = useCallback((website: SupabaseWebsite) => {
    setEditingWebsite(website)
    setIsEditDialogOpen(true)
  }, [])

  const handleEditDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setIsEditDialogOpen(false)
      setEditingWebsite(null)
    }
  }, [])

  // 颜色处理函数
  const hexToTailwindClass = useCallback((hex: string) => {
    // 简化的 hex 到 tailwind 类名转换
    // 在实际应用中，我们直接使用 hex 值作为 CSS 变量
    return hex
  }, [])

  const getColorStyle = useCallback((fromColor: string, toColor: string, isCustom: boolean, customFromHex?: string, customToHex?: string) => {
    if (isCustom && customFromHex && customToHex) {
      return {
        background: `linear-gradient(to right, ${customFromHex}, ${customToHex})`
      }
    }
    return {}
  }, [])

  // 分类管理处理函数
  const handleAddCategory = useCallback(async () => {
    if (newCategory.name.trim()) {
      try {
        await addCategoryMutation.mutateAsync({
          name: newCategory.name.trim(),
          color_from: newCategory.is_custom ? newCategory.custom_from_hex : newCategory.color_from,
          color_to: newCategory.is_custom ? newCategory.custom_to_hex : newCategory.color_to,
        })
        toast.success(`分类 "${newCategory.name.trim()}" 添加成功！`)
        setNewCategory({
          name: "",
          color_from: "orange-500",
          color_to: "amber-500",
          custom_from_hex: "#f97316",
          custom_to_hex: "#f59e0b",
          is_custom: false,
        })
        setIsAddCategoryDialogOpen(false)
      } catch (error) {
        console.error('Error adding category:', error)
        toast.error('添加分类失败，请重试')
      }
    }
  }, [newCategory, addCategoryMutation])

  const handleEditCategory = useCallback(async () => {
    if (editingCategory && editingCategory.name.trim()) {
      try {
        // 根据是否为自定义颜色决定保存的颜色格式
        const colorFrom = editingCategory.is_custom
          ? editingCategory.custom_from_hex
          : editingCategory.color_from
        const colorTo = editingCategory.is_custom
          ? editingCategory.custom_to_hex
          : editingCategory.color_to

        const updateData = {
          id: editingCategory.id,
          updates: {
            name: editingCategory.name.trim(),
            color_from: colorFrom,
            color_to: colorTo,
          }
        }

        await updateCategoryMutation.mutateAsync(updateData)
        toast.success(`分类 "${editingCategory.name.trim()}" 更新成功！`)
        setIsEditCategoryDialogOpen(false)
        setEditingCategory(null)
      } catch (error) {
        console.error('Error updating category:', error)
        const errorMessage = error instanceof Error ? error.message : '更新分类失败，请重试'
        toast.error(errorMessage)
      }
    }
  }, [editingCategory, updateCategoryMutation])

  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      // 立即添加到删除状态，显示视觉反馈
      setDeletingCategories(prev => new Set(prev).add(id))

      // 立即显示删除成功的Toast，不等待API响应
      toast.success('分类删除成功！')

      // 异步执行删除操作
      deleteCategoryMutation.mutate(id, {
        onError: (error) => {
          console.error('Error deleting category:', error)
          // 如果删除失败，显示错误Toast并移除删除状态
          toast.error('删除分类失败，请重试')
          setDeletingCategories(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
          })
        },
        onSettled: () => {
          // 无论成功失败，都移除删除状态
          setDeletingCategories(prev => {
            const newSet = new Set(prev)
            newSet.delete(id)
            return newSet
          })
        }
      })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('删除分类失败，请重试')
      setDeletingCategories(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }, [deleteCategoryMutation])

  const handleEditCategoryClick = useCallback((category: CategoryWithUsage) => {
    const isCustomColor = category.color_from.startsWith('#') || category.color_to.startsWith('#')
    setEditingCategory({
      ...category,
      is_custom: isCustomColor,
      custom_from_hex: isCustomColor ? category.color_from : "#f97316",
      custom_to_hex: isCustomColor ? category.color_to : "#f59e0b",
    })
    setIsEditCategoryDialogOpen(true)
  }, [])

  const handleEditCategoryDialogClose = useCallback((open: boolean) => {
    if (!open) {
      setIsEditCategoryDialogOpen(false)
      setEditingCategory(null)
    }
  }, [])

  const getStatusColor = (status: SupabaseWebsite["status"]) => {
    switch (status) {
      case "approved":
        return "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300"
      case "pending":
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900/30 dark:to-orange-900/30 dark:text-amber-300"
      case "rejected":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900/30 dark:to-slate-900/30 dark:text-gray-300"
    }
  }

  const getUserStatusColor = (status: "active" | "inactive") => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 dark:from-emerald-900/30 dark:to-teal-900/30 dark:text-emerald-300"
      case "inactive":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-300"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900/30 dark:to-slate-900/30 dark:text-gray-300"
    }
  }

  const stats = {
    totalWebsites: supabaseWebsites.length,
    pendingWebsites: supabaseWebsites.filter((w) => w.status === "pending").length,
    approvedWebsites: supabaseWebsites.filter((w) => w.status === "approved").length,
    totalUsers: supabaseUsers.length,
    activeUsers: supabaseUsers.filter((u) => u.status === "active").length,
  }

  // 渐进式加载：立即显示界面，数据加载时显示骨架屏
  const showWebsitesSkeleton = websitesLoading && supabaseWebsites.length === 0
  const showCategoriesSkeleton = categoriesLoading && categoriesWithUsage.length === 0

  // 处理网站选择
  const handleWebsiteSelection = useCallback((id: string, isSelected: boolean) => {
    setSelectedWebsites(prev => {
      const newSet = new Set(prev)
      if (isSelected) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }, [])

  // 处理全选/取消全选网站
  const handleSelectAllWebsites = useCallback((selectAll: boolean) => {
    if (selectAll) {
      const newSet = new Set<string>()
      filteredWebsites.forEach(website => newSet.add(website.id))
      setSelectedWebsites(newSet)
    } else {
      setSelectedWebsites(new Set())
    }
  }, [filteredWebsites])

  // 获取状态的中文名称
  const getStatusText = (status: SupabaseWebsite["status"]) => {
    switch (status) {
      case "approved": return "已批准"
      case "pending": return "待审核"
      case "rejected": return "已拒绝"
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-orange-50/50 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 pb-16">
      <div className="container px-2 sm:px-4 py-4 sm:py-6">
        {/* 标题部分 - 居中 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 via-rose-600 via-orange-600 to-purple-600 bg-clip-text text-transparent animate-wave-gradient mb-2">
            管理面板
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base flex items-center justify-center gap-2">
            <Activity className="h-4 w-4" />
            管理网站、用户和内容审核
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          {[
            { title: "网站总数", value: stats.totalWebsites, icon: Globe, color: "from-blue-500 to-cyan-500" },
            {
              title: "待审核",
              value: stats.pendingWebsites,
              icon: Clock,
              color: "from-amber-500 to-orange-500",
            },
            {
              title: "已批准",
              value: stats.approvedWebsites,
              icon: CheckCircle,
              color: "from-emerald-500 to-teal-500",
            },
            { title: "用户总数", value: stats.totalUsers, icon: Users, color: "from-purple-500 to-pink-500" },
            { title: "活跃用户", value: stats.activeUsers, icon: Shield, color: "from-indigo-500 to-purple-500" },
          ].map((stat) => (
            <Card
              key={stat.title}
              className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="websites" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-center overflow-x-auto scrollbar-hide pb-2">
            <TabsList className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-lg p-1.5 text-base sm:text-lg lg:text-xl flex sm:grid sm:grid-cols-4 w-full sm:max-w-4xl gap-1 min-w-max sm:min-w-0 mx-2 sm:mx-0">
              <TabsTrigger
                value="websites"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-50 data-[state=active]:to-pink-50 dark:data-[state=active]:from-purple-900/20 dark:data-[state=active]:to-pink-900/20 dark:data-[state=active]:text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg flex flex-row items-center gap-1 font-medium rounded-lg whitespace-nowrap flex-shrink-0"
              >
                <span>网站</span>
                {stats.pendingWebsites > 0 && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
                    {stats.pendingWebsites}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-50 data-[state=active]:to-orange-50 dark:data-[state=active]:from-amber-900/20 dark:data-[state=active]:to-orange-900/20 dark:data-[state=active]:text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium rounded-lg whitespace-nowrap flex-shrink-0"
              >
                分类
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-50 data-[state=active]:to-purple-50 dark:data-[state=active]:from-indigo-900/20 dark:data-[state=active]:to-purple-900/20 dark:data-[state=active]:text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium rounded-lg whitespace-nowrap flex-shrink-0"
              >
                用户
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-50 data-[state=active]:to-teal-50 dark:data-[state=active]:from-green-900/20 dark:data-[state=active]:to-teal-900/20 dark:data-[state=active]:text-white px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-medium rounded-lg whitespace-nowrap flex-shrink-0"
              >
                系统设置
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="websites" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-purple-600" />
                        网站管理
                      </div>
                      {stats.pendingWebsites > 0 && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white w-fit">
                          {stats.pendingWebsites} 待审核
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>管理系统中的所有网站数据</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    {selectedWebsites.size > 0 && (
                      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                            onClick={() => {
                              setBulkDeleteType('websites')
                              setIsBulkDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            批量删除 ({selectedWebsites.size})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>批量删除网站</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除所选的 {selectedWebsites.size} 个网站吗？此操作无法撤销。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleBulkDelete}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                            >
                              确认删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                          <Plus className="h-4 w-4 mr-2" />
                          添加网站
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="max-w-[95vw] sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-xl"
                        onPointerDownOutside={(e) => e.preventDefault()}
                      >
                        <DialogHeader>
                          <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            添加新网站
                          </DialogTitle>
                          <DialogDescription>
                            以管理员身份向集合中添加新网站。
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="new-title" className="flex items-center gap-1">
                              标题 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="new-title"
                              value={newWebsite.title}
                              onChange={(e) => setNewWebsite({ ...newWebsite, title: e.target.value })}
                              placeholder="网站标题"
                              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-url" className="flex items-center gap-1">
                              URL <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="new-url"
                              value={newWebsite.url}
                              onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                              placeholder="https://example.com"
                              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-icon">图标 URL</Label>
                            <Input
                              id="new-icon"
                              value={newWebsite.icon || ""}
                              onChange={(e) => setNewWebsite({ ...newWebsite, icon: e.target.value })}
                              placeholder="https://example.com/favicon.ico"
                              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-xs text-muted-foreground">网站图标或标志图片的URL地址</p>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-category" className="flex items-center gap-1">
                              分类 <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={newWebsite.category_id}
                              onValueChange={(value) => setNewWebsite({ ...newWebsite, category_id: value })}
                              required
                            >
                              <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500">
                                <SelectValue placeholder="选择分类" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-description" className="flex items-center gap-1">
                              描述 <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              id="new-description"
                              value={newWebsite.description}
                              onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                              placeholder="网站的简要描述"
                              rows={3}
                              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-tags">标签</Label>
                            <Input
                              id="new-tags"
                              value={newWebsite.tags}
                              onChange={(e) => setNewWebsite({ ...newWebsite, tags: e.target.value })}
                              placeholder="tag1, tag2, tag3"
                              className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            取消
                          </Button>
                          <Button
                            onClick={handleAddWebsite}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          >
                            添加网站
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        placeholder="搜索网站..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:shadow-xl"
                      />
                      {searchQuery && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110"
                          title="清除搜索 (Esc)"
                          aria-label="清除搜索内容"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300" />
                        </Button>
                      )}
                      {!searchQuery && (
                        <div className="absolute right-3 top-3 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          ⌘K
                        </div>
                      )}
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-32 transition-all duration-200 focus:ring-2 focus:ring-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="pending">待审核</SelectItem>
                        <SelectItem value="approved">已批准</SelectItem>
                        <SelectItem value="rejected">已拒绝</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 dark:border-gray-700">
                        <TableHead className="w-10">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded-full border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                              checked={selectedWebsites.size > 0 && selectedWebsites.size === filteredWebsites.length}
                              onChange={(e) => handleSelectAllWebsites(e.target.checked)}
                              aria-label="全选网站"
                              title="全选网站"
                            />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">网站</TableHead>
                        <TableHead className="font-semibold text-center">分类</TableHead>
                        <TableHead className="font-semibold">提交人</TableHead>
                        <TableHead className="font-semibold text-center">日期</TableHead>
                        <TableHead className="font-semibold text-center">状态</TableHead>
                        <TableHead className="font-semibold text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {showWebsitesSkeleton ? (
                        // 显示骨架屏
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={`skeleton-${i}`} className="border-b border-gray-100 dark:border-gray-800">
                            <TableCell className="w-10">
                              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div>
                                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                                  <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell>
                              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        paginatedWebsites.map((website) => {
                          const isDeleting = deletingWebsites.has(website.id)
                          const isSelected = selectedWebsites.has(website.id)
                          return (
                            <TableRow
                              key={website.id}
                              className={`transition-all duration-300 ${isDeleting
                                ? "opacity-50 bg-red-50 dark:bg-red-900/20 scale-95"
                                : isSelected
                                  ? "bg-purple-50/70 dark:bg-purple-900/20"
                                  : "hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/10 dark:hover:to-pink-900/10"
                                }`}
                            >
                              <TableCell className="w-10">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="rounded-full border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                    checked={isSelected}
                                    onChange={(e) => handleWebsiteSelection(website.id, e.target.checked)}
                                    disabled={isDeleting}
                                    aria-label={`选择网站 ${website.title}`}
                                    title={`选择网站 ${website.title}`}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 p-1 rounded bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                                    {website.favicon ? (
                                      <img
                                        src={website.favicon || "/placeholder.svg"}
                                        alt={`${website.title} icon`}
                                        className="w-6 h-6 object-contain"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement
                                          target.style.display = "none"
                                          const parent = target.parentElement!
                                          parent.innerHTML = '<span class="text-lg">🌐</span>'
                                        }}
                                      />
                                    ) : (
                                      <span className="text-lg">🌐</span>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{website.title}</div>
                                    <div className="text-sm text-muted-foreground">{new URL(website.url).hostname}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
                                >
                                  {website.category?.name || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-xs">
                                    {website.submitted_by_user?.name?.charAt(0) || website.submitted_by?.charAt(0) || 'U'}
                                  </div>
                                  <div className="text-sm">
                                    <div className="font-medium">
                                      {website.submitted_by_user?.name || 'Unknown User'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {website.submitted_by_user?.email || website.submitted_by}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{new Date(website.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="text-center">
                                <Badge className={`${getStatusColor(website.status)} font-medium`}>{getStatusText(website.status)}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                      className="max-w-[95vw] sm:max-w-[500px] max-h-[85vh] overflow-y-auto rounded-xl"
                                      onPointerDownOutside={(e) => e.preventDefault()}
                                    >
                                      <DialogHeader>
                                        <DialogTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                          网站详情
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-sm font-medium">标题</Label>
                                          <p className="text-sm">{website.title}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">网址</Label>
                                          <p className="text-sm text-blue-600">{website.url}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">描述</Label>
                                          <p className="text-sm">{website.description}</p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">标签</Label>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {website.tags && Array.isArray(website.tags) ? website.tags.map((tag) => (
                                              <Badge key={typeof tag === 'string' ? tag : tag.name} variant="outline" className="text-xs">
                                                {typeof tag === 'string' ? tag : tag.name}
                                              </Badge>
                                            )) : (
                                              <span className="text-sm text-gray-500">暂无标签</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {website.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleStatusChange(website.id, "approved")}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleStatusChange(website.id, "rejected")}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                                      >
                                        <XCircle className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}

                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditClick(website)}
                                    className="hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>删除网站</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          确定要删除 "{website.title}" 吗？此操作无法撤销。
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>取消</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteWebsite(website.id)}
                                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                                        >
                                          删除
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* 网站分页 */}
                {filteredWebsites.length > 0 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setWebsitesPage(p => Math.max(1, p - 1))}
                            className={websitesPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            href="#"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>上一页</span>
                          </PaginationPrevious>
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalWebsitesPages) }).map((_, i) => {
                          let pageNumber: number;

                          // 计算页码显示逻辑
                          if (totalWebsitesPages <= 5) {
                            // 总页数小于等于5，直接显示1到totalPages
                            pageNumber = i + 1;
                          } else if (websitesPage <= 3) {
                            // 当前页靠近开始，显示1-5
                            pageNumber = i + 1;
                          } else if (websitesPage >= totalWebsitesPages - 2) {
                            // 当前页靠近结尾，显示最后5页
                            pageNumber = totalWebsitesPages - 4 + i;
                          } else {
                            // 当前页在中间，显示当前页及其前后2页
                            pageNumber = websitesPage - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setWebsitesPage(pageNumber);
                                }}
                                isActive={pageNumber === websitesPage}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setWebsitesPage(p => Math.min(totalWebsitesPages, p + 1))}
                            className={websitesPage >= totalWebsitesPages ? "pointer-events-none opacity-50" : ""}
                            href="#"
                          >
                            <span>下一页</span>
                            <ChevronRight className="h-4 w-4" />
                          </PaginationNext>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5 text-orange-600" />
                      分类管理
                    </CardTitle>
                    <CardDescription>管理网站分类及其颜色</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                      <Input
                        placeholder="搜索分类..."
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        className="pl-10 pr-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:shadow-xl"
                      />
                      {categorySearchQuery && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCategorySearchQuery("")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110"
                          title="清除搜索 (Esc)"
                          aria-label="清除搜索内容"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300" />
                        </Button>
                      )}
                      {!categorySearchQuery && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          ⌘K
                        </div>
                      )}
                    </div>
                    {selectedCategories.size > 0 && (
                      <AlertDialog open={isBulkDeleteDialogOpen && bulkDeleteType === 'categories'} onOpenChange={setIsBulkDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                            onClick={() => {
                              setBulkDeleteType('categories')
                              setIsBulkDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            批量删除 ({selectedCategories.size})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>批量删除分类</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要删除所选的 {selectedCategories.size} 个分类吗？此操作无法撤销。
                              {Array.from(selectedCategories).some(id => {
                                const category = categoriesWithUsage.find(c => c.id === id)
                                return category && category.website_count > 0
                              }) && (
                                  <span className="block mt-2 text-amber-600 dark:text-amber-400">
                                    警告：部分分类正在被网站使用。删除后这些网站将失去所属分类。
                                  </span>
                                )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleBulkDelete}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                            >
                              确认删除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                          <Plus className="h-4 w-4 mr-2" />
                          添加分类
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] overflow-hidden rounded-xl">
                        <DialogHeader>
                          <DialogTitle>添加新分类</DialogTitle>
                          <DialogDescription>
                            创建新分类来组织网站
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 px-1 custom-scrollbar">
                          <div>
                            <Label htmlFor="category-name">分类名称</Label>
                            <Input
                              id="category-name"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="输入分类名称"
                            />
                          </div>
                          <div>
                            <Label>颜色主题</Label>
                            <div className="space-y-4 mt-2">
                              {/* 预设颜色组合 */}
                              {Object.entries(COLOR_PRESETS).map(([category, presets]) => (
                                <div key={category}>
                                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                    {category === 'warm' ? '暖色调' :
                                      category === 'cool' ? '冷色调' :
                                        category === 'purple' ? '紫色系' :
                                          category === 'neutral' ? '中性色' : '特殊色'}
                                  </h4>
                                  <div className="grid grid-cols-3 gap-2">
                                    {presets.map((preset) => (
                                      <button
                                        key={`${preset.from}-${preset.to}`}
                                        type="button"
                                        onClick={() => setNewCategory(prev => ({
                                          ...prev,
                                          color_from: preset.from,
                                          color_to: preset.to,
                                          custom_from_hex: preset.fromHex,
                                          custom_to_hex: preset.toHex,
                                          is_custom: false,
                                        }))}
                                        className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${!newCategory.is_custom && newCategory.color_from === preset.from && newCategory.color_to === preset.to
                                          ? 'border-orange-500 shadow-lg'
                                          : 'border-gray-200 dark:border-gray-700'
                                          }`}
                                      >
                                        <div
                                          className="h-4 w-full rounded mb-1"
                                          style={{ background: `linear-gradient(to right, ${preset.fromHex}, ${preset.toHex})` }}
                                        ></div>
                                        <p className="text-xs text-center">{preset.name}</p>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              {/* 自定义颜色选择器 */}
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">自定义颜色</h4>
                                <div className="space-y-3">
                                  <button
                                    type="button"
                                    onClick={() => setNewCategory(prev => ({ ...prev, is_custom: !prev.is_custom }))}
                                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${newCategory.is_custom
                                      ? 'border-orange-500 shadow-lg bg-orange-50 dark:bg-orange-900/20'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                                      }`}
                                  >
                                    <div
                                      className="h-6 w-full rounded mb-2"
                                      style={newCategory.is_custom ? {
                                        background: `linear-gradient(to right, ${newCategory.custom_from_hex}, ${newCategory.custom_to_hex})`
                                      } : {
                                        background: 'linear-gradient(to right, #f97316, #f59e0b)'
                                      }}
                                    ></div>
                                    <p className="text-sm font-medium">
                                      {newCategory.is_custom ? '自定义颜色 (已选择)' : '点击选择自定义颜色'}
                                    </p>
                                  </button>

                                  {newCategory.is_custom && (
                                    <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                      <div>
                                        <Label htmlFor="custom-from-color" className="text-xs">起始颜色</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <input
                                            id="custom-from-color"
                                            type="color"
                                            value={localFromColor}
                                            onChange={(e) => handleColorChange('from', e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0"
                                            title="选择起始颜色"
                                          />
                                          <Input
                                            value={localFromColor}
                                            onChange={(e) => handleColorChange('from', e.target.value)}
                                            className="text-xs"
                                            placeholder="#000000"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <Label htmlFor="custom-to-color" className="text-xs">结束颜色</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                          <input
                                            id="custom-to-color"
                                            type="color"
                                            value={localToColor}
                                            onChange={(e) => handleColorChange('to', e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0"
                                            title="选择结束颜色"
                                          />
                                          <Input
                                            value={localToColor}
                                            onChange={(e) => handleColorChange('to', e.target.value)}
                                            className="text-xs"
                                            placeholder="#000000"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)}>
                              取消
                            </Button>
                            <Button
                              onClick={handleAddCategory}
                              disabled={!newCategory.name.trim() || addCategoryMutation.isPending}
                              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                            >
                              {addCategoryMutation.isPending ? "添加中..." : "添加分类"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur overflow-x-auto">
                    <Table className="min-w-[600px]">
                      <TableHeader>
                        <TableRow className="border-b border-gray-200 dark:border-gray-700">
                          <TableHead className="w-10">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                className="rounded-full border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50"
                                checked={selectedCategories.size > 0 && selectedCategories.size === filteredCategories.length}
                                onChange={(e) => handleSelectAllCategories(e.target.checked)}
                                aria-label="全选分类"
                                title="全选分类"
                              />
                            </div>
                          </TableHead>
                          <TableHead className="font-semibold">分类名称</TableHead>
                          <TableHead className="font-semibold text-center">颜色预览</TableHead>
                          <TableHead className="font-semibold text-center">网站数量</TableHead>
                          <TableHead className="font-semibold text-center">创建时间</TableHead>
                          <TableHead className="font-semibold text-center">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {showCategoriesSkeleton ? (
                          // 显示骨架屏
                          Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={`category-skeleton-${i}`} className="border-b border-gray-100 dark:border-gray-800">
                              <TableCell>
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : filteredCategories.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <div className="text-muted-foreground">
                                {debouncedCategorySearchQuery ? (
                                  <div className="space-y-2">
                                    <p>No categories found matching "{debouncedCategorySearchQuery}"</p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setCategorySearchQuery("")}
                                      className="text-xs"
                                    >
                                      Clear search
                                    </Button>
                                  </div>
                                ) : (
                                  "No categories found"
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedCategories.map((category) => {
                            const isDeleting = deletingCategories.has(category.id)
                            return (
                              <TableRow
                                key={category.id}
                                className={`transition-all duration-300 ${isDeleting
                                  ? "opacity-50 bg-red-50 dark:bg-red-900/20 scale-95"
                                  : "hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                  }`}
                              >
                                <TableCell className="w-10">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      className="rounded-full border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                                      checked={selectedCategories.has(category.id)}
                                      onChange={(e) => handleCategorySelection(category.id, e.target.checked)}
                                      disabled={isDeleting}
                                      aria-label={`选择分类 ${category.name}`}
                                      title={`选择分类 ${category.name}`}
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Tag className="h-4 w-4 text-orange-600" />
                                    <span className="font-medium">{category.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center">
                                    <div
                                      className="h-6 w-20 rounded-full shadow-sm"
                                      style={
                                        category.color_from.startsWith('#') || category.color_to.startsWith('#')
                                          ? { background: `linear-gradient(to right, ${category.color_from}, ${category.color_to})` }
                                          : {}
                                      }
                                      {...(!category.color_from.startsWith('#') && !category.color_to.startsWith('#') && {
                                        className: `h-6 w-20 rounded-full shadow-sm bg-gradient-to-r from-${category.color_from} to-${category.color_to}`
                                      })}
                                    ></div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                    {category.website_count} 个网站
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center text-muted-foreground">
                                  {new Date(category.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditCategoryClick(category)}
                                      className="hover:bg-orange-100 dark:hover:bg-orange-900/30"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>删除分类</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            您确定要删除分类"{category.name}"吗？
                                            {category.website_count > 0 && (
                                              <span className="block mt-2 text-amber-600 dark:text-amber-400">
                                                警告：此分类被 {category.website_count} 个网站使用。
                                                删除后这些网站将失去所属分类。
                                              </span>
                                            )}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>取消</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteCategory(category.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            删除
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* 分类分页 */}
                {filteredCategories.length > 0 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCategoriesPage(p => Math.max(1, p - 1))}
                            className={categoriesPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            href="#"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>上一页</span>
                          </PaginationPrevious>
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalCategoriesPages) }).map((_, i) => {
                          let pageNumber: number;

                          if (totalCategoriesPages <= 5) {
                            pageNumber = i + 1;
                          } else if (categoriesPage <= 3) {
                            pageNumber = i + 1;
                          } else if (categoriesPage >= totalCategoriesPages - 2) {
                            pageNumber = totalCategoriesPages - 4 + i;
                          } else {
                            pageNumber = categoriesPage - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCategoriesPage(pageNumber);
                                }}
                                isActive={pageNumber === categoriesPage}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCategoriesPage(p => Math.min(totalCategoriesPages, p + 1))}
                            className={categoriesPage >= totalCategoriesPages ? "pointer-events-none opacity-50" : ""}
                            href="#"
                          >
                            <span>下一页</span>
                            <ChevronRight className="h-4 w-4" />
                          </PaginationNext>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 编辑分类对话框 */}
            <Dialog open={isEditCategoryDialogOpen} onOpenChange={handleEditCategoryDialogClose}>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                  <DialogTitle>编辑分类</DialogTitle>
                  <DialogDescription>
                    更新分类名称和颜色主题
                  </DialogDescription>
                </DialogHeader>
                {editingCategory && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-category-name">分类名称</Label>
                      <Input
                        id="edit-category-name"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                        placeholder="输入分类名称"
                      />
                    </div>
                    <div>
                      <Label>颜色主题</Label>
                      <div className="space-y-4 mt-2 max-h-96 overflow-y-auto">
                        {/* 预设颜色组合 */}
                        {Object.entries(COLOR_PRESETS).map(([category, presets]) => (
                          <div key={category}>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                              {category === 'warm' ? '暖色调' :
                                category === 'cool' ? '冷色调' :
                                  category === 'purple' ? '紫色系' :
                                    category === 'neutral' ? '中性色' : '特殊色'}
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {presets.map((preset) => (
                                <button
                                  key={`edit-${preset.from}-${preset.to}`}
                                  type="button"
                                  onClick={() => setEditingCategory(prev => prev ? {
                                    ...prev,
                                    color_from: preset.from,
                                    color_to: preset.to,
                                    custom_from_hex: preset.fromHex,
                                    custom_to_hex: preset.toHex,
                                    is_custom: false,
                                  } : null)}
                                  className={`p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${!editingCategory.is_custom && editingCategory.color_from === preset.from && editingCategory.color_to === preset.to
                                    ? 'border-orange-500 shadow-lg'
                                    : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                  <div
                                    className="h-4 w-full rounded mb-1"
                                    style={{ background: `linear-gradient(to right, ${preset.fromHex}, ${preset.toHex})` }}
                                  ></div>
                                  <p className="text-xs text-center">{preset.name}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* 自定义颜色选择器 */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">自定义颜色</h4>
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() => setEditingCategory(prev => prev ? { ...prev, is_custom: !prev.is_custom } : null)}
                              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${editingCategory.is_custom
                                ? 'border-orange-500 shadow-lg bg-orange-50 dark:bg-orange-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                                }`}
                            >
                              <div
                                className="h-6 w-full rounded mb-2"
                                style={editingCategory.is_custom ? {
                                  background: `linear-gradient(to right, ${editingCategory.custom_from_hex || editingCategory.color_from}, ${editingCategory.custom_to_hex || editingCategory.color_to})`
                                } : {
                                  background: 'linear-gradient(to right, #f97316, #f59e0b)'
                                }}
                              ></div>
                              <p className="text-sm font-medium">
                                {editingCategory.is_custom ? '自定义颜色 (已选择)' : '点击选择自定义颜色'}
                              </p>
                            </button>

                            {editingCategory.is_custom && (
                              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                  <Label htmlFor="edit-custom-from-color" className="text-xs">起始颜色</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <input
                                      id="edit-custom-from-color"
                                      type="color"
                                      value={editLocalFromColor}
                                      onChange={(e) => handleEditColorChange('from', e.target.value)}
                                      className="w-8 h-8 rounded cursor-pointer border-0"
                                      title="选择起始颜色"
                                    />
                                    <Input
                                      value={editLocalFromColor}
                                      onChange={(e) => handleEditColorChange('from', e.target.value)}
                                      className="text-xs"
                                      placeholder="#000000"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="edit-custom-to-color" className="text-xs">结束颜色</Label>
                                  <div className="flex items-center gap-2 mt-1">
                                    <input
                                      id="edit-custom-to-color"
                                      type="color"
                                      value={editLocalToColor}
                                      onChange={(e) => handleEditColorChange('to', e.target.value)}
                                      className="w-8 h-8 rounded cursor-pointer border-0"
                                      title="选择结束颜色"
                                    />
                                    <Input
                                      value={editLocalToColor}
                                      onChange={(e) => handleEditColorChange('to', e.target.value)}
                                      className="text-xs"
                                      placeholder="#000000"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditCategoryDialogOpen(false)}>
                        取消
                      </Button>
                      <Button
                        onClick={handleEditCategory}
                        disabled={!editingCategory.name.trim() || updateCategoryMutation.isPending}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      >
                        {updateCategoryMutation.isPending ? "更新中..." : "更新分类"}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-indigo-600" />
                      用户管理
                    </CardTitle>
                    <CardDescription>管理用户账户和权限</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        placeholder="搜索用户..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="pl-10 pr-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:shadow-xl"
                      />
                      {userSearchQuery && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setUserSearchQuery("")}
                          className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110"
                          title="清除搜索 (Esc)"
                          aria-label="清除搜索内容"
                        >
                          <X className="h-3 w-3 text-muted-foreground hover:text-gray-700 dark:hover:text-gray-300" />
                        </Button>
                      )}
                      {!userSearchQuery && (
                        <div className="absolute right-3 top-3 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          ⌘K
                        </div>
                      )}
                    </div>
                    {selectedUsers.size > 0 && (
                      <AlertDialog open={isBulkDeleteDialogOpen && bulkDeleteType === 'users'} onOpenChange={setIsBulkDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                            onClick={() => {
                              setBulkDeleteType('users')
                              setIsBulkDeleteDialogOpen(true)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            批量禁用 ({selectedUsers.size})
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle>批量禁用用户</AlertDialogTitle>
                            <AlertDialogDescription>
                              确定要禁用所选的 {selectedUsers.size} 个用户吗？此操作可以在用户管理中恢复。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleBulkDisableUsers}
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                            >
                              确认禁用
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshUsers}
                      disabled={usersLoading}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 transition-all duration-200 hover:scale-105"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                      刷新用户
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="border-b border-gray-200 dark:border-gray-700">
                        <TableHead className="w-10">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded-full border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                              checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                              onChange={(e) => handleSelectAllUsers(e.target.checked)}
                              aria-label="全选用户"
                              title="全选用户"
                            />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold">用户</TableHead>
                        <TableHead className="font-semibold text-center">角色</TableHead>
                        <TableHead className="font-semibold text-center">注册时间</TableHead>
                        <TableHead className="font-semibold text-center">状态</TableHead>
                        <TableHead className="font-semibold text-center">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersLoading ? (
                        // 显示骨架屏
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={`user-skeleton-${i}`} className="border-b border-gray-100 dark:border-gray-800">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                                <div>
                                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                                  <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="text-muted-foreground">
                              {debouncedUserSearchQuery ? (
                                <div className="space-y-2">
                                  <p>没有找到匹配 "{debouncedUserSearchQuery}" 的用户</p>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setUserSearchQuery("")}
                                    className="text-xs"
                                  >
                                    清除搜索
                                  </Button>
                                </div>
                              ) : (
                                "暂无用户数据"
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedUsers.map((targetUser) => (
                          <TableRow
                            key={targetUser.id}
                            className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 dark:hover:from-indigo-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                          >
                            <TableCell className="w-10">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="rounded-full border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                  checked={selectedUsers.has(targetUser.id)}
                                  onChange={(e) => handleUserSelection(targetUser.id, e.target.checked)}
                                  disabled={!canModifyUser(targetUser)}
                                  aria-label={`选择用户 ${targetUser.name}`}
                                  title={`选择用户 ${targetUser.name}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                  {targetUser.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium">{targetUser.name}</div>
                                  <div className="text-sm text-muted-foreground">{targetUser.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={targetUser.role === "super_admin" || targetUser.role === "admin" ? "default" : "secondary"}
                                className={
                                  targetUser.role === "super_admin"
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                                    : targetUser.role === "admin"
                                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                      : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                                }
                              >
                                {targetUser.role === "super_admin" ? "超级管理员" : targetUser.role === "admin" ? "管理员" : "用户"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{new Date(targetUser.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${getUserStatusColor(targetUser.status)} font-medium`}>
                                {targetUser.status === "active" ? "活跃" : "禁用"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                {!canModifyUser(targetUser) ? (
                                  <div className="text-xs text-muted-foreground px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                    {targetUser.id === user?.id ? "当前用户" : "受保护"}
                                  </div>
                                ) : (
                                  <>
                                    {/* 状态管理按钮 */}
                                    {canModifyUserStatus(targetUser) && (
                                      targetUser.status === "active" ? (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleUserStatusChange(targetUser.id, "inactive")}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200"
                                          title="禁用用户"
                                        >
                                          禁用
                                        </Button>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleUserStatusChange(targetUser.id, "active")}
                                          className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200"
                                          title="启用用户"
                                        >
                                          启用
                                        </Button>
                                      )
                                    )}

                                    {/* 角色管理按钮 */}
                                    {canModifyUserRole(targetUser) && (
                                      targetUser.role === "user" ? (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleUserRoleChange(targetUser.id, "admin")}
                                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200"
                                          title="设为管理员"
                                        >
                                          提升
                                        </Button>
                                      ) : targetUser.role === "admin" ? (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleUserRoleChange(targetUser.id, "user")}
                                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200"
                                          title="设为普通用户"
                                        >
                                          降级
                                        </Button>
                                      ) : null
                                    )}
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* 用户分页 */}
                {filteredUsers.length > 0 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                            className={usersPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            href="#"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>上一页</span>
                          </PaginationPrevious>
                        </PaginationItem>

                        {Array.from({ length: Math.min(5, totalUsersPages) }).map((_, i) => {
                          let pageNumber: number;

                          if (totalUsersPages <= 5) {
                            pageNumber = i + 1;
                          } else if (usersPage <= 3) {
                            pageNumber = i + 1;
                          } else if (usersPage >= totalUsersPages - 2) {
                            pageNumber = totalUsersPages - 4 + i;
                          } else {
                            pageNumber = usersPage - 2 + i;
                          }

                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setUsersPage(pageNumber);
                                }}
                                isActive={pageNumber === usersPage}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))}
                            className={usersPage >= totalUsersPages ? "pointer-events-none opacity-50" : ""}
                            href="#"
                          >
                            <span>下一页</span>
                            <ChevronRight className="h-4 w-4" />
                          </PaginationNext>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SystemSettingsPage />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Website Dialog - Fixed positioning and behavior */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-[425px] max-h-[85vh] overflow-y-auto rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
            handleEditDialogClose(false)
          }}
        >
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              编辑网站
            </DialogTitle>
            <DialogDescription>修改网站信息和分类。</DialogDescription>
          </DialogHeader>
          {editingWebsite && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">标题</Label>
                <Input
                  id="edit-title"
                  value={editingWebsite.title}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, title: e.target.value })}
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-url">网址</Label>
                <Input
                  id="edit-url"
                  value={editingWebsite.url}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, url: e.target.value })}
                  placeholder="https://example.com"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-icon">图标URL</Label>
                <Input
                  id="edit-icon"
                  value={editingWebsite.favicon || ""}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, favicon: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-muted-foreground">网站图标或标志图片的URL地址</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">分类</Label>
                <Select
                  value={editingWebsite.category_id}
                  onValueChange={(value) => setEditingWebsite({ ...editingWebsite, category_id: value })}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={editingWebsite.description}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, description: e.target.value })}
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tags">标签</Label>
                <Input
                  id="edit-tags"
                  value={editingWebsite.tags as any}
                  onChange={(e) => setEditingWebsite({ ...editingWebsite, tags: e.target.value } as any)}
                  className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">状态</Label>
                <Select
                  value={editingWebsite.status}
                  onValueChange={(value: SupabaseWebsite["status"]) => setEditingWebsite({ ...editingWebsite, status: value })}
                >
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-purple-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待审核</SelectItem>
                    <SelectItem value="approved">已批准</SelectItem>
                    <SelectItem value="rejected">已拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleEditDialogClose(false)}>
              取消
            </Button>
            <Button
              onClick={handleEditWebsite}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              保存修改
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Copyright Footer - Fixed at bottom */}
      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-center py-3 px-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>by</span>
            <a
              href="https://github.com/Sube3494"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary transition-colors duration-200 hover:underline"
            >
              Sube
            </a>
            <span className="text-xs opacity-60">© 2025</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
