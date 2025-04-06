"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarIcon, 
  Check, 
  CheckCheck, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Copy, 
  Edit, 
  Eye, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Share2, 
  Trash, 
  UserPlus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ChecklistTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
  priority: "low" | "medium" | "high";
}

interface Checklist {
  id: string;
  title: string;
  description?: string;
  rfpId?: string;
  rfpName?: string;
  tasks: ChecklistTask[];
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
  category: "Pre-Bid" | "Proposal Development" | "Review" | "Submission" | "Post-Submission";
}

// Sample team members
const teamMembers = [
  {
    id: "1",
    name: "Emma Wilson",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "Lead Proposal Writer"
  },
  {
    id: "2",
    name: "David Chen",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "Technical Specialist"
  },
  {
    id: "3",
    name: "Sarah Johnson",
    avatar: "https://i.pravatar.cc/150?img=5", 
    role: "Business Analyst"
  },
  {
    id: "4",
    name: "James Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=7",
    role: "Graphics Designer"
  },
  {
    id: "5",
    name: "Mia Wong",
    avatar: "https://i.pravatar.cc/150?img=9",
    role: "Legal Specialist"
  }
];

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([
    {
      id: "1",
      title: "City Transit RFP Submission",
      description: "Final review checklist for Metro Transit Authority proposal",
      rfpId: "RFP-2023-0087",
      rfpName: "Metropolitan Transit Authority - City Transit Modernization",
      tasks: [
        {
          id: "task-1-1",
          title: "Verify compliance with all technical requirements",
          description: "Cross-check our proposal against all technical requirements in sections 3.1-3.8 of the RFP",
          completed: true,
          assignee: "2",
          dueDate: "2023-08-10",
          priority: "high"
        },
        {
          id: "task-1-2",
          title: "Review pricing structure",
          description: "Ensure all pricing components align with the required format in section 5",
          completed: true,
          assignee: "3",
          dueDate: "2023-08-11",
          priority: "high"
        },
        {
          id: "task-1-3",
          title: "Complete executive summary",
          description: "Finalize 2-page executive summary highlighting key differentiators",
          completed: false,
          assignee: "1",
          dueDate: "2023-08-12",
          priority: "medium"
        },
        {
          id: "task-1-4",
          title: "Proofread entire document",
          description: "Complete final review of all sections for grammar, spelling, and formatting",
          completed: false,
          assignee: "1",
          dueDate: "2023-08-13",
          priority: "medium"
        },
        {
          id: "task-1-5",
          title: "Prepare submission package",
          description: "Assemble all required materials including 5 hard copies and digital submission",
          completed: false,
          assignee: "4",
          dueDate: "2023-08-14",
          priority: "high"
        }
      ],
      createdAt: "2023-08-01T08:00:00Z",
      updatedAt: "2023-08-09T14:32:00Z",
      category: "Review"
    },
    {
      id: "2",
      title: "Healthcare Data Platform Proposal",
      description: "Initial response checklist for Regional Medical Center",
      rfpId: "RFP-2023-0104",
      rfpName: "Regional Medical Center - Healthcare Data Platform",
      tasks: [
        {
          id: "task-2-1",
          title: "Data security compliance documentation",
          description: "Prepare HIPAA and HITECH compliance documentation",
          completed: true,
          assignee: "5",
          dueDate: "2023-09-15",
          priority: "high"
        },
        {
          id: "task-2-2",
          title: "Technical approach section",
          description: "Draft the technical approach including data migration strategy",
          completed: false,
          assignee: "2",
          dueDate: "2023-09-18",
          priority: "high"
        },
        {
          id: "task-2-3",
          title: "Cost proposal",
          description: "Prepare detailed cost breakdown for all phases",
          completed: false,
          assignee: "3",
          dueDate: "2023-09-20",
          priority: "medium"
        },
        {
          id: "task-2-4",
          title: "Staff qualifications",
          description: "Compile resumes and qualifications for proposed team members",
          completed: false,
          assignee: "1",
          dueDate: "2023-09-22",
          priority: "low"
        }
      ],
      createdAt: "2023-09-01T09:30:00Z",
      updatedAt: "2023-09-10T11:45:00Z",
      category: "Proposal Development"
    },
    {
      id: "3",
      title: "Standard RFP Response Template",
      description: "Template checklist for general technology RFP responses",
      tasks: [
        {
          id: "task-3-1",
          title: "Company overview section",
          description: "Description of our organization, history, and capabilities",
          completed: false,
          priority: "medium"
        },
        {
          id: "task-3-2",
          title: "Qualification statements",
          description: "Standard qualification statements and certifications",
          completed: false,
          priority: "medium"
        },
        {
          id: "task-3-3",
          title: "Past performance",
          description: "Case studies and references from relevant past projects",
          completed: false,
          priority: "high"
        },
        {
          id: "task-3-4",
          title: "Technical approach framework",
          description: "Standard approach methodology and process overview",
          completed: false,
          priority: "medium"
        },
        {
          id: "task-3-5",
          title: "Pricing template",
          description: "Standard pricing structure and format",
          completed: false,
          priority: "high"
        },
        {
          id: "task-3-6",
          title: "Quality assurance review",
          description: "Final review of formatting, consistency, and completeness",
          completed: false,
          priority: "medium"
        }
      ],
      createdAt: "2023-07-15T10:00:00Z",
      updatedAt: "2023-07-15T10:00:00Z",
      isTemplate: true,
      category: "Proposal Development"
    }
  ]);

  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [isAddChecklistOpen, setIsAddChecklistOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isViewTaskOpen, setIsViewTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedTask, setSelectedTask] = useState<ChecklistTask | null>(null);
  
  const [newChecklist, setNewChecklist] = useState<Partial<Checklist>>({
    title: "",
    description: "",
    category: "Proposal Development",
    tasks: [],
    isTemplate: false
  });
  
  const [newTask, setNewTask] = useState<Partial<ChecklistTask>>({
    title: "",
    description: "",
    priority: "medium",
    completed: false
  });

  // Filter checklists by active tab
  const filteredChecklists = checklists.filter(checklist => {
    if (activeTab === "active") {
      return !checklist.isTemplate;
    } else if (activeTab === "templates") {
      return checklist.isTemplate;
    }
    return true;
  });

  // Sort checklists by updatedAt
  const sortedChecklists = [...filteredChecklists].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Calculate completion percentage for a checklist
  const getCompletionPercentage = (tasks: ChecklistTask[]) => {
    if (tasks.length === 0) return 0;
    const completedCount = tasks.filter(task => task.completed).length;
    return Math.round((completedCount / tasks.length) * 100);
  };

  // Format date to friendly string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  // Get team member by ID
  const getMemberById = (id: string) => {
    return teamMembers.find(member => member.id === id);
  };

  // Toggle task completion
  const toggleTaskCompletion = (checklistId: string, taskId: string) => {
    setChecklists(checklists.map(checklist => {
      if (checklist.id === checklistId) {
        return {
          ...checklist,
          tasks: checklist.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            return task;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return checklist;
    }));
  };

  // View task details
  const handleViewTask = (task: ChecklistTask) => {
    setSelectedTask(task);
    setIsViewTaskOpen(true);
  };

  // Add new checklist
  const handleAddChecklist = () => {
    if (newChecklist.title) {
      const checklistToAdd: Checklist = {
        id: `checklist-${new Date().getTime()}`,
        title: newChecklist.title || "",
        description: newChecklist.description,
        rfpId: newChecklist.rfpId,
        rfpName: newChecklist.rfpName,
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isTemplate: newChecklist.isTemplate || false,
        category: newChecklist.category || "Proposal Development"
      };
      
      setChecklists([...checklists, checklistToAdd]);
      setIsAddChecklistOpen(false);
      setNewChecklist({
        title: "",
        description: "",
        category: "Proposal Development",
        tasks: [],
        isTemplate: false
      });
    }
  };

  // Add new task to selected checklist
  const handleAddTask = () => {
    if (selectedChecklist && newTask.title) {
      const taskToAdd: ChecklistTask = {
        id: `task-${selectedChecklist.id}-${new Date().getTime()}`,
        title: newTask.title || "",
        description: newTask.description,
        completed: false,
        assignee: newTask.assignee,
        dueDate: newTask.dueDate,
        priority: newTask.priority as "low" | "medium" | "high" || "medium"
      };
      
      setChecklists(checklists.map(checklist => {
        if (checklist.id === selectedChecklist.id) {
          return {
            ...checklist,
            tasks: [...checklist.tasks, taskToAdd],
            updatedAt: new Date().toISOString()
          };
        }
        return checklist;
      }));
      
      setSelectedChecklist({
        ...selectedChecklist,
        tasks: [...selectedChecklist.tasks, taskToAdd],
        updatedAt: new Date().toISOString()
      });
      
      setIsAddTaskOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        completed: false
      });
    }
  };

  // Get priority badge styles
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-slate-100 text-slate-800 hover:bg-slate-200";
    }
  };

  // Get category badge styles
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Pre-Bid":
        return "bg-blue-100 text-blue-800";
      case "Proposal Development":
        return "bg-purple-100 text-purple-800";
      case "Review":
        return "bg-amber-100 text-amber-800";
      case "Submission":
        return "bg-green-100 text-green-800";
      case "Post-Submission":
        return "bg-slate-100 text-slate-800";
      default:
        return "bg-teal-100 text-teal-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <DashboardHeader
          heading="Checklists"
          subheading="Manage RFP response tasks and track submission requirements."
        />
        <Button onClick={() => setIsAddChecklistOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Checklist
        </Button>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="active">Active Checklists</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4 pt-4">
          {sortedChecklists.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedChecklists.map((checklist) => (
                <Card 
                  key={checklist.id} 
                  className="overflow-hidden border-teal-500/20 hover:border-teal-500/40 transition-colors"
                  onClick={() => setSelectedChecklist(checklist)}
                >
                  <CardHeader className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className={`mb-2 ${getCategoryBadge(checklist.category)}`}>
                          {checklist.category}
                        </Badge>
                        <CardTitle className="text-base">{checklist.title}</CardTitle>
                        {checklist.description && (
                          <CardDescription className="mt-1.5 line-clamp-2">
                            {checklist.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedChecklist(checklist);
                          }}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            // Implement edit functionality
                          }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            // Implement duplicate functionality
                          }}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600" 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Implement delete functionality
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {checklist.rfpName && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
                          <div>
                            <div className="text-muted-foreground">Associated RFP:</div>
                            <div>{checklist.rfpName}</div>
                            {checklist.rfpId && (
                              <div className="text-xs text-muted-foreground">{checklist.rfpId}</div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Completion:</div>
                        <div className="text-sm font-medium">{getCompletionPercentage(checklist.tasks)}%</div>
                      </div>
                      <Progress value={getCompletionPercentage(checklist.tasks)} className="h-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          {checklist.tasks.length} tasks
                        </div>
                        <div className="text-muted-foreground">
                          Updated {new Date(checklist.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-muted/10">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No checklists found</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "active" 
                  ? "You haven't created any active checklists yet." 
                  : "No templates available. Create a template to reuse for future RFPs."
                }
              </p>
              <Button onClick={() => setIsAddChecklistOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> 
                {activeTab === "active" ? "Create Your First Checklist" : "Create Template"}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Checklist details dialog */}
      {selectedChecklist && (
        <Dialog open={!!selectedChecklist} onOpenChange={(isOpen) => !isOpen && setSelectedChecklist(null)}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedChecklist.title}</DialogTitle>
                <Badge variant="outline" className={getCategoryBadge(selectedChecklist.category)}>
                  {selectedChecklist.category}
                </Badge>
              </div>
              {selectedChecklist.description && (
                <DialogDescription className="mt-2">
                  {selectedChecklist.description}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>
                  {selectedChecklist.rfpName || "No RFP associated"} 
                  {selectedChecklist.rfpId && <span className="text-xs text-muted-foreground ml-1">({selectedChecklist.rfpId})</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Updated {formatDate(selectedChecklist.updatedAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground">Completion:</div>
                <div className="text-sm font-medium">{getCompletionPercentage(selectedChecklist.tasks)}%</div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Assign
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              </div>
            </div>
            
            <Progress value={getCompletionPercentage(selectedChecklist.tasks)} className="h-2 mb-6" />
            
            <div className="space-y-2 max-h-[350px] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Tasks</div>
                <Button variant="ghost" size="sm" onClick={() => {
                  setIsAddTaskOpen(true);
                  setNewTask({
                    title: "",
                    description: "",
                    priority: "medium",
                    completed: false
                  });
                }}>
                  <Plus className="h-4 w-4 mr-1" /> Add Task
                </Button>
              </div>
              
              {selectedChecklist.tasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedChecklist.tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors">
                      <Checkbox 
                        id={task.id} 
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(selectedChecklist.id, task.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0" onClick={() => handleViewTask(task)}>
                        <div className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className={`text-sm mt-1 line-clamp-2 ${task.completed ? 'text-muted-foreground/70' : 'text-muted-foreground'}`}>
                            {task.description}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs px-1.5 py-0 ${getPriorityBadge(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          {task.dueDate && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                          {task.assignee && (
                            <div className="flex items-center ml-auto">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={getMemberById(task.assignee)?.avatar} />
                                <AvatarFallback className="text-xs">{getMemberById(task.assignee)?.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/50">
                  <p className="text-sm text-muted-foreground">No tasks added yet</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setIsAddTaskOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Task
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button className="gap-2">
                <CheckCheck className="h-4 w-4" /> Mark All Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Checklist Dialog */}
      <Dialog open={isAddChecklistOpen} onOpenChange={setIsAddChecklistOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Checklist</DialogTitle>
            <DialogDescription>
              Create a new checklist to track tasks for an RFP response or as a reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="checklist-title">Checklist Title</Label>
              <Input
                id="checklist-title"
                value={newChecklist.title || ""}
                onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })}
                placeholder="e.g. Metro Transit RFP Final Review"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checklist-description">Description (Optional)</Label>
              <Textarea
                id="checklist-description"
                value={newChecklist.description || ""}
                onChange={(e) => setNewChecklist({ ...newChecklist, description: e.target.value })}
                placeholder="Add a brief description of this checklist"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checklist-category">Category</Label>
                <Select 
                  value={newChecklist.category} 
                  onValueChange={(value: any) => setNewChecklist({ ...newChecklist, category: value })}
                >
                  <SelectTrigger id="checklist-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Bid">Pre-Bid</SelectItem>
                    <SelectItem value="Proposal Development">Proposal Development</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Submission">Submission</SelectItem>
                    <SelectItem value="Post-Submission">Post-Submission</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rfp-id">RFP ID (Optional)</Label>
                <Input
                  id="rfp-id"
                  value={newChecklist.rfpId || ""}
                  onChange={(e) => setNewChecklist({ ...newChecklist, rfpId: e.target.value })}
                  placeholder="e.g. RFP-2023-0087"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rfp-name">RFP Name (Optional)</Label>
              <Input
                id="rfp-name"
                value={newChecklist.rfpName || ""}
                onChange={(e) => setNewChecklist({ ...newChecklist, rfpName: e.target.value })}
                placeholder="e.g. Metropolitan Transit Authority - City Transit Modernization"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="template-mode" 
                checked={newChecklist.isTemplate || false}
                onCheckedChange={(checked) => setNewChecklist({ ...newChecklist, isTemplate: checked })}
              />
              <Label htmlFor="template-mode">Save as reusable template</Label>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddChecklist}>Create Checklist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Add a task to {selectedChecklist?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={newTask.title || ""}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g. Review executive summary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Description (Optional)</Label>
              <Textarea
                id="task-description"
                value={newTask.description || ""}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Add details about this task"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select 
                  value={newTask.priority as string} 
                  onValueChange={(value: "low" | "medium" | "high") => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due Date (Optional)</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate || ""}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-assignee">Assign To (Optional)</Label>
              <Select 
                value={newTask.assignee} 
                onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
              >
                <SelectTrigger id="task-assignee">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center">
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog open={isViewTaskOpen} onOpenChange={setIsViewTaskOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id={`view-${selectedTask.id}`} 
                  checked={selectedTask.completed}
                  onCheckedChange={() => {
                    if (selectedChecklist) {
                      toggleTaskCompletion(selectedChecklist.id, selectedTask.id);
                      setSelectedTask({
                        ...selectedTask,
                        completed: !selectedTask.completed
                      });
                    }
                  }}
                />
                <h3 className={`text-lg font-medium ${selectedTask.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {selectedTask.title}
                </h3>
              </div>
              
              {selectedTask.description && (
                <div className="border-t pt-3">
                  <div className="font-medium mb-1">Description</div>
                  <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 border-t pt-3">
                <div>
                  <div className="font-medium mb-1">Priority</div>
                  <Badge variant="outline" className={`${getPriorityBadge(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                
                {selectedTask.dueDate && (
                  <div>
                    <div className="font-medium mb-1">Due Date</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(selectedTask.dueDate)}
                    </div>
                  </div>
                )}
              </div>
              
              {selectedTask.assignee && (
                <div className="border-t pt-3">
                  <div className="font-medium mb-1">Assigned To</div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={getMemberById(selectedTask.assignee)?.avatar} />
                      <AvatarFallback>{getMemberById(selectedTask.assignee)?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm">{getMemberById(selectedTask.assignee)?.name}</div>
                      <div className="text-xs text-muted-foreground">{getMemberById(selectedTask.assignee)?.role}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="outline" size="sm" className="text-red-600">
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button>
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
