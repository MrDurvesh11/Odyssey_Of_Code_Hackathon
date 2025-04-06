"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Mail, MessageSquare, PhoneCall, Plus, UserPlus, X, Download, Upload, RefreshCw, Search } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  department: string;
  status: "active" | "away" | "busy";
  lastActive?: string;
  skills: string[];
}

interface TeamProject {
  id: string;
  name: string;
  client: string;
  deadline: string;
  status: "in progress" | "completed" | "on hold";
  members: string[];
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Emma Wilson",
      role: "Lead Proposal Writer",
      email: "emma.wilson@example.com",
      phone: "(555) 123-4567",
      avatar: "https://i.pravatar.cc/150?img=1",
      department: "Content",
      status: "active",
      lastActive: "Just now",
      skills: ["Technical Writing", "Research", "Editing", "Project Management"]
    },
    {
      id: "2",
      name: "David Chen",
      role: "Technical Specialist",
      email: "david.chen@example.com",
      phone: "(555) 234-5678",
      avatar: "https://i.pravatar.cc/150?img=3",
      department: "Engineering",
      status: "away",
      lastActive: "2 hours ago",
      skills: ["Technical Analysis", "Solution Architecture", "Cost Estimation"]
    },
    {
      id: "3",
      name: "Sarah Johnson",
      role: "Business Analyst",
      email: "sarah.johnson@example.com",
      phone: "(555) 345-6789",
      avatar: "https://i.pravatar.cc/150?img=5",
      department: "Business",
      status: "busy",
      lastActive: "35 minutes ago",
      skills: ["Requirements Analysis", "Process Mapping", "Data Analysis"]
    },
    {
      id: "4",
      name: "James Rodriguez",
      role: "Graphics Designer",
      email: "james.rodriguez@example.com",
      phone: "(555) 456-7890",
      avatar: "https://i.pravatar.cc/150?img=7",
      department: "Design",
      status: "active",
      lastActive: "5 minutes ago",
      skills: ["InDesign", "Photoshop", "Illustration", "Brand Identity"]
    },
    {
      id: "5",
      name: "Mia Wong",
      role: "Legal Specialist",
      email: "mia.wong@example.com",
      phone: "(555) 567-8901",
      avatar: "https://i.pravatar.cc/150?img=9",
      department: "Legal",
      status: "away",
      lastActive: "1 day ago",
      skills: ["Contract Review", "Compliance", "Risk Assessment"]
    }
  ]);

  const [teamProjects, setTeamProjects] = useState<TeamProject[]>([
    {
      id: "1",
      name: "City Transit Modernization",
      client: "Metropolitan Transit Authority",
      deadline: "2023-08-15",
      status: "in progress",
      members: ["1", "2", "4"]
    },
    {
      id: "2",
      name: "Healthcare Data Platform",
      client: "Regional Medical Center",
      deadline: "2023-09-30",
      status: "in progress",
      members: ["2", "3", "5"]
    },
    {
      id: "3",
      name: "Educational Technology Initiative",
      client: "State School District",
      deadline: "2023-07-10",
      status: "completed",
      members: ["1", "3", "4"]
    },
    {
      id: "4",
      name: "Corporate Office Renovation",
      client: "GlobalTech Industries",
      deadline: "2023-10-22",
      status: "on hold",
      members: ["5", "4", "2"]
    }
  ]);
  
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: "",
    role: "",
    email: "",
    phone: "",
    department: "Content",
    status: "active",
    skills: []
  });

  const [newProject, setNewProject] = useState<Partial<TeamProject>>({
    name: "",
    client: "",
    deadline: "",
    status: "in progress",
    members: []
  });

  const departments = ["Content", "Engineering", "Business", "Design", "Legal"];
  
  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      const memberToAdd: TeamMember = {
        id: String(new Date().getTime()),
        name: newMember.name || "",
        role: newMember.role || "",
        email: newMember.email || "",
        phone: newMember.phone || "",
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        department: newMember.department || "Content",
        status: newMember.status || "active",
        skills: newMember.skills || []
      };
      
      setTeamMembers([...teamMembers, memberToAdd]);
      setIsAddMemberOpen(false);
      setNewMember({
        name: "",
        role: "",
        email: "",
        phone: "",
        department: "Content",
        status: "active",
        skills: []
      });
    }
  };

  const handleAddProject = () => {
    if (newProject.name && newProject.client) {
      const projectToAdd: TeamProject = {
        id: String(new Date().getTime()),
        name: newProject.name || "",
        client: newProject.client || "",
        deadline: newProject.deadline || new Date().toISOString().split('T')[0],
        status: newProject.status || "in progress",
        members: newProject.members || []
      };
      
      setTeamProjects([...teamProjects, projectToAdd]);
      setIsAddProjectOpen(false);
      setNewProject({
        name: "",
        client: "",
        deadline: "",
        status: "in progress",
        members: []
      });
    }
  };

  const getMemberById = (id: string) => {
    return teamMembers.find(member => member.id === id);
  };

  const getStatusColor = (status: "active" | "away" | "busy") => {
    switch(status) {
      case "active": return "bg-green-500";
      case "away": return "bg-amber-500";
      case "busy": return "bg-red-500";
      default: return "bg-slate-500";
    }
  };

  const getProjectStatusColor = (status: "in progress" | "completed" | "on hold") => {
    switch(status) {
      case "in progress": return "bg-blue-500 hover:bg-blue-600";
      case "completed": return "bg-green-500 hover:bg-green-600";
      case "on hold": return "bg-amber-500 hover:bg-amber-600";
      default: return "bg-slate-500 hover:bg-slate-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <DashboardHeader
          heading="Team Management"
          subheading="Manage your RFP team members and projects."
        />
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
          <Button variant="outline" onClick={() => setIsAddProjectOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        
        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Label htmlFor="department-filter" className="whitespace-nowrap">Department:</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger id="department-filter" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => {
                setSearchQuery("");
                setDepartmentFilter("all");
              }}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeamMembers.map((member) => (
              <Card key={member.id} className="overflow-hidden border-teal-500/20 hover:border-teal-500/40 transition-colors">
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}{member.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${getStatusColor(member.status)} border-2 border-white`}></div>
                      </div>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription className="text-sm">{member.role}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-teal-500/10 text-teal-700 border-teal-500/20">
                      {member.department}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 text-sm space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <PhoneCall className="mr-2 h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground mb-1.5">Skills & Expertise</div>
                    <div className="flex flex-wrap gap-1">
                      {member.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0 border-t">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredTeamMembers.length === 0 && (
            <div className="text-center py-10">
              <div className="text-muted-foreground">No team members found.</div>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery("");
                setDepartmentFilter("all");
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {teamProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden border-teal-500/20 hover:border-teal-500/40 transition-colors">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge className={`${getProjectStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{project.client}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <div className="text-muted-foreground">Deadline:</div>
                    <div className="font-medium">
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Team:</div>
                    <div className="flex -space-x-2">
                      {project.members.map((memberId) => {
                        const member = getMemberById(memberId);
                        if (!member) return null;
                        return (
                          <div key={memberId} className="relative group">
                            <Avatar className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-background hidden group-hover:block">
                              <div className={`h-full w-full rounded-full ${getStatusColor(member.status)}`}></div>
                            </div>
                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap transition-opacity">
                              {member.name}
                            </div>
                          </div>
                        );
                      })}
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full flex items-center justify-center border-dashed">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4 pt-0 border-t">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new member to your RFP response team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newMember.name || ""}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role / Position</Label>
              <Input
                id="role"
                value={newMember.role || ""}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                placeholder="e.g. Proposal Writer"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newMember.email || ""}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newMember.phone || ""}
                  onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={newMember.department} 
                  onValueChange={(value) => setNewMember({ ...newMember, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newMember.status} 
                  onValueChange={(value: "active" | "away" | "busy") => setNewMember({ ...newMember, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                value={newMember.skills?.join(", ") || ""}
                onChange={(e) => setNewMember({ 
                  ...newMember, 
                  skills: e.target.value.split(",").map(skill => skill.trim()).filter(Boolean)
                })}
                placeholder="e.g. Technical Writing, Research, Analytics"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddMember}>Add Team Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new RFP response project to your team workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProject.name || ""}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={newProject.client || ""}
                onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                placeholder="Client organization"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newProject.deadline || ""}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Select 
                  value={newProject.status} 
                  onValueChange={(value: "in progress" | "completed" | "on hold") => setNewProject({ ...newProject, status: value })}
                >
                  <SelectTrigger id="project-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`member-${member.id}`}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      checked={newProject.members?.includes(member.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewProject({
                            ...newProject,
                            members: [...(newProject.members || []), member.id]
                          });
                        } else {
                          setNewProject({
                            ...newProject,
                            members: newProject.members?.filter(id => id !== member.id) || []
                          });
                        }
                      }}
                    />
                    <label htmlFor={`member-${member.id}`} className="flex items-center cursor-pointer">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {member.role}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddProject}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
