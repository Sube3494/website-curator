"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ColorPresetsPanel, ColorPreset, GroupedPresets } from "./ColorPresetsPanel"
import { CustomColorPanel } from "./CustomColorPanel"
import { PreviewCard } from "./PreviewCard"
import { DialogFooterSticky } from "./DialogFooterSticky"

export interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string

  name: string
  onNameChange: (value: string) => void

  presets: GroupedPresets
  isCustom: boolean
  onToggleCustom: () => void
  // 当前颜色（十六进制）
  fromHex?: string
  toHex?: string
  onChangeFromHex: (hex: string) => void
  onChangeToHex: (hex: string) => void

  // 选中预设逻辑
  isPresetSelected: (preset: ColorPreset) => boolean
  onSelectPreset: (preset: ColorPreset) => void

  // 预览颜色（可与输入分离以支持本地态）
  previewFromHex: string
  previewToHex: string

  onCancel: () => void
  onSubmit: () => void
  submitDisabled?: boolean
  submitLabel: string
}

export function CategoryDialog(props: CategoryDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    description,
    name,
    onNameChange,
    presets,
    isCustom,
    onToggleCustom,
    fromHex,
    toHex,
    onChangeFromHex,
    onChangeToHex,
    isPresetSelected,
    onSelectPreset,
    previewFromHex,
    previewToHex,
    onCancel,
    onSubmit,
    submitDisabled,
    submitLabel,
  } = props

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border bg-white/90 dark:bg-gray-900/85 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</DialogTitle>
          {description ? <DialogDescription className="text-xs sm:text-sm">{description}</DialogDescription> : null}
        </DialogHeader>

        {/* 顶部预览条（全宽） */}
        <div className="px-3 sm:px-5">
          <section className="rounded-xl border bg-white/80 dark:bg-gray-800/80 p-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="h-12 flex-1 rounded-full shadow-inner" style={{ background: `linear-gradient(90deg, ${previewFromHex}, ${previewToHex})` }} />
              <div className="text-xs sm:text-sm text-muted-foreground shrink-0 w-36">
                {name || '分类名称'}
              </div>
            </div>
          </section>
        </div>

        {/* 内容区：单列滚动 */}
        <div className="px-3 sm:px-5 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar space-y-6">
            <section className="rounded-xl border bg-white/80 dark:bg-gray-800/80 p-4">
              <Label htmlFor="category-name" className="mb-2 block">分类名称</Label>
              <Input id="category-name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="输入分类名称" />
            </section>

            <section className="rounded-xl border bg-white/80 dark:bg-gray-800/80 p-4">
              <div className="mb-3">
                <Label className="mb-1 block">颜色选择</Label>
                <p className="text-xs text-muted-foreground">选择预设配色或启用自定义颜色</p>
              </div>
              <div className="space-y-5">
                <ColorPresetsPanel presets={presets} isSelected={isPresetSelected} onSelect={onSelectPreset} />
                <CustomColorPanel
                  isCustom={isCustom}
                  fromHex={fromHex || ""}
                  toHex={toHex || ""}
                  onToggleCustom={onToggleCustom}
                  onChangeFrom={onChangeFromHex}
                  onChangeTo={onChangeToHex}
                />
              </div>
            </section>
        </div>

        <DialogFooterSticky>
          <Button variant="outline" onClick={onCancel}>取消</Button>
          <Button onClick={onSubmit} disabled={!!submitDisabled} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
            {submitLabel}
          </Button>
        </DialogFooterSticky>
      </DialogContent>
    </Dialog>
  )
}

export default CategoryDialog


