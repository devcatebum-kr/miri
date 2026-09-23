import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold leading-none",
  {
    variants: {
      tone: {
        must: "text-miss bg-[var(--miss-bg)]",
        check: "text-check bg-[var(--check-bg)]",
        neutral: "text-sub bg-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)
function Badge({ className, tone, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
export { Badge }
