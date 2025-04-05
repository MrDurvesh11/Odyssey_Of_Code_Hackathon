"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Calendar, CheckCircle, FileText, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardShell } from "@/components/dashboard-shell";
import { RecentDocuments } from "@/components/recent-documents";
import { UploadDropzone } from "@/components/upload-dropzone";
import { WelcomeOnboarding } from "@/components/welcome-onboarding";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Component-level auth check
    if (isLoaded && !isSignedIn) {
      window.location.href = "/sign-in"; // Use window.location instead of redirect for client-side
    }
  }, [isLoaded, isSignedIn]);

  // Don't render anything until we know the authentication state
  if (!mounted || !isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If somehow we got here but not signed in, show nothing
  if (!isSignedIn) {
    return null;
  }

  // Rest of the component remains the same
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background/90 to-background">
      <DashboardNav />
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] md:gap-6 lg:gap-10 py-8">
        <DashboardSidebar />
        <main className="flex w-full flex-col overflow-hidden">
          <DashboardShell>
            <DashboardHeader
              heading="RFP Analysis Suite"
              subheading={`Welcome back, ${user.firstName || 'User'}! Upload and analyze RFP documents to get actionable insights.`}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              <Card className="border-teal-500/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm overflow-hidden group hover:border-teal-500/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total RFPs Analyzed</CardTitle>
                  <div className="rounded-full bg-teal-500/10 p-2 group-hover:bg-teal-500/20 transition-colors duration-300">
                    <FileText className="h-4 w-4 text-teal-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
              <Card className="border-teal-500/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm overflow-hidden group hover:border-teal-500/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
                  <div className="rounded-full bg-teal-500/10 p-2 group-hover:bg-teal-500/20 transition-colors duration-300">
                    <Calendar className="h-4 w-4 text-teal-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">128 hours</div>
                  <p className="text-xs text-muted-foreground">~5.3 hours per document</p>
                </CardContent>
              </Card>
              <Card className="border-teal-500/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm overflow-hidden group hover:border-teal-500/40 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bid Success Rate</CardTitle>
                  <div className="rounded-full bg-teal-500/10 p-2 group-hover:bg-teal-500/20 transition-colors duration-300">
                    <BarChart3 className="h-4 w-4 text-teal-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <p className="text-xs text-muted-foreground">+12% with AI assistance</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
            >
              <Card className="lg:col-span-4 border-teal-500/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm hover:border-teal-500/40 transition-all duration-300">
                <CardHeader>
                  <CardTitle>Upload New RFP</CardTitle>
                  <CardDescription>Drag and drop your RFP documents to begin analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadDropzone />
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">Supported formats: PDF, DOCX, TXT (Max size: 25MB)</p>
                </CardFooter>
              </Card>
              <Card className="lg:col-span-3 border-teal-500/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm hover:border-teal-500/40 transition-all duration-300">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                  <Button className="w-full justify-between group" variant="outline">
                    <span className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-teal-600 group-hover:text-teal-500 transition-colors" />
                      View Submission Checklists
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button className="w-full justify-between group" variant="outline">
                    <span className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4 text-teal-600 group-hover:text-teal-500 transition-colors" />
                      Risk Assessment Dashboard
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button className="w-full justify-between group" variant="outline">
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4 text-teal-600 group-hover:text-teal-500 transition-colors" />
                      Batch Upload Documents
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-md shadow-teal-500/10"
                  >
                    <Link href="/ai-assistant">Ask AI Assistant</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <RecentDocuments />
            </motion.div>

            <AnimatePresence>
              {showOnboarding && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <WelcomeOnboarding onClose={() => setShowOnboarding(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </DashboardShell>
        </main>
      </div>
    </div>
  );
}

