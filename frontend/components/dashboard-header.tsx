import type React from "react"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"
import { UserButton } from "@/components/user-button";

interface DashboardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  heading: string
  subheading?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, subheading, children, className, ...props }: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 pb-5", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="grid gap-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">{heading}</h1>
          {subheading && <p className="text-muted-foreground">{subheading}</p>}
        </div>
        <div className="flex items-center gap-4">
          {children}
          <UserButton />
        </div>
      </div>
    </div>
  )
}

