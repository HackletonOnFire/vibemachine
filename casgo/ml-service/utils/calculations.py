"""
Comprehensive Calculation Utilities for Sustainability Recommendations (Python)

Features:
- Carbon footprint calculations with emission factors
- ROI and payback period analysis
- Cost savings calculations with regional adjustments
- Tax incentive and rebate optimization
- Implementation cost modeling
- Energy efficiency calculations
- Renewable energy potential assessment
"""

from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from datetime import datetime, date
import math

@dataclass
class EnergyData:
    monthly_kwh: float
    monthly_therms: float
    electricity_cost: Optional[float] = None  # $/kWh
    gas_cost: Optional[float] = None  # $/therm
    demand_charges: Optional[float] = None  # $/kW
    peak_demand_kw: Optional[float] = None

@dataclass
class BusinessProfile:
    industry: str
    company_size: str
    location: str
    facility_size: Optional[float] = None  # square feet
    operating_hours: Optional[float] = None  # hours per week
    seasonal_variation: Optional[float] = None  # 0-1 factor

@dataclass
class IncentiveData:
    type: str  # 'tax_credit', 'rebate', 'grant', 'loan', 'deduction'
    name: str
    value: float
    max_value: Optional[float] = None
    percentage: Optional[float] = None
    description: str
    eligibility: List[str]
    expiration_date: Optional[date] = None
    application_process: str

@dataclass
class RegionalFactors:
    electricity_rate: float  # $/kWh
    gas_rate: float  # $/therm
    co2_emission_factor: float  # lbs CO2/kWh
    gas_emission_factor: float  # lbs CO2/therm
    solar_potential: float  # kWh/kW/year
    heating_degree_days: float
    cooling_degree_days: float
    utility_rebate_multiplier: float
    labor_cost_multiplier: float

@dataclass
class RecommendationMetrics:
    id: str
    title: str
    category: str
    
    # Financial Metrics
    annual_cost_savings: float
    implementation_cost: float
    roi_months: float
    net_present_value: float
    internal_rate_of_return: float
    
    # Environmental Metrics
    annual_co2_reduction_tons: float
    annual_co2_reduction_percent: float
    equivalent_trees_planted: int
    equivalent_cars_off_road: int
    
    # Technical Metrics
    energy_savings_kwh: float
    energy_savings_percent: float
    peak_demand_reduction_kw: float
    
    # Implementation Metrics
    difficulty: str  # 'Easy', 'Medium', 'Hard'
    priority_score: float
    risk_level: str  # 'Low', 'Medium', 'High'
    maintenance_impact: float  # annual $ change
    
    # Incentive Optimization
    available_incentives: List[IncentiveData]
    total_incentive_value: float
    post_incentive_payback: float

