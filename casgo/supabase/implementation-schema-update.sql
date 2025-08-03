-- Implementation tracking table for recommendation implementations
CREATE TABLE IF NOT EXISTS public.implementations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
  
  -- Implementation Content (copied from recommendation for stability)
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  
  -- Financial tracking
  estimated_cost_savings DECIMAL(12,2) NOT NULL DEFAULT 0,
  estimated_co2_reduction DECIMAL(8,2) NOT NULL DEFAULT 0,
  roi_months INTEGER DEFAULT 12,
  
  -- Implementation tracking
  status TEXT NOT NULL DEFAULT 'started' CHECK (status IN ('started', 'in-progress', 'completed')),
  difficulty TEXT NOT NULL DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  
  -- Auto-generated timeline based on difficulty
  estimated_completion_weeks INTEGER NOT NULL DEFAULT 4,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Constraints
  CONSTRAINT implementations_title_length CHECK (LENGTH(title) >= 3),
  CONSTRAINT implementations_category_length CHECK (LENGTH(category) >= 2)
);

-- Enable RLS
ALTER TABLE public.implementations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own implementations" ON public.implementations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own implementations" ON public.implementations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own implementations" ON public.implementations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own implementations" ON public.implementations
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX implementations_user_id_idx ON public.implementations(user_id);
CREATE INDEX implementations_status_idx ON public.implementations(status);
CREATE INDEX implementations_created_at_idx ON public.implementations(created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_implementations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER implementations_updated_at_trigger
  BEFORE UPDATE ON public.implementations
  FOR EACH ROW
  EXECUTE FUNCTION update_implementations_updated_at();

-- Function to auto-calculate progress based on time elapsed and difficulty
CREATE OR REPLACE FUNCTION calculate_implementation_progress(
  started_at TIMESTAMP WITH TIME ZONE,
  estimated_weeks INTEGER,
  current_status TEXT
)
RETURNS INTEGER AS $$
DECLARE
  weeks_elapsed DECIMAL;
  calculated_progress INTEGER;
BEGIN
  -- If completed, return 100%
  IF current_status = 'completed' THEN
    RETURN 100;
  END IF;
  
  -- Calculate weeks elapsed since start
  weeks_elapsed := EXTRACT(EPOCH FROM (NOW() - started_at)) / (7 * 24 * 3600);
  
  -- Calculate progress percentage (max 95% until manually completed)
  calculated_progress := LEAST(95, GREATEST(0, (weeks_elapsed / estimated_weeks * 100)::INTEGER));
  
  RETURN calculated_progress;
END;
$$ LANGUAGE plpgsql; 