"use client"

import { useState } from "react"
import { Filter, Tag, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface FilterTag {
  id: string
  name: string
  count?: number
}

interface FilterPanelProps {
  selectedTags: string[]
  onSelectTag: (tagId: string) => void
  onRemoveTag: (tagId: string) => void
  onClearTags: () => void
  availableTags: FilterTag[]
  className?: string
}

export function FilterPanel({
  selectedTags,
  onSelectTag,
  onRemoveTag,
  onClearTags,
  availableTags,
  className
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleTagSelect = (tagId: string) => {
    onSelectTag(tagId)
    // 不关闭下拉菜单，允许多选
  }
  
  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>标签筛选</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto">
            <DropdownMenuLabel>
              <div className="flex items-center justify-between">
                <span>按标签筛选</span>
                {selectedTags.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      onClearTags()
                      setIsOpen(false)
                    }}
                    className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                  >
                    清除全部
                  </Button>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {availableTags.length === 0 ? (
                <DropdownMenuItem disabled>
                  <span className="text-muted-foreground">无可用标签</span>
                </DropdownMenuItem>
              ) : (
                availableTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id)
                  return (
                    <DropdownMenuItem 
                      key={tag.id}
                      onClick={() => handleTagSelect(tag.id)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span className={isSelected ? "text-emerald-600 font-medium" : ""}>
                          {tag.name}
                        </span>
                      </div>
                      {tag.count !== undefined && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {tag.count}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  )
                })
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center">
            {selectedTags.map((tagId) => {
              const tag = availableTags.find(t => t.id === tagId)
              if (!tag) return null
              
              return (
                <Badge 
                  key={tagId}
                  variant="secondary" 
                  className="pl-2 pr-1 py-1 flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                >
                  {tag.name}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemoveTag(tagId)}
                    className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800"
                  >
                    <X className="h-2.5 w-2.5" />
                  </Button>
                </Badge>
              )
            })}
            
            {selectedTags.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearTags}
                className="h-7 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
              >
                清除全部
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 