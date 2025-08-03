"""
Unit Tests for Sustainability Calculation Utilities (Python)

Test Coverage:
- Carbon footprint calculations
- ROI and financial analysis
- Regional adjustments
- Incentive optimization
- Priority scoring
- Environmental equivalents
- Solar potential calculations
- Edge cases and error handling
"""

import pytest
from datetime import date
from calculations import (
    sustainability_calculator,
    calculate_roi,
    calculate_npv,
    format_currency,
    format_number,
    EnergyData,
    BusinessProfile,
    IncentiveData
)

class TestSustainabilityCalculator:
    """Test suite for SustainabilityCalculator class."""
    
    def test_california_regional_factors(self):
        """Test California regional factors."""
        factors = sustainability_calculator.get_regional_factors('Los Angeles, California')
        
        assert abs(factors.electricity_rate - 0.2245) < 0.0001
        assert abs(factors.co2_emission_factor - 0.651) < 0.001
        assert factors.solar_potential == 1850
        assert factors.utility_rebate_multiplier == 1.4
    
    def test_texas_regional_factors(self):
        """Test Texas regional factors."""
        factors = sustainability_calculator.get_regional_factors('Austin, Texas')
        
        assert abs(factors.electricity_rate - 0.1189) < 0.0001
        assert abs(factors.co2_emission_factor - 0.995) < 0.001
        assert factors.utility_rebate_multiplier == 0.8
    
    def test_default_regional_factors(self):
        """Test default factors for unrecognized location."""
        factors = sustainability_calculator.get_regional_factors('Unknown City, Unknown State')
        
        assert abs(factors.electricity_rate - 0.1378) < 0.0001
        assert abs(factors.co2_emission_factor - 0.855) < 0.001
        assert factors.utility_rebate_multiplier == 1.0
    
    def test_case_insensitive_location_matching(self):
        """Test case-insensitive location matching."""
        factors1 = sustainability_calculator.get_regional_factors('CALIFORNIA')
        factors2 = sustainability_calculator.get_regional_factors('california')
        
        assert factors1.electricity_rate == factors2.electricity_rate
        assert factors1.co2_emission_factor == factors2.co2_emission_factor

class TestCarbonFootprintCalculations:
    """Test carbon footprint calculation functionality."""
    
    def setup_method(self):
        """Set up test data."""
        self.test_energy_data = EnergyData(
            monthly_kwh=5000,
            monthly_therms=200
        )
    
    def test_carbon_footprint_california(self):
        """Test carbon footprint calculation for California."""
        result = sustainability_calculator.calculate_carbon_footprint(
            self.test_energy_data, 'California'
        )
        
        # Expected: (5000 * 0.651 + 200 * 11.7) * 12 / 2000 = 33.57 tons annually
        assert abs(result['annual_co2_tons'] - 33.57) < 0.1
        assert result['electricity_co2'] == 3255.0  # 5000 * 0.651
        assert result['gas_co2'] == 2340.0  # 200 * 11.7
    
    def test_carbon_footprint_texas(self):
        """Test carbon footprint for high emission grid (Texas)."""
        result = sustainability_calculator.calculate_carbon_footprint(
            self.test_energy_data, 'Texas'
        )
        
        # Texas has higher emission factor (0.995)
        assert result['annual_co2_tons'] > 35
        assert result['electricity_co2'] == 4975.0  # 5000 * 0.995
    
    def test_zero_energy_usage(self):
        """Test handling of zero energy usage."""
        zero_energy = EnergyData(monthly_kwh=0, monthly_therms=0)
        result = sustainability_calculator.calculate_carbon_footprint(
            zero_energy, 'California'
        )
        
        assert result['annual_co2_tons'] == 0
        assert result['electricity_co2'] == 0
        assert result['gas_co2'] == 0
    
    def test_electricity_only_usage(self):
        """Test electricity-only usage."""
        electricity_only = EnergyData(monthly_kwh=3000, monthly_therms=0)
        result = sustainability_calculator.calculate_carbon_footprint(
            electricity_only, 'New York'
        )
        
        assert result['gas_co2'] == 0
        assert result['electricity_co2'] > 0
        # (3000 * 0.578 * 12) / 2000 = 10.404 tons
        assert abs(result['annual_co2_tons'] - 10.4) < 0.1

