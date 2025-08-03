"use strict";
/**
 * Advanced Prompt Engineering System for Sustainability Recommendations
 *
 * Features:
 * - Industry-specific prompt templates
 * - Few-shot learning examples
 * - Chain-of-thought reasoning
 * - Context-aware prompt selection
 * - Prompt versioning and A/B testing
 * - ROI-focused optimization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptEngineering = exports.PromptEngineeringService = void 0;
class PromptEngineeringService {
    constructor() {
        this.templates = new Map();
        this.metrics = new Map();
        this.initializeTemplates();
    }
    initializeTemplates() {
        // Core sustainability template
        this.templates.set('sustainability_core_v2', this.createCoreSustainabilityTemplate());
        // Industry-specific templates
        this.templates.set('technology_focused_v1', this.createTechnologyTemplate());
        this.templates.set('manufacturing_focused_v1', this.createManufacturingTemplate());
        this.templates.set('retail_focused_v1', this.createRetailTemplate());
        this.templates.set('healthcare_focused_v1', this.createHealthcareTemplate());
        // Size-specific templates
        this.templates.set('small_business_v1', this.createSmallBusinessTemplate());
        this.templates.set('enterprise_v1', this.createEnterpriseTemplate());
        // Goal-specific templates
        this.templates.set('carbon_neutral_v1', this.createCarbonNeutralTemplate());
        this.templates.set('cost_optimization_v1', this.createCostOptimizationTemplate());
    }
    createCoreSustainabilityTemplate() {
        return {
            id: 'sustainability_core_v2',
            name: 'Core Sustainability Consultant v2.0',
            version: '2.0.0',
            industries: ['*'],
            systemPrompt: `You are Dr. Sarah Chen, a leading sustainability consultant with 15 years of experience helping businesses achieve measurable environmental and financial improvements. You specialize in:

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
- Address the specific industry context and regulations`,
            userPromptTemplate: `I need your expert analysis for a sustainability strategy. Please think through this step-by-step using your proven methodology.

## Company Profile Analysis
**Business:** {businessName}
**Industry:** {industry} 
**Size:** {companySize}
**Location:** {location}
**Energy Profile:** {monthlyKwh} kWh/month electricity, {monthlyTherms} therms/month natural gas
**Sustainability Objectives:** {sustainabilityGoals}
{currentChallenges}
{previousRecommendations}
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

Focus on recommendations that align with {industry} best practices for {companySize} companies and can realistically be implemented within typical corporate approval processes.`,
            examples: this.createCoreSustainabilityExamples(),
            temperature: 0.3,
            maxTokens: 3000
        };
    }
    createTechnologyTemplate() {
        return {
            id: 'technology_focused_v1',
            name: 'Technology Industry Specialist',
            version: '1.0.0',
            industries: ['Technology', 'Software', 'IT Services'],
            systemPrompt: `You are a sustainability consultant specializing in technology companies. You understand the unique energy challenges of data centers, server farms, office environments, and cloud infrastructure.

Key Technology Industry Focus Areas:
• Data center efficiency and cooling optimization
• Server virtualization and cloud migration benefits
• Power Usage Effectiveness (PUE) improvements
• Employee remote work sustainability impact
• E-waste management and circular economy principles
• Green software development practices

You're expert in technology sustainability frameworks like the Green Software Foundation guidelines, ENERGY STAR for data centers, and carbon accounting for cloud services.`,
            userPromptTemplate: `Analyze this technology company's sustainability opportunities:

{businessName} - {industry} company, {companySize}
Location: {location}
Current Usage: {monthlyKwh} kWh/month, {monthlyTherms} therms/month
Goals: {sustainabilityGoals}

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

Include technology industry benchmarks and consider typical IT budgets and approval processes.`,
            examples: [
                {
                    input: {
                        businessName: "TechFlow Solutions",
                        industry: "Technology",
                        companySize: "51-200 employees",
                        monthlyKwh: 8500,
                        sustainabilityGoals: ["Reduce data center energy costs", "Achieve carbon neutral operations"]
                    },
                    output: `{
  "recommendations": [
    {
      "title": "Data Center Cooling Optimization with AI",
      "description": "Implement AI-driven cooling management system to optimize temperature control and reduce energy consumption by 25-30% in server environments.",
      "category": "Energy Efficiency",
      "estimated_cost_savings": 28400,
      "estimated_co2_reduction": 45.2,
      "roi_months": 14,
      "difficulty": "Medium",
      "priority_score": 0.92,
      "implementation_steps": [
        "Conduct thermal audit of current data center",
        "Install IoT temperature sensors throughout facility",
        "Deploy AI cooling management software",
        "Configure automated HVAC controls",
        "Train IT staff on new monitoring systems"
      ],
      "reasoning": "High energy usage suggests significant cooling costs. AI optimization typical ROI 12-18 months for tech companies."
    }
  ]
}`
                }
            ],
            temperature: 0.2,
            maxTokens: 2500
        };
    }
    createManufacturingTemplate() {
        return {
            id: 'manufacturing_focused_v1',
            name: 'Manufacturing Industry Specialist',
            version: '1.0.0',
            industries: ['Manufacturing', 'Industrial', 'Production'],
            systemPrompt: `You are a sustainability consultant specializing in manufacturing operations. You understand industrial energy systems, process optimization, and manufacturing-specific efficiency opportunities.

Manufacturing Expertise:
• Motor efficiency and variable frequency drives (VFDs)
• Compressed air system optimization
• Industrial heating and cooling systems
• Production process energy analysis
• Waste heat recovery systems
• Lean manufacturing and energy waste elimination

You understand manufacturing budgets, maintenance schedules, and the critical importance of avoiding production downtime during improvements.`,
            userPromptTemplate: `Analyze manufacturing sustainability opportunities for:

{businessName} - {industry}, {companySize}
Location: {location}  
Energy: {monthlyKwh} kWh/month, {monthlyTherms} therms/month
Goals: {sustainabilityGoals}

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
- Account for industrial safety requirements`,
            examples: [],
            temperature: 0.3,
            maxTokens: 2800
        };
    }
    createRetailTemplate() {
        return {
            id: 'retail_focused_v1',
            name: 'Retail Industry Specialist',
            version: '1.0.0',
            industries: ['Retail', 'Store', 'Shopping'],
            systemPrompt: `You are a sustainability consultant specializing in retail operations. You understand the unique energy challenges of retail spaces including lighting, refrigeration, HVAC for customer comfort, and point-of-sale systems.

Retail Industry Focus:
• Store lighting optimization for both efficiency and customer experience
• Refrigeration system efficiency (critical for food retail)
• HVAC balance between energy efficiency and customer comfort
• Energy management across multiple store locations
• Sustainable packaging and waste reduction strategies
• Customer-facing sustainability initiatives that drive brand value`,
            userPromptTemplate: `Retail sustainability analysis for:

{businessName} - {industry}, {companySize}
Location: {location}
Energy: {monthlyKwh} kWh/month, {monthlyTherms} therms/month  
Goals: {sustainabilityGoals}

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
- Consider seasonal energy variations`,
            examples: [],
            temperature: 0.3,
            maxTokens: 2600
        };
    }
    createHealthcareTemplate() {
        return {
            id: 'healthcare_focused_v1',
            name: 'Healthcare Industry Specialist',
            version: '1.0.0',
            industries: ['Healthcare', 'Medical', 'Hospital'],
            systemPrompt: `You are a sustainability consultant specializing in healthcare facilities. You understand the critical nature of healthcare operations and the strict requirements for patient care, medical equipment reliability, and regulatory compliance.

Healthcare Expertise:
• Medical equipment energy optimization without compromising patient care
• HVAC systems for infection control and patient comfort
• Emergency backup power and sustainability integration
• Healthcare-specific regulatory requirements (Joint Commission, etc.)
• Specialized lighting requirements for medical procedures
• Pharmaceutical and medical waste management`,
            userPromptTemplate: `Healthcare sustainability analysis for:

{businessName} - {industry}, {companySize}
Energy: {monthlyKwh} kWh/month, {monthlyTherms} therms/month
Location: {location}
Goals: {sustainabilityGoals}

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
- Can be implemented with minimal operational disruption`,
            examples: [],
            temperature: 0.25,
            maxTokens: 2700
        };
    }
    createSmallBusinessTemplate() {
        return {
            id: 'small_business_v1',
            name: 'Small Business Specialist',
            version: '1.0.0',
            industries: ['*'],
            systemPrompt: `You are a sustainability consultant who specializes in small businesses. You understand limited budgets, simple approval processes, and the need for quick, high-impact solutions that small business owners can implement without extensive technical expertise.

Small Business Focus:
• Low-cost, high-impact solutions with fast payback
• Simple implementation that doesn't require specialized staff
• Leveraging small business energy rebates and incentives
• Solutions that improve both costs and operations
• Minimal maintenance requirements
• Clear, immediate ROI demonstration`,
            userPromptTemplate: `Small business sustainability plan for:

{businessName} - {companySize}, {industry}
Monthly Energy: {monthlyKwh} kWh, {monthlyTherms} therms
Location: {location}
Goals: {sustainabilityGoals}

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
- Don't disrupt daily operations`,
            examples: [],
            temperature: 0.4,
            maxTokens: 2000
        };
    }
    createEnterpriseTemplate() {
        return {
            id: 'enterprise_v1',
            name: 'Enterprise Specialist',
            version: '1.0.0',
            industries: ['*'],
            systemPrompt: `You are a sustainability consultant specializing in large enterprise organizations. You understand complex approval processes, corporate sustainability reporting requirements, and large-scale implementation across multiple facilities.

Enterprise Focus:
• Large-scale efficiency projects with significant capital investment
• Corporate sustainability reporting and ESG compliance
• Multi-facility rollout strategies and standardization
• Integration with existing enterprise energy management systems
• Regulatory compliance and sustainability certification (LEED, ISO 14001)
• Stakeholder communication and change management`,
            userPromptTemplate: `Enterprise sustainability strategy for:

{businessName} - {companySize}, {industry}
Energy Portfolio: {monthlyKwh} kWh/month, {monthlyTherms} therms/month
Location: {location}
Corporate Goals: {sustainabilityGoals}

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
- Include competitive benchmarking and industry leadership opportunities`,
            examples: [],
            temperature: 0.2,
            maxTokens: 3500
        };
    }
    createCarbonNeutralTemplate() {
        return {
            id: 'carbon_neutral_v1',
            name: 'Carbon Neutral Strategy Specialist',
            version: '1.0.0',
            industries: ['*'],
            systemPrompt: `You are a carbon neutral strategy specialist. You focus specifically on pathways to achieve net-zero carbon emissions through a combination of efficiency improvements, renewable energy adoption, and strategic carbon offsets.

Carbon Neutral Expertise:
• Science-based targets (SBTi) methodology
• Scope 1, 2, and 3 emissions calculation and reduction
• Renewable energy procurement strategies (PPAs, RECs, on-site generation)
• Carbon offset evaluation and verification
• Net-zero roadmap development with interim milestones`,
            userPromptTemplate: `Carbon neutral roadmap for:

{businessName} - {industry}, {companySize}
Current Emissions Profile: {monthlyKwh} kWh/month, {monthlyTherms} therms/month
Location: {location}
Target: {sustainabilityGoals}

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
- Verification and reporting frameworks`,
            examples: [],
            temperature: 0.25,
            maxTokens: 3000
        };
    }
    createCostOptimizationTemplate() {
        return {
            id: 'cost_optimization_v1',
            name: 'Cost Optimization Specialist',
            version: '1.0.0',
            industries: ['*'],
            systemPrompt: `You are a cost optimization specialist who focuses on sustainability solutions that deliver maximum financial returns. Every recommendation must have clear, immediate cost benefits with detailed financial analysis.

Cost Optimization Focus:
• Energy cost reduction with fastest payback periods
• Utility rate optimization and demand management
• Tax incentive and rebate maximization
• Operational cost reduction through efficiency
• Maintenance cost reduction through equipment upgrades`,
            userPromptTemplate: `Cost optimization analysis for:

{businessName} - {industry}, {companySize}
Energy Costs: {monthlyKwh} kWh/month, {monthlyTherms} therms/month
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

Include detailed financial analysis with sensitivity scenarios for energy price changes.`,
            examples: [],
            temperature: 0.2,
            maxTokens: 2500
        };
    }
    createCoreSustainabilityExamples() {
        return [
            {
                input: {
                    businessName: "GreenTech Manufacturing",
                    industry: "Manufacturing",
                    companySize: "201-1000 employees",
                    location: "Austin, Texas",
                    monthlyKwh: 15000,
                    monthlyTherms: 450,
                    sustainabilityGoals: ["Reduce energy costs by 30%", "Achieve carbon neutral operations by 2030"]
                },
                output: `{
  "recommendations": [
    {
      "title": "Variable Frequency Drive Installation for Motor Systems",
      "description": "Install VFDs on major motor systems to optimize energy consumption based on actual demand rather than running at constant speeds.",
      "category": "Energy Efficiency", 
      "estimated_cost_savings": 42000,
      "estimated_co2_reduction": 78.5,
      "roi_months": 16,
      "difficulty": "Medium",
      "priority_score": 0.95,
      "implementation_steps": [
        "Conduct motor audit to identify VFD candidates",
        "Select appropriate VFD technology for each application", 
        "Schedule installation during planned maintenance windows",
        "Commission systems and train maintenance staff",
        "Implement monitoring and optimization protocols"
      ],
      "reasoning": "High energy usage indicates significant motor load. VFDs typically save 20-30% on motor energy costs with proven ROI in manufacturing."
    }
  ]
}`
            }
        ];
    }
    selectOptimalPrompt(request) {
        // Industry-specific template selection
        const industryTemplates = this.getIndustryTemplates(request.industry);
        // Company size considerations
        const sizeTemplate = this.getSizeTemplate(request.companySize);
        // Goal-specific templates
        const goalTemplate = this.getGoalTemplate(request.sustainabilityGoals);
        // Priority: Goal-specific > Industry-specific > Size-specific > Core
        if (goalTemplate)
            return goalTemplate;
        if (industryTemplates.length > 0)
            return industryTemplates[0];
        if (sizeTemplate)
            return sizeTemplate;
        return this.templates.get('sustainability_core_v2');
    }
    getIndustryTemplates(industry) {
        const industryLower = industry.toLowerCase();
        const templates = [];
        if (industryLower.includes('tech') || industryLower.includes('software')) {
            const template = this.templates.get('technology_focused_v1');
            if (template)
                templates.push(template);
        }
        if (industryLower.includes('manufacturing') || industryLower.includes('industrial')) {
            const template = this.templates.get('manufacturing_focused_v1');
            if (template)
                templates.push(template);
        }
        if (industryLower.includes('retail') || industryLower.includes('store')) {
            const template = this.templates.get('retail_focused_v1');
            if (template)
                templates.push(template);
        }
        if (industryLower.includes('health') || industryLower.includes('medical')) {
            const template = this.templates.get('healthcare_focused_v1');
            if (template)
                templates.push(template);
        }
        return templates;
    }
    getSizeTemplate(companySize) {
        const sizeLower = companySize.toLowerCase();
        if (sizeLower.includes('1-50') || sizeLower.includes('small')) {
            return this.templates.get('small_business_v1') || null;
        }
        if (sizeLower.includes('1000+') || sizeLower.includes('enterprise')) {
            return this.templates.get('enterprise_v1') || null;
        }
        return null;
    }
    getGoalTemplate(goals) {
        const goalsText = goals.join(' ').toLowerCase();
        if (goalsText.includes('carbon neutral') || goalsText.includes('net zero')) {
            return this.templates.get('carbon_neutral_v1') || null;
        }
        if (goalsText.includes('cost') || goalsText.includes('savings') || goalsText.includes('budget')) {
            return this.templates.get('cost_optimization_v1') || null;
        }
        return null;
    }
    generatePrompt(request) {
        const template = this.selectOptimalPrompt(request);
        // Prepare dynamic content
        const currentChallenges = request.currentChallenges?.length
            ? `**Current Challenges:** ${request.currentChallenges.join(', ')}`
            : '';
        const previousRecommendations = request.previousRecommendations?.length
            ? `**Previous Initiatives:** ${request.previousRecommendations.join(', ')}`
            : '';
        const budget = request.budget
            ? `**Budget Considerations:** ${request.budget}`
            : '';
        const timeline = request.timeline
            ? `**Implementation Timeline:** ${request.timeline}`
            : '';
        // Replace template variables
        const userPrompt = template.userPromptTemplate
            .replace(/{businessName}/g, request.businessName)
            .replace(/{industry}/g, request.industry)
            .replace(/{companySize}/g, request.companySize)
            .replace(/{location}/g, request.location)
            .replace(/{monthlyKwh}/g, request.monthlyKwh.toString())
            .replace(/{monthlyTherms}/g, request.monthlyTherms.toString())
            .replace(/{sustainabilityGoals}/g, request.sustainabilityGoals.join(', '))
            .replace(/{currentChallenges}/g, currentChallenges)
            .replace(/{previousRecommendations}/g, previousRecommendations)
            .replace(/{budget}/g, budget)
            .replace(/{timeline}/g, timeline);
        return {
            systemPrompt: template.systemPrompt,
            userPrompt,
            template
        };
    }
    recordMetrics(promptId, metrics) {
        if (!this.metrics.has(promptId)) {
            this.metrics.set(promptId, []);
        }
        const fullMetrics = {
            promptId,
            responseQuality: metrics.responseQuality || 0,
            implementationFeasibility: metrics.implementationFeasibility || 0,
            roiAccuracy: metrics.roiAccuracy || 0,
            userSatisfaction: metrics.userSatisfaction || 0,
            executionTime: metrics.executionTime || 0
        };
        this.metrics.get(promptId).push(fullMetrics);
    }
    getTemplatePerformance(templateId) {
        const templateMetrics = this.metrics.get(templateId) || [];
        if (templateMetrics.length === 0) {
            return { avgQuality: 0, avgSatisfaction: 0, usageCount: 0 };
        }
        const avgQuality = templateMetrics.reduce((sum, m) => sum + m.responseQuality, 0) / templateMetrics.length;
        const avgSatisfaction = templateMetrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / templateMetrics.length;
        return {
            avgQuality: Math.round(avgQuality * 100) / 100,
            avgSatisfaction: Math.round(avgSatisfaction * 100) / 100,
            usageCount: templateMetrics.length
        };
    }
    listAvailableTemplates() {
        return Array.from(this.templates.values()).map(template => ({
            id: template.id,
            name: template.name,
            version: template.version,
            industries: template.industries
        }));
    }
}
exports.PromptEngineeringService = PromptEngineeringService;
// Export singleton instance
exports.promptEngineering = new PromptEngineeringService();
