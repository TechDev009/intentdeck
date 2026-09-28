import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva("u-btn", {
  variants: {
    variant: {
      default: "u-btn-default",
      secondary: "u-btn-secondary",
      outline: "u-btn-outline",
      ghost: "u-btn-ghost",
      destructive: "u-btn-destructive",
    },
    size: {
      default: "u-btn-md",
      sm: "u-btn-sm",
      lg: "u-btn-lg",
      icon: "u-btn-icon",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
})

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
}

export { buttonVariants }
