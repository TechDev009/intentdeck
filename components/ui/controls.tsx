import * as React from "react"
import { Checkbox as CheckboxPrimitive, Progress as ProgressPrimitive, Switch as SwitchPrimitive } from "radix-ui"
import { Check } from "lucide-react"
import { cn } from "../../lib/utils"

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root ref={ref} className={cn("u-check", className)} {...props}>
      <CheckboxPrimitive.Indicator className="u-check-ind">
        <Check size={12} strokeWidth={3.5} aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
  return (
    <SwitchPrimitive.Root ref={ref} className={cn("u-switch", className)} {...props}>
      <SwitchPrimitive.Thumb className="u-switch-thumb" />
    </SwitchPrimitive.Root>
  )
})

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { value?: number }
>(function Progress({ className, value, ...props }, ref) {
  return (
    <ProgressPrimitive.Root ref={ref} className={cn("u-progress", className)} value={value} {...props}>
      <ProgressPrimitive.Indicator className="u-progress-ind" style={{ width: `${Math.max(0, Math.min(100, value ?? 0))}%` }} />
    </ProgressPrimitive.Root>
  )
})
