"""
Rules-based recommendation engine for sustainability recommendations.
Analyzes business data and generates targeted recommendations based on:
- Industry best practices
- Company size considerations
- Geographic factors
- Energy usage patterns
- Sustainability goals
"""

import math
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

class IndustryType(Enum):
    TECHNOLOGY = "Technology"
    MANUFACTURING = "Manufacturing"
    RETAIL = "Retail"
    HEALTHCARE = "Healthcare"
    HOSPITALITY = "Hospitality"
    EDUCATION = "Education"
    FINANCIAL = "Financial Services"
    LOGISTICS = "Logistics & Transportation"
    CONSTRUCTION = "Construction"
    AGRICULTURE = "Agriculture"
    OTHER = "Other"

class CompanySize(Enum):
    SMALL = "1-50 employees"
    MEDIUM = "51-200 employees"
    LARGE = "201-1000 employees"
    ENTERPRISE = "1000+ employees"

class GoalCategory(Enum):
    ENERGY_EFFICIENCY = "Energy Efficiency"
    RENEWABLE_ENERGY = "Renewable Energy"
    CARBON_REDUCTION = "Carbon Footprint Reduction"
    WASTE_REDUCTION = "Waste Reduction"
    WATER_CONSERVATION = "Water Conservation"
    TRANSPORTATION = "Sustainable Transportation"
    GREEN_BUILDING = "Green Building"
    SUPPLY_CHAIN = "Sustainable Supply Chain"

@dataclass
class RecommendationRule:
    """Defines a recommendation rule with conditions and parameters."""
    rule_id: str
    title: str
    description: str
    category: str
    difficulty: str  # Easy, Medium, Hard
    
    # Conditions
    min_kwh: Optional[float] = None
    max_kwh: Optional[float] = None
    min_therms: Optional[float] = None
    max_therms: Optional[float] = None
    applicable_industries: Optional[List[IndustryType]] = None
    applicable_sizes: Optional[List[CompanySize]] = None
    required_goals: Optional[List[GoalCategory]] = None
    
    # ROI Parameters
    cost_savings_factor: float = 0.0  # Multiplier for annual savings calculation
    co2_reduction_factor: float = 0.0  # Multiplier for CO2 reduction calculation
    base_roi_months: int = 12
    implementation_cost_factor: float = 1.0
    
    # Priority
    base_priority: float = 0.5
    priority_multipliers: Optional[Dict[str, float]] = None

