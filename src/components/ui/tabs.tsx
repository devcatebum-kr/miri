import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("flex gap-1.5", className)} {...props} />
}
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "flex-1 cursor-pointer rounded-[11px] border-[1.5px] border-input bg-card px-2.5 py-2 text-[12.5px] font-extrabold text-sub transition-colors outline-none",
        "data-[state=active]:border-primary data-[state=active]:text-[color:var(--primary)]",
        className
      )}
      {...props}
    />
  )
}
const TabsContent = TabsPrimitive.Content
export { Tabs, TabsList, TabsTrigger, TabsContent }
