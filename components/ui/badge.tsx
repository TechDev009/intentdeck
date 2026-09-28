import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva("u-badge", {
  variants: {
    variant: {
      default: "u-badge-default",
      secondary: "u-badge-secondary",
      outline: "u-badge-outline",
      success: "u-badge-success",
      warning: "u-badge-warning",
    },
  },
  defaultVariants: { variant: "default" },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
