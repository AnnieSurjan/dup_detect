"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, ChevronRight, ChevronLeft, Sparkles, Search, CheckCircle2, Calendar, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingDialogProps {
  isOpen: boolean
  onComplete: () => void
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Welcome to Dup-Detect",
    description: "Your AI-powered solution for finding and managing duplicate transactions in QuickBooks",
    icon: Sparkles,
    content: (
      <div className="space-y-4 text-center py-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Dup-Detect uses advanced algorithms to automatically identify duplicate transactions, 
          saving you hours of manual work and preventing costly accounting errors.
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">99%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">10x</div>
            <div className="text-xs text-muted-foreground">Faster</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">$1000+</div>
            <div className="text-xs text-muted-foreground">Saved/Month</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Connect QuickBooks",
    description: "Securely link your QuickBooks account to start scanning for duplicates",
    icon: CheckCircle2,
    content: (
      <div className="space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-green-600/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">Go to Settings</p>
              <p className="text-sm text-muted-foreground">Navigate to Settings → QuickBooks Connection</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">Click "Connect to QuickBooks"</p>
              <p className="text-sm text-muted-foreground">You'll be redirected to QuickBooks to authorize access</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">Grant Permissions</p>
              <p className="text-sm text-muted-foreground">Allow read-only access to your transaction data</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Run Your First Scan",
    description: "Scan your QuickBooks data to identify potential duplicates",
    icon: Search,
    content: (
      <div className="space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto">
          <Search className="w-8 h-8 text-blue-600" />
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground text-center">
            From the Dashboard, click "Run New Scan" to analyze your transactions
          </p>
          <div className="bg-muted rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scan Speed</span>
              <span className="font-medium">~1,000 transactions/min</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Detection Method</span>
              <span className="font-medium">AI-Powered Matching</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Typical Results</span>
              <span className="font-medium">2-5% duplicates found</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Review & Resolve Duplicates",
    description: "Examine detected duplicates and choose which ones to keep or delete",
    icon: Check,
    content: (
      <div className="space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-amber-600/10 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground text-center">
            Each duplicate pair shows side-by-side comparison with actions
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-muted rounded-lg p-3">
              <div className="w-8 h-8 rounded bg-green-600/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Keep Both</p>
                <p className="text-xs text-muted-foreground">These aren't duplicates</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-muted rounded-lg p-3">
              <div className="w-8 h-8 rounded bg-red-600/10 flex items-center justify-center">
                <span className="text-red-600 font-bold">✕</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Delete Duplicate</p>
                <p className="text-xs text-muted-foreground">Remove from QuickBooks</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Automate with Scheduling",
    description: "Set up automatic scans to catch duplicates as they happen",
    icon: Calendar,
    content: (
      <div className="space-y-4 py-6">
        <div className="w-16 h-16 rounded-full bg-purple-600/10 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8 text-purple-600" />
        </div>
        <div className="space-y-3">
          <p className="text-muted-foreground text-center">
            Schedule regular scans to maintain clean books automatically
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-medium">Daily</div>
              <div className="text-xs text-muted-foreground mt-1">Every 24h</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-medium">Weekly</div>
              <div className="text-xs text-muted-foreground mt-1">Every Monday</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-medium">Monthly</div>
              <div className="text-xs text-muted-foreground mt-1">1st of month</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center pt-2">
            <Bell className="w-4 h-4" />
            <span>Get email notifications after each scan</span>
          </div>
        </div>
      </div>
    ),
  },
]

export function OnboardingDialog({ isOpen, onComplete }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const step = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100
  const Icon = step.icon

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onComplete()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <DialogTitle>{step.title}</DialogTitle>
            </div>
            <div className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>
          <DialogDescription>{step.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="h-2" />
          
          {step.content}

          <div className="flex gap-2 pt-2">
            {ONBOARDING_STEPS.map((s, index) => (
              <div
                key={s.id}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  index <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip Tutorial
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrev}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep < ONBOARDING_STEPS.length - 1 ? (
                <>
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  Get Started
                  <Check className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
