-- Dup-Detect Database Schema
-- QuickBooks Duplicate Detection Application

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  subscription_tier TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QuickBooks connections (stores OAuth tokens - encrypted in production)
CREATE TABLE IF NOT EXISTS public.quickbooks_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  realm_id TEXT NOT NULL,
  company_name TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, realm_id)
);

-- Scan schedules
CREATE TABLE IF NOT EXISTS public.scan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.quickbooks_connections(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('hourly', 'twice_daily', 'daily', 'weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan history
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES public.quickbooks_connections(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_transactions_scanned INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate transactions found
CREATE TABLE IF NOT EXISTS public.duplicate_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scan_history(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('invoice', 'bill', 'customer', 'vendor', 'journal_entry', 'payment', 'purchase')),
  original_transaction_id TEXT NOT NULL,
  duplicate_transaction_id TEXT NOT NULL,
  original_date DATE,
  duplicate_date DATE,
  original_amount DECIMAL(15,2),
  duplicate_amount DECIMAL(15,2),
  customer_vendor_name TEXT,
  memo TEXT,
  match_reason TEXT NOT NULL,
  confidence_score DECIMAL(5,2) DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'confirmed', 'dismissed', 'deleted')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction backups (for undo feature)
CREATE TABLE IF NOT EXISTS public.transaction_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duplicate_id UUID NOT NULL REFERENCES public.duplicate_transactions(id) ON DELETE CASCADE,
  transaction_data JSONB NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  restored_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages (for AI chatbot)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email reports sent
CREATE TABLE IF NOT EXISTS public.email_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scan_id UUID REFERENCES public.scan_history(id) ON DELETE SET NULL,
  email_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scan logs (for retry tracking)
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scan_history(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quickbooks_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Admin can see all profiles
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for quickbooks_connections
CREATE POLICY "qb_connections_select_own" ON public.quickbooks_connections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "qb_connections_insert_own" ON public.quickbooks_connections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "qb_connections_update_own" ON public.quickbooks_connections FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "qb_connections_delete_own" ON public.quickbooks_connections FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for scan_schedules
CREATE POLICY "scan_schedules_select_own" ON public.scan_schedules FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "scan_schedules_insert_own" ON public.scan_schedules FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "scan_schedules_update_own" ON public.scan_schedules FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "scan_schedules_delete_own" ON public.scan_schedules FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for scan_history
CREATE POLICY "scan_history_select_own" ON public.scan_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "scan_history_insert_own" ON public.scan_history FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "scan_history_update_own" ON public.scan_history FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for duplicate_transactions
CREATE POLICY "duplicates_select_own" ON public.duplicate_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "duplicates_insert_own" ON public.duplicate_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "duplicates_update_own" ON public.duplicate_transactions FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for transaction_backups
CREATE POLICY "backups_select_own" ON public.transaction_backups FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "backups_insert_own" ON public.transaction_backups FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "backups_update_own" ON public.transaction_backups FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "chat_select_own" ON public.chat_messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "chat_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "chat_delete_own" ON public.chat_messages FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for feedback
CREATE POLICY "feedback_select_own" ON public.feedback FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "feedback_insert_own" ON public.feedback FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can see all feedback
CREATE POLICY "feedback_admin_select" ON public.feedback FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for email_reports
CREATE POLICY "reports_select_own" ON public.email_reports FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "reports_insert_own" ON public.email_reports FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for scan_logs
CREATE POLICY "logs_select_own" ON public.scan_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.scan_history WHERE id = scan_id AND user_id = auth.uid()));

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'viewer'),
    COALESCE(NEW.raw_user_meta_data ->> 'subscription_tier', 'starter')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qb_connections_updated_at BEFORE UPDATE ON public.quickbooks_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scan_schedules_updated_at BEFORE UPDATE ON public.scan_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_started_at ON public.scan_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_duplicates_scan_id ON public.duplicate_transactions(scan_id);
CREATE INDEX IF NOT EXISTS idx_duplicates_user_id ON public.duplicate_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_duplicates_status ON public.duplicate_transactions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
