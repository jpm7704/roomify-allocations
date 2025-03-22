
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  shimmer = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { shimmer?: boolean }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/70",
        shimmer && "shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
