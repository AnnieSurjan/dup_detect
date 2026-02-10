'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import {
  LayoutDashboard,
  Search,
  Clock,
  History,
  MessageSquare,
  Settings,
  HelpCircle,
  FileText,
  Shield,
  BarChart3,
} from 'lucide-react'

interface DashboardSidebarProps {
  user: User
  profile: Profile | null
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Scan for Duplicates',
    href: '/dashboard/scan',
    icon: Search,
  },
  {
    title: 'Scheduled Scans',
    href: '/dashboard/schedules',
    icon: Clock,
  },
  {
    title: 'Scan History',
    href: '/dashboard/history',
    icon: History,
  },
  {
    title: 'Performance Insights',
    href: '/dashboard/insights',
    icon: BarChart3,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
  },
]

const supportItems = [
  {
    title: 'AI Support',
    href: '/dashboard/support',
    icon: MessageSquare,
  },
  {
    title: 'Help Center',
    href: '/dashboard/help',
    icon: HelpCircle,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center">
          <Image 
            src="/logo-full.png" 
            alt="DupDetect Logo" 
            width={140} 
            height={40}
            className="h-8 w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2">
            Main
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-2">
            Support
          </p>
          {supportItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user.email}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
