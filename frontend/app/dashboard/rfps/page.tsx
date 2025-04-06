"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, SearchIcon, PlusIcon, FilterIcon } from "lucide-react";

export default function RFPsPage() {
  const [rfps, setRfps] = useState([
    {
      id: "RFP-1001",
      title: "Enterprise Cloud Migration Solution",
      date: "2023-11-15",
      deadline: "2023-12-15",
      status: "Open",
      category: "IT Infrastructure",
    },
    {
      id: "RFP-1002",
      title: "Healthcare Data Analytics Platform",
      date: "2023-11-10",
      deadline: "2023-12-10",
      status: "Open",
      category: "Healthcare",
    },
    {
      id: "RFP-1003",
      title: "Smart City IoT Implementation",
      date: "2023-10-25",
      deadline: "2023-11-30",
      status: "Closed",
      category: "Smart City",
    },
    {
      id: "RFP-1004",
      title: "Financial Services Security Audit",
      date: "2023-11-01",
      deadline: "2023-12-05",
      status: "Open",
      category: "Financial",
    },
    {
      id: "RFP-1005",
      title: "Educational Content Management System",
      date: "2023-10-20",
      deadline: "2023-11-20",
      status: "Closed",
      category: "Education",
    },
  ]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">RFP Management</h1>
        <Button className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          New RFP
        </Button>
      </div>

      <div className="flex justify-between gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search RFPs..."
            className="pl-10 pr-4"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="it">IT Infrastructure</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="smartcity">Smart City</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your RFPs</CardTitle>
          <CardDescription>
            Manage and analyze your Request for Proposals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Published Date</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfps.map((rfp) => (
                <TableRow key={rfp.id}>
                  <TableCell className="font-medium">{rfp.id}</TableCell>
                  <TableCell>{rfp.title}</TableCell>
                  <TableCell>{rfp.date}</TableCell>
                  <TableCell>{rfp.deadline}</TableCell>
                  <TableCell>{rfp.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant={rfp.status === "Open" ? "default" : "secondary"}
                    >
                      {rfp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      Analyze
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {rfps.length} RFPs
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