class TestEnergyCostCalculations:
    """Test energy cost calculation functionality."""
    
    def setup_method(self):
        """Set up test data."""
        self.test_energy_data = EnergyData(
            monthly_kwh=4000,
            monthly_therms=150
        )
    
    def test_energy_costs_california(self):
        """Test energy cost calculation for California."""
        result = sustainability_calculator.calculate_energy_costs(
            self.test_energy_data, 'California'
        )
        
        # Expected electricity: 4000 * 0.2245 * 12 = $10,776
        # Expected gas: 150 * 1.35 * 12 = $2,430
        assert abs(result['annual_electricity_cost'] - 10776) < 1
        assert abs(result['annual_gas_cost'] - 2430) < 1
        assert abs(result['total_annual_cost'] - 13206) < 1
    
    def test_custom_rates(self):
        """Test using custom energy rates."""
        custom_energy_data = EnergyData(
            monthly_kwh=2000,
            monthly_therms=100,
            electricity_cost=0.15,  # Custom rate
            gas_cost=1.00  # Custom rate
        )
        
        result = sustainability_calculator.calculate_energy_costs(
            custom_energy_data, 'Texas'
        )
        
        # Should use custom rates, not Texas regional rates
        assert abs(result['annual_electricity_cost'] - 3600) < 1  # 2000 * 0.15 * 12
        assert abs(result['annual_gas_cost'] - 1200) < 1  # 100 * 1.00 * 12
    
    def test_demand_charges(self):
        """Test inclusion of demand charges."""
        demand_energy_data = EnergyData(
            monthly_kwh=3000,
            monthly_therms=0,
            demand_charges=15,  # $/kW
            peak_demand_kw=500
        )
        
        result = sustainability_calculator.calculate_energy_costs(
            demand_energy_data, 'Florida'
        )
        
        # Should include demand charges: 15 * 500 * 12 = $90,000 annually
        assert result['total_annual_cost'] > 90000

class TestROICalculations:
    """Test ROI calculation functionality."""
    
    def setup_method(self):
        """Set up test data."""
        self.test_energy_data = EnergyData(
            monthly_kwh=8000,
            monthly_therms=300
        )
    
    def test_roi_calculation_25_percent_savings(self):
        """Test ROI calculation for 25% energy savings."""
        result = sustainability_calculator.calculate_recommendation_roi(
            energy_savings_percent=0.25,  # 25% energy savings
            implementation_cost=50000,  # $50k implementation cost
            energy=self.test_energy_data,
            location='California',
            category='LED Lighting'
        )
        
        assert result['annual_savings'] > 5000
        assert result['roi_months'] > 0
        assert result['roi_months'] < 120  # Should break even within 10 years
        assert result['total_co2_reduction'] > 0
    
    def test_maintenance_savings_inclusion(self):
        """Test inclusion of maintenance savings in ROI calculation."""
        result_with_maintenance = sustainability_calculator.calculate_recommendation_roi(
            energy_savings_percent=0.15,  # 15% energy savings
            implementation_cost=30000,
            energy=self.test_energy_data,
            location='Texas',
            category='HVAC Upgrade',
            maintenance_savings=2000  # $2k annual maintenance savings
        )
        
        result_without_maintenance = sustainability_calculator.calculate_recommendation_roi(
            energy_savings_percent=0.15,
            implementation_cost=30000,
            energy=self.test_energy_data,
            location='Texas',
            category='HVAC Upgrade',
            maintenance_savings=0
        )
        
        assert result_with_maintenance['annual_savings'] > result_without_maintenance['annual_savings']
        assert result_with_maintenance['roi_months'] < result_without_maintenance['roi_months']
    
    def test_npv_calculation(self):
        """Test NPV calculation for significant savings."""
        result = sustainability_calculator.calculate_recommendation_roi(
            energy_savings_percent=0.30,
            implementation_cost=75000,
            energy=self.test_energy_data,
            location='New York',
            category='Comprehensive Retrofit'
        )
        
        # With significant savings, NPV should be positive
        assert result['net_present_value'] > 0
        assert result['internal_rate_of_return'] > 0
    
    def test_low_savings_scenarios(self):
        """Test handling of very low savings scenarios."""
        result = sustainability_calculator.calculate_recommendation_roi(
            energy_savings_percent=0.02,  # Only 2% savings
            implementation_cost=100000,  # High implementation cost
            energy=self.test_energy_data,
            location='Florida',
            category='Minor Upgrade'
        )
        
        # Should have long payback period
        assert result['roi_months'] > 60
        assert result['net_present_value'] < 0  # Likely negative NPV

class TestIncentiveOptimization:
    """Test incentive optimization functionality."""
    
    def test_federal_solar_incentives(self):
        """Test finding applicable federal solar incentives."""
        business_profile = BusinessProfile(
            industry='Technology',
            company_size='Medium',
            location='California'
        )
        
        result = sustainability_calculator.calculate_incentive_optimization(
            category='Solar Panel Installation',
            implementation_cost=100000,
            location='California',
            business_profile=business_profile
        )
        
        assert len(result['applicable_incentives']) > 0
        assert result['total_incentive_value'] > 20000  # Should include 30% federal credit
        assert result['post_incentive_cost'] < 100000
    
    def test_percentage_based_incentives(self):
        """Test application of percentage-based incentives."""
        business_profile = BusinessProfile(
            industry='Manufacturing',
            company_size='Large',
            location='Texas'
        )
        
        result = sustainability_calculator.calculate_incentive_optimization(
            category='renewable_energy',
            implementation_cost=50000,
            location='Texas',
            business_profile=business_profile
        )
        
        # Should find federal solar tax credit (30%)
        assert abs(result['total_incentive_value'] - 15000) < 100  # 30% of $50k
        assert abs(result['post_incentive_cost'] - 35000) < 100
    
    def test_maximum_incentive_limits(self):
        """Test handling of maximum incentive limits."""
        business_profile = BusinessProfile(
            industry='Healthcare',
            company_size='Enterprise',
            location='New York'
        )
        
        result = sustainability_calculator.calculate_incentive_optimization(
            category='lighting',
            implementation_cost=5000000,  # $5M project
            location='New York',
            business_profile=business_profile
        )
        
        # Should cap incentives at maximum values
        assert result['total_incentive_value'] < 2000000  # Reasonable cap
    
    def test_non_eligible_categories(self):
        """Test handling of non-eligible categories."""
        business_profile = BusinessProfile(
            industry='Retail',
            company_size='Small',
            location='Florida'
        )
        
        result = sustainability_calculator.calculate_incentive_optimization(
            category='non_eligible_category',
            implementation_cost=25000,
            location='Florida',
            business_profile=business_profile
        )
        
        assert len(result['applicable_incentives']) == 0
        assert result['total_incentive_value'] == 0
        assert result['post_incentive_cost'] == 25000

