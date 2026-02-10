-- Enable RLS on all audit tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_audit ENABLE ROW LEVEL SECURITY;

-- Audit logs - users can only see their own audit logs
CREATE POLICY "Users can view their own audit logs" 
  ON public.audit_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" 
  ON public.audit_logs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Activity history - users can only see their own activity
CREATE POLICY "Users can view their own activity history" 
  ON public.activity_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity history" 
  ON public.activity_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Export history - users can only see their own exports
CREATE POLICY "Users can view their own export history" 
  ON public.export_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert export records" 
  ON public.export_history 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Settings audit - users can only see their own settings changes
CREATE POLICY "Users can view their own settings audit" 
  ON public.settings_audit 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert settings audit records" 
  ON public.settings_audit 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
