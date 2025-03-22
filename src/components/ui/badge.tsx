
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary/15 text-primary ring-primary/30 hover:bg-primary/25 backdrop-blur-sm",
        secondary:
          "bg-secondary/20 text-secondary-foreground ring-secondary/30 hover:bg-secondary/30 backdrop-blur-sm",
        destructive:
          "bg-destructive/15 text-destructive ring-destructive/30 hover:bg-destructive/25 backdrop-blur-sm",
        outline:
          "text-foreground/70 ring-border bg-background/30 backdrop-blur-xl hover:bg-muted/30",
        peach:
          "bg-peach-200/80 text-maroon-800 ring-peach-300/50 hover:bg-peach-200 backdrop-blur-sm",
        maroon:
          "bg-maroon-100/80 text-maroon-700 ring-maroon-300/50 hover:bg-maroon-100 backdrop-blur-sm",
        blue:
          "bg-blue-100/80 text-blue-700 ring-blue-300/50 hover:bg-blue-100 backdrop-blur-sm",
        orange:
          "bg-orange-100/80 text-orange-700 ring-orange-300/50 hover:bg-orange-100 backdrop-blur-sm",
        green:
          "bg-green-100/80 text-green-700 ring-green-300/50 hover:bg-green-100 backdrop-blur-sm",
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
