import React from "react"
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { SupportChat } from '@/components/dashboard/support-chat'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar user={user} profile={null} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={user} profile={null} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <SupportChat />
    </div>
  )
}
