"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  FileText,
  Search,
  Settings,
  Zap,
  LayoutDashboard,
  Bell,
  User,
  LogOut,
  HelpCircle,
  Calendar,
  CheckCircle,
  Users,
  ChevronRight,
  AlertTriangle,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isSignedIn, user } = useUser();

  const mainNavItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "RFPs",
      href: "/dashboard/rfps",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Analyze",
      href: "/dashboard/analyze",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: <BarChart2 className="h-4 w-4" />,
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      title: "Checklists",
      href: "/dashboard/checklists",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      title: "Team",
      href: "/dashboard/team",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: "Help",
      href: "/dashboard/help",
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className={cn(
      "fixed inset-y-0 z-30 h-full border-r bg-background/95 backdrop-blur transition-all duration-300", 
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex h-full flex-col">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-16 border-b">
          <Link href="/dashboard" className={cn("flex items-center", collapsed && "justify-center")}>
            {!collapsed ? (
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-600">
                RFP Nexus
              </span>
            ) : (
              <span className="text-2xl font-bold text-teal-500">R</span>
            )}
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-3 py-4">
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "bg-teal-500/10 text-teal-500"
                      : "text-muted-foreground",
                    collapsed && "justify-center p-2"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                  {collapsed && <span className="sr-only">{item.title}</span>}
                </Link>
              ))}
            </div>
          </div>

          <div className="px-3 py-2">
            <div className="space-y-1">
              {secondaryNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                    pathname === item.href
                      ? "bg-teal-500/10 text-teal-500"
                      : "text-muted-foreground",
                    collapsed && "justify-center p-2"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.title}</span>}
                  {collapsed && <span className="sr-only">{item.title}</span>}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 border-t">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              {isSignedIn ? (
                <div className="flex items-center gap-2">
                  <UserButton afterSignOutUrl="/" />
                  <div className="text-sm">
                    <p className="font-medium">{user?.fullName || user?.firstName}</p>
                    <p className="text-xs text-muted-foreground">{user?.publicMetadata?.role || "user"}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm" className="px-0">
                        Sign In
                      </Button>
                    </SignInButton>
                  </div>
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  {isSignedIn && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" /> Log out
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex justify-center">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <SignInButton mode="modal">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

