"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Menu, X, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/user-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function LandingNav() {
  const { isSignedIn, isLoaded } = useUser();
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-6">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 text-lg font-semibold"
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="h-5 w-5 text-teal-500" />
                  <span>RFP Analysis</span>
                </Link>
                <div className="flex flex-col gap-2">
                  <Link 
                    href="/#features" 
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === "/features" ? "bg-muted font-medium" : "hover:bg-muted"
                    )}
                  >
                    Features
                  </Link>
                  <Link 
                    href="#pricing" 
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === "#pricing" ? "bg-muted font-medium" : "hover:bg-muted"
                    )}
                  >
                    Pricing
                  </Link>
                  <Link 
                    href="#testimonials" 
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === "#testimonials" ? "bg-muted font-medium" : "hover:bg-muted"
                    )}
                  >
                    Testimonials
                  </Link>
                  <Link 
                    href="#faq" 
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      pathname === "#faq" ? "bg-muted font-medium" : "hover:bg-muted"
                    )}
                  >
                    FAQ
                  </Link>
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-4 border-t">
                  {isSignedIn ? (
                    <>
                      <Button asChild variant="outline" className="w-full justify-between">
                        <Link href="/dashboard">
                          Dashboard
                          <span className="sr-only">Dashboard</span>
                        </Link>
                      </Button>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Account</div>
                        <UserButton />
                      </div>
                    </>
                  ) : (
                    <>
                      <SignInButton mode="modal">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
                          Sign Up
                        </Button>
                      </SignUpButton>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-teal-500" />
            <span className="text-xl font-bold">RFP Analysis</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground/80",
              pathname === "#features" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground/80",
              pathname === "#pricing" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Pricing
          </Link>
          <Link
            href="#testimonials"
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground/80",
              pathname === "#testimonials" ? "text-foreground" : "text-foreground/60"
            )}
          >
            Testimonials
          </Link>
          <Link
            href="#faq"
            className={cn(
              "text-sm font-medium transition-colors hover:text-foreground/80",
              pathname === "#faq" ? "text-foreground" : "text-foreground/60"
            )}
          >
            FAQ
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isSignedIn ? (
            <>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
                  Sign Up Free
                </Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

