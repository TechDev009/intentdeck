import * as React from "react"
import {
  Avatar as AvatarPrimitive,
  Select as SelectPrimitive,
  Slider as SliderPrimitive,
  Collapsible as CollapsiblePrimitive,
  ScrollArea as ScrollAreaPrimitive,
  ToggleGroup as ToggleGroupPrimitive,
} from "radix-ui"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

export const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(function Avatar({ className, ...props }, ref) {
  return <AvatarPrimitive.Root ref={ref} className={cn("u-avatar", className)} {...props} />
})

export const AvatarImage = AvatarPrimitive.Image

export const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(function AvatarFallback({ className, ...props }, ref) {
  return <AvatarPrimitive.Fallback ref={ref} className={cn("u-avatar-fb", className)} {...props} />
})

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(function SelectTrigger({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Trigger ref={ref} className={cn("u-select", className)} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={14} aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
})

export function SelectContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content className={cn("u-menu", className)} position="popper" sideOffset={5} {...props}>
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item ref={ref} className={cn("u-menu-item", className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="u-menu-check">
        <SelectPrimitive.ItemIndicator>
          <Check size={13} aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
})

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(function Slider({ className, ...props }, ref) {
  return (
    <SliderPrimitive.Root ref={ref} className={cn("u-slider", className)} {...props}>
      <SliderPrimitive.Track className="u-slider-track">
        <SliderPrimitive.Range className="u-slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="u-slider-thumb" aria-label="Value" />
    </SliderPrimitive.Root>
  )
})

export const Collapsible = CollapsiblePrimitive.Root
export const CollapsibleTrigger = CollapsiblePrimitive.Trigger
export const CollapsibleContent = CollapsiblePrimitive.Content

export const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(function ScrollArea({ className, children, ...props }, ref) {
  return (
    <ScrollAreaPrimitive.Root ref={ref} className={cn("u-scroll", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="u-scroll-vp">{children}</ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar orientation="vertical" className="u-scrollbar">
        <ScrollAreaPrimitive.Thumb className="u-scroll-thumb" />
      </ScrollAreaPrimitive.Scrollbar>
    </ScrollAreaPrimitive.Root>
  )
})

export const ToggleGroup = ToggleGroupPrimitive.Root

export const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(function ToggleGroupItem({ className, ...props }, ref) {
  return <ToggleGroupPrimitive.Item ref={ref} className={cn("u-toggle-item", className)} {...props} />
})
