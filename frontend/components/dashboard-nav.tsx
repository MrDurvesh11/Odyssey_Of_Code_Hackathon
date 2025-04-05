"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Menu, X, BarChart, FileText, Settings, Home, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserButton } from "@/components/user-button";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sheet when path changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Wait for auth to load and component to mount
  if (!mounted || !isLoaded) return null;

  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="flex flex-col gap-4 pt-4">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="h-5 w-5 text-teal-500" />
                <span>RFP Analysis</span>
              </Link>
              
              <div className="grid gap-2 pt-2">
                <Link 
                  href="/" 
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === "/" 
                      ? "bg-muted font-medium text-foreground" 
                      : "hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Home className="h-4 w-4" />
                  Home
                </Link>
                
                {isSignedIn && (
                  <>
                    <Link 
                      href="/dashboard" 
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === "/dashboard" 
                          ? "bg-muted font-medium text-foreground" 
                          : "hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <BarChart className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/settings" 
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === "/settings" 
                          ? "bg-muted font-medium text-foreground" 
                          : "hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-auto">
                {isSignedIn ? (
                  <div className="flex flex-col gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2 p-2">
                      <UserButton />
                      <div className="grid gap-0.5">
                        <p className="text-sm font-medium">{user.fullName || user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <SignInButton mode="modal">
                      <Button variant="outline" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="w-full justify-start">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        
        <Link href="/" className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-teal-500" />
          <span className="font-semibold inline-block">RFP Analysis</span>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center gap-5">
        <Link 
          href="/" 
          className={cn(
            "text-sm font-medium transition-colors hover:text-foreground/80",
            pathname === "/" ? "text-foreground" : "text-foreground/60"
          )}
        >
          Home
        </Link>
        
        {isSignedIn ? (
          <>
            <Link 
              href="/dashboard" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Dashboard
            </Link>
            <Link 
              href="/settings" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === "/settings" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Settings
            </Link>
            <UserButton />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Sign Up</Button>
            </SignUpButton>
          </div>
        )}
      </nav>
    </header>
  );
}

