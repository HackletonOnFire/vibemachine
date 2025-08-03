-- Create the get_energy_summary RPC function
-- This function provides optimized energy summary data for dashboard performance

CREATE OR REPLACE FUNCTION public.get_energy_summary(
  p_user_id UUID,
  p_start_date DATE,
  p_months INTEGER DEFAULT 12
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  end_date DATE;
BEGIN
  -- Calculate end date
  end_date := CURRENT_DATE;
  
  -- Get aggregated energy summary
  SELECT json_build_object(
    'totalKwh', COALESCE(SUM(kwh_usage), 0),
    'totalTherms', COALESCE(SUM(gas_usage_therms), 0),
    'totalCost', COALESCE(SUM(total_cost), 0),
    'averageMonthlyKwh', COALESCE(AVG(kwh_usage), 0),
    'averageMonthlyCost', COALESCE(AVG(total_cost), 0),
    'recordCount', COUNT(*),
    'monthlyData', COALESCE(
      json_agg(
        json_build_object(
          'measurement_date', measurement_date,
          'kwh_usage', COALESCE(kwh_usage, 0),
          'gas_usage_therms', COALESCE(gas_usage_therms, 0),
          'total_cost', COALESCE(total_cost, 0),
          'electricity_cost', COALESCE(electricity_cost, 0),
          'gas_cost', COALESCE(gas_cost, 0)
        )
        ORDER BY measurement_date DESC
      ), 
      '[]'::json
    )
  ) INTO result
  FROM public.energy_data
  WHERE user_id = p_user_id
    AND measurement_date >= p_start_date
    AND measurement_date <= end_date
  ORDER BY measurement_date DESC;
  
  -- Return result or empty object if no data
  RETURN COALESCE(result, json_build_object(
    'totalKwh', 0,
    'totalTherms', 0,
    'totalCost', 0,
    'averageMonthlyKwh', 0,
    'averageMonthlyCost', 0,
    'recordCount', 0,
    'monthlyData', '[]'::json
  ));
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_energy_summary(UUID, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_energy_summary(UUID, DATE, INTEGER) TO anon; 