"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export interface CustomColorState {
  is_custom: boolean
  custom_from_hex: string
  custom_to_hex: string
}

export interface CustomColorPanelProps {
  title?: string
  isCustom: boolean
  fromHex: string
  toHex: string
  onToggleCustom: () => void
  onChangeFrom: (hex: string) => void
  onChangeTo: (hex: string) => void
}

export function CustomColorPanel({ title = "自定义颜色", isCustom, fromHex, toHex, onToggleCustom, onChangeFrom, onChangeTo }: CustomColorPanelProps) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
      <div className="space-y-3">
        <button
          type="button"
          onClick={onToggleCustom}
          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 pointer-coarse:p-4 ${
            isCustom ? "border-orange-500 shadow-lg bg-orange-50 dark:bg-orange-900/20" : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
          }`}
        >
          <div className="h-6 w-full rounded mb-2 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="custom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={fromHex || '#f97316'} />
                <stop offset="100%" stopColor={toHex || '#f59e0b'} />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="100" height="10" fill="url(#custom-grad)" rx="999" ry="999" />
          </svg>
        </div>
          <p className="text-sm font-medium">{isCustom ? "自定义颜色 (已选择)" : "点击选择自定义颜色"}</p>
        </button>

        {isCustom && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label htmlFor="custom-from-color" className="text-xs">起始颜色</Label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <input
                  id="custom-from-color"
                  type="color"
                  value={fromHex}
                  onChange={(e) => onChangeFrom(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                  title="选择起始颜色"
                />
                <Input value={fromHex} onChange={(e) => onChangeFrom(e.target.value)} className="text-xs" placeholder="#000000" />
              </div>
            </div>
            <div>
              <Label htmlFor="custom-to-color" className="text-xs">结束颜色</Label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <input
                  id="custom-to-color"
                  type="color"
                  value={toHex}
                  onChange={(e) => onChangeTo(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                  title="选择结束颜色"
                />
                <Input value={toHex} onChange={(e) => onChangeTo(e.target.value)} className="text-xs" placeholder="#000000" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomColorPanel


