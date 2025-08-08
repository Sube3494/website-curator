"use client"

import React, { ReactNode } from "react"

export interface DialogFooterStickyProps {
  children: ReactNode
}

export function DialogFooterSticky({ children }: DialogFooterStickyProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 pt-3 mt-3 border-t border-black/5 dark:border-white/10 bg-background/60 backdrop-blur">
      <div className="flex justify-end gap-2 px-3 sm:px-4 py-2">{children}</div>
    </div>
  )
}

export default DialogFooterSticky


