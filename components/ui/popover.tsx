"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { motion } from 'framer-motion'
import { useUiPreferences } from '@/lib/ui-preferences'

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, children, ...props }, ref) => {
  const { motionEnabled, motionLevel } = useUiPreferences()
  const duration = motionLevel === 'high' ? 0.22 : motionLevel === 'low' ? 0.12 : 0.18
  return (
    <PopoverPrimitive.Portal>
      {motionEnabled ? (
        <PopoverPrimitive.Content asChild ref={ref} align={align} sideOffset={sideOffset} {...props}>
          <motion.div
            className={cn(
              "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
              className
            )}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </PopoverPrimitive.Content>
      ) : (
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
            className
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Content>
      )}
    </PopoverPrimitive.Portal>
  )
})
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