class SustainabilityCalculator:
    """Comprehensive calculator for sustainability recommendations."""
    
    def __init__(self):
        self.regional_factors: Dict[str, RegionalFactors] = {}
        self.industry_factors: Dict[str, Dict[str, float]] = {}
        self.incentive_database: Dict[str, List[IncentiveData]] = {}
        self._initialize_factors()
    
    def _initialize_factors(self) -> None:
        """Initialize all calculation factors."""
        self._initialize_regional_factors()
        self._initialize_industry_factors()
        self._initialize_incentive_database()
    
    def _initialize_regional_factors(self) -> None:
        """Initialize regional adjustment factors."""
        # Major US regions with accurate energy data
        self.regional_factors['california'] = RegionalFactors(
            electricity_rate=0.2245,  # $/kWh
            gas_rate=1.35,  # $/therm
            co2_emission_factor=0.651,  # lbs CO2/kWh (CA grid is cleaner)
            gas_emission_factor=11.7,  # lbs CO2/therm
            solar_potential=1850,  # kWh/kW/year
            heating_degree_days=1500,
            cooling_degree_days=1200,
            utility_rebate_multiplier=1.4,
            labor_cost_multiplier=1.3
        )
        
        self.regional_factors['texas'] = RegionalFactors(
            electricity_rate=0.1189,
            gas_rate=1.12,
            co2_emission_factor=0.995,  # Higher due to fossil fuel mix
            gas_emission_factor=11.7,
            solar_potential=1650,
            heating_degree_days=1600,
            cooling_degree_days=2800,
            utility_rebate_multiplier=0.8,
            labor_cost_multiplier=0.9
        )
        
        self.regional_factors['new york'] = RegionalFactors(
            electricity_rate=0.1825,
            gas_rate=1.48,
            co2_emission_factor=0.578,  # Clean NY grid
            gas_emission_factor=11.7,
            solar_potential=1300,
            heating_degree_days=4800,
            cooling_degree_days=900,
            utility_rebate_multiplier=1.2,
            labor_cost_multiplier=1.4
        )
        
        self.regional_factors['florida'] = RegionalFactors(
            electricity_rate=0.1147,
            gas_rate=1.25,
            co2_emission_factor=0.892,
            gas_emission_factor=11.7,
            solar_potential=1800,
            heating_degree_days=600,
            cooling_degree_days=3500,
            utility_rebate_multiplier=0.9,
            labor_cost_multiplier=0.95
        )
        
        # Default for unspecified regions
        self.regional_factors['default'] = RegionalFactors(
            electricity_rate=0.1378,  # US average
            gas_rate=1.28,
            co2_emission_factor=0.855,  # US grid average
            gas_emission_factor=11.7,
            solar_potential=1500,
            heating_degree_days=3000,
            cooling_degree_days=1500,
            utility_rebate_multiplier=1.0,
            labor_cost_multiplier=1.0
        )
    
    def _initialize_industry_factors(self) -> None:
        """Initialize industry-specific factors."""
        self.industry_factors['technology'] = {
            'energy_intensity': 15.2,  # kWh/sqft/year
            'hvac_share': 0.45,
            'lighting_share': 0.25,
            'equipment_share': 0.30,
            'typical_utilization': 0.65,
            'peak_demand_factor': 0.7,
            'seasonal_variation': 0.15
        }
        
        self.industry_factors['manufacturing'] = {
            'energy_intensity': 28.5,
            'hvac_share': 0.25,
            'lighting_share': 0.15,
            'equipment_share': 0.60,
            'typical_utilization': 0.85,
            'peak_demand_factor': 0.9,
            'seasonal_variation': 0.10
        }
        
        self.industry_factors['retail'] = {
            'energy_intensity': 14.1,
            'hvac_share': 0.40,
            'lighting_share': 0.35,
            'equipment_share': 0.25,
            'typical_utilization': 0.55,
            'peak_demand_factor': 0.6,
            'seasonal_variation': 0.25
        }
        
        self.industry_factors['healthcare'] = {
            'energy_intensity': 31.8,
            'hvac_share': 0.50,
            'lighting_share': 0.20,
            'equipment_share': 0.30,
            'typical_utilization': 0.95,
            'peak_demand_factor': 0.85,
            'seasonal_variation': 0.05
        }
        
        self.industry_factors['default'] = {
            'energy_intensity': 18.5,
            'hvac_share': 0.40,
            'lighting_share': 0.25,
            'equipment_share': 0.35,
            'typical_utilization': 0.70,
            'peak_demand_factor': 0.75,
            'seasonal_variation': 0.20
        }
    
    def _initialize_incentive_database(self) -> None:
        """Initialize incentive database."""
        # Federal incentives (available nationwide)
        federal_incentives = [
            IncentiveData(
                type='tax_credit',
                name='Commercial Solar Investment Tax Credit',
                value=30,  # 30% through 2032
                percentage=30,
                description='30% federal tax credit for commercial solar installations',
                eligibility=['solar', 'renewable_energy'],
                expiration_date=date(2032, 12, 31),
                application_process='File IRS Form 3468 with tax return'
            ),
            IncentiveData(
                type='deduction',
                name='Section 179D Energy Efficient Commercial Building Deduction',
                value=1.88,  # $/sqft
                max_value=1000000,
                description='Tax deduction for energy-efficient building improvements',
                eligibility=['hvac', 'lighting', 'building_envelope'],
                application_process='IRS Form 3468 with energy certification'
            ),
            IncentiveData(
                type='tax_credit',
                name='Commercial Energy Efficiency Tax Credit',
                value=25,
                percentage=25,
                description='25% credit for qualifying energy efficiency improvements',
                eligibility=['hvac', 'lighting', 'building_systems'],
                expiration_date=date(2024, 12, 31),
                application_process='IRS Form 3468'
            )
        ]
        
        # State-specific incentives
        california_incentives = federal_incentives + [
            IncentiveData(
                type='rebate',
                name='Self-Generation Incentive Program (SGIP)',
                value=150,  # $/kWh for battery storage
                description='Rebate for energy storage and fuel cell systems',
                eligibility=['battery_storage', 'fuel_cells'],
                application_process='Apply through approved installers'
            ),
            IncentiveData(
                type='rebate',
                name='Energy Efficiency Rebates',
                value=500,  # varies by measure
                description='Utility rebates for lighting, HVAC, and motor upgrades',
                eligibility=['led_lighting', 'hvac', 'motors'],
                application_process='Utility pre-approval required'
            )
        ]
        
        texas_incentives = federal_incentives + [
            IncentiveData(
                type='loan',
                name='Texas LoanSTAR Revolving Loan Program',
                value=0,  # Low interest loans
                description='Below-market rate loans for energy efficiency projects',
                eligibility=['energy_efficiency', 'renewable_energy'],
                application_process='Apply through State Energy Conservation Office'
            )
        ]
        
        self.incentive_database['california'] = california_incentives
        self.incentive_database['texas'] = texas_incentives
        self.incentive_database['default'] = federal_incentives
    
    def get_regional_factors(self, location: str) -> RegionalFactors:
        """Get regional factors for a location."""
        location_lower = location.lower()
        
        # Try to match major cities/states
        for region, factors in self.regional_factors.items():
            if region != 'default' and region in location_lower:
                return factors
        
        return self.regional_factors['default']
    
    def calculate_carbon_footprint(self, energy: EnergyData, location: str) -> Dict[str, float]:
        """Calculate carbon footprint from energy usage."""
        factors = self.get_regional_factors(location)
        
        # Calculate monthly CO2 emissions
        electricity_co2_lbs = energy.monthly_kwh * factors.co2_emission_factor
        gas_co2_lbs = energy.monthly_therms * factors.gas_emission_factor
        total_monthly_lbs = electricity_co2_lbs + gas_co2_lbs
        
        # Convert to annual tons
        annual_co2_tons = (total_monthly_lbs * 12) / 2000
        monthly_co2_tons = total_monthly_lbs / 2000
        
        return {
            'annual_co2_tons': round(annual_co2_tons, 2),
            'monthly_co2_tons': round(monthly_co2_tons, 2),
            'electricity_co2': round(electricity_co2_lbs, 2),
            'gas_co2': round(gas_co2_lbs, 2),
            'total_co2_lbs': round(total_monthly_lbs * 12, 2)
        }
    
    def calculate_energy_costs(self, energy: EnergyData, location: str) -> Dict[str, float]:
        """Calculate energy costs with regional adjustments."""
        factors = self.get_regional_factors(location)
        
        electricity_rate = energy.electricity_cost or factors.electricity_rate
        gas_rate = energy.gas_cost or factors.gas_rate
        
        monthly_electricity_cost = energy.monthly_kwh * electricity_rate
        monthly_gas_cost = energy.monthly_therms * gas_rate
        
        # Add demand charges if applicable
        demand_cost = 0
        if energy.demand_charges and energy.peak_demand_kw:
            demand_cost = energy.demand_charges * energy.peak_demand_kw
        
        total_monthly_cost = monthly_electricity_cost + monthly_gas_cost + demand_cost
        total_annual_cost = total_monthly_cost * 12
        
        return {
            'annual_electricity_cost': round(monthly_electricity_cost * 12, 2),
            'annual_gas_cost': round(monthly_gas_cost * 12, 2),
            'total_annual_cost': round(total_annual_cost, 2),
            'monthly_electricity_cost': round(monthly_electricity_cost, 2),
            'monthly_gas_cost': round(monthly_gas_cost, 2),
            'average_rate': round(total_annual_cost / ((energy.monthly_kwh + energy.monthly_therms * 3.412) * 12), 4)
        }
    
    def calculate_recommendation_roi(
        self,
        energy_savings_percent: float,
        implementation_cost: float,
        energy: EnergyData,
        location: str,
        category: str,
        maintenance_savings: float = 0
    ) -> Dict[str, float]:
        """Calculate ROI metrics for a recommendation."""
        costs = self.calculate_energy_costs(energy, location)
        carbon_data = self.calculate_carbon_footprint(energy, location)
        
        # Calculate annual savings
        energy_savings = costs['total_annual_cost'] * energy_savings_percent
        total_annual_savings = energy_savings + maintenance_savings
        
        # Calculate payback period
        roi_months = implementation_cost / (total_annual_savings / 12) if total_annual_savings > 0 else float('inf')
        
        # Calculate NPV (assuming 7% discount rate, 10-year analysis)
        discount_rate = 0.07
        analysis_years = 10
        npv = -implementation_cost
        
        for year in range(1, analysis_years + 1):
            yearly_benefit = total_annual_savings
            npv += yearly_benefit / ((1 + discount_rate) ** year)
        
        # Calculate IRR (simplified approximation)
        irr = (total_annual_savings / implementation_cost) - 1 if implementation_cost > 0 else 0
        
        # Calculate CO2 reduction
        co2_reduction = carbon_data['annual_co2_tons'] * energy_savings_percent
        
        return {
            'annual_savings': round(total_annual_savings, 2),
            'roi_months': round(roi_months, 1),
            'net_present_value': round(npv, 2),
            'internal_rate_of_return': round(irr * 100, 2),  # as percentage
            'break_even_year': round(roi_months / 12, 1),
            'total_co2_reduction': round(co2_reduction, 2)
        }
    
    def calculate_incentive_optimization(
        self,
        category: str,
        implementation_cost: float,
        location: str,
        business_profile: BusinessProfile
    ) -> Dict[str, Any]:
        """Calculate available incentives and optimization."""
        incentives = self.incentive_database.get(location.lower(), 
                                               self.incentive_database['default'])
        
        applicable_incentives = [
            incentive for incentive in incentives
            if any(eligibility in category.lower() or category.lower() in eligibility
                   for eligibility in incentive.eligibility)
        ]
        
        total_incentive_value = 0
        
        for incentive in applicable_incentives:
            if incentive.percentage:
                percentage_value = implementation_cost * (incentive.percentage / 100)
                if incentive.max_value:
                    total_incentive_value += min(percentage_value, incentive.max_value)
                else:
                    total_incentive_value += percentage_value
            else:
                total_incentive_value += incentive.value
        
        post_incentive_cost = implementation_cost - total_incentive_value
        payback_reduction = (total_incentive_value / implementation_cost) * 100 if implementation_cost > 0 else 0
        
        return {
            'applicable_incentives': applicable_incentives,
            'total_incentive_value': round(total_incentive_value, 2),
            'post_incentive_cost': round(post_incentive_cost, 2),
            'optimized_payback_reduction': round(payback_reduction, 1)  # as percentage
        }
    
    def generate_priority_score(
        self,
        roi_months: float,
        annual_savings: float,
        co2_reduction_tons: float,
        implementation_difficulty: str,
        energy_usage: float
    ) -> float:
        """Generate priority score for recommendations."""
        score = 0.5  # Base score
        
        # ROI factor (higher score for faster payback)
        if roi_months <= 12:
            score += 0.25
        elif roi_months <= 24:
            score += 0.15
        elif roi_months <= 36:
            score += 0.05
        elif roi_months > 60:
            score -= 0.15
        
        # Savings magnitude factor
        if annual_savings > 20000:
            score += 0.20
        elif annual_savings > 10000:
            score += 0.15
        elif annual_savings > 5000:
            score += 0.10
        elif annual_savings > 2000:
            score += 0.05
        
        # Environmental impact factor
        if co2_reduction_tons > 50:
            score += 0.15
        elif co2_reduction_tons > 25:
            score += 0.10
        elif co2_reduction_tons > 10:
            score += 0.05
        
        # Implementation difficulty factor
        difficulty_adjustments = {
            'Easy': 0.10,
            'Medium': 0.0,  # neutral
            'Hard': -0.10
        }
        score += difficulty_adjustments.get(implementation_difficulty, 0)
        
        # High energy usage bonus
        if energy_usage > 10000:
            score += 0.10
        
        # Ensure score stays within bounds
        return max(0.1, min(1.0, round(score, 2)))
    
    def calculate_environmental_equivalents(self, co2_reduction_tons: float) -> Dict[str, int]:
        """Calculate environmental equivalents."""
        # EPA equivalency factors
        trees_planted = round(co2_reduction_tons * 16.5)  # trees planted and grown for 10 years
        cars_off_road = round(co2_reduction_tons * 0.22)  # passenger cars driven for one year
        homes_powered = round(co2_reduction_tons * 0.18)  # average homes' electricity use for one year
        gallons_gasoline_saved = round(co2_reduction_tons * 113)  # gallons of gasoline consumed
        
        return {
            'trees_planted': trees_planted,
            'cars_off_road': cars_off_road,
            'homes_powered': homes_powered,
            'gallons_gasoline_saved': gallons_gasoline_saved
        }
    
    def calculate_solar_potential(
        self,
        facility_size: float,
        location: str,
        roof_percentage: float = 0.6
    ) -> Dict[str, float]:
        """Calculate solar installation potential."""
        factors = self.get_regional_factors(location)
        
        # Estimate system size (typical: 6-8 watts per sqft of usable roof)
        usable_roof_area = facility_size * roof_percentage
        system_size_kw = (usable_roof_area * 7) / 1000  # 7 watts per sqft
        
        # Annual generation
        annual_generation_kwh = system_size_kw * factors.solar_potential
        
        # Financial calculations
        annual_savings = annual_generation_kwh * factors.electricity_rate
        estimated_cost = system_size_kw * 2500  # $2.50/watt installed
        roi_years = estimated_cost / annual_savings if annual_savings > 0 else float('inf')
        
        # Environmental impact
        co2_offset_tons = (annual_generation_kwh * factors.co2_emission_factor) / 2000
        
        return {
            'estimated_system_size_kw': round(system_size_kw, 1),
            'annual_generation_kwh': round(annual_generation_kwh),
            'annual_savings': round(annual_savings, 2),
            'estimated_cost': round(estimated_cost, 2),
            'roi_years': round(roi_years, 1),
            'co2_offset_tons': round(co2_offset_tons, 2)
        }

# Create singleton instance
sustainability_calculator = SustainabilityCalculator()

# Utility functions
def calculate_roi(annual_savings: float, implementation_cost: float) -> float:
    """Calculate ROI in months."""
    if annual_savings <= 0:
        return float('inf') if annual_savings == 0 else -implementation_cost / annual_savings * 12
    return implementation_cost / annual_savings * 12

def calculate_npv(cash_flows: List[float], discount_rate: float, initial_investment: float) -> float:
    """Calculate Net Present Value."""
    npv = -initial_investment
    
    for index, cash_flow in enumerate(cash_flows):
        npv += cash_flow / ((1 + discount_rate) ** (index + 1))
    
    return round(npv, 2)

def format_currency(amount: float) -> str:
    """Format amount as currency."""
    return f"${amount:,.0f}"

def format_number(num: float, decimals: int = 1) -> str:
    """Format number with specified decimal places."""
    return f"{num:,.{decimals}f}" 