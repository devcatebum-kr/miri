import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card" className={cn("bg-card text-card-foreground rounded-xl border shadow-[0_1px_3px_rgba(25,31,40,0.06)]", className)} {...props} />
}
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 px-5 pt-5", className)} {...props} />
}
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-extrabold text-ink leading-tight", className)} {...props} />
}
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 pb-5", className)} {...props} />
}
export { Card, CardHeader, CardTitle, CardContent }
