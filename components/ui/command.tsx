import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function Command({ className, ...props }, ref) {
  return <CommandPrimitive ref={ref} className={cn("u-cmd", className)} {...props} />
})

export function CommandInput({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) {
  return (
    <div className="u-cmd-search">
      <Search size={15} aria-hidden="true" />
      <CommandPrimitive.Input className={cn("u-cmd-input", className)} {...props} />
    </div>
  )
}

export function CommandList({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn("u-cmd-list", className)} {...props} />
}

export function CommandEmpty({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className={cn("u-cmd-empty", className)} {...props} />
}

export function CommandGroup({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn("u-cmd-group", className)} {...props} />
}

export function CommandItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>) {
  return <CommandPrimitive.Item className={cn("u-cmd-item", className)} {...props} />
}

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("u-cmd-key", className)} {...props} />
}
