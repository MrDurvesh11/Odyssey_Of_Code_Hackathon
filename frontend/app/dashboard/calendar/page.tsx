"use client";

import { useState, useEffect } from "react";
import { CalendarPlus, Clock, Trash2, X } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// We'll use a different approach by importing only on the client side
let FullCalendar;
let dayGridPlugin;
let timeGridPlugin;
let interactionPlugin;

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  description?: string;
  type?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "RFP Deadline: City of Portland",
      start: new Date(new Date().setDate(new Date().getDate() + 3)),
      end: new Date(new Date().setDate(new Date().getDate() + 3)),
      allDay: true,
      type: "deadline",
      description: "Final submission deadline for Portland transit project RFP."
    },
    {
      id: "2",
      title: "Team Kickoff: Healthcare Project",
      start: new Date(new Date().setDate(new Date().getDate() + 1)),
      end: new Date(new Date().setHours(new Date().getHours() + 2)),
      allDay: false,
      type: "meeting",
      description: "Initial kickoff meeting to discuss the healthcare project approach."
    },
    {
      id: "3",
      title: "Content Review: Education Proposal",
      start: new Date(new Date().setDate(new Date().getDate() - 2)),
      end: new Date(new Date().setDate(new Date().getDate() - 2)),
      allDay: true,
      type: "review",
      description: "Final review of all materials for the educational initiative proposal."
    }
  ]);

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    type: "meeting",
    allDay: false
  });

  // Track if calendar components are loaded
  const [calendarLoaded, setCalendarLoaded] = useState(false);
  
  // Load FullCalendar dynamically only on the client side
  useEffect(() => {
    const loadCalendarDependencies = async () => {
      if (typeof window !== "undefined") {
        const fullCalendarModule = await import('@fullcalendar/react');
        const dayGridModule = await import('@fullcalendar/daygrid');
        const timeGridModule = await import('@fullcalendar/timegrid');
        const interactionModule = await import('@fullcalendar/interaction');
        
        FullCalendar = fullCalendarModule.default;
        dayGridPlugin = dayGridModule.default;
        timeGridPlugin = timeGridModule.default;
        interactionPlugin = interactionModule.default;
        
        setCalendarLoaded(true);
      }
    };
    
    loadCalendarDependencies();
  }, []);

  const handleDateSelect = (selectInfo) => {
    setNewEvent({
      ...newEvent,
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay
    });
    setIsAddEventOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const eventId = clickInfo.event.id;
    const foundEvent = events.find(e => e.id === eventId);
    if (foundEvent) {
      setSelectedEvent(foundEvent);
      setIsViewEventOpen(true);
    }
  };

  const handleAddEvent = () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      const eventToAdd: Event = {
        id: String(new Date().getTime()),
        title: newEvent.title,
        start: newEvent.start,
        end: newEvent.end,
        allDay: newEvent.allDay || false,
        description: newEvent.description,
        type: newEvent.type
      };
      setEvents([...events, eventToAdd]);
      setIsAddEventOpen(false);
      setNewEvent({
        title: "",
        description: "",
        type: "meeting",
        allDay: false
      });
    }
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setIsViewEventOpen(false);
      setSelectedEvent(null);
    }
  };

  const getEventClassNames = (eventInfo) => {
    const type = eventInfo.event.extendedProps.type;
    switch (type) {
      case 'deadline':
        return 'bg-red-500 border-red-600 text-white';
      case 'meeting':
        return 'bg-blue-500 border-blue-600 text-white';
      case 'review':
        return 'bg-amber-500 border-amber-600 text-white';
      default:
        return 'bg-teal-500 border-teal-600 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          heading="Calendar"
          subheading="Track RFP deadlines, team meetings, and review sessions."
        />
        <Button onClick={() => setIsAddEventOpen(true)}>
          <CalendarPlus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-4">
        <Card className="col-span-1 border-teal-500/20">
          <CardHeader>
            <CardTitle>Legend</CardTitle>
            <CardDescription>Event categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>RFP Deadlines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span>Team Meetings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-amber-500"></div>
              <span>Content Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-teal-500"></div>
              <span>Other Events</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start space-y-3">
            <div className="font-medium">Upcoming Deadlines</div>
            {events
              .filter(e => e.type === 'deadline' && new Date(e.start) > new Date())
              .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
              .slice(0, 3)
              .map(event => (
                <div key={event.id} className="w-full p-2 border rounded-md text-sm">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.start).toLocaleDateString()}
                  </div>
                </div>
              ))}
          </CardFooter>
        </Card>

        <Card className="col-span-1 lg:col-span-3 border-teal-500/20">
          <CardContent className="p-1 sm:p-4">
            <div className="min-h-[500px]">
              {!calendarLoaded ? (
                <div className="h-full flex items-center justify-center">
                  <p>Loading calendar...</p>
                </div>
              ) : (
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  initialView="dayGridMonth"
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events.map(event => ({
                    ...event,
                    start: event.start,
                    end: event.end
                  }))}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventClassNames={getEventClassNames}
                  height="auto"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event or deadline in your calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Add title for your event"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Add event details"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select 
                  value={newEvent.type} 
                  onValueChange={(value) => setNewEvent({ ...newEvent, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deadline">RFP Deadline</SelectItem>
                    <SelectItem value="meeting">Team Meeting</SelectItem>
                    <SelectItem value="review">Content Review</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={newEvent.allDay}
                    onChange={(e) => setNewEvent({ ...newEvent, allDay: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <Label htmlFor="allDay">All Day Event</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedEvent.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.type === 'deadline' ? (
                    <span className="text-red-500 font-medium">RFP Deadline</span>
                  ) : selectedEvent.type === 'meeting' ? (
                    <span className="text-blue-500 font-medium">Team Meeting</span>
                  ) : selectedEvent.type === 'review' ? (
                    <span className="text-amber-500 font-medium">Content Review</span>
                  ) : (
                    <span className="text-teal-500 font-medium">Other Event</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Date & Time</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedEvent.allDay ? (
                      new Date(selectedEvent.start).toLocaleDateString()
                    ) : (
                      <>
                        {new Date(selectedEvent.start).toLocaleDateString()}, {new Date(selectedEvent.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {" - "}
                        {new Date(selectedEvent.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedEvent.description && (
                <div className="border-t pt-3">
                  <div className="font-medium">Description</div>
                  <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteEvent}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
