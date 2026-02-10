import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  Calendar, 
  Shield, 
  Zap, 
  BarChart3, 
  Clock,
  CheckCircle,
  ArrowRight,
  Bot
} from "lucide-react"

const FEATURES = [
  {
    icon: Search,
    title: "Smart Detection",
    description: "Advanced algorithms analyze transaction patterns to identify duplicates with high accuracy.",
  },
  {
    icon: Calendar,
    title: "Automated Scheduling",
    description: "Set it and forget it. Schedule daily, weekly, or monthly scans to keep your books clean.",
  },
  {
    icon: Shield,
    title: "Secure & Safe",
    description: "Read-only access to your QuickBooks data. We never modify your records without permission.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Scan thousands of transactions in minutes, not hours. Get results when you need them.",
  },
  {
    icon: BarChart3,
    title: "Detailed Reports",
    description: "Comprehensive reports with confidence scores help you make informed decisions.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Get instant help understanding duplicates and managing your QuickBooks data.",
  },
]

const STATS = [
  { value: "99.5%", label: "Detection Accuracy" },
  { value: "50K+", label: "Transactions Scanned" },
  { value: "2.5K", label: "Duplicates Found" },
  { value: "< 2min", label: "Average Scan Time" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo-full.png" 
              alt="DupDetect Logo" 
              width={100} 
              height={28}
              className="h-6 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
            />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Logo */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 flex justify-center">
          <Image 
            src="/logo-full.png" 
            alt="DupDetect Logo" 
            width={600} 
            height={200}
            className="w-80 md:w-[500px] lg:w-[600px] h-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
            priority
          />
        </div>
      </section>

      {/* Hero Section */}
      <section className="pb-20 md:pb-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <Zap className="h-4 w-4" />
            QuickBooks Duplicate Detection Made Easy
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance max-w-4xl mx-auto">
            Stop Duplicate Transactions From{" "}
            <span className="text-primary">Cluttering Your Books</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Automatically detect, review, and resolve duplicate transactions in your 
            QuickBooks Online account. Save hours of manual work and keep your financial 
            records accurate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Stay Duplicate-Free
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for QuickBooks users who value 
              accuracy and efficiency.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Reports Preview */}
      <section className="py-20 md:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See Exactly How We Find Duplicates
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our detailed reports show you exactly why each transaction was flagged, 
              with confidence scores and side-by-side comparisons.
            </p>
          </div>
          
          {/* Sample Report Card */}
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden border-2">
              <div className="bg-card px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="font-semibold">Duplicate Detected</span>
                  <span className="text-sm text-muted-foreground">Invoice #INV-2024-0847</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-bold text-destructive">98.5%</span>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                  {/* Original Transaction */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium">ORIGINAL</div>
                      <span className="text-sm text-muted-foreground">Created Jan 15, 2024</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor</span>
                        <span className="font-medium">Office Supplies Co.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium">$1,250.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">Jan 12, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-medium">PO-2024-0392</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account</span>
                        <span className="font-medium">Office Expenses</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Duplicate Transaction */}
                  <div className="p-6 bg-destructive/5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="px-2 py-1 rounded bg-destructive/10 text-destructive text-xs font-medium">DUPLICATE</div>
                      <span className="text-sm text-muted-foreground">Created Jan 16, 2024</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor</span>
                        <span className="font-medium">Office Supplies Co.</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-medium text-destructive">$1,250.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium">Jan 12, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="font-medium">PO-2024-0392</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Account</span>
                        <span className="font-medium">Office Expenses</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Detection Reasons */}
                <div className="border-t p-6 bg-muted/30">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Search className="h-4 w-4 text-primary" />
                    Why This Was Flagged
                  </h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Same vendor name</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Identical amount</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Same transaction date</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Matching reference #</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="border-t p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
                  <p className="text-sm text-muted-foreground">
                    Review this duplicate and choose an action
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Keep Both</Button>
                    <Button variant="outline" size="sm">Ignore</Button>
                    <Button size="sm" className="bg-destructive hover:bg-destructive/90">Delete Duplicate</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Additional Stats */}
            <div className="grid sm:grid-cols-3 gap-4 mt-6">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">5 Fields</div>
                <div className="text-sm text-muted-foreground">Matched Exactly</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">1 Day</div>
                <div className="text-sm text-muted-foreground">Between Entries</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-destructive">$1,250</div>
                <div className="text-sm text-muted-foreground">Potential Savings</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Connect QuickBooks",
                description: "Securely link your QuickBooks Online account with just a few clicks.",
              },
              {
                step: "2",
                title: "Run a Scan",
                description: "Let DupDetect analyze your transactions and identify duplicates.",
              },
              {
                step: "3",
                title: "Review & Resolve",
                description: "Review flagged duplicates and take action with confidence.",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg mb-4">
                  {item.step}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+30px)] w-[calc(100%-60px)] h-[2px] bg-border" />
                )}
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Money Saved Impact Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-primary/5 to-primary/10 border-y">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
                Real Results from Real Users
              </h2>
              <p className="text-lg text-muted-foreground">
                See the impact DupDetect is having on businesses just like yours
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Main Impact Card */}
              <Card className="md:col-span-2 border-2 border-primary overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8 md:p-12">
                  <div className="text-sm font-semibold opacity-90 mb-2">Total Savings</div>
                  <div className="text-5xl md:text-7xl font-bold mb-4">$15,750.50</div>
                  <p className="text-lg opacity-95">From resolved duplicates across our user base</p>
                </div>
                <div className="p-8 md:p-12">
                  <div className="grid sm:grid-cols-3 gap-6">
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-primary">1,247</div>
                      <p className="text-sm text-muted-foreground mt-1">Transactions Scanned</p>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-primary">8</div>
                      <p className="text-sm text-muted-foreground mt-1">Duplicates Found</p>
                    </div>
                    <div>
                      <div className="text-2xl md:text-3xl font-bold text-primary">5</div>
                      <p className="text-sm text-muted-foreground mt-1">Duplicates Resolved</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Testimonial Cards */}
              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Accurate Books</h4>
                    <p className="text-xs text-muted-foreground">Every transaction verified</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "DupDetect found duplicates we didn't even know we had. Our financial reports are now completely reliable."
                </p>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Hours Saved</h4>
                    <p className="text-xs text-muted-foreground">Automated detection</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  "What would have taken us days to reconcile manually, DupDetect found in minutes. Amazing time saver."
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="py-16 px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Clean Up Your Books?
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of businesses that trust DupDetect to keep their 
                QuickBooks data accurate and duplicate-free.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/sign-up">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Start Your Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-primary-foreground/80">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  14-day free trial
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Cancel anytime
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Image 
              src="/logo-full.png" 
              alt="DupDetect Logo" 
              width={200} 
              height={60}
              className="h-14 w-auto mix-blend-multiply dark:mix-blend-screen dark:invert"
            />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DupDetect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
