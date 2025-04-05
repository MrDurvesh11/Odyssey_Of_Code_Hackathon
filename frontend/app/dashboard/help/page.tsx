"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Book,
  FileQuestion,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Play,
  Search,
  ThumbsUp,
  Video
} from "lucide-react";
import Link from "next/link";

const faqData = [
  {
    category: "Getting Started",
    items: [
      {
        question: "How do I upload an RFP document?",
        answer: "You can upload an RFP document from the dashboard by clicking on the 'Upload New RFP' card or by navigating to the Documents section and clicking on the Upload button. We support PDF, DOCX, and TXT file formats up to 25MB in size."
      },
      {
        question: "What happens after I upload an RFP?",
        answer: "After uploading, our AI system automatically analyzes the document to extract key requirements, deadlines, and evaluation criteria. This process typically takes 1-3 minutes depending on the document size. Once completed, you'll see a detailed analysis in the Analysis section."
      },
      {
        question: "How accurate is the AI analysis?",
        answer: "Our AI system has an accuracy rate of over 90% for standard RFPs. However, for highly technical or specialized RFPs, we recommend reviewing the extracted information. You can always edit the extracted data if needed."
      },
      {
        question: "Can I invite team members to collaborate?",
        answer: "Yes, you can invite team members from the Team section. Click on 'Add Member' and enter their email address. They'll receive an invitation to join your workspace and collaborate on RFP responses."
      }
    ]
  },
  {
    category: "Analysis Features",
    items: [
      {
        question: "How does the requirement extraction work?",
        answer: "Our AI engine uses natural language processing to identify requirements, deliverables, and evaluation criteria within RFP documents. It categorizes these by topic and importance, allowing you to easily navigate complex documents."
      },
      {
        question: "Can I customize the analysis parameters?",
        answer: "Yes, you can adjust analysis parameters in Settings. You can modify detection sensitivity, prioritize certain requirement types, and customize categorization rules to better suit your industry needs."
      },
      {
        question: "What happens if the AI misses a requirement?",
        answer: "You can manually add requirements that may have been missed. Simply go to the Analysis section, click 'Add Requirement', and input the details. The AI also learns from these additions to improve future analyses."
      },
      {
        question: "How does the compliance checker work?",
        answer: "The compliance checker compares your draft response against all extracted requirements to ensure you've addressed everything. It provides a percentage score and highlights any missed items so you can complete them before submission."
      }
    ]
  },
  {
    category: "Response Generation",
    items: [
      {
        question: "How does AI-assisted response generation work?",
        answer: "Once requirements are extracted, you can use our AI to generate draft responses. The AI uses your company information, past successful proposals, and industry best practices to craft tailored responses that address each requirement effectively."
      },
      {
        question: "Can I customize the AI-generated responses?",
        answer: "Absolutely. AI-generated responses should be used as a starting point. You can edit, expand, or completely rewrite them. We recommend customizing them with specific details about your company's capabilities and past experience."
      },
      {
        question: "How can I save previous responses for reuse?",
        answer: "Our system automatically saves your previous responses in a content library. When writing new proposals, you can access this library and reuse content that performed well in the past, saving significant time on repetitive sections."
      }
    ]
  },
  {
    category: "Account & Billing",
    items: [
      {
        question: "How do I upgrade my subscription?",
        answer: "You can upgrade your subscription from the Settings > Billing section. We offer monthly and annual plans with different features and document limits. Annual subscriptions include a 20% discount compared to monthly billing."
      },
      {
        question: "What happens if I reach my document limit?",
        answer: "If you reach your document limit, you'll need to upgrade to a higher tier to upload additional documents. Alternatively, you can archive completed projects to free up space for new documents (archived projects can be reactivated later if needed)."
      },
      {
        question: "How do I add or remove team members?",
        answer: "Team members can be managed from the Team section. Click 'Add Member' to invite new users, or select an existing user and click 'Remove' to revoke their access. Team member limits depend on your subscription tier."
      }
    ]
  }
];