class TestPriorityScoring:
    """Test priority scoring functionality."""
    
    def test_quick_payback_priority(self):
        """Test high priority for quick payback projects."""
        quick_payback_score = sustainability_calculator.generate_priority_score(
            roi_months=8,  # 8 months ROI
            annual_savings=15000,  # $15k annual savings
            co2_reduction_tons=12,  # 12 tons CO2 reduction
            implementation_difficulty='Easy',
            energy_usage=6000  # 6000 kWh usage
        )
        
        slow_payback_score = sustainability_calculator.generate_priority_score(
            roi_months=72,  # 6 years ROI
            annual_savings=15000,
            co2_reduction_tons=12,
            implementation_difficulty='Easy',
            energy_usage=6000
        )
        
        assert quick_payback_score > slow_payback_score
        assert quick_payback_score > 0.7
    
    def test_high_savings_priority(self):
        """Test prioritization of high savings projects."""
        high_savings_score = sustainability_calculator.generate_priority_score(
            roi_months=24,  # 2 years ROI
            annual_savings=25000,  # $25k annual savings
            co2_reduction_tons=20,  # 20 tons CO2 reduction
            implementation_difficulty='Medium',
            energy_usage=8000
        )
        
        low_savings_score = sustainability_calculator.generate_priority_score(
            roi_months=24,
            annual_savings=1000,  # $1k annual savings
            co2_reduction_tons=1,  # 1 ton CO2 reduction
            implementation_difficulty='Medium',
            energy_usage=1000
        )
        
        assert high_savings_score > low_savings_score
    
    def test_implementation_difficulty_penalty(self):
        """Test penalty for difficult implementations."""
        easy_score = sustainability_calculator.generate_priority_score(
            roi_months=18, annual_savings=10000, co2_reduction_tons=8, 
            implementation_difficulty='Easy', energy_usage=4000
        )
        
        hard_score = sustainability_calculator.generate_priority_score(
            roi_months=18, annual_savings=10000, co2_reduction_tons=8, 
            implementation_difficulty='Hard', energy_usage=4000
        )
        
        assert easy_score > hard_score
    
    def test_score_bounds(self):
        """Test score stays within bounds [0.1, 1.0]."""
        extremely_bad_score = sustainability_calculator.generate_priority_score(
            roi_months=120,  # 10 years ROI
            annual_savings=100,  # Very low savings
            co2_reduction_tons=0.1,  # Minimal CO2 reduction
            implementation_difficulty='Hard',
            energy_usage=100
        )
        
        extremely_good_score = sustainability_calculator.generate_priority_score(
            roi_months=3,  # 3 months ROI
            annual_savings=100000,  # Very high savings
            co2_reduction_tons=100,  # High CO2 reduction
            implementation_difficulty='Easy',
            energy_usage=20000
        )
        
        assert extremely_bad_score >= 0.1
        assert extremely_good_score <= 1.0

class TestEnvironmentalEquivalents:
    """Test environmental equivalents calculations."""
    
    def test_environmental_equivalents_calculation(self):
        """Test calculation of environmental equivalents."""
        result = sustainability_calculator.calculate_environmental_equivalents(50)  # 50 tons CO2
        
        assert result['trees_planted'] == 825  # 50 * 16.5
        assert result['cars_off_road'] == 11  # 50 * 0.22
        assert result['homes_powered'] == 9  # 50 * 0.18
        assert result['gallons_gasoline_saved'] == 5650  # 50 * 113
    
    def test_zero_co2_reduction(self):
        """Test handling of zero CO2 reduction."""
        result = sustainability_calculator.calculate_environmental_equivalents(0)
        
        assert result['trees_planted'] == 0
        assert result['cars_off_road'] == 0
        assert result['homes_powered'] == 0
        assert result['gallons_gasoline_saved'] == 0
    
    def test_results_are_integers(self):
        """Test that results are rounded to whole numbers."""
        result = sustainability_calculator.calculate_environmental_equivalents(2.7)
        
        assert isinstance(result['trees_planted'], int)
        assert isinstance(result['cars_off_road'], int)
        assert isinstance(result['homes_powered'], int)
        assert isinstance(result['gallons_gasoline_saved'], int)

