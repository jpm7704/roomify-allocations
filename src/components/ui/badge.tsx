
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/10 text-primary ring-primary/20 hover:bg-primary/20 backdrop-blur-sm",
        secondary:
          "bg-secondary/10 text-secondary-foreground ring-secondary/20 hover:bg-secondary/20 backdrop-blur-sm",
        destructive:
          "bg-destructive/10 text-destructive ring-destructive/20 hover:bg-destructive/20 backdrop-blur-sm",
        outline:
          "text-foreground/70 ring-border bg-background/30 backdrop-blur-xl hover:bg-muted/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
