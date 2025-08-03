"""
Advanced Prompt Engineering System for Sustainability Recommendations (Python)

Features:
- Industry-specific prompt templates
- Few-shot learning examples  
- Chain-of-thought reasoning
- Context-aware prompt selection
- Prompt versioning and A/B testing
- ROI-focused optimization
"""

from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json

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

@dataclass
class RecommendationRequest:
    business_name: str
    industry: str
    company_size: str
    location: str
    monthly_kwh: float
    monthly_therms: float
    sustainability_goals: List[str]
    current_challenges: Optional[List[str]] = None
    previous_recommendations: Optional[List[str]] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None

@dataclass
class FewShotExample:
    input_data: Dict[str, Any]
    output: str

@dataclass
class PromptTemplate:
    id: str
    name: str
    version: str
    industries: List[str]
    system_prompt: str
    user_prompt_template: str
    examples: List[FewShotExample]
    temperature: float
    max_tokens: int

@dataclass
class PromptMetrics:
    prompt_id: str
    response_quality: float
    implementation_feasibility: float
    roi_accuracy: float
    user_satisfaction: float
    execution_time: float

class PromptEngineeringService:
    """Advanced prompt engineering service for sustainability recommendations."""
    
    def __init__(self):
        self.templates: Dict[str, PromptTemplate] = {}
        self.metrics: Dict[str, List[PromptMetrics]] = {}
        self._initialize_templates()
    
    def _initialize_templates(self):
        """Initialize all prompt templates."""
        # Core sustainability template
        self.templates['sustainability_core_v2'] = self._create_core_sustainability_template()
        
        # Industry-specific templates
        self.templates['technology_focused_v1'] = self._create_technology_template()
        self.templates['manufacturing_focused_v1'] = self._create_manufacturing_template()
        self.templates['retail_focused_v1'] = self._create_retail_template()
        self.templates['healthcare_focused_v1'] = self._create_healthcare_template()
        
        # Size-specific templates
        self.templates['small_business_v1'] = self._create_small_business_template()
        self.templates['enterprise_v1'] = self._create_enterprise_template()
        
        # Goal-specific templates
        self.templates['carbon_neutral_v1'] = self._create_carbon_neutral_template()
        self.templates['cost_optimization_v1'] = self._create_cost_optimization_template()
    
    def _create_core_sustainability_template(self) -> PromptTemplate:
        """Create the core sustainability consultant template."""
        system_prompt = """You are Dr. Sarah Chen, a leading sustainability consultant with 15 years of experience helping businesses achieve measurable environmental and financial improvements. You specialize in:

• Energy efficiency optimization with proven ROI models
• Renewable energy transition strategies
• Carbon footprint reduction methodologies
• Regulatory compliance and incentive optimization
• Industry-specific best practices implementation

Your approach is data-driven, pragmatic, and focused on delivering recommendations that businesses can actually implement with clear financial benefits. You always provide specific, actionable steps with realistic timelines and cost estimates.

Key principles:
- Prioritize recommendations with payback periods under 3 years
- Consider company size and financial constraints
- Leverage available tax incentives and rebates
- Focus on measurable outcomes and tracking methods
- Address the specific industry context and regulations"""

        user_prompt_template = """I need your expert analysis for a sustainability strategy. Please think through this step-by-step using your proven methodology.

## Company Profile Analysis
**Business:** {business_name}
**Industry:** {industry} 
**Size:** {company_size}
**Location:** {location}
**Energy Profile:** {monthly_kwh} kWh/month electricity, {monthly_therms} therms/month natural gas
**Sustainability Objectives:** {sustainability_goals}
{current_challenges}
{previous_recommendations}
{budget}
{timeline}

## Your Analysis Framework:
1. **Energy Baseline Assessment**: Calculate current energy costs and carbon footprint
2. **Industry Benchmarking**: Compare against {industry} best practices
3. **Opportunity Identification**: Identify the highest-impact, lowest-risk improvements
4. **Financial Modeling**: Calculate ROI including all available incentives
5. **Implementation Roadmap**: Prioritize by quick wins vs. long-term investments

## Deliverable Requirements:
Provide 4-6 prioritized recommendations in valid JSON format. For each recommendation, include:

**Financial Analysis:**
- Precise annual cost savings (consider local energy rates for {location})
- Implementation costs including labor and materials
- Payback period in months with sensitivity analysis
- Available tax credits, rebates, and utility incentives
- Net present value over 10 years

**Environmental Impact:**
- Annual CO2 reduction in tons (not lbs)
- Other environmental benefits (water savings, waste reduction, etc.)
- Contribution to stated sustainability goals

**Implementation Details:**
- 5-7 specific implementation steps with timelines
- Required permits, certifications, or compliance considerations
- Recommended vendors or technology partners in {location} area
- Potential obstacles and mitigation strategies
- Success metrics and tracking methods

**Risk Assessment:**
- Technology maturity and reliability
- Maintenance requirements and ongoing costs
- Market volatility factors (energy prices, incentive changes)

Focus on recommendations that align with {industry} best practices for {company_size} companies and can realistically be implemented within typical corporate approval processes."""

        examples = [
            FewShotExample(
                input_data={
                    "business_name": "GreenTech Manufacturing",
                    "industry": "Manufacturing",
                    "company_size": "201-1000 employees",
                    "location": "Austin, Texas",
                    "monthly_kwh": 15000,
                    "monthly_therms": 450,
                    "sustainability_goals": ["Reduce energy costs by 30%", "Achieve carbon neutral operations by 2030"]
                },
                output="""{"recommendations": [{"title": "Variable Frequency Drive Installation for Motor Systems", "description": "Install VFDs on major motor systems to optimize energy consumption based on actual demand rather than running at constant speeds.", "category": "Energy Efficiency", "estimated_cost_savings": 42000, "estimated_co2_reduction": 78.5, "roi_months": 16, "difficulty": "Medium", "priority_score": 0.95, "implementation_steps": ["Conduct motor audit to identify VFD candidates", "Select appropriate VFD technology for each application", "Schedule installation during planned maintenance windows", "Commission systems and train maintenance staff", "Implement monitoring and optimization protocols"], "reasoning": "High energy usage indicates significant motor load. VFDs typically save 20-30% on motor energy costs with proven ROI in manufacturing."}]}"""
            )
        ]
        
        return PromptTemplate(
            id='sustainability_core_v2',
            name='Core Sustainability Consultant v2.0',
            version='2.0.0',
            industries=['*'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=examples,
            temperature=0.3,
            max_tokens=3000
        )
    
    def _create_technology_template(self) -> PromptTemplate:
        """Create technology industry specific template."""
        system_prompt = """You are a sustainability consultant specializing in technology companies. You understand the unique energy challenges of data centers, server farms, office environments, and cloud infrastructure.

Key Technology Industry Focus Areas:
• Data center efficiency and cooling optimization
• Server virtualization and cloud migration benefits
• Power Usage Effectiveness (PUE) improvements
• Employee remote work sustainability impact
• E-waste management and circular economy principles
• Green software development practices

You're expert in technology sustainability frameworks like the Green Software Foundation guidelines, ENERGY STAR for data centers, and carbon accounting for cloud services."""

        user_prompt_template = """Analyze this technology company's sustainability opportunities:

{business_name} - {industry} company, {company_size}
Location: {location}
Current Usage: {monthly_kwh} kWh/month, {monthly_therms} therms/month
Goals: {sustainability_goals}

**Technology-Specific Analysis:**
1. **IT Infrastructure Efficiency**: Assess server utilization, cooling systems, and power management
2. **Cloud Migration Opportunities**: Evaluate potential for improved efficiency through cloud services
3. **Digital Workplace Optimization**: Remote work policies, digital document management
4. **Green Software Practices**: Code efficiency, algorithm optimization for lower energy consumption
5. **E-Waste and Circular IT**: Hardware lifecycle management and sustainable procurement

Provide recommendations specific to technology companies, including:
- Server efficiency improvements and virtualization
- Data center cooling optimization
- Cloud migration carbon benefits
- Green software development practices
- Sustainable IT procurement policies
- Employee digital sustainability programs

Include technology industry benchmarks and consider typical IT budgets and approval processes."""

        return PromptTemplate(
            id='technology_focused_v1',
            name='Technology Industry Specialist',
            version='1.0.0',
            industries=['Technology', 'Software', 'IT Services'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.2,
            max_tokens=2500
        )
    
    def _create_manufacturing_template(self) -> PromptTemplate:
        """Create manufacturing industry specific template."""
        system_prompt = """You are a sustainability consultant specializing in manufacturing operations. You understand industrial energy systems, process optimization, and manufacturing-specific efficiency opportunities.

Manufacturing Expertise:
• Motor efficiency and variable frequency drives (VFDs)
• Compressed air system optimization
• Industrial heating and cooling systems
• Production process energy analysis
• Waste heat recovery systems
• Lean manufacturing and energy waste elimination

You understand manufacturing budgets, maintenance schedules, and the critical importance of avoiding production downtime during improvements."""

        user_prompt_template = """Analyze manufacturing sustainability opportunities for:

{business_name} - {industry}, {company_size}
Location: {location}  
Energy: {monthly_kwh} kWh/month, {monthly_therms} therms/month
Goals: {sustainability_goals}

**Manufacturing-Specific Analysis:**
1. **Motor Systems**: Assess motor efficiency and VFD opportunities
2. **Compressed Air Systems**: Identify leaks and optimization potential
3. **Process Heating**: Evaluate boiler efficiency and waste heat recovery
4. **Production Line Efficiency**: Energy-intensive processes and optimization
5. **Facility Systems**: HVAC, lighting optimized for manufacturing environment

Focus on solutions that:
- Can be implemented during scheduled maintenance windows
- Don't disrupt critical production processes
- Leverage available utility rebates for industrial customers
- Consider 24/7 operation schedules
- Account for industrial safety requirements"""

        return PromptTemplate(
            id='manufacturing_focused_v1',
            name='Manufacturing Industry Specialist',
            version='1.0.0',
            industries=['Manufacturing', 'Industrial', 'Production'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.3,
            max_tokens=2800
        )
    
    def _create_retail_template(self) -> PromptTemplate:
        """Create retail industry specific template."""
        system_prompt = """You are a sustainability consultant specializing in retail operations. You understand the unique energy challenges of retail spaces including lighting, refrigeration, HVAC for customer comfort, and point-of-sale systems.

Retail Industry Focus:
• Store lighting optimization for both efficiency and customer experience
• Refrigeration system efficiency (critical for food retail)
• HVAC balance between energy efficiency and customer comfort
• Energy management across multiple store locations
• Sustainable packaging and waste reduction strategies
• Customer-facing sustainability initiatives that drive brand value"""

        user_prompt_template = """Retail sustainability analysis for:

{business_name} - {industry}, {company_size}
Location: {location}
Energy: {monthly_kwh} kWh/month, {monthly_therms} therms/month  
Goals: {sustainability_goals}

**Retail-Specific Considerations:**
1. **Customer Experience Impact**: Ensure energy efficiency doesn't compromise shopping experience
2. **Store Operations**: Extended hours, customer comfort requirements
3. **Refrigeration Systems**: Critical for food retail, high energy usage
4. **Lighting Design**: Balance efficiency with product visibility and ambiance
5. **Multi-Location Strategies**: Scalable solutions across store portfolio

Prioritize recommendations that:
- Maintain or enhance customer experience
- Can be rolled out across multiple locations
- Include customer-visible sustainability features for brand value
- Work within retail operational constraints
- Consider seasonal energy variations"""

        return PromptTemplate(
            id='retail_focused_v1',
            name='Retail Industry Specialist',
            version='1.0.0',
            industries=['Retail', 'Store', 'Shopping'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.3,
            max_tokens=2600
        )
    
    def _create_healthcare_template(self) -> PromptTemplate:
        """Create healthcare industry specific template."""
        system_prompt = """You are a sustainability consultant specializing in healthcare facilities. You understand the critical nature of healthcare operations and the strict requirements for patient care, medical equipment reliability, and regulatory compliance.

Healthcare Expertise:
• Medical equipment energy optimization without compromising patient care
• HVAC systems for infection control and patient comfort
• Emergency backup power and sustainability integration
• Healthcare-specific regulatory requirements (Joint Commission, etc.)
• Specialized lighting requirements for medical procedures
• Pharmaceutical and medical waste management"""

        user_prompt_template = """Healthcare sustainability analysis for:

{business_name} - {industry}, {company_size}
Energy: {monthly_kwh} kWh/month, {monthly_therms} therms/month
Location: {location}
Goals: {sustainability_goals}

**Healthcare-Specific Requirements:**
1. **Patient Care Priority**: No recommendations that could impact patient safety or care quality
2. **Regulatory Compliance**: All solutions must meet healthcare regulations
3. **Emergency Preparedness**: Backup power and critical system reliability
4. **Infection Control**: HVAC and air quality considerations
5. **Medical Equipment**: Specialized energy requirements and reliability needs

Focus on solutions that:
- Maintain all patient care and safety standards
- Meet Joint Commission and regulatory requirements  
- Consider 24/7 critical operations
- Include backup power integration
- Address medical waste and pharmaceutical disposal
- Can be implemented with minimal operational disruption"""

        return PromptTemplate(
            id='healthcare_focused_v1',
            name='Healthcare Industry Specialist',
            version='1.0.0',
            industries=['Healthcare', 'Medical', 'Hospital'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.25,
            max_tokens=2700
        )
    
    def _create_small_business_template(self) -> PromptTemplate:
        """Create small business specific template."""
        system_prompt = """You are a sustainability consultant who specializes in small businesses. You understand limited budgets, simple approval processes, and the need for quick, high-impact solutions that small business owners can implement without extensive technical expertise.

Small Business Focus:
• Low-cost, high-impact solutions with fast payback
• Simple implementation that doesn't require specialized staff
• Leveraging small business energy rebates and incentives
• Solutions that improve both costs and operations
• Minimal maintenance requirements
• Clear, immediate ROI demonstration"""

        user_prompt_template = """Small business sustainability plan for:

{business_name} - {company_size}, {industry}
Monthly Energy: {monthly_kwh} kWh, {monthly_therms} therms
Location: {location}
Goals: {sustainability_goals}

**Small Business Constraints:**
- Limited capital budget (prioritize <$10K investments)
- Simple approval process (owner/manager decision)
- Minimal technical expertise available
- Need quick wins and visible results
- Focus on immediate cost savings

Recommend 3-4 solutions that:
- Have payback under 18 months
- Can be implemented by local contractors
- Require minimal ongoing maintenance
- Include available small business rebates/incentives
- Provide immediate cost visibility
- Don't disrupt daily operations"""

        return PromptTemplate(
            id='small_business_v1',
            name='Small Business Specialist',
            version='1.0.0',
            industries=['*'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.4,
            max_tokens=2000
        )
    
    def _create_enterprise_template(self) -> PromptTemplate:
        """Create enterprise specific template."""
        system_prompt = """You are a sustainability consultant specializing in large enterprise organizations. You understand complex approval processes, corporate sustainability reporting requirements, and large-scale implementation across multiple facilities.

Enterprise Focus:
• Large-scale efficiency projects with significant capital investment
• Corporate sustainability reporting and ESG compliance
• Multi-facility rollout strategies and standardization
• Integration with existing enterprise energy management systems
• Regulatory compliance and sustainability certification (LEED, ISO 14001)
• Stakeholder communication and change management"""

        user_prompt_template = """Enterprise sustainability strategy for:

{business_name} - {company_size}, {industry}
Energy Portfolio: {monthly_kwh} kWh/month, {monthly_therms} therms/month
Location: {location}
Corporate Goals: {sustainability_goals}

**Enterprise Considerations:**
- Complex approval processes and budget cycles
- Multiple stakeholder alignment required
- Corporate sustainability reporting requirements
- Multi-facility implementation potential
- Integration with existing systems and processes
- Long-term strategic impact and competitive advantage

Provide comprehensive recommendations that:
- Support corporate ESG and sustainability reporting
- Can scale across enterprise operations
- Include implementation roadmap with phases
- Address change management and training needs
- Consider integration with enterprise systems
- Include competitive benchmarking and industry leadership opportunities"""

        return PromptTemplate(
            id='enterprise_v1',
            name='Enterprise Specialist',
            version='1.0.0',
            industries=['*'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.2,
            max_tokens=3500
        )
    
    def _create_carbon_neutral_template(self) -> PromptTemplate:
        """Create carbon neutral focused template."""
        system_prompt = """You are a carbon neutral strategy specialist. You focus specifically on pathways to achieve net-zero carbon emissions through a combination of efficiency improvements, renewable energy adoption, and strategic carbon offsets.

Carbon Neutral Expertise:
• Science-based targets (SBTi) methodology
• Scope 1, 2, and 3 emissions calculation and reduction
• Renewable energy procurement strategies (PPAs, RECs, on-site generation)
• Carbon offset evaluation and verification
• Net-zero roadmap development with interim milestones"""

        user_prompt_template = """Carbon neutral roadmap for:

{business_name} - {industry}, {company_size}
Current Emissions Profile: {monthly_kwh} kWh/month, {monthly_therms} therms/month
Location: {location}
Target: {sustainability_goals}

**Carbon Neutral Pathway Analysis:**
1. **Current Carbon Footprint**: Calculate baseline Scope 1 & 2 emissions
2. **Reduction Hierarchy**: Efficiency first, then renewable energy, then offsets
3. **Renewable Energy Strategy**: On-site generation, PPAs, or renewable energy credits
4. **Offset Strategy**: High-quality, verified offset projects for remaining emissions
5. **Milestone Planning**: Interim targets aligned with science-based methodologies

Provide a phased carbon neutral roadmap prioritizing:
- Maximum emissions reduction through efficiency
- Cost-effective renewable energy procurement  
- High-quality carbon offset strategies
- Interim milestones (e.g., 30% by 2030, 100% by 2035)
- Verification and reporting frameworks"""

        return PromptTemplate(
            id='carbon_neutral_v1',
            name='Carbon Neutral Strategy Specialist',
            version='1.0.0',
            industries=['*'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.25,
            max_tokens=3000
        )
    
    def _create_cost_optimization_template(self) -> PromptTemplate:
        """Create cost optimization focused template."""
        system_prompt = """You are a cost optimization specialist who focuses on sustainability solutions that deliver maximum financial returns. Every recommendation must have clear, immediate cost benefits with detailed financial analysis.

Cost Optimization Focus:
• Energy cost reduction with fastest payback periods
• Utility rate optimization and demand management
• Tax incentive and rebate maximization
• Operational cost reduction through efficiency
• Maintenance cost reduction through equipment upgrades"""

        user_prompt_template = """Cost optimization analysis for:

{business_name} - {industry}, {company_size}
Energy Costs: {monthly_kwh} kWh/month, {monthly_therms} therms/month
Location: {location}
Primary Goal: Reduce operational costs through sustainability

**Financial Optimization Framework:**
1. **Energy Bill Analysis**: Identify highest-cost components (demand charges, peak usage)
2. **Quick Wins**: Solutions with <12 month payback
3. **Incentive Optimization**: Maximize available rebates, tax credits
4. **Operational Savings**: Reduced maintenance, improved productivity
5. **Total Cost of Ownership**: Long-term financial impact

Prioritize recommendations by:
- Shortest payback period first
- Highest net present value over 10 years
- Lowest implementation risk
- Maximum total dollar savings annually
- Available financing options (0% loans, leasing)

Include detailed financial analysis with sensitivity scenarios for energy price changes."""

        return PromptTemplate(
            id='cost_optimization_v1',
            name='Cost Optimization Specialist',
            version='1.0.0',
            industries=['*'],
            system_prompt=system_prompt,
            user_prompt_template=user_prompt_template,
            examples=[],
            temperature=0.2,
            max_tokens=2500
        )
    
    def select_optimal_prompt(self, request: RecommendationRequest) -> PromptTemplate:
        """Select the optimal prompt template based on request characteristics."""
        # Industry-specific template selection
        industry_templates = self._get_industry_templates(request.industry)
        
        # Company size considerations
        size_template = self._get_size_template(request.company_size)
        
        # Goal-specific templates
        goal_template = self._get_goal_template(request.sustainability_goals)
        
        # Priority: Goal-specific > Industry-specific > Size-specific > Core
        if goal_template:
            return goal_template
        if industry_templates:
            return industry_templates[0]
        if size_template:
            return size_template
            
        return self.templates['sustainability_core_v2']
    
    def _get_industry_templates(self, industry: str) -> List[PromptTemplate]:
        """Get industry-specific templates."""
        industry_lower = industry.lower()
        templates = []
        
        if any(tech in industry_lower for tech in ['tech', 'software']):
            if 'technology_focused_v1' in self.templates:
                templates.append(self.templates['technology_focused_v1'])
        
        if any(mfg in industry_lower for mfg in ['manufacturing', 'industrial']):
            if 'manufacturing_focused_v1' in self.templates:
                templates.append(self.templates['manufacturing_focused_v1'])
        
        if any(retail in industry_lower for retail in ['retail', 'store']):
            if 'retail_focused_v1' in self.templates:
                templates.append(self.templates['retail_focused_v1'])
        
        if any(health in industry_lower for health in ['health', 'medical']):
            if 'healthcare_focused_v1' in self.templates:
                templates.append(self.templates['healthcare_focused_v1'])
        
        return templates
    
    def _get_size_template(self, company_size: str) -> Optional[PromptTemplate]:
        """Get size-specific template."""
        size_lower = company_size.lower()
        
        if any(small in size_lower for small in ['1-50', 'small']):
            return self.templates.get('small_business_v1')
        
        if any(large in size_lower for large in ['1000+', 'enterprise']):
            return self.templates.get('enterprise_v1')
        
        return None
    
    def _get_goal_template(self, goals: List[str]) -> Optional[PromptTemplate]:
        """Get goal-specific template."""
        goals_text = ' '.join(goals).lower()
        
        if any(carbon in goals_text for carbon in ['carbon neutral', 'net zero']):
            return self.templates.get('carbon_neutral_v1')
        
        if any(cost in goals_text for cost in ['cost', 'savings', 'budget']):
            return self.templates.get('cost_optimization_v1')
        
        return None
    
    def generate_prompt(self, request: RecommendationRequest) -> Tuple[str, str, PromptTemplate]:
        """Generate optimized prompt based on request characteristics."""
        template = self.select_optimal_prompt(request)
        
        # Prepare dynamic content
        current_challenges = ""
        if request.current_challenges:
            current_challenges = f"**Current Challenges:** {', '.join(request.current_challenges)}"
        
        previous_recommendations = ""
        if request.previous_recommendations:
            previous_recommendations = f"**Previous Initiatives:** {', '.join(request.previous_recommendations)}"
        
        budget = ""
        if request.budget:
            budget = f"**Budget Considerations:** {request.budget}"
        
        timeline = ""
        if request.timeline:
            timeline = f"**Implementation Timeline:** {request.timeline}"
        
        # Replace template variables
        user_prompt = template.user_prompt_template.format(
            business_name=request.business_name,
            industry=request.industry,
            company_size=request.company_size,
            location=request.location,
            monthly_kwh=request.monthly_kwh,
            monthly_therms=request.monthly_therms,
            sustainability_goals=', '.join(request.sustainability_goals),
            current_challenges=current_challenges,
            previous_recommendations=previous_recommendations,
            budget=budget,
            timeline=timeline
        )
        
        return template.system_prompt, user_prompt, template
    
    def record_metrics(self, prompt_id: str, metrics: PromptMetrics) -> None:
        """Record prompt performance metrics."""
        if prompt_id not in self.metrics:
            self.metrics[prompt_id] = []
        self.metrics[prompt_id].append(metrics)
    
    def get_template_performance(self, template_id: str) -> Dict[str, float]:
        """Get performance metrics for a template."""
        template_metrics = self.metrics.get(template_id, [])
        
        if not template_metrics:
            return {"avg_quality": 0, "avg_satisfaction": 0, "usage_count": 0}
        
        avg_quality = sum(m.response_quality for m in template_metrics) / len(template_metrics)
        avg_satisfaction = sum(m.user_satisfaction for m in template_metrics) / len(template_metrics)
        
        return {
            "avg_quality": round(avg_quality, 2),
            "avg_satisfaction": round(avg_satisfaction, 2),
            "usage_count": len(template_metrics)
        }
    
    def list_available_templates(self) -> List[Dict[str, Any]]:
        """List all available prompt templates."""
        return [
            {
                "id": template.id,
                "name": template.name,
                "version": template.version,
                "industries": template.industries
            }
            for template in self.templates.values()
        ]

# Create singleton instance
prompt_engineering_service = PromptEngineeringService() 