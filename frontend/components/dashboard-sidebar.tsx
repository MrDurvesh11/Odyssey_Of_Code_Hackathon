"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
  import { BarChart3, Calendar, CheckCircle, Database, FileText, HelpCircle, Home, Lightbulb, MessageSquare, Settings, Users } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export function DashboardSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Documents",
      icon: FileText,
      href: "/dashboard/documents",
      active: pathname === "/dashboard/documents",
    },
    {
      label: "Analysis",
      icon: BarChart3,
      href: "/dashboard/analysis",
      active: pathname === "/dashboard/analysis",
    },
    {
      label: "Checklists",
      icon: CheckCircle,
      href: "/dashboard/checklists",
      active: pathname === "/dashboard/checklists",
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/dashboard/calendar",
      active: pathname === "/dashboard/calendar",
    },
    {
      label: "Team",
      icon: Users,
      href: "/dashboard/team",
      active: pathname === "/dashboard/team",
    },
  ]

  const aiRoutes = [
    {
      label: "Help Center",
      icon: HelpCircle,
      href: "/dashboard/help",
      active: pathname === "/dashboard/help",
    },
    {
      label: "AI Responses",
      icon: MessageSquare,
      href: "/dashboard/ai-responses",
      active: pathname === "/dashboard/ai-responses",
    },
    {
      label: "Gemini Analysis",
      icon: Lightbulb,
      href: "/dashboard/ai-responses/gemini",
      active: pathname === "/dashboard/ai-responses/gemini",
    },
    {
      label: "Ollama Analysis",
      icon: Database,
      href: "/dashboard/ai-responses/ollama",
      active: pathname === "/dashboard/ai-responses/ollama",
    },
  ]

  const secondaryRoutes = [
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r border-r-border/40 md:sticky md:block">
      <ScrollArea className="py-6 pr-6 lg:py-8">
        <div className="flex flex-col gap-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    route.active && "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 hover:text-teal-600",
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">AI Resources</h2>
            <div className="space-y-1">
              {aiRoutes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    route.active && "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 hover:text-teal-600",
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">Settings</h2>
            <div className="space-y-1">
              {secondaryRoutes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    route.active && "bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 hover:text-teal-600",
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="rounded-lg border border-teal-500/20 bg-teal-500/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-full bg-teal-500/20 p-1">
                  <MessageSquare className="h-4 w-4 text-teal-500" />
                </div>
                <h3 className="font-medium">AI Insights</h3>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                View detailed AI analysis and generated responses from your RFPs.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-teal-500/20 hover:bg-teal-500/10 hover:text-teal-500"
                asChild
              >
                <Link href="/dashboard/ai-responses">View Responses</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}

