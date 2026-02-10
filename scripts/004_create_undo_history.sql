-- Undo History Tables for Dup-Detect
-- Enables users to undo duplicate resolutions and track undo operations

-- Main undo history table (tracks all undo operations)
CREATE TABLE IF NOT EXISTS public.undo_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'duplicate_resolved', 'duplicate_dismissed', 'duplicate_deleted',
    'batch_resolved', 'batch_dismissed', 'batch_deleted'
  )),
  original_action_id TEXT NOT NULL,
  duplicate_id UUID REFERENCES public.duplicate_transactions(id) ON DELETE SET NULL,
  previous_status TEXT NOT NULL,
  backup_data JSONB,
  undo_reason TEXT,
  is_undone BOOLEAN DEFAULT false,
  undo_requested_at TIMESTAMPTZ,
  undo_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_undo_user_id ON public.undo_history(user_id);
CREATE INDEX idx_undo_created_at ON public.undo_history(created_at DESC);
CREATE INDEX idx_undo_duplicate_id ON public.undo_history(duplicate_id);
CREATE INDEX idx_undo_is_undone ON public.undo_history(is_undone);

-- Tracks the last action per user (for "undo last action" feature)
CREATE TABLE IF NOT EXISTS public.user_last_action (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_action_id TEXT NOT NULL,
  last_action_type TEXT NOT NULL,
  last_action_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  can_undo BOOLEAN DEFAULT true,
  undo_expiration TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_last_action_user ON public.user_last_action(user_id);

-- Undo queue for batch operations (enterprise feature)
CREATE TABLE IF NOT EXISTS public.undo_batch_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL,
  duplicate_ids UUID[] NOT NULL,
  batch_action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'undone')),
  can_undo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  undo_requested_at TIMESTAMPTZ
);

CREATE INDEX idx_batch_user_id ON public.undo_batch_queue(user_id);
CREATE INDEX idx_batch_created_at ON public.undo_batch_queue(created_at DESC);
CREATE INDEX idx_batch_status ON public.undo_batch_queue(status);
