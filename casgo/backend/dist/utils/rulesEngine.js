"use strict";
/**
 * Rules-based recommendation engine for sustainability recommendations.
 * Analyzes business data and generates targeted recommendations based on:
 * - Industry best practices
 * - Company size considerations
 * - Geographic factors
 * - Energy usage patterns
 * - Sustainability goals
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rulesEngine = exports.RulesBasedRecommendationEngine = exports.BusinessDataAnalyzer = exports.GoalCategory = exports.CompanySize = exports.IndustryType = void 0;
var IndustryType;
(function (IndustryType) {
    IndustryType["TECHNOLOGY"] = "Technology";
    IndustryType["MANUFACTURING"] = "Manufacturing";
    IndustryType["RETAIL"] = "Retail";
    IndustryType["HEALTHCARE"] = "Healthcare";
    IndustryType["HOSPITALITY"] = "Hospitality";
    IndustryType["EDUCATION"] = "Education";
    IndustryType["FINANCIAL"] = "Financial Services";
    IndustryType["LOGISTICS"] = "Logistics & Transportation";
    IndustryType["CONSTRUCTION"] = "Construction";
    IndustryType["AGRICULTURE"] = "Agriculture";
    IndustryType["OTHER"] = "Other";
})(IndustryType || (exports.IndustryType = IndustryType = {}));
var CompanySize;
(function (CompanySize) {
    CompanySize["SMALL"] = "1-50 employees";
    CompanySize["MEDIUM"] = "51-200 employees";
    CompanySize["LARGE"] = "201-1000 employees";
    CompanySize["ENTERPRISE"] = "1000+ employees";
})(CompanySize || (exports.CompanySize = CompanySize = {}));
var GoalCategory;
(function (GoalCategory) {
    GoalCategory["ENERGY_EFFICIENCY"] = "Energy Efficiency";
    GoalCategory["RENEWABLE_ENERGY"] = "Renewable Energy";
    GoalCategory["CARBON_REDUCTION"] = "Carbon Footprint Reduction";
    GoalCategory["WASTE_REDUCTION"] = "Waste Reduction";
    GoalCategory["WATER_CONSERVATION"] = "Water Conservation";
    GoalCategory["TRANSPORTATION"] = "Sustainable Transportation";
    GoalCategory["GREEN_BUILDING"] = "Green Building";
    GoalCategory["SUPPLY_CHAIN"] = "Sustainable Supply Chain";
})(GoalCategory || (exports.GoalCategory = GoalCategory = {}));
class BusinessDataAnalyzer {
    static categorizeIndustry(industryStr) {
        const industryLower = industryStr.toLowerCase();
        if (['tech', 'software', 'it', 'computer'].some(tech => industryLower.includes(tech))) {
            return IndustryType.TECHNOLOGY;
        }
        else if (['manufacturing', 'factory', 'production'].some(mfg => industryLower.includes(mfg))) {
            return IndustryType.MANUFACTURING;
        }
        else if (['retail', 'store', 'shopping'].some(retail => industryLower.includes(retail))) {
            return IndustryType.RETAIL;
        }
        else if (['health', 'medical', 'hospital'].some(health => industryLower.includes(health))) {
            return IndustryType.HEALTHCARE;
        }
        else if (['hotel', 'restaurant', 'hospitality'].some(hosp => industryLower.includes(hosp))) {
            return IndustryType.HOSPITALITY;
        }
        else if (['education', 'school', 'university'].some(edu => industryLower.includes(edu))) {
            return IndustryType.EDUCATION;
        }
        else if (['financial', 'bank', 'finance'].some(fin => industryLower.includes(fin))) {
            return IndustryType.FINANCIAL;
        }
        else if (['logistics', 'transport', 'shipping'].some(log => industryLower.includes(log))) {
            return IndustryType.LOGISTICS;
        }
        else if (['construction', 'building'].some(con => industryLower.includes(con))) {
            return IndustryType.CONSTRUCTION;
        }
        else if (['agriculture', 'farming'].some(agr => industryLower.includes(agr))) {
            return IndustryType.AGRICULTURE;
        }
        else {
            return IndustryType.OTHER;
        }
    }
    static categorizeCompanySize(sizeStr) {
        const sizeLower = sizeStr.toLowerCase();
        if (['small', '1-50', 'startup'].some(small => sizeLower.includes(small))) {
            return CompanySize.SMALL;
        }
        else if (['medium', '51-200', 'mid'].some(med => sizeLower.includes(med))) {
            return CompanySize.MEDIUM;
        }
        else if (['large', '201-1000'].some(large => sizeLower.includes(large))) {
            return CompanySize.LARGE;
        }
        else if (['enterprise', '1000+', 'corporation'].some(ent => sizeLower.includes(ent))) {
            return CompanySize.ENTERPRISE;
        }
        else {
            return CompanySize.MEDIUM; // Default
        }
    }
    static categorizeGoals(goals) {
        const categorized = [];
        for (const goal of goals) {
            const goalLower = goal.toLowerCase();
            if (['energy', 'efficiency'].some(energy => goalLower.includes(energy))) {
                categorized.push(GoalCategory.ENERGY_EFFICIENCY);
            }
            else if (['renewable', 'solar', 'wind'].some(renewable => goalLower.includes(renewable))) {
                categorized.push(GoalCategory.RENEWABLE_ENERGY);
            }
            else if (['carbon', 'emissions', 'co2'].some(carbon => goalLower.includes(carbon))) {
                categorized.push(GoalCategory.CARBON_REDUCTION);
            }
            else if (['waste', 'recycling'].some(waste => goalLower.includes(waste))) {
                categorized.push(GoalCategory.WASTE_REDUCTION);
            }
            else if (['water', 'conservation'].some(water => goalLower.includes(water))) {
                categorized.push(GoalCategory.WATER_CONSERVATION);
            }
            else if (['transport', 'fleet', 'commute'].some(transport => goalLower.includes(transport))) {
                categorized.push(GoalCategory.TRANSPORTATION);
            }
            else if (['building', 'leed', 'green'].some(building => goalLower.includes(building))) {
                categorized.push(GoalCategory.GREEN_BUILDING);
            }
            else if (['supply', 'vendor', 'procurement'].some(supply => goalLower.includes(supply))) {
                categorized.push(GoalCategory.SUPPLY_CHAIN);
            }
        }
        return Array.from(new Set(categorized)); // Remove duplicates
    }
}
exports.BusinessDataAnalyzer = BusinessDataAnalyzer;
class RulesBasedRecommendationEngine {
    constructor() {
        this.rules = this.initializeRules();
        this.regionalFactors = this.initializeRegionalFactors();
    }
    initializeRules() {
        const rules = [];
        // Energy Efficiency Rules
        rules.push(...this.createEnergyEfficiencyRules());
        // Industry-Specific Rules
        rules.push(...this.createIndustrySpecificRules());
        // Company Size Rules
        rules.push(...this.createSizeSpecificRules());
        // Goal-Specific Rules
        rules.push(...this.createGoalSpecificRules());
        return rules;
    }
    createEnergyEfficiencyRules() {
        return [
            {
                ruleId: "led_retrofit_basic",
                title: "LED Lighting Retrofit",
                description: "Replace traditional incandescent and fluorescent lighting with energy-efficient LED bulbs throughout the facility.",
                category: "Energy Efficiency",
                difficulty: "Easy",
                minKwh: 800,
                costSavingsFactor: 0.25,
                co2ReductionFactor: 0.25,
                baseRoiMonths: 18,
                implementationCostFactor: 1.0,
                basePriority: 0.8
            },
            {
                ruleId: "hvac_optimization",
                title: "HVAC System Optimization",
                description: "Implement smart thermostats, regular maintenance schedules, and system optimization to improve heating and cooling efficiency.",
                category: "Energy Efficiency",
                difficulty: "Medium",
                minKwh: 1500,
                costSavingsFactor: 0.15,
                co2ReductionFactor: 0.15,
                baseRoiMonths: 24,
                implementationCostFactor: 1.5,
                basePriority: 0.7
            },
            {
                ruleId: "smart_power_management",
                title: "Smart Power Management Systems",
                description: "Install smart power strips and automated shutdown systems to eliminate phantom loads and reduce standby power consumption.",
                category: "Energy Efficiency",
                difficulty: "Easy",
                minKwh: 500,
                applicableSizes: [CompanySize.MEDIUM, CompanySize.LARGE, CompanySize.ENTERPRISE],
                costSavingsFactor: 0.08,
                co2ReductionFactor: 0.08,
                baseRoiMonths: 12,
                implementationCostFactor: 0.8,
                basePriority: 0.6
            },
            {
                ruleId: "energy_audit_comprehensive",
                title: "Professional Energy Audit",
                description: "Conduct a comprehensive energy audit to identify specific areas of energy waste and optimization opportunities.",
                category: "Assessment",
                difficulty: "Easy",
                costSavingsFactor: 0.10,
                co2ReductionFactor: 0.10,
                baseRoiMonths: 6,
                implementationCostFactor: 0.3,
                basePriority: 0.9
            },
            {
                ruleId: "insulation_upgrade",
                title: "Building Insulation Upgrade",
                description: "Improve building insulation in walls, windows, and roofing to reduce heating and cooling energy requirements.",
                category: "Energy Efficiency",
                difficulty: "Hard",
                minKwh: 2000,
                minTherms: 100,
                costSavingsFactor: 0.20,
                co2ReductionFactor: 0.18,
                baseRoiMonths: 36,
                implementationCostFactor: 3.0,
                basePriority: 0.5
            }
        ];
    }
    createIndustrySpecificRules() {
        return [
            {
                ruleId: "server_efficiency_tech",
                title: "Data Center and Server Efficiency",
                description: "Optimize server utilization, implement virtualization, and upgrade to energy-efficient hardware.",
                category: "Energy Efficiency",
                difficulty: "Medium",
                applicableIndustries: [IndustryType.TECHNOLOGY],
                minKwh: 2000,
                costSavingsFactor: 0.30,
                co2ReductionFactor: 0.30,
                baseRoiMonths: 18,
                implementationCostFactor: 1.5,
                basePriority: 0.8
            },
            {
                ruleId: "motor_efficiency_mfg",
                title: "High-Efficiency Motor Upgrades",
                description: "Replace standard motors with premium efficiency motors and implement variable frequency drives (VFDs).",
                category: "Energy Efficiency",
                difficulty: "Medium",
                applicableIndustries: [IndustryType.MANUFACTURING],
                minKwh: 5000,
                costSavingsFactor: 0.25,
                co2ReductionFactor: 0.25,
                baseRoiMonths: 30,
                implementationCostFactor: 2.0,
                basePriority: 0.7
            },
            {
                ruleId: "refrigeration_efficiency_retail",
                title: "Refrigeration System Optimization",
                description: "Upgrade to high-efficiency refrigeration systems and implement advanced controls for better energy management.",
                category: "Energy Efficiency",
                difficulty: "Hard",
                applicableIndustries: [IndustryType.RETAIL],
                minKwh: 3000,
                costSavingsFactor: 0.20,
                co2ReductionFactor: 0.20,
                baseRoiMonths: 36,
                implementationCostFactor: 2.5,
                basePriority: 0.6
            }
        ];
    }
    createSizeSpecificRules() {
        return [
            {
                ruleId: "small_business_basics",
                title: "Small Business Energy Basics",
                description: "Implement simple energy-saving measures like programmable thermostats, LED lighting, and Energy Star appliances.",
                category: "Energy Efficiency",
                difficulty: "Easy",
                applicableSizes: [CompanySize.SMALL],
                costSavingsFactor: 0.15,
                co2ReductionFactor: 0.15,
                baseRoiMonths: 12,
                implementationCostFactor: 0.8,
                basePriority: 0.8
            },
            {
                ruleId: "enterprise_energy_management",
                title: "Enterprise Energy Management System",
                description: "Implement comprehensive energy management software with real-time monitoring and automated optimization.",
                category: "Energy Efficiency",
                difficulty: "Hard",
                applicableSizes: [CompanySize.ENTERPRISE],
                minKwh: 10000,
                costSavingsFactor: 0.20,
                co2ReductionFactor: 0.20,
                baseRoiMonths: 24,
                implementationCostFactor: 2.0,
                basePriority: 0.7
            }
        ];
    }
    createGoalSpecificRules() {
        return [
            {
                ruleId: "solar_installation",
                title: "Solar Panel Installation",
                description: "Install rooftop or ground-mounted solar panels to generate clean renewable energy and reduce grid dependence.",
                category: "Renewable Energy",
                difficulty: "Hard",
                requiredGoals: [GoalCategory.RENEWABLE_ENERGY],
                minKwh: 2000,
                costSavingsFactor: 0.30,
                co2ReductionFactor: 0.40,
                baseRoiMonths: 60,
                implementationCostFactor: 4.0,
                basePriority: 0.9
            },
            {
                ruleId: "waste_reduction_program",
                title: "Comprehensive Waste Reduction Program",
                description: "Implement recycling programs, composting, and waste stream analysis to minimize landfill waste.",
                category: "Waste Reduction",
                difficulty: "Medium",
                requiredGoals: [GoalCategory.WASTE_REDUCTION],
                costSavingsFactor: 0.05,
                co2ReductionFactor: 0.08,
                baseRoiMonths: 18,
                implementationCostFactor: 1.0,
                basePriority: 0.6
            },
            {
                ruleId: "green_transportation",
                title: "Green Transportation Initiative",
                description: "Implement electric vehicle fleet, employee incentives for public transit, and bike-sharing programs.",
                category: "Transportation",
                difficulty: "Hard",
                requiredGoals: [GoalCategory.TRANSPORTATION],
                applicableSizes: [CompanySize.MEDIUM, CompanySize.LARGE, CompanySize.ENTERPRISE],
                costSavingsFactor: 0.10,
                co2ReductionFactor: 0.15,
                baseRoiMonths: 48,
                implementationCostFactor: 2.5,
                basePriority: 0.6
            }
        ];
    }
    initializeRegionalFactors() {
        return {
            electricityRate: {
                california: 0.20,
                "new york": 0.18,
                massachusetts: 0.22,
                texas: 0.12,
                florida: 0.11,
                illinois: 0.13,
                default: 0.12
            },
            solarPotential: {
                arizona: 1.4,
                california: 1.3,
                nevada: 1.3,
                texas: 1.2,
                florida: 1.1,
                "north carolina": 1.0,
                "new york": 0.8,
                washington: 0.7,
                default: 1.0
            },
            heatingFactor: {
                alaska: 2.0,
                minnesota: 1.8,
                wisconsin: 1.6,
                michigan: 1.5,
                "new york": 1.3,
                illinois: 1.3,
                california: 0.6,
                florida: 0.3,
                texas: 0.7,
                default: 1.0
            }
        };
    }
    generateRecommendations(businessData) {
        // Analyze business data
        const industry = BusinessDataAnalyzer.categorizeIndustry(businessData.industry);
        const companySize = BusinessDataAnalyzer.categorizeCompanySize(businessData.size);
        const goals = BusinessDataAnalyzer.categorizeGoals(businessData.sustainabilityGoals);
        const applicableRules = [];
        // Filter rules based on business data
        for (const rule of this.rules) {
            if (this.isRuleApplicable(rule, businessData, industry, companySize, goals)) {
                applicableRules.push(rule);
            }
        }
        // Generate recommendations from applicable rules
        const recommendations = [];
        for (const rule of applicableRules) {
            const rec = this.createRecommendationFromRule(rule, businessData);
            recommendations.push(rec);
        }
        // Sort by priority score and return top recommendations
        recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
        return recommendations.slice(0, 8); // Return top 8 recommendations
    }
    isRuleApplicable(rule, businessData, industry, companySize, goals) {
        // Check energy usage thresholds
        if (rule.minKwh && businessData.monthlyKwh < rule.minKwh)
            return false;
        if (rule.maxKwh && businessData.monthlyKwh > rule.maxKwh)
            return false;
        if (rule.minTherms && businessData.monthlyTherms < rule.minTherms)
            return false;
        if (rule.maxTherms && businessData.monthlyTherms > rule.maxTherms)
            return false;
        // Check industry applicability
        if (rule.applicableIndustries && !rule.applicableIndustries.includes(industry))
            return false;
        // Check company size applicability
        if (rule.applicableSizes && !rule.applicableSizes.includes(companySize))
            return false;
        // Check required goals
        if (rule.requiredGoals && !rule.requiredGoals.some(goal => goals.includes(goal)))
            return false;
        return true;
    }
    createRecommendationFromRule(rule, businessData) {
        // Calculate annual savings
        const electricityRate = this.getRegionalFactor('electricityRate', businessData.location);
        const annualElectricityCost = businessData.monthlyKwh * 12 * electricityRate;
        const annualGasCost = businessData.monthlyTherms * 12 * 1.20; // Avg $1.20/therm
        const estimatedSavings = (annualElectricityCost + annualGasCost) * rule.costSavingsFactor;
        // Calculate CO2 reduction
        const annualCo2Lbs = (businessData.monthlyKwh * 0.92 + businessData.monthlyTherms * 11.7) * 12;
        const estimatedCo2Reduction = annualCo2Lbs * rule.co2ReductionFactor;
        // Calculate ROI
        const implementationCost = estimatedSavings * rule.implementationCostFactor;
        let roiMonths = rule.baseRoiMonths;
        if (estimatedSavings > 0) {
            roiMonths = Math.max(6, Math.round((implementationCost / estimatedSavings) * 12));
        }
        // Calculate priority score
        const priorityScore = this.calculatePriorityScore(rule, businessData, estimatedSavings, roiMonths);
        return {
            id: rule.ruleId,
            title: rule.title,
            description: rule.description,
            category: rule.category,
            estimatedCostSavings: Math.round(estimatedSavings * 100) / 100,
            estimatedCo2Reduction: Math.round(estimatedCo2Reduction * 100) / 100,
            roiMonths,
            difficulty: rule.difficulty,
            priorityScore: Math.round(priorityScore * 100) / 100
        };
    }
    getRegionalFactor(factorType, location) {
        const locationLower = location.toLowerCase();
        const factors = this.regionalFactors[factorType] || {};
        for (const [region, factor] of Object.entries(factors)) {
            if (region !== 'default' && locationLower.includes(region)) {
                return factor;
            }
        }
        return factors.default || 1.0;
    }
    calculatePriorityScore(rule, businessData, estimatedSavings, roiMonths) {
        // Start with base priority
        let priority = rule.basePriority;
        // ROI bonus (shorter ROI = higher priority)
        if (roiMonths <= 12) {
            priority += 0.2;
        }
        else if (roiMonths <= 24) {
            priority += 0.1;
        }
        else if (roiMonths > 48) {
            priority -= 0.1;
        }
        // Savings bonus (higher savings = higher priority)
        if (estimatedSavings > 10000) {
            priority += 0.15;
        }
        else if (estimatedSavings > 5000) {
            priority += 0.1;
        }
        else if (estimatedSavings > 2000) {
            priority += 0.05;
        }
        // High energy usage bonus
        if (businessData.monthlyKwh > 5000) {
            priority += 0.1;
        }
        // Ensure priority stays within reasonable bounds
        return Math.max(0.1, Math.min(1.0, priority));
    }
}
exports.RulesBasedRecommendationEngine = RulesBasedRecommendationEngine;
// Create and export singleton instance
exports.rulesEngine = new RulesBasedRecommendationEngine();