class BusinessDataAnalyzer:
    """Analyzes business data to extract insights for recommendation generation."""
    
    @staticmethod
    def categorize_industry(industry_str: str) -> IndustryType:
        """Categorize industry string into enum."""
        industry_lower = industry_str.lower()
        
        if any(tech in industry_lower for tech in ['tech', 'software', 'it', 'computer']):
            return IndustryType.TECHNOLOGY
        elif any(mfg in industry_lower for mfg in ['manufacturing', 'factory', 'production']):
            return IndustryType.MANUFACTURING
        elif any(retail in industry_lower for retail in ['retail', 'store', 'shopping']):
            return IndustryType.RETAIL
        elif any(health in industry_lower for health in ['health', 'medical', 'hospital']):
            return IndustryType.HEALTHCARE
        elif any(hosp in industry_lower for hosp in ['hotel', 'restaurant', 'hospitality']):
            return IndustryType.HOSPITALITY
        elif any(edu in industry_lower for edu in ['education', 'school', 'university']):
            return IndustryType.EDUCATION
        elif any(fin in industry_lower for fin in ['financial', 'bank', 'finance']):
            return IndustryType.FINANCIAL
        elif any(log in industry_lower for log in ['logistics', 'transport', 'shipping']):
            return IndustryType.LOGISTICS
        elif any(con in industry_lower for con in ['construction', 'building']):
            return IndustryType.CONSTRUCTION
        elif any(agr in industry_lower for agr in ['agriculture', 'farming']):
            return IndustryType.AGRICULTURE
        else:
            return IndustryType.OTHER
    
    @staticmethod
    def categorize_company_size(size_str: str) -> CompanySize:
        """Categorize company size string into enum."""
        size_lower = size_str.lower()
        
        if any(small in size_lower for small in ['small', '1-50', 'startup']):
            return CompanySize.SMALL
        elif any(med in size_lower for med in ['medium', '51-200', 'mid']):
            return CompanySize.MEDIUM
        elif any(large in size_lower for large in ['large', '201-1000']):
            return CompanySize.LARGE
        elif any(ent in size_lower for ent in ['enterprise', '1000+', 'corporation']):
            return CompanySize.ENTERPRISE
        else:
            return CompanySize.MEDIUM  # Default
    
    @staticmethod
    def categorize_goals(goals: List[str]) -> List[GoalCategory]:
        """Categorize sustainability goals into enums."""
        categorized = []
        
        for goal in goals:
            goal_lower = goal.lower()
            
            if any(energy in goal_lower for energy in ['energy', 'efficiency']):
                categorized.append(GoalCategory.ENERGY_EFFICIENCY)
            elif any(renewable in goal_lower for renewable in ['renewable', 'solar', 'wind']):
                categorized.append(GoalCategory.RENEWABLE_ENERGY)
            elif any(carbon in goal_lower for carbon in ['carbon', 'emissions', 'co2']):
                categorized.append(GoalCategory.CARBON_REDUCTION)
            elif any(waste in goal_lower for waste in ['waste', 'recycling']):
                categorized.append(GoalCategory.WASTE_REDUCTION)
            elif any(water in goal_lower for water in ['water', 'conservation']):
                categorized.append(GoalCategory.WATER_CONSERVATION)
            elif any(transport in goal_lower for transport in ['transport', 'fleet', 'commute']):
                categorized.append(GoalCategory.TRANSPORTATION)
            elif any(building in goal_lower for building in ['building', 'leed', 'green']):
                categorized.append(GoalCategory.GREEN_BUILDING)
            elif any(supply in goal_lower for supply in ['supply', 'vendor', 'procurement']):
                categorized.append(GoalCategory.SUPPLY_CHAIN)
        
        return list(set(categorized))  # Remove duplicates

