-- Audit Log Tables for Dup-Detect
-- Tracks all user actions for compliance and activity history

-- Main audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN (
    'duplicate_transaction', 'scan_history', 'settings', 'export', 
    'schedule', 'connection', 'user_profile', 'other'
  )),
  resource_id TEXT,
  description TEXT NOT NULL,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_action ON public.audit_logs(action);
CREATE INDEX idx_audit_created_at ON public.audit_logs(created_at DESC);

-- Activity history view (combines audit logs with related data)
CREATE TABLE IF NOT EXISTS public.activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'duplicate_resolved', 'duplicate_dismissed', 'duplicate_deleted',
    'scan_started', 'scan_completed', 'scan_failed',
    'settings_updated', 'export_generated', 'schedule_created',
    'schedule_updated', 'connection_added', 'connection_removed',
    'profile_updated', 'other'
  )),
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_name TEXT,
  target_id UUID,
  target_type TEXT,
  summary TEXT NOT NULL,
  details JSONB,
  enterprise_feature BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id ON public.activity_history(user_id);
CREATE INDEX idx_activity_actor_id ON public.activity_history(actor_id);
CREATE INDEX idx_activity_created_at ON public.activity_history(created_at DESC);
CREATE INDEX idx_activity_action_type ON public.activity_history(action_type);

-- Export history (tracks all exports for enterprise feature)
CREATE TABLE IF NOT EXISTS public.export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('csv', 'pdf', 'excel')),
  scope TEXT NOT NULL CHECK (scope IN ('all_time', 'date_range', 'scan_id')),
  filter_params JSONB,
  file_path TEXT,
  file_size INTEGER,
  row_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_export_user_id ON public.export_history(user_id);
CREATE INDEX idx_export_created_at ON public.export_history(created_at DESC);

-- Settings change history (tracks all settings modifications)
CREATE TABLE IF NOT EXISTS public.settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  modified_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_user_id ON public.settings_audit(user_id);
CREATE INDEX idx_settings_modified_by ON public.settings_audit(modified_by);
CREATE INDEX idx_settings_created_at ON public.settings_audit(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "audit_logs_select_own" ON public.audit_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "audit_logs_insert_own" ON public.audit_logs FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can view all audit logs
CREATE POLICY "audit_logs_admin_select" ON public.audit_logs FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for activity_history
CREATE POLICY "activity_history_select_own" ON public.activity_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "activity_history_insert_own" ON public.activity_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admin can view all activity
CREATE POLICY "activity_history_admin_select" ON public.activity_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for export_history
CREATE POLICY "export_history_select_own" ON public.export_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "export_history_insert_own" ON public.export_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for settings_audit
CREATE POLICY "settings_audit_select_own" ON public.settings_audit FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "settings_audit_insert_own" ON public.settings_audit FOR INSERT WITH CHECK (modified_by = auth.uid());

-- Admin can view all settings changes
CREATE POLICY "settings_audit_admin_select" ON public.settings_audit FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Function to log audit activities
CREATE OR REPLACE FUNCTION public.log_audit_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT,
  p_description TEXT,
  p_changes JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id, action, resource_type, resource_id, description, 
    changes, ip_address, user_agent
  )
  VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_description,
    p_changes, p_ip_address, p_user_agent
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity history
CREATE OR REPLACE FUNCTION public.log_activity_history(
  p_user_id UUID,
  p_action_type TEXT,
  p_actor_id UUID,
  p_actor_name TEXT,
  p_target_id UUID,
  p_target_type TEXT,
  p_summary TEXT,
  p_details JSONB DEFAULT NULL,
  p_enterprise_feature BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.activity_history (
    user_id, action_type, actor_id, actor_name, target_id, 
    target_type, summary, details, enterprise_feature
  )
  VALUES (
    p_user_id, p_action_type, p_actor_id, p_actor_name, p_target_id,
    p_target_type, p_summary, p_details, p_enterprise_feature
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
