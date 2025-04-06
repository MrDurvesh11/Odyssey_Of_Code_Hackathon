"use client"

import { ArrowUpRight, Calendar, FileText, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const recentDocuments = [
  {
    id: "1",
    title: "Federal IT Modernization RFP",
    date: "2023-11-15",
    status: "High Match",
    statusColor: "success",
    bidRecommendation: "Recommended",
    confidenceScore: 87,
  },
  {
    id: "2",
    title: "State Healthcare Portal Development",
    date: "2023-11-10",
    status: "Partial Match",
    statusColor: "warning",
    bidRecommendation: "Review Needed",
    confidenceScore: 62,
  },
  {
    id: "3",
    title: "Municipal Transportation System",
    date: "2023-11-05",
    status: "Low Match",
    statusColor: "destructive",
    bidRecommendation: "Not Recommended",
    confidenceScore: 34,
  },
]

export function RecentDocuments() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <Card className="border-teal-500/20 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
        <CardDescription>Your recently analyzed RFP documents</CardDescription>
      </CardHeader>
      <CardContent>
        <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
          {recentDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center justify-between rounded-lg border p-3 transition-all hover:border-teal-500/30 hover:bg-teal-500/5 ${
                doc.statusColor === "success"
                  ? "hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  : doc.statusColor === "warning"
                    ? "hover:border-amber-500/30 hover:bg-amber-500/5"
                    : "hover:border-red-500/30 hover:bg-red-500/5"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`rounded-md p-2 ${
                    doc.statusColor === "success"
                      ? "bg-emerald-500/10"
                      : doc.statusColor === "warning"
                        ? "bg-amber-500/10"
                        : "bg-red-500/10"
                  }`}
                >
                  <FileText
                    className={`h-5 w-5 ${
                      doc.statusColor === "success"
                        ? "text-emerald-500"
                        : doc.statusColor === "warning"
                          ? "text-amber-500"
                          : "text-red-500"
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{doc.title}</h3>
                    <Badge variant={doc.statusColor as "default" | "success" | "warning" | "destructive"}>
                      {doc.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {doc.date}
                    </div>
                    <div>Confidence: {doc.confidenceScore}%</div>
                    <div>Bid: {doc.bidRecommendation}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="h-8 w-8 hover:bg-teal-500/10 hover:text-teal-500"
                >
                  <Link href={`/analysis/${doc.id}`}>
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="sr-only">View analysis</span>
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-teal-500/10 hover:text-teal-500">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Export Report</DropdownMenuItem>
                    <DropdownMenuItem>Share Analysis</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  )
}

