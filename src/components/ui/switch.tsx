"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cn } from "@/lib/utils"

function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-unchecked:bg-muted-foreground/30",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200 data-checked:translate-x-5 data-unchecked:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
