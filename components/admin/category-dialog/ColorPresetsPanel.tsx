"use client"

import React, { createElement } from "react"
import { GradientBar } from "@/components/ui/gradient-bar"

export interface ColorPreset {
  name: string
  from: string
  to: string
  fromHex: string
  toHex: string
}

export type GroupedPresets = Record<string, ColorPreset[]>

export interface ColorPresetsPanelProps {
  presets: GroupedPresets
  isSelected: (preset: ColorPreset) => boolean
  onSelect: (preset: ColorPreset) => void
  className?: string
}

function getGroupLabel(groupKey: string): string {
  switch (groupKey) {
    case "warm":
      return "暖色调"
    case "cool":
      return "冷色调"
    case "purple":
      return "紫色系"
    case "neutral":
      return "中性色"
    default:
      return "特殊色"
  }
}

export function ColorPresetsPanel({ presets, isSelected, onSelect, className }: ColorPresetsPanelProps) {
  return (
    <div className={className}>
      {Object.entries(presets).map(([group, groupPresets]) => (
        <div key={group} className="mb-4 last:mb-0">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
            {getGroupLabel(group)}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 pointer-coarse:gap-4">
            {groupPresets.map((preset) => {
              const selected = isSelected(preset)
              return (
                <button
                  key={`${preset.from}-${preset.to}`}
                  type="button"
                  onClick={() => onSelect(preset)}
                  className={`p-2 rounded-lg border-2 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] pointer-coarse:p-4 ${
                    selected ? "border-orange-500 shadow-lg" : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <GradientBar from={preset.fromHex} to={preset.toHex} className="h-8 sm:h-9 w-full rounded-full mb-1" />
                  <p className="text-[11px] sm:text-xs text-center leading-none mt-1">{preset.name}</p>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ColorPresetsPanel