const videoTutorials = [
  {
    id: "1",
    title: "Getting Started with RFP AI",
    description: "Learn the basics of navigating the platform and uploading your first RFP.",
    duration: "5:24",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    url: "#"
  },
  {
    id: "2",
    title: "Advanced RFP Analysis Techniques",
    description: "Dive deeper into analysis features and learn how to extract maximum insights.",
    duration: "8:12",
    thumbnail: "https://images.unsplash.com/photo-1560472355-536de3962603?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    url: "#"
  },
  {
    id: "3",
    title: "Creating Winning Response Templates",
    description: "Develop reusable templates that save time and improve consistency.",
    duration: "6:45",
    thumbnail: "https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    url: "#"
  },
  {
    id: "4",
    title: "Team Collaboration Best Practices",
    description: "Learn how to effectively collaborate with your team on complex proposals.",
    duration: "7:18",
    thumbnail: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    url: "#"
  },
  {
    id: "5",
    title: "Using AI for Compliance Checking",
    description: "Ensure your proposals meet all requirements with automated compliance tools.",
    duration: "4:56",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    url: "#"
  },
  {
    id: "6",
    title: "Analytics & Performance Tracking",
    description: "Learn how to measure and improve your RFP response success rate.",
    duration: "9:33",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
    url: "#"
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "normal"
  });

  const filteredFaqs = faqData.map(category => {
    const filteredItems = category.items.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...category,
      items: filteredItems
    };
  }).filter(category => category.items.length > 0);

  const handleSupportSubmit = () => {
    // In a real app, you would send this to your backend
    console.log("Support request submitted:", supportForm);
    setSupportDialogOpen(false);
    
    // Reset form
    setSupportForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      priority: "normal"
    });
    
    // Show success message or notification
    alert("Your support request has been submitted. We'll get back to you soon!");
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Help & Support"
        subheading="Find answers to common questions and learn how to use RFP AI effectively."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-3 md:col-span-2 border-teal-500/20">
          <CardHeader className="pb-3">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help topics..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="pb-0">
            <Tabs defaultValue="faq" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="faq">
                  <FileQuestion className="h-4 w-4 mr-2" />
                  FAQ
                </TabsTrigger>
                <TabsTrigger value="videos">
                  <Video className="h-4 w-4 mr-2" />
                  Video Tutorials
                </TabsTrigger>
                <TabsTrigger value="docs">
                  <Book className="h-4 w-4 mr-2" />
                  Documentation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="faq" className="pt-4 pb-4">
                {filteredFaqs.length > 0 ? (
                  <>
                    {filteredFaqs.map((category, index) => (
                      <div key={category.category} className={index > 0 ? "mt-6" : ""}>
                        <h3 className="text-lg font-medium mb-3">{category.category}</h3>
                        <Accordion type="single" collapsible className="w-full">
                          {category.items.map((item, itemIndex) => (
                            <AccordionItem key={itemIndex} value={`item-${index}-${itemIndex}`}>
                              <AccordionTrigger className="text-base font-normal">
                                {item.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground">
                                <div className="pb-2">
                                  {item.answer}
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <div className="text-sm">Was this helpful?</div>
                                  <div className="flex gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className={activeFeedback === `${index}-${itemIndex}-yes` ? "bg-green-100 text-green-800" : ""}
                                      onClick={() => setActiveFeedback(`${index}-${itemIndex}-yes`)}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1" />
                                      Yes
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className={activeFeedback === `${index}-${itemIndex}-no` ? "bg-red-100 text-red-800" : ""}
                                      onClick={() => {
                                        setActiveFeedback(`${index}-${itemIndex}-no`);
                                        setSupportDialogOpen(true);
                                      }}
                                    >
                                      <ThumbsUp className="h-4 w-4 mr-1 rotate-180" />
                                      No
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No results found</p>
                    <p className="text-muted-foreground mb-4">
                      We couldn't find answers matching "{searchQuery}"
                    </p>
                    <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="videos" className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoTutorials.map((video) => (
                    <Link href={video.url} key={video.id} className="block">
                      <Card className="overflow-hidden h-full border-teal-500/20 hover:border-teal-500/40 transition-colors">
                        <div className="relative">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title} 
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-white/90 rounded-full p-3">
                              <Play className="h-6 w-6 text-teal-600" />
                            </div>
                          </div>
                          <Badge className="absolute top-2 right-2 bg-black/70">
                            {video.duration}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-1">{video.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {video.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="docs" className="pt-4">
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-medium">User Guides</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="border-teal-500/20 hover:border-teal-500/40 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Getting Started Guide</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Learn the basics of using the platform and setting up your account.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="#">View Guide</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="border-teal-500/20 hover:border-teal-500/40 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">AI Analysis Documentation</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Detailed explanation of how our AI analyzes RFP documents.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="#">View Guide</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="border-teal-500/20 hover:border-teal-500/40 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Response Generation Guide</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Master the AI-assisted response generation and review process.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="#">View Guide</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="border-teal-500/20 hover:border-teal-500/40 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Team Collaboration Manual</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Learn how to effectively collaborate with your team on proposals.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="#">View Guide</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API & Integrations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Card className="border-teal-500/20 hover:border-teal-500/40 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">API Documentation</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Complete reference for our REST API endpoints and usage examples.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="#">View Docs</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    <Card className="border-teal-500/20 hover:border-teal-500/40 transition-colors">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Integration Guides</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          Connect RFP AI with your CRM, project management, and document systems.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="#">View Guides</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 col-span-3 border-teal-500/20">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Need personalized help? Our support team is ready to assist you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-md">
              <div className="bg-teal-100 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Live Chat</h4>
                <p className="text-xs text-muted-foreground">Available Mon-Fri, 9am-6pm ET</p>
              </div>
              <Button size="sm" className="shrink-0">Chat Now</Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-md">
              <div className="bg-teal-100 p-2 rounded-full">
                <Mail className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Email Support</h4>
                <p className="text-xs text-muted-foreground">support@rfpai.example.com</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0" onClick={() => setSupportDialogOpen(true)}>
                Contact
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-md">
              <div className="bg-teal-100 p-2 rounded-full">
                <Phone className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Phone Support</h4>
                <p className="text-xs text-muted-foreground">Premium customers only</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">Call</Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <div className="w-full p-4 bg-muted/50 rounded-md">
              <h4 className="font-medium text-sm mb-2">Quick Support Resources</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-teal-500"></div>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Troubleshooting Guide
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-teal-500"></div>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    System Status Page
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-teal-500"></div>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Community Forums
                  </Link>
                </li>
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Support Request Dialog */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Fill out the form below to get help from our support team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="support-name">Name</Label>
                <Input
                  id="support-name"
                  value={supportForm.name}
                  onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                  placeholder="Your email address"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                value={supportForm.subject}
                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                value={supportForm.message}
                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                placeholder="Describe your issue in detail"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                value={supportForm.priority}
                onValueChange={(value) => setSupportForm({ ...supportForm, priority: value })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="priority-low" />
                  <Label htmlFor="priority-low" className="cursor-pointer">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="priority-normal" />
                  <Label htmlFor="priority-normal" className="cursor-pointer">Normal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="priority-high" />
                  <Label htmlFor="priority-high" className="cursor-pointer">High</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSupportDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSupportSubmit}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
