"use client"

import { useState, useEffect } from "react"
import { Search, X, Tag } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useSupabaseAuth } from "@/lib/supabase-auth-context"
import { useCategories, useAddWebsite } from "@/lib/hooks/use-websites"
import { toast } from "sonner"

interface SubmitWebsiteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function SubmitWebsiteDialog({ open, onOpenChange }: SubmitWebsiteDialogProps) {
    const { user } = useSupabaseAuth()
    const { data: categories = [] } = useCategories()
    const addWebsiteMutation = useAddWebsite()

    const [newWebsite, setNewWebsite] = useState({
        title: "",
        url: "",
        description: "",
        category_id: "",
        favicon: "",
        tags: ""
    })

    const [tagInput, setTagInput] = useState("")
    const [tags, setTags] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 重置表单
    useEffect(() => {
        if (open) {
            setNewWebsite({
                title: "",
                url: "",
                description: "",
                category_id: "",
                favicon: "",
                tags: ""
            })
            setTags([])
            setTagInput("")
            setIsSubmitting(false)
        }
    }, [open])

    // 处理标签添加
    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()])
            setTagInput("")
        }
    }

    // 处理按回车添加标签
    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            handleAddTag()
        }
    }

    // 处理移除标签
    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleSubmit = async () => {
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
            setIsSubmitting(true)
            
            // 立即显示提交中状态
            toast.loading('正在提交网站，请稍候...')
            
            const websiteData = {
                title: newWebsite.title.trim(),
                url: newWebsite.url.trim(),
                description: newWebsite.description.trim(),
                category_id: newWebsite.category_id,
                favicon: newWebsite.favicon?.trim() || undefined,
                // 用户提交的网站状态为pending，等待管理员审核
                status: "pending" as const,
                submitted_by: user.id,
                // 将标签数组传递给后端
                tags: tags
            }

            // 乐观关闭对话框，提高用户体验
            onOpenChange(false)
            
            await addWebsiteMutation.mutateAsync(websiteData)
            toast.dismiss()
            toast.success(`网站 "${newWebsite.title.trim()}" 提交成功！等待管理员审核`)
        } catch (error) {
            console.error('Error submitting website:', error)
            toast.dismiss()
            toast.error('提交网站失败，请重试')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            // 如果正在提交，阻止用户关闭对话框
            if (isSubmitting && !isOpen) return
            onOpenChange(isOpen)
        }}>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[85vh] overflow-y-auto rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        提交新网站
                    </DialogTitle>
                    <DialogDescription>
                        提交您发现的优质网站，审核通过后将会展示给所有用户
                    </DialogDescription>
                    <p className="text-sm text-muted-foreground mt-2">
                        所有提交的网站都需要经过管理员审核，审核通过后才会显示在公开列表中
                    </p>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="flex items-center gap-1">
                            网站标题 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={newWebsite.title}
                            onChange={(e) => setNewWebsite({ ...newWebsite, title: e.target.value })}
                            placeholder="输入网站标题"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="url" className="flex items-center gap-1">
                            网站地址 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="url"
                            value={newWebsite.url}
                            onChange={(e) => setNewWebsite({ ...newWebsite, url: e.target.value })}
                            placeholder="https://example.com"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="favicon">网站图标地址</Label>
                        <Input
                            id="favicon"
                            value={newWebsite.favicon}
                            onChange={(e) => setNewWebsite({ ...newWebsite, favicon: e.target.value })}
                            placeholder="https://example.com/favicon.ico（选填）"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">网站的图标URL，如果不提供将自动尝试获取</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="category" className="flex items-center gap-1">
                            网站分类 <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={newWebsite.category_id}
                            onValueChange={(value) => setNewWebsite({ ...newWebsite, category_id: value })}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
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
                        <Label htmlFor="description" className="flex items-center gap-1">
                            网站描述 <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={newWebsite.description}
                            onChange={(e) => setNewWebsite({ ...newWebsite, description: e.target.value })}
                            placeholder="简要描述此网站的内容和特色..."
                            className="h-24 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tags" className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-blue-600" />标签
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                placeholder="输入标签后按Enter添加"
                                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                                disabled={isSubmitting}
                            />
                            <Button
                                type="button"
                                onClick={handleAddTag}
                                disabled={!tagInput.trim() || isSubmitting}
                                variant="outline"
                                className="shrink-0"
                            >
                                添加
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">添加相关标签以便更好地分类和发现</p>

                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map(tag => (
                                    <Badge key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 p-0.5"
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">移除 {tag} 标签</span>
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button 
                        variant="outline" 
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        取消
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || addWebsiteMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    >
                        {isSubmitting || addWebsiteMutation.isPending ? "提交中..." : "提交网站"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 