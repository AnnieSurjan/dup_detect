"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Building, CreditCard, Check, Zap, Crown, Save, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const SUBSCRIPTION_PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    icon: User,
    features: [
      "Up to 100 transactions per scan",
      "1 scan per week",
      "Basic duplicate detection",
      "7 days data retention",
      "Email support",
    ],
    current: false,
  },
  {
    name: "Professional",
    price: "$29",
    period: "per month",
    icon: Zap,
    features: [
      "Up to 5,000 transactions per scan",
      "Unlimited scans",
      "Advanced duplicate detection",
      "90 days data retention",
      "Scheduled automated scans",
      "Priority email support",
      "API access",
    ],
    current: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "per month",
    icon: Crown,
    features: [
      "Unlimited transactions",
      "Unlimited scans",
      "AI-powered detection",
      "Unlimited data retention",
      "Multi-company support",
      "Custom scan schedules",
      "Dedicated account manager",
      "Phone & chat support",
      "Custom integrations",
      "SLA guarantee",
    ],
    current: false,
  },
]

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState({
    fullName: "John Doe",
    email: "john@example.com",
    companyName: "Acme Corp",
    phone: "+1 (555) 123-4567",
  })

  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast({
      title: "Profile updated",
      description: "Your profile has been saved successfully.",
    })
  }

  const handleUpgrade = (planName: string) => {
    toast({
      title: "Subscription upgrade",
      description: `Redirecting to checkout for ${planName} plan...`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and subscription
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-medium text-primary">
                {profile.fullName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{profile.fullName}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Subscription Plans</h2>
          <p className="text-muted-foreground">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {SUBSCRIPTION_PLANS.map((plan, idx) => (
            <Card
              key={idx}
              className={`relative ${plan.current ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-background">
                    Current Plan
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <plan.icon className="h-5 w-5 text-primary" />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {plan.current ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.name === "Free" ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing Information
          </CardTitle>
          <CardDescription>
            Manage your payment method and billing details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/2025</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next billing date</span>
            <span className="font-medium">January 1, 2024</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Billing cycle</span>
            <span className="font-medium">Monthly</span>
          </div>
          
          <Button variant="outline" className="w-full">
            View Billing History
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
