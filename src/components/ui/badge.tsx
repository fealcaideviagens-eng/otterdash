import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-success-bg text-secondary-foreground hover:bg-success-bg/80",
        secondary:
          "border-transparent bg-warning-bg text-secondary-foreground hover:bg-warning-bg/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        success:
          "border-transparent bg-success-bg text-success-foreground hover:bg-success-bg/80",
        warning:
          "border-transparent bg-warning-bg text-warning-foreground hover:bg-warning-bg/80",
        info:
          "border-transparent bg-info-bg text-info-foreground hover:bg-info-bg/80",
        buy:
          "border-transparent bg-buy text-buy-foreground hover:bg-buy/80",
        outline: "text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
