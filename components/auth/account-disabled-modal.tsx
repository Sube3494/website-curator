"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail } from "lucide-react"

interface AccountDisabledModalProps {
  open: boolean
  onClose: () => void
}

export function AccountDisabledModal({ open, onClose }: AccountDisabledModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            账户已被禁用
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 dark:text-gray-400 mt-2">
            您的账户已被管理员禁用，无法继续使用系统功能。
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  需要帮助？
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  如有疑问，请联系管理员：
                </p>
                <a 
                  href="mailto:sube@sube.top"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  sube@sube.top
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            我知道了
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 