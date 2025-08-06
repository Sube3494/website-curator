"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAllSystemSettings, useUpdateSystemSetting } from "@/lib/hooks/use-system-settings"
import { toast } from "sonner"
import { Upload, Settings, Save, Clock, Users, Shield, Palette, Heart, Eye, Globe } from "lucide-react"

// 设置项配置
const settingConfigs = {
  allow_registration: { icon: Users, label: "用户注册", description: "允许新用户注册账户" },
  allow_website_submission: { icon: Upload, label: "网站提交", description: "允许用户提交新网站" },
  auto_approve_trusted_users: { icon: Shield, label: "自动批准可信用户", description: "自动批准可信用户提交的网站" },
  enable_animation: { icon: Palette, label: "动画效果", description: "启用页面动画和过渡效果" },
  enable_dark_mode: { icon: Eye, label: "暗色模式", description: "允许用户切换到暗色主题" },
  enable_favorites: { icon: Heart, label: "收藏功能", description: "允许用户收藏喜欢的网站" },
  require_approval_for_websites: { icon: Shield, label: "网站审核", description: "新提交的网站需要管理员审核" },
  show_footer: { icon: Globe, label: "显示页脚", description: "在页面底部显示页脚信息" },
  user_submissions: { icon: Upload, label: "用户提交功能", description: "允许普通用户提交网站建议" },
  favicon_cache_duration: { icon: Clock, label: "Favicon缓存时长", description: "网站图标缓存时长（小时）", type: "number", field: "hours" },
  max_websites_per_user: { icon: Users, label: "用户提交限制", description: "每个用户最大提交网站数量", type: "number", field: "limit" }
}

export function SystemSettingsPage() {
  const { data: settings = [], isLoading, error } = useAllSystemSettings()
  const updateSettingMutation = useUpdateSystemSetting()
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // 当设置加载完成时，同步本地状态
  useEffect(() => {
    if (settings && settings.length > 0) {
      const settingsObj: Record<string, any> = {}
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })
      setLocalSettings(settingsObj)
      setHasChanges(false)
    }
  }, [settings])

  // 处理开关变化
  const handleSwitchChange = (key: string, checked: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: { enabled: checked }
    }))
    setHasChanges(true)
  }

  // 处理数字输入变化
  const handleNumberChange = (key: string, field: string, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: { [field]: value }
    }))
    setHasChanges(true)
  }

  // 保存设置
  const saveSettings = async () => {
    try {
      console.log("正在保存系统设置...")
      
      // 找出有变化的设置
      const changedSettings = Object.keys(localSettings).filter(key => {
        const original = settings.find(s => s.key === key)?.value
        const current = localSettings[key]
        return JSON.stringify(original) !== JSON.stringify(current)
      })

      // 批量更新设置
      for (const key of changedSettings) {
        await updateSettingMutation.mutateAsync({ key, value: localSettings[key] })
      }

      toast.success("系统设置已更新")
      setHasChanges(false)
    } catch (error) {
      console.error("保存设置失败:", error)
      toast.error("保存设置失败，请重试")
    }
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-muted-foreground">加载系统设置中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-red-600">加载系统设置失败</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
              <CardDescription>配置系统功能和用户权限（共 {settings.length} 项设置）</CardDescription>
            </div>
            {hasChanges && (
              <Button
                onClick={saveSettings}
                disabled={updateSettingMutation.isPending}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettingMutation.isPending ? "保存中..." : "保存设置"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur p-6">
            <div className="space-y-6">
              {settings.map((setting, index) => {
                const config = settingConfigs[setting.key as keyof typeof settingConfigs]
                if (!config) return null

                const IconComponent = config.icon
                const currentValue = localSettings[setting.key] || setting.value

                return (
                  <div key={setting.key} className={`flex justify-between items-center ${index < settings.length - 1 ? 'pb-4 border-b' : ''}`}>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-blue-600" />
                        <Label htmlFor={setting.key} className="font-medium">{config.label}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {config.type === 'number' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            id={setting.key}
                            type="number"
                            min="1"
                            value={currentValue?.[config.field!] || 0}
                            onChange={(e) => handleNumberChange(setting.key, config.field!, parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-muted-foreground">
                            {config.field === 'hours' ? '小时' : '个'}
                          </span>
                        </div>
                      ) : (
                        <Switch
                          id={setting.key}
                          checked={currentValue?.enabled || false}
                          onCheckedChange={(checked) => handleSwitchChange(setting.key, checked)}
                          disabled={isLoading}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
