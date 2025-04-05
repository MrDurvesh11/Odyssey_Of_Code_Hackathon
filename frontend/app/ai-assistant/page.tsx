"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, BarChart3, Bot, FileText, Send, User } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your RFP Analysis Assistant. I can help you understand the requirements, assess risks, and prepare your proposal. What would you like to know about the Federal IT Modernization RFP?",
    },
  ])

  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    setMessages([...messages, { role: "user", content: input }])

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I've analyzed the Federal IT Modernization RFP and found that the security requirements in Section 5.2.3 require FedRAMP High certification within 60 days of award. This is a high-risk item that you should address in your proposal. Would you like me to suggest some mitigation strategies?",
        },
      ])
    }, 1000)

    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    "What are the key requirements for this RFP?",
    "What are the highest risk items in this contract?",
    "How does our company profile match the requirements?",
    "What are the critical deadlines for this proposal?",
    "Can you generate a compliance matrix for this RFP?",
  ]

  return (
    <DashboardShell>
      <div className="flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to dashboard</span>
          </Link>
        </Button>
        <DashboardHeader heading="AI Assistant" subheading="Get help with your RFP analysis and proposal preparation" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>RFP Analysis Assistant</CardTitle>
              <CardDescription>Ask questions about the Federal IT Modernization RFP</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex max-w-[80%] items-start space-x-2 rounded-lg px-3 py-2 ${
                        message.role === "user" ? "bg-teal-600 text-white" : "bg-muted"
                      }`}
                    >
                      <div className="mt-0.5">
                        {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </div>
                      <div>{message.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t bg-background pt-3">
              <form
                className="flex w-full items-center space-x-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
              >
                <Input
                  placeholder="Type your question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="suggested">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="suggested">Suggested</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="suggested" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Suggested Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setInput(question)
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Visualization Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-left">
                    <BarChart3 className="mr-2 h-4 w-4 text-teal-600" />
                    Generate Requirements Chart
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <BarChart3 className="mr-2 h-4 w-4 text-teal-600" />
                    Generate Timeline Visualization
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <BarChart3 className="mr-2 h-4 w-4 text-teal-600" />
                    Generate Risk Heatmap
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Related Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start text-left">
                    <FileText className="mr-2 h-4 w-4 text-teal-600" />
                    Federal IT Modernization RFP
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <FileText className="mr-2 h-4 w-4 text-teal-600" />
                    Q&A Addendum
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <FileText className="mr-2 h-4 w-4 text-teal-600" />
                    Technical Requirements
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <FileText className="mr-2 h-4 w-4 text-teal-600" />
                    Evaluation Criteria
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  )
}

