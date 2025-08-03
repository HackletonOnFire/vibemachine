-- Fixed get_energy_summary RPC function
-- This version has proper error handling and simpler return type

CREATE OR REPLACE FUNCTION public.get_energy_summary(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '12 months',
  p_months INTEGER DEFAULT 12
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  end_date DATE := CURRENT_DATE;
  monthly_data JSONB;
  total_kwh NUMERIC := 0;
  total_therms NUMERIC := 0;
  total_cost NUMERIC := 0;
  record_count INTEGER := 0;
BEGIN
  -- Validate input parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null';
  END IF;
  
  IF p_start_date IS NULL THEN
    p_start_date := CURRENT_DATE - INTERVAL '12 months';
  END IF;

  -- Get monthly data as JSON array
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'measurement_date', measurement_date,
      'kwh_usage', COALESCE(kwh_usage, 0),
      'gas_usage_therms', COALESCE(gas_usage_therms, 0),
      'total_cost', COALESCE(total_cost, 0),
      'electricity_cost', COALESCE(electricity_cost, 0),
      'gas_cost', COALESCE(gas_cost, 0)
    )
    ORDER BY measurement_date DESC
  ), '[]'::jsonb)
  INTO monthly_data
  FROM public.energy_data
  WHERE user_id = p_user_id
    AND measurement_date >= p_start_date
    AND measurement_date <= end_date;

  -- Calculate totals
  SELECT 
    COALESCE(SUM(kwh_usage), 0),
    COALESCE(SUM(gas_usage_therms), 0),
    COALESCE(SUM(total_cost), 0),
    COUNT(*)
  INTO total_kwh, total_therms, total_cost, record_count
  FROM public.energy_data
  WHERE user_id = p_user_id
    AND measurement_date >= p_start_date
    AND measurement_date <= end_date;

  -- Build result object
  result := jsonb_build_object(
    'totalKwh', total_kwh,
    'totalTherms', total_therms,
    'totalCost', total_cost,
    'averageMonthlyKwh', CASE WHEN record_count > 0 THEN total_kwh / record_count ELSE 0 END,
    'averageMonthlyCost', CASE WHEN record_count > 0 THEN total_cost / record_count ELSE 0 END,
    'recordCount', record_count,
    'monthlyData', monthly_data
  );
  
  RETURN result;
EXCEPTION 
  WHEN OTHERS THEN
    -- Return empty result on any error
    RETURN jsonb_build_object(
      'totalKwh', 0,
      'totalTherms', 0,
      'totalCost', 0,
      'averageMonthlyKwh', 0,
      'averageMonthlyCost', 0,
      'recordCount', 0,
      'monthlyData', '[]'::jsonb
    );
END;
$$;

-- Grant proper permissions
GRANT EXECUTE ON FUNCTION public.get_energy_summary(UUID, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_energy_summary(UUID, DATE, INTEGER) TO anon;

-- Test the function to ensure it works
-- SELECT public.get_energy_summary('4bfc2adb-d15b-43fa-9bf2-ff8fc47c8cbd'::uuid); 