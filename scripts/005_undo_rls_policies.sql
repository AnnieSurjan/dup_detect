-- Enable RLS on undo tables
ALTER TABLE public.undo_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_last_action ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.undo_batch_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for undo_history table
CREATE POLICY "Users can view their own undo history"
  ON public.undo_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own undo history"
  ON public.undo_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_last_action table
CREATE POLICY "Users can view their own last action"
  ON public.user_last_action
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own last action"
  ON public.user_last_action
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own last action"
  ON public.user_last_action
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for undo_batch_queue table
CREATE POLICY "Users can view their own batch undos"
  ON public.undo_batch_queue
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own batch undos"
  ON public.undo_batch_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batch undos"
  ON public.undo_batch_queue
  FOR UPDATE
  USING (auth.uid() = user_id);
