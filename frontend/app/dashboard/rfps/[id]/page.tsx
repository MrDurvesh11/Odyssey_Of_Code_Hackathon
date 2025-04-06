"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Share2,
  Zap,
} from "lucide-react";

export default function RFPDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  // Mock RFP data
  const rfp = {
    id: id,
    title: "Enterprise Cloud Migration Solution",
    description:
      "We are seeking proposals for a comprehensive enterprise cloud migration solution that will help our organization transition from on-premises infrastructure to a cloud-based environment. The solution should include assessment, planning, migration, and post-migration support services.",
    date: "2023-11-15",
    deadline: "2023-12-15",
    status: "Open",
    category: "IT Infrastructure",
    organization: "Acme Corporation",
    budget: "$100,000 - $150,000",
    duration: "6 months",
    sections: [
      {
        title: "Company Background",
        content:
          "Acme Corporation is a global leader in widget manufacturing with 5,000 employees across 20 locations. Our current IT infrastructure consists of 200+ servers, 50+ applications, and 5 petabytes of data.",
      },
      {
        title: "Project Objectives",
        content:
          "• Migrate 200+ on-premises servers to cloud\n• Ensure minimal disruption to business operations\n• Implement robust security and compliance measures\n• Establish monitoring and management framework\n• Train IT staff on cloud operations",
      },
      {
        title: "Technical Requirements",
        content:
          "• Assessment of current infrastructure and applications\n• Development of migration strategy and roadmap\n• Implementation of cloud landing zone\n• Migration of applications and data\n• Setup of security controls and compliance monitoring\n• Configuration of backup and disaster recovery",
      },
      {
        title: "Vendor Qualifications",
        content:
          "• Minimum 5 years experience in cloud migrations\n• Certified partnership with major cloud providers\n• Experience with similar scale migrations\n• References from at least 3 enterprise clients\n• Industry certifications for security and compliance",
      },
      {
        title: "Submission Requirements",
        content:
          "• Company profile and experience\n• Proposed solution approach\n• Project timeline and milestones\n• Pricing structure\n• Team composition and qualifications\n• Case studies of similar projects",
      },
    ],
    contacts: [
      {
        name: "John Smith",
        title: "IT Director",
        email: "john.smith@acmecorp.com",
        phone: "555-123-4567",
      },
      {
        name: "Sarah Johnson",
        title: "Procurement Manager",
        email: "sarah.johnson@acmecorp.com",
        phone: "555-987-6543",
      },
    ],
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to RFPs
        </Button>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{rfp.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>RFP {rfp.id}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Due: {rfp.deadline}</span>
            </div>
            <Badge variant={rfp.status === "Open" ? "default" : "secondary"}>
              {rfp.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analyze with AI
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="response">Response</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>RFP Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Organization</h3>
                  <p>{rfp.organization}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Category</h3>
                  <p>{rfp.category}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Budget</h3>
                  <p>{rfp.budget}</p>
                </div>
                <div>
                  <h3 className="font-medium text-muted-foreground">Duration</h3>
                  <p>{rfp.duration}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{rfp.description}</p>
              </div>
            </CardContent>
          </Card>

          {rfp.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{section.content}</p>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {rfp.contacts.map((contact, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    <h3 className="font-medium">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.title}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">{contact.email}</p>
                      <p className="text-sm">{contact.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                Our AI has analyzed this RFP to help you understand key requirements and competitive factors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Key Requirements</h3>
                  <ul className="mt-2 space-y-2 list-disc pl-5">
                    <li>Enterprise-scale cloud migration (200+ servers)</li>
                    <li>Minimal business disruption during migration</li>
                    <li>Security and compliance implementation</li>
                    <li>Monitoring and management framework</li>
                    <li>Staff training for cloud operations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Competitive Analysis</h3>
                  <p className="mt-2">
                    This RFP has moderate complexity with standard cloud migration requirements. Your company has a strong advantage in security implementation and staff training aspects. Consider emphasizing your experience with similar scale migrations and certified partnerships with cloud providers.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Suggested Response Focus</h3>
                  <ul className="mt-2 space-y-2 list-disc pl-5">
                    <li>Highlight experience with enterprise migrations</li>
                    <li>Emphasize minimal-disruption migration methodology</li>
                    <li>Detail security and compliance expertise</li>
                    <li>Showcase previous similar-scale projects</li>
                    <li>Present clear timeline with defined milestones</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Generate Response Draft</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Requirements</CardTitle>
              <CardDescription>
                Key requirements automatically extracted from the RFP
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Migrate 200+ on-premises servers to cloud</TableCell>
                    <TableCell>Technical</TableCell>
                    <TableCell>High</TableCell>
                    <TableCell>
                      <Badge variant="outline">To Address</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Implement robust security and compliance measures</TableCell>
                    <TableCell>Security</TableCell>
                    <TableCell>Critical</TableCell>
                    <TableCell>
                      <Badge variant="outline">To Address</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Ensure minimal disruption to business operations</TableCell>
                    <TableCell>Operational</TableCell>
                    <TableCell>High</TableCell>
                    <TableCell>
                      <Badge variant="outline">To Address</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Establish monitoring and management framework</TableCell>
                    <TableCell>Technical</TableCell>
                    <TableCell>Medium</TableCell>
                    <TableCell>
                      <Badge variant="outline">To Address</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Train IT staff on cloud operations</TableCell>
                    <TableCell>Training</TableCell>
                    <TableCell>Medium</TableCell>
                    <TableCell>
                      <Badge variant="outline">To Address</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Generator</CardTitle>
              <CardDescription>
                Generate your RFP response with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Create Your Response</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                  Use our AI-powered response generator to create a comprehensive, tailored response for this RFP.
                </p>
                <Button className="mt-6">Start Response Generator</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Adding these components to avoid errors since we're not importing them
function Table({ children }) {
  return <table className="w-full">{children}</table>;
}

function TableHeader({ children }) {
  return <thead>{children}</thead>;
}

function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

function TableRow({ children }) {
  return <tr>{children}</tr>;
}

function TableHead({ children, className }) {
  return <th className={className}>{children}</th>;
}

function TableCell({ children, className }) {
  return <td className={className}>{children}</td>;
}
