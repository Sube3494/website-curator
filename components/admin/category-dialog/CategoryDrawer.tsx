"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ColorPresetsPanel, ColorPreset, GroupedPresets } from "./ColorPresetsPanel"
import { CustomColorPanel } from "./CustomColorPanel"
import { DialogFooterSticky } from "./DialogFooterSticky"

export interface CategoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string

  name: string
  onNameChange: (value: string) => void

  presets: GroupedPresets
  isCustom: boolean
  onToggleCustom: () => void
  fromHex?: string
  toHex?: string
  onChangeFromHex: (hex: string) => void
  onChangeToHex: (hex: string) => void
  isPresetSelected: (preset: ColorPreset) => boolean
  onSelectPreset: (preset: ColorPreset) => void
  
  // 预览颜色（可与输入分离以支持本地态）
  previewFromHex?: string
  previewToHex?: string

  onCancel: () => void
  onSubmit: () => void
  submitDisabled?: boolean
  submitLabel: string
}

export function CategoryDrawer(props: CategoryDrawerProps) {
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
    onCancel,
    onSubmit,
    submitDisabled,
    submitLabel,
  } = props

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[460px] md:max-w-[520px]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        {/* 顶部预览条 */}
        <div className="mt-3 mb-3 rounded-xl border bg-white/80 dark:bg-gray-800/80 p-3">
          <div className="h-10 w-full rounded-full shadow-inner" style={{ background: `linear-gradient(90deg, ${fromHex || '#10b981'}, ${toHex || '#06b6d4'})` }} />
          <div className="mt-2 text-xs text-muted-foreground">{name || '分类名称'}</div>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
          <section className="rounded-xl border bg-white/80 dark:bg-gray-800/80 p-3">
            <Label htmlFor="drawer-category-name" className="mb-2 block">分类名称</Label>
            <Input id="drawer-category-name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="输入分类名称" />
          </section>

          <section className="rounded-xl border bg-white/80 dark:bg-gray-800/80 p-3">
            <div className="mb-3">
              <Label className="mb-1 block">颜色选择</Label>
              <p className="text-xs text-muted-foreground">选择预设配色或启用自定义颜色</p>
            </div>
            <div className="space-y-4">
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
      </SheetContent>
    </Sheet>
  )
}

export default CategoryDrawer


