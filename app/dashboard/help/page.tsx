"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BookOpen, Search, Video, FileText, MessageCircle, ExternalLink } from "lucide-react"
import { useState } from "react"

const HELP_CATEGORIES = [
  {
    title: "Getting Started",
    icon: BookOpen,
    articles: [
      { title: "QuickBooks Integration Setup", href: "#setup" },
      { title: "Running Your First Scan", href: "#first-scan" },
      { title: "Understanding Confidence Scores", href: "#confidence" },
      { title: "Managing Duplicates", href: "#managing" },
    ]
  },
  {
    title: "Video Tutorials",
    icon: Video,
    articles: [
      { title: "5-Minute Quick Start Guide", href: "#video-quick" },
      { title: "Advanced Filtering Techniques", href: "#video-filtering" },
      { title: "Scheduled Scans Setup", href: "#video-scheduled" },
      { title: "Bulk Actions Tutorial", href: "#video-bulk" },
    ]
  },
  {
    title: "Documentation",
    icon: FileText,
    articles: [
      { title: "API Documentation", href: "#api" },
      { title: "Security & Privacy Policy", href: "#security" },
      { title: "Data Handling Guidelines", href: "#data" },
      { title: "Troubleshooting Guide", href: "#troubleshooting" },
    ]
  },
]

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers, guides, and documentation
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Categories */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {HELP_CATEGORIES.map((category, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <category.icon className="h-5 w-5" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.articles.map((article, articleIdx) => (
                  <li key={articleIdx}>
                    <a
                      href={article.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group"
                    >
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {article.title}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-medium">Need instant help?</h3>
              <p className="text-sm text-muted-foreground">
                Chat with our AI assistant
              </p>
            </div>
            <Button onClick={() => window.open('/dashboard/ai-chat', '_blank')}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Open Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-medium">Contact Support</h3>
              <p className="text-sm text-muted-foreground">
                Send us a message
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard/support'}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Get Help
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