class TestSolarPotentialCalculations:
    """Test solar potential calculation functionality."""
    
    def test_medium_facility_california(self):
        """Test solar potential for medium facility in California."""
        result = sustainability_calculator.calculate_solar_potential(
            facility_size=50000,  # 50,000 sqft facility
            location='California',
            roof_percentage=0.7  # 70% usable roof
        )
        
        assert result['estimated_system_size_kw'] > 200
        assert result['annual_generation_kwh'] > 300000
        assert result['annual_savings'] > 50000
        assert result['roi_years'] < 15
        assert result['co2_offset_tons'] > 100
    
    def test_regional_solar_potential_adjustment(self):
        """Test adjustment for regional solar potential."""
        california_result = sustainability_calculator.calculate_solar_potential(
            facility_size=20000, location='California', roof_percentage=0.6
        )
        
        new_york_result = sustainability_calculator.calculate_solar_potential(
            facility_size=20000, location='New York', roof_percentage=0.6
        )
        
        # California should have higher generation and better ROI
        assert california_result['annual_generation_kwh'] > new_york_result['annual_generation_kwh']
        assert california_result['roi_years'] < new_york_result['roi_years']
    
    def test_small_facilities(self):
        """Test handling of small facilities."""
        result = sustainability_calculator.calculate_solar_potential(
            facility_size=5000,  # Small 5,000 sqft facility
            location='Florida',
            roof_percentage=0.5
        )
        
        assert result['estimated_system_size_kw'] > 0
        assert result['estimated_system_size_kw'] < 50
        assert result['roi_years'] > 0
    
    def test_zero_roof_percentage(self):
        """Test handling of zero roof percentage."""
        result = sustainability_calculator.calculate_solar_potential(
            facility_size=30000,
            location='Texas',
            roof_percentage=0  # No usable roof
        )
        
        assert result['estimated_system_size_kw'] == 0
        assert result['annual_generation_kwh'] == 0
        assert result['annual_savings'] == 0

class TestUtilityFunctions:
    """Test utility functions."""
    
    def test_calculate_roi(self):
        """Test ROI calculation in months."""
        roi_months = calculate_roi(5000, 30000)  # $5k savings, $30k cost
        assert abs(roi_months - 72) < 1  # 6 years = 72 months
    
    def test_calculate_roi_zero_savings(self):
        """Test ROI calculation with zero savings."""
        roi_months = calculate_roi(0, 10000)
        assert roi_months == float('inf')
    
    def test_calculate_roi_negative_savings(self):
        """Test ROI calculation with negative savings."""
        roi_months = calculate_roi(-1000, 10000)
        assert roi_months == -120  # Negative payback
    
    def test_calculate_npv(self):
        """Test NPV calculation for positive cash flows."""
        cash_flows = [10000, 10000, 10000, 10000, 10000]  # 5 years of $10k
        npv = calculate_npv(cash_flows, 0.08, 35000)  # 8% discount, $35k investment
        
        assert npv > 0  # Should be profitable
        assert abs(npv - 4927) < 100  # Calculated NPV
    
    def test_calculate_npv_poor_investment(self):
        """Test NPV calculation for poor investments."""
        cash_flows = [1000, 1000, 1000]  # 3 years of $1k
        npv = calculate_npv(cash_flows, 0.10, 10000)  # 10% discount, $10k investment
        
        assert npv < 0  # Should be unprofitable
    
    def test_calculate_npv_empty_cash_flows(self):
        """Test NPV calculation with empty cash flows."""
        npv = calculate_npv([], 0.05, 5000)
        assert npv == -5000  # Just the initial investment
    
    def test_format_currency(self):
        """Test currency formatting."""
        assert format_currency(1234.56) == '$1,235'
        assert format_currency(0) == '$0'
        assert format_currency(1000000) == '$1,000,000'
    
    def test_format_number(self):
        """Test number formatting with decimals."""
        assert format_number(1234.5678, 2) == '1,234.57'
        assert format_number(0, 1) == '0.0'
        assert format_number(1000000.123, 3) == '1,000,000.123'
    
    def test_format_number_default_decimals(self):
        """Test number formatting with default decimal places."""
        assert format_number(1234.5678) == '1,234.6'  # Default 1 decimal

if __name__ == '__main__':
    pytest.main([__file__]) 