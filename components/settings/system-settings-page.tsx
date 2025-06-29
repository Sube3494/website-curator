"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useSystemSettings } from "@/lib/system-settings-context"
import { toast } from "sonner"
import { Upload, Settings, Save } from "lucide-react"

export function SystemSettingsPage() {
    const { settings, updateSetting, isLoading } = useSystemSettings()
    const [allowUserSubmissions, setAllowUserSubmissions] = useState(settings.allow_website_submission)
    const [hasChanges, setHasChanges] = useState(false)

    // 当设置加载完成时，同步本地状态
    useEffect(() => {
        setAllowUserSubmissions(settings.allow_website_submission)
        setHasChanges(false)
    }, [settings.allow_website_submission])

    // 处理开关变化
    const handleSwitchChange = (checked: boolean) => {
        setAllowUserSubmissions(checked)
        setHasChanges(true)
    }

    // 保存设置
    const saveSettings = async () => {
        try {
            await updateSetting('allow_website_submission', allowUserSubmissions)
            toast.success("系统设置已更新")
            setHasChanges(false)
        } catch (error) {
            console.error("保存设置失败:", error)
            toast.error("保存设置失败，请重试")
        }
    }

    return (
        <div className="w-full">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-green-600" />
                                系统设置
                            </CardTitle>
                            <CardDescription>配置系统功能和用户权限</CardDescription>
                        </div>
                        {hasChanges && (
                            <Button
                                onClick={saveSettings}
                                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                保存设置
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur p-6">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Upload className="h-4 w-4 text-blue-600" />
                                        <Label htmlFor="allowUserSubmissions" className="font-medium">用户提交功能</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        允许普通用户提交网站建议，需要管理员审核通过后才会显示在公开列表
                                    </p>
                                </div>
                                <Switch
                                    id="allowUserSubmissions"
                                    checked={allowUserSubmissions}
                                    onCheckedChange={handleSwitchChange}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* 注释：系统默认对所有提交的网站进行审核，这是固定的设计，不作为可配置选项 */}

                            {/* 未来可以在这里添加更多设置项 */}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 