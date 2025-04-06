"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BellIcon,
  CreditCard,
  Key,
  Lock,
  User,
  Building,
  UserPlus,
  BellRing,
  Settings,
  Cloud,
  Mail,
  ShieldCheck,
  AlertOctagon,
  CheckCircle,
  Clock,
  CreditCardIcon,
  Badge ,
  
} from "lucide-react";

export default function SettingsPage() {
  const [savedPersonal, setSavedPersonal] = useState(false);
  const [savedNotifications, setSavedNotifications] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building className="h-4 w-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="team">
            <UserPlus className="h-4 w-4 mr-2" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <BellRing className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" defaultValue="Alex" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" defaultValue="Johnson" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" defaultValue="alex.johnson@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input id="jobTitle" defaultValue="Proposal Manager" />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  setSavedPersonal(true);
                  setTimeout(() => setSavedPersonal(false), 3000);
                }}
              >
                {savedPersonal ? "Saved!" : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-medium mb-3">Two-factor authentication</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <div className="font-medium">Authenticator app</div>
                    <div className="text-sm text-muted-foreground">
                      Use an authenticator app to generate one-time codes
                    </div>
                  </div>
                  <Button variant="outline">Setup</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="organization" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Manage your organization information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization name</Label>
                <Input id="orgName" defaultValue="Acme Solutions" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" type="url" defaultValue="https://acmesolutions.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="technology">
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgDescription">Description</Label>
                <Input id="orgDescription" defaultValue="Enterprise IT solutions provider" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select defaultValue="usa">
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="pst">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Organization</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Preferences</CardTitle>
              <CardDescription>
                Configure AI settings specific to your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Default analysis depth</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose the level of detail for RFP Nexus
                    </p>
                  </div>
                  <Select defaultValue="detailed">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select depth" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">Quick Analysis</SelectItem>
                      <SelectItem value="detailed">Detailed Analysis</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Industry-specific analysis</Label>
                    <p className="text-sm text-muted-foreground">
                      Use industry-specific knowledge models
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Custom terminology</Label>
                    <p className="text-sm text-muted-foreground">
                      Use your organization's terminology database
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Competitive intelligence</Label>
                    <p className="text-sm text-muted-foreground">
                      Include market and competitive analysis
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your team and permissions
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Alex Johnson</h3>
                      <p className="text-sm text-muted-foreground">alex.johnson@example.com • Admin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="admin">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Sarah Lee</h3>
                      <p className="text-sm text-muted-foreground">sarah.lee@example.com • Editor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="editor">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Michael Chen</h3>
                      <p className="text-sm text-muted-foreground">michael.chen@example.com • Viewer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="viewer">
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Permissions</CardTitle>
              <CardDescription>
                Configure role-based permissions for your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Admin Role</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-rfp-create">Create and manage RFPs</Label>
                      <Switch id="admin-rfp-create" checked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-rfp-analyze">Analyze RFPs with AI</Label>
                      <Switch id="admin-rfp-analyze" checked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-team-manage">Manage team members</Label>
                      <Switch id="admin-team-manage" checked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-billing">Manage billing and subscriptions</Label>
                      <Switch id="admin-billing" checked disabled />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Editor Role</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="editor-rfp-create">Create and manage RFPs</Label>
                      <Switch id="editor-rfp-create" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="editor-rfp-analyze">Analyze RFPs with AI</Label>
                      <Switch id="editor-rfp-analyze" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="editor-team-manage">Manage team members</Label>
                      <Switch id="editor-team-manage" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="editor-billing">Manage billing and subscriptions</Label>
                      <Switch id="editor-billing" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Viewer Role</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="viewer-rfp-view">View RFPs</Label>
                      <Switch id="viewer-rfp-view" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="viewer-rfp-analyze">Analyze RFPs with AI</Label>
                      <Switch id="viewer-rfp-analyze" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="viewer-reports-view">View analysis reports</Label>
                      <Switch id="viewer-reports-view" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Permissions</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-rfp-new">New RFP published</Label>
                    </div>
                    <Switch id="email-rfp-new" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-rfp-deadline">RFP deadline approaching</Label>
                    </div>
                    <Switch id="email-rfp-deadline" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-analysis-complete">Analysis complete</Label>
                    </div>
                    <Switch id="email-analysis-complete" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="email-team-changes">Team member changes</Label>
                    </div>
                    <Switch id="email-team-changes" defaultChecked />
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6">In-App Notifications</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-rfp-new">New RFP published</Label>
                    </div>
                    <Switch id="app-rfp-new" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-rfp-deadline">RFP deadline approaching</Label>
                    </div>
                    <Switch id="app-rfp-deadline" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-analysis-complete">Analysis complete</Label>
                    </div>
                    <Switch id="app-analysis-complete" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="app-team-changes">Team member changes</Label>
                    </div>
                    <Switch id="app-team-changes" />
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mt-6">Notification Schedule</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="digest-frequency" className="text-base">Email digest frequency</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a digest of notifications instead of individual emails
                      </p>
                    </div>
                    <Select defaultValue="daily">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  setSavedNotifications(true);
                  setTimeout(() => setSavedNotifications(false), 3000);
                }}
              >
                {savedNotifications ? "Saved!" : "Save Preferences"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg border bg-primary/5">
                  <div>
                    <h3 className="font-medium text-lg">Enterprise Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      $499 per month, billed annually
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Unlimited RFP uploads and analyses</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Advanced AI response generation</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Up to 25 team members</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Priority support</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className="mb-2">Current Plan</Badge>
                    <Button variant="outline">Manage Plan</Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Payment Information</h3>
                  <div className="flex justify-between items-center p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Visa ending in 4242</p>
                        <p className="text-sm text-muted-foreground">Expires 12/2024</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-lg mb-2">Billing History</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="py-3 px-4 text-left text-sm font-medium">Date</th>
                          <th className="py-3 px-4 text-left text-sm font-medium">Description</th>
                          <th className="py-3 px-4 text-left text-sm font-medium">Amount</th>
                          <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                          <th className="py-3 px-4 text-right text-sm font-medium">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="py-3 px-4 text-sm">Nov 01, 2023</td>
                          <td className="py-3 px-4 text-sm">Enterprise Plan (Annual)</td>
                          <td className="py-3 px-4 text-sm">$5,988.00</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            <Button variant="ghost" size="sm">Download</Button>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 text-sm">Nov 01, 2022</td>
                          <td className="py-3 px-4 text-sm">Enterprise Plan (Annual)</td>
                          <td className="py-3 px-4 text-sm">$5,988.00</td>
                          <td className="py-3 px-4 text-sm">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Paid
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-right">
                            <Button variant="ghost" size="sm">Download</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage & Limits</CardTitle>
              <CardDescription>
                Monitor your usage and subscription limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">RFP Analyses</h3>
                  <span className="text-sm text-muted-foreground">78 / Unlimited</span>
                </div>
                {/* <Progress value={30} className="h-2" /> */}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Team Members</h3>
                  <span className="text-sm text-muted-foreground">12 / 25</span>
                </div>
                {/* <Progress value={48} className="h-2" /> */}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Storage Used</h3>
                  <span className="text-sm text-muted-foreground">2.1 GB / 50 GB</span>
                </div>
                {/* <Progress value={4} className="h-2" /> */}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">API Calls</h3>
                  <span className="text-sm text-muted-foreground">8,724 / 50,000</span>
                </div>
                {/* <Progress value={17} className="h-2" /> */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
