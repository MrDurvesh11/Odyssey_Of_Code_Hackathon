"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Calendar, CheckCircle, FileText, Upload, Zap, Plus } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { RecentDocuments } from "@/components/recent-documents";
import { UploadDropzone } from "@/components/upload-dropzone";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="RFP Analysis Suite"
          subheading="Upload and analyze RFP documents to get actionable insights."
        />
        <Button className="hidden md:flex">
          <Plus className="mr-2 h-4 w-4" /> New Analysis
        </Button>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">RFPs Analyzed</CardTitle>
              <div className="rounded-full bg-teal-500/10 p-2">
                <FileText className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <div className="rounded-full bg-teal-500/10 p-2">
                <Calendar className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">128h</div>
              <p className="text-xs text-muted-foreground">~5.3 hours per document</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <div className="rounded-full bg-teal-500/10 p-2">
                <BarChart3 className="h-4 w-4 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">+12% with AI assistance</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-7"
      >
        <motion.div variants={itemVariants} className="md:col-span-4">
          <Card className="border-teal-500/20 hover:border-teal-500/40 transition-all duration-300">
            <CardHeader>
              <CardTitle>Upload New RFP</CardTitle>
              <CardDescription>Drag and drop your RFP documents to begin analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <UploadDropzone />
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">Supports PDF, DOCX, and TXT (Max: 25MB)</p>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} className="md:col-span-3">
          <Card className="border-teal-500/20 hover:border-teal-500/40 transition-all duration-300 h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-between group" variant="outline">
                <span className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-teal-600" />
                  Submission Checklists
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button className="w-full justify-between group" variant="outline">
                <span className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-teal-600" />
                  Risk Assessment
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button className="w-full justify-between group" variant="outline">
                <span className="flex items-center">
                  <Upload className="mr-2 h-4 w-4 text-teal-600" />
                  Batch Upload
                </span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
            <CardFooter>
              <Button
                asChild
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Link href="/ai-assistant">
                  <Zap className="mr-2 h-4 w-4" /> Ask AI Assistant
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <RecentDocuments />
      </motion.div>
    </div>
  );
}