class RulesBasedRecommendationEngine:
    """Comprehensive rules-based recommendation engine."""
    
    def __init__(self):
        self.rules = self._initialize_rules()
        self.regional_factors = self._initialize_regional_factors()
    
    def _initialize_rules(self) -> List[RecommendationRule]:
        """Initialize all recommendation rules."""
        rules = []
        
        # Energy Efficiency Rules
        rules.extend(self._create_energy_efficiency_rules())
        
        # Industry-Specific Rules
        rules.extend(self._create_industry_specific_rules())
        
        # Company Size Rules
        rules.extend(self._create_size_specific_rules())
        
        # Goal-Specific Rules
        rules.extend(self._create_goal_specific_rules())
        
        return rules
    
    def _create_energy_efficiency_rules(self) -> List[RecommendationRule]:
        """Create energy efficiency recommendation rules."""
        return [
            RecommendationRule(
                rule_id="led_retrofit_basic",
                title="LED Lighting Retrofit",
                description="Replace traditional incandescent and fluorescent lighting with energy-efficient LED bulbs throughout the facility.",
                category="Energy Efficiency",
                difficulty="Easy",
                min_kwh=800,
                cost_savings_factor=0.25,  # 25% reduction
                co2_reduction_factor=0.25,
                base_roi_months=18,
                base_priority=0.8
            ),
            RecommendationRule(
                rule_id="hvac_optimization",
                title="HVAC System Optimization",
                description="Implement smart thermostats, regular maintenance schedules, and system optimization to improve heating and cooling efficiency.",
                category="Energy Efficiency",
                difficulty="Medium",
                min_kwh=1500,
                cost_savings_factor=0.15,
                co2_reduction_factor=0.15,
                base_roi_months=24,
                base_priority=0.7
            ),
            RecommendationRule(
                rule_id="smart_power_management",
                title="Smart Power Management Systems",
                description="Install smart power strips and automated shutdown systems to eliminate phantom loads and reduce standby power consumption.",
                category="Energy Efficiency",
                difficulty="Easy",
                min_kwh=500,
                applicable_sizes=[CompanySize.MEDIUM, CompanySize.LARGE, CompanySize.ENTERPRISE],
                cost_savings_factor=0.08,
                co2_reduction_factor=0.08,
                base_roi_months=12,
                base_priority=0.6
            ),
            RecommendationRule(
                rule_id="energy_audit_comprehensive",
                title="Professional Energy Audit",
                description="Conduct a comprehensive energy audit to identify specific areas of energy waste and optimization opportunities.",
                category="Assessment",
                difficulty="Easy",
                cost_savings_factor=0.10,
                co2_reduction_factor=0.10,
                base_roi_months=6,
                base_priority=0.9
            ),
            RecommendationRule(
                rule_id="insulation_upgrade",
                title="Building Insulation Upgrade",
                description="Improve building insulation in walls, windows, and roofing to reduce heating and cooling energy requirements.",
                category="Energy Efficiency",
                difficulty="Hard",
                min_kwh=2000,
                min_therms=100,
                cost_savings_factor=0.20,
                co2_reduction_factor=0.18,
                base_roi_months=36,
                implementation_cost_factor=3.0,
                base_priority=0.5
            )
        ]
    
    def _create_industry_specific_rules(self) -> List[RecommendationRule]:
        """Create industry-specific recommendation rules."""
        return [
            # Technology Industry
            RecommendationRule(
                rule_id="server_efficiency_tech",
                title="Data Center and Server Efficiency",
                description="Optimize server utilization, implement virtualization, and upgrade to energy-efficient hardware.",
                category="Energy Efficiency",
                difficulty="Medium",
                applicable_industries=[IndustryType.TECHNOLOGY],
                min_kwh=2000,
                cost_savings_factor=0.30,
                co2_reduction_factor=0.30,
                base_roi_months=18,
                base_priority=0.8
            ),
            
            # Manufacturing
            RecommendationRule(
                rule_id="motor_efficiency_mfg",
                title="High-Efficiency Motor Upgrades",
                description="Replace standard motors with premium efficiency motors and implement variable frequency drives (VFDs).",
                category="Energy Efficiency",
                difficulty="Medium",
                applicable_industries=[IndustryType.MANUFACTURING],
                min_kwh=5000,
                cost_savings_factor=0.25,
                co2_reduction_factor=0.25,
                base_roi_months=30,
                base_priority=0.7
            ),
            
            # Retail
            RecommendationRule(
                rule_id="refrigeration_efficiency_retail",
                title="Refrigeration System Optimization",
                description="Upgrade to high-efficiency refrigeration systems and implement advanced controls for better energy management.",
                category="Energy Efficiency",
                difficulty="Hard",
                applicable_industries=[IndustryType.RETAIL],
                min_kwh=3000,
                cost_savings_factor=0.20,
                co2_reduction_factor=0.20,
                base_roi_months=36,
                base_priority=0.6
            ),
            
            # Healthcare
            RecommendationRule(
                rule_id="medical_equipment_efficiency",
                title="Medical Equipment Energy Management",
                description="Implement energy-efficient medical equipment scheduling and optimize HVAC for critical areas.",
                category="Energy Efficiency",
                difficulty="Medium",
                applicable_industries=[IndustryType.HEALTHCARE],
                min_kwh=4000,
                cost_savings_factor=0.12,
                co2_reduction_factor=0.12,
                base_roi_months=24,
                base_priority=0.7
            ),
            
            # Hospitality
            RecommendationRule(
                rule_id="guest_room_automation",
                title="Guest Room Energy Automation",
                description="Install occupancy-based energy management systems in guest rooms to optimize heating, cooling, and lighting.",
                category="Energy Efficiency",
                difficulty="Medium",
                applicable_industries=[IndustryType.HOSPITALITY],
                min_kwh=2500,
                cost_savings_factor=0.18,
                co2_reduction_factor=0.18,
                base_roi_months=20,
                base_priority=0.8
            )
        ]
    
    def _create_size_specific_rules(self) -> List[RecommendationRule]:
        """Create company size-specific recommendation rules."""
        return [
            RecommendationRule(
                rule_id="small_business_basics",
                title="Small Business Energy Basics",
                description="Implement simple energy-saving measures like programmable thermostats, LED lighting, and Energy Star appliances.",
                category="Energy Efficiency",
                difficulty="Easy",
                applicable_sizes=[CompanySize.SMALL],
                cost_savings_factor=0.15,
                co2_reduction_factor=0.15,
                base_roi_months=12,
                base_priority=0.8
            ),
            RecommendationRule(
                rule_id="enterprise_energy_management",
                title="Enterprise Energy Management System",
                description="Implement comprehensive energy management software with real-time monitoring and automated optimization.",
                category="Energy Efficiency",
                difficulty="Hard",
                applicable_sizes=[CompanySize.ENTERPRISE],
                min_kwh=10000,
                cost_savings_factor=0.20,
                co2_reduction_factor=0.20,
                base_roi_months=24,
                implementation_cost_factor=2.0,
                base_priority=0.7
            )
        ]
    
    def _create_goal_specific_rules(self) -> List[RecommendationRule]:
        """Create sustainability goal-specific recommendation rules."""
        return [
            RecommendationRule(
                rule_id="solar_installation",
                title="Solar Panel Installation",
                description="Install rooftop or ground-mounted solar panels to generate clean renewable energy and reduce grid dependence.",
                category="Renewable Energy",
                difficulty="Hard",
                required_goals=[GoalCategory.RENEWABLE_ENERGY],
                min_kwh=2000,
                cost_savings_factor=0.30,
                co2_reduction_factor=0.40,
                base_roi_months=60,
                implementation_cost_factor=4.0,
                base_priority=0.9
            ),
            RecommendationRule(
                rule_id="waste_reduction_program",
                title="Comprehensive Waste Reduction Program",
                description="Implement recycling programs, composting, and waste stream analysis to minimize landfill waste.",
                category="Waste Reduction",
                difficulty="Medium",
                required_goals=[GoalCategory.WASTE_REDUCTION],
                cost_savings_factor=0.05,
                co2_reduction_factor=0.08,
                base_roi_months=18,
                base_priority=0.6
            ),
            RecommendationRule(
                rule_id="water_conservation_systems",
                title="Water Conservation Systems",
                description="Install low-flow fixtures, rainwater harvesting, and greywater recycling systems to reduce water consumption.",
                category="Water Conservation",
                difficulty="Medium",
                required_goals=[GoalCategory.WATER_CONSERVATION],
                cost_savings_factor=0.03,
                co2_reduction_factor=0.02,
                base_roi_months=30,
                base_priority=0.5
            ),
            RecommendationRule(
                rule_id="green_transportation",
                title="Green Transportation Initiative",
                description="Implement electric vehicle fleet, employee incentives for public transit, and bike-sharing programs.",
                category="Transportation",
                difficulty="Hard",
                required_goals=[GoalCategory.TRANSPORTATION],
                applicable_sizes=[CompanySize.MEDIUM, CompanySize.LARGE, CompanySize.ENTERPRISE],
                cost_savings_factor=0.10,
                co2_reduction_factor=0.15,
                base_roi_months=48,
                implementation_cost_factor=2.5,
                base_priority=0.6
            )
        ]
    
    def _initialize_regional_factors(self) -> Dict[str, Dict[str, float]]:
        """Initialize regional adjustment factors."""
        return {
            "electricity_rate": {
                "california": 0.20, "new york": 0.18, "massachusetts": 0.22,
                "texas": 0.12, "florida": 0.11, "illinois": 0.13,
                "default": 0.12
            },
            "solar_potential": {
                "arizona": 1.4, "california": 1.3, "nevada": 1.3, "texas": 1.2,
                "florida": 1.1, "north carolina": 1.0, "new york": 0.8,
                "washington": 0.7, "default": 1.0
            },
            "heating_factor": {
                "alaska": 2.0, "minnesota": 1.8, "wisconsin": 1.6, "michigan": 1.5,
                "new york": 1.3, "illinois": 1.3, "california": 0.6, "florida": 0.3,
                "texas": 0.7, "default": 1.0
            }
        }
    
    def generate_recommendations(self, business_data: Any) -> List[Dict[str, Any]]:
        """Generate recommendations based on business data and rules."""
        # Analyze business data
        industry = BusinessDataAnalyzer.categorize_industry(business_data.industry)
        company_size = BusinessDataAnalyzer.categorize_company_size(business_data.size)
        goals = BusinessDataAnalyzer.categorize_goals(business_data.sustainability_goals)
        
        applicable_rules = []
        
        # Filter rules based on business data
        for rule in self.rules:
            if self._is_rule_applicable(rule, business_data, industry, company_size, goals):
                applicable_rules.append(rule)
        
        # Generate recommendations from applicable rules
        recommendations = []
        for rule in applicable_rules:
            rec = self._create_recommendation_from_rule(rule, business_data)
            recommendations.append(rec)
        
        # Sort by priority score and return top recommendations
        recommendations.sort(key=lambda x: x["priority_score"], reverse=True)
        return recommendations[:8]  # Return top 8 recommendations
    
    def _is_rule_applicable(self, rule: RecommendationRule, business_data: Any, 
                          industry: IndustryType, company_size: CompanySize, 
                          goals: List[GoalCategory]) -> bool:
        """Check if a rule is applicable to the given business data."""
        
        # Check energy usage thresholds
        if rule.min_kwh and business_data.monthly_kwh < rule.min_kwh:
            return False
        if rule.max_kwh and business_data.monthly_kwh > rule.max_kwh:
            return False
        if rule.min_therms and business_data.monthly_therms < rule.min_therms:
            return False
        if rule.max_therms and business_data.monthly_therms > rule.max_therms:
            return False
        
        # Check industry applicability
        if rule.applicable_industries and industry not in rule.applicable_industries:
            return False
        
        # Check company size applicability
        if rule.applicable_sizes and company_size not in rule.applicable_sizes:
            return False
        
        # Check required goals
        if rule.required_goals and not any(goal in goals for goal in rule.required_goals):
            return False
        
        return True
    
    def _create_recommendation_from_rule(self, rule: RecommendationRule, business_data: Any) -> Dict[str, Any]:
        """Create a recommendation from a rule and business data."""
        
        # Calculate annual savings
        electricity_rate = self._get_regional_factor("electricity_rate", business_data.location)
        annual_electricity_cost = business_data.monthly_kwh * 12 * electricity_rate
        annual_gas_cost = business_data.monthly_therms * 12 * 1.20  # Avg $1.20/therm
        
        estimated_savings = (annual_electricity_cost + annual_gas_cost) * rule.cost_savings_factor
        
        # Calculate CO2 reduction
        annual_co2_lbs = (business_data.monthly_kwh * 0.92 + business_data.monthly_therms * 11.7) * 12
        estimated_co2_reduction = annual_co2_lbs * rule.co2_reduction_factor
        
        # Calculate ROI
        implementation_cost = estimated_savings * rule.implementation_cost_factor
        roi_months = rule.base_roi_months
        if estimated_savings > 0:
            roi_months = max(6, int((implementation_cost / estimated_savings) * 12))
        
        # Calculate priority score
        priority_score = self._calculate_priority_score(rule, business_data, estimated_savings, roi_months)
        
        return {
            "id": rule.rule_id,
            "title": rule.title,
            "description": rule.description,
            "category": rule.category,
            "estimated_cost_savings": round(estimated_savings, 2),
            "estimated_co2_reduction": round(estimated_co2_reduction, 2),
            "roi_months": roi_months,
            "difficulty": rule.difficulty,
            "priority_score": round(priority_score, 2)
        }
    
    def _get_regional_factor(self, factor_type: str, location: str) -> float:
        """Get regional adjustment factor."""
        location_lower = location.lower()
        factors = self.regional_factors.get(factor_type, {})
        
        for region, factor in factors.items():
            if region != "default" and region in location_lower:
                return factor
        
        return factors.get("default", 1.0)
    
    def _calculate_priority_score(self, rule: RecommendationRule, business_data: Any, 
                                estimated_savings: float, roi_months: int) -> float:
        """Calculate priority score for a recommendation."""
        
        # Start with base priority
        priority = rule.base_priority
        
        # ROI bonus (shorter ROI = higher priority)
        if roi_months <= 12:
            priority += 0.2
        elif roi_months <= 24:
            priority += 0.1
        elif roi_months > 48:
            priority -= 0.1
        
        # Savings bonus (higher savings = higher priority)
        if estimated_savings > 10000:
            priority += 0.15
        elif estimated_savings > 5000:
            priority += 0.1
        elif estimated_savings > 2000:
            priority += 0.05
        
        # High energy usage bonus
        if business_data.monthly_kwh > 5000:
            priority += 0.1
        
        # Ensure priority stays within reasonable bounds
        return max(0.1, min(1.0, priority))

# Create global instance
rules_engine = RulesBasedRecommendationEngine() 