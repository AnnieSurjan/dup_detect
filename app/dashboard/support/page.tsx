"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, Mail, HelpCircle, Send, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const FAQ_ITEMS = [
  {
    question: "How does duplicate detection work?",
    answer: "Dup-Detect analyzes your QuickBooks transactions by comparing key fields like amount, date, vendor name, and description. Transactions with matching or similar values are flagged as potential duplicates with a confidence score indicating the likelihood they are true duplicates.",
  },
  {
    question: "What do confidence scores mean?",
    answer: "High confidence (95%+) means transactions are very likely duplicates - they match on multiple criteria. Medium confidence (80-94%) suggests possible duplicates that warrant review. Low confidence (<80%) indicates transactions may be similar but could be legitimate separate entries.",
  },
  {
    question: "Will deleting a duplicate affect my QuickBooks data?",
    answer: "Currently, Dup-Detect operates in a read-only mode for safety. When you choose to delete a duplicate, it marks the transaction in our system. To actually remove it from QuickBooks, you'll need to delete it directly in QuickBooks or enable write access (coming soon).",
  },
  {
    question: "How often should I run scans?",
    answer: "We recommend weekly scans for most businesses. If you have high transaction volume, daily scans may be beneficial. Monthly scans work well for businesses with lower transaction counts. You can set up automated scheduling to run scans at your preferred frequency.",
  },
  {
    question: "Can I connect multiple QuickBooks companies?",
    answer: "Currently, each Dup-Detect account supports one QuickBooks company connection. Multi-company support is on our roadmap for a future release.",
  },
  {
    question: "What happens if I ignore a duplicate?",
    answer: "Ignored duplicates won't appear in your pending list and won't be flagged in future scans. You can always review ignored duplicates in the history section and change their status if needed.",
  },
]

export default function SupportPage() {
  const router = useRouter()
  const [feedbackType, setFeedbackType] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackType || !subject || !message) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSending(false)

    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback! We'll get back to you soon.",
    })

    setFeedbackType("")
    setSubject("")
    setMessage("")
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Get help with Dup-Detect or send us feedback
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Feedback
            </CardTitle>
            <CardDescription>
              Report bugs, request features, or ask questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="question">Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="general">General Feedback</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your feedback"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about your feedback..."
                  rows={5}
                />
              </div>

              <Button type="submit" disabled={isSending} className="w-full">
                {isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSending ? "Sending..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* AI Chat Prompt */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">Need instant help?</h3>
              <p className="text-sm text-muted-foreground">
                Chat with our AI assistant for quick answers
              </p>
            </div>
          </div>
          <Button onClick={() => window.open('/dashboard/ai-chat', '_blank')}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Open Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
