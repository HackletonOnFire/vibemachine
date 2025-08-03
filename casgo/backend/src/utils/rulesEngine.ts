/**
 * Rules-based recommendation engine for sustainability recommendations.
 * Analyzes business data and generates targeted recommendations based on:
 * - Industry best practices
 * - Company size considerations
 * - Geographic factors
 * - Energy usage patterns
 * - Sustainability goals
 */

export enum IndustryType {
  TECHNOLOGY = "Technology",
  MANUFACTURING = "Manufacturing",
  RETAIL = "Retail",
  HEALTHCARE = "Healthcare",
  HOSPITALITY = "Hospitality",
  EDUCATION = "Education",
  FINANCIAL = "Financial Services",
  LOGISTICS = "Logistics & Transportation",
  CONSTRUCTION = "Construction",
  AGRICULTURE = "Agriculture",
  OTHER = "Other"
}

export enum CompanySize {
  SMALL = "1-50 employees",
  MEDIUM = "51-200 employees",
  LARGE = "201-1000 employees",
  ENTERPRISE = "1000+ employees"
}

export enum GoalCategory {
  ENERGY_EFFICIENCY = "Energy Efficiency",
  RENEWABLE_ENERGY = "Renewable Energy",
  CARBON_REDUCTION = "Carbon Footprint Reduction",
  WASTE_REDUCTION = "Waste Reduction",
  WATER_CONSERVATION = "Water Conservation",
  TRANSPORTATION = "Sustainable Transportation",
  GREEN_BUILDING = "Green Building",
  SUPPLY_CHAIN = "Sustainable Supply Chain"
}

export interface RecommendationRule {
  ruleId: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  
  // Conditions
  minKwh?: number;
  maxKwh?: number;
  minTherms?: number;
  maxTherms?: number;
  applicableIndustries?: IndustryType[];
  applicableSizes?: CompanySize[];
  requiredGoals?: GoalCategory[];
  
  // ROI Parameters
  costSavingsFactor: number;
  co2ReductionFactor: number;
  baseRoiMonths: number;
  implementationCostFactor: number;
  
  // Priority
  basePriority: number;
  priorityMultipliers?: Record<string, number>;
}

export interface BusinessData {
  businessName: string;
  industry: string;
  size: string;
  location: string;
  monthlyKwh: number;
  monthlyTherms: number;
  sustainabilityGoals: string[];
}

export interface RuleRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedCostSavings: number;
  estimatedCo2Reduction: number;
  roiMonths: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priorityScore: number;
}

export class BusinessDataAnalyzer {
  static categorizeIndustry(industryStr: string): IndustryType {
    const industryLower = industryStr.toLowerCase();
    
    if (['tech', 'software', 'it', 'computer'].some(tech => industryLower.includes(tech))) {
      return IndustryType.TECHNOLOGY;
    } else if (['manufacturing', 'factory', 'production'].some(mfg => industryLower.includes(mfg))) {
      return IndustryType.MANUFACTURING;
    } else if (['retail', 'store', 'shopping'].some(retail => industryLower.includes(retail))) {
      return IndustryType.RETAIL;
    } else if (['health', 'medical', 'hospital'].some(health => industryLower.includes(health))) {
      return IndustryType.HEALTHCARE;
    } else if (['hotel', 'restaurant', 'hospitality'].some(hosp => industryLower.includes(hosp))) {
      return IndustryType.HOSPITALITY;
    } else if (['education', 'school', 'university'].some(edu => industryLower.includes(edu))) {
      return IndustryType.EDUCATION;
    } else if (['financial', 'bank', 'finance'].some(fin => industryLower.includes(fin))) {
      return IndustryType.FINANCIAL;
    } else if (['logistics', 'transport', 'shipping'].some(log => industryLower.includes(log))) {
      return IndustryType.LOGISTICS;
    } else if (['construction', 'building'].some(con => industryLower.includes(con))) {
      return IndustryType.CONSTRUCTION;
    } else if (['agriculture', 'farming'].some(agr => industryLower.includes(agr))) {
      return IndustryType.AGRICULTURE;
    } else {
      return IndustryType.OTHER;
    }
  }
  
  static categorizeCompanySize(sizeStr: string): CompanySize {
    const sizeLower = sizeStr.toLowerCase();
    
    if (['small', '1-50', 'startup'].some(small => sizeLower.includes(small))) {
      return CompanySize.SMALL;
    } else if (['medium', '51-200', 'mid'].some(med => sizeLower.includes(med))) {
      return CompanySize.MEDIUM;
    } else if (['large', '201-1000'].some(large => sizeLower.includes(large))) {
      return CompanySize.LARGE;
    } else if (['enterprise', '1000+', 'corporation'].some(ent => sizeLower.includes(ent))) {
      return CompanySize.ENTERPRISE;
    } else {
      return CompanySize.MEDIUM; // Default
    }
  }
  
  static categorizeGoals(goals: string[]): GoalCategory[] {
    const categorized: GoalCategory[] = [];
    
    for (const goal of goals) {
      const goalLower = goal.toLowerCase();
      
      if (['energy', 'efficiency'].some(energy => goalLower.includes(energy))) {
        categorized.push(GoalCategory.ENERGY_EFFICIENCY);
      } else if (['renewable', 'solar', 'wind'].some(renewable => goalLower.includes(renewable))) {
        categorized.push(GoalCategory.RENEWABLE_ENERGY);
      } else if (['carbon', 'emissions', 'co2'].some(carbon => goalLower.includes(carbon))) {
        categorized.push(GoalCategory.CARBON_REDUCTION);
      } else if (['waste', 'recycling'].some(waste => goalLower.includes(waste))) {
        categorized.push(GoalCategory.WASTE_REDUCTION);
      } else if (['water', 'conservation'].some(water => goalLower.includes(water))) {
        categorized.push(GoalCategory.WATER_CONSERVATION);
      } else if (['transport', 'fleet', 'commute'].some(transport => goalLower.includes(transport))) {
        categorized.push(GoalCategory.TRANSPORTATION);
      } else if (['building', 'leed', 'green'].some(building => goalLower.includes(building))) {
        categorized.push(GoalCategory.GREEN_BUILDING);
      } else if (['supply', 'vendor', 'procurement'].some(supply => goalLower.includes(supply))) {
        categorized.push(GoalCategory.SUPPLY_CHAIN);
      }
    }
    
    return Array.from(new Set(categorized)); // Remove duplicates
  }
}

export class RulesBasedRecommendationEngine {
  private rules: RecommendationRule[];
  private regionalFactors: Record<string, Record<string, number>>;
  
  constructor() {
    this.rules = this.initializeRules();
    this.regionalFactors = this.initializeRegionalFactors();
  }
  
  private initializeRules(): RecommendationRule[] {
    const rules: RecommendationRule[] = [];
    
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
  
  private createEnergyEfficiencyRules(): RecommendationRule[] {
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
      },
      {
        ruleId: "energy_star_appliances",
        title: "Energy Star Appliance Upgrade",
        description: "Replace old appliances with Energy Star certified models for refrigerators, water heaters, and office equipment.",
        category: "Energy Efficiency",
        difficulty: "Easy",
        minKwh: 300,
        costSavingsFactor: 0.18,
        co2ReductionFactor: 0.18,
        baseRoiMonths: 30,
        implementationCostFactor: 1.2,
        basePriority: 0.7
      },
      {
        ruleId: "window_film_upgrade",
        title: "Energy-Efficient Window Film",
        description: "Install low-E window films to reduce solar heat gain and improve building thermal performance.",
        category: "Energy Efficiency",
        difficulty: "Easy",
        minKwh: 1000,
        costSavingsFactor: 0.12,
        co2ReductionFactor: 0.12,
        baseRoiMonths: 24,
        implementationCostFactor: 0.8,
        basePriority: 0.6
      },
      {
        ruleId: "occupancy_sensors",
        title: "Occupancy Sensor Installation",
        description: "Install motion-activated lighting controls to automatically turn off lights in unoccupied areas.",
        category: "Energy Efficiency",
        difficulty: "Easy",
        minKwh: 600,
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.15,
        baseRoiMonths: 18,
        implementationCostFactor: 0.6,
        basePriority: 0.8
      },
      {
        ruleId: "variable_speed_drives",
        title: "Variable Speed Drive Implementation",
        description: "Install variable frequency drives on pumps, fans, and motors to optimize energy consumption based on demand.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        minKwh: 2500,
        costSavingsFactor: 0.22,
        co2ReductionFactor: 0.22,
        baseRoiMonths: 30,
        implementationCostFactor: 1.8,
        basePriority: 0.7
      },
      {
        ruleId: "power_factor_correction",
        title: "Power Factor Correction",
        description: "Install power factor correction equipment to improve electrical efficiency and reduce demand charges.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        minKwh: 3000,
        applicableSizes: [CompanySize.LARGE, CompanySize.ENTERPRISE],
        costSavingsFactor: 0.12,
        co2ReductionFactor: 0.08,
        baseRoiMonths: 24,
        implementationCostFactor: 1.5,
        basePriority: 0.6
      }
    ];
  }
  
  private createIndustrySpecificRules(): RecommendationRule[] {
    return [
      // Technology Industry
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
        ruleId: "cloud_migration_tech",
        title: "Cloud Infrastructure Migration",
        description: "Migrate on-premises servers to energy-efficient cloud platforms to reduce power consumption and cooling needs.",
        category: "Energy Efficiency",
        difficulty: "Hard",
        applicableIndustries: [IndustryType.TECHNOLOGY],
        minKwh: 1500,
        costSavingsFactor: 0.35,
        co2ReductionFactor: 0.40,
        baseRoiMonths: 24,
        implementationCostFactor: 2.0,
        basePriority: 0.8
      },
      {
        ruleId: "green_coding_practices",
        title: "Green Software Development Practices",
        description: "Implement energy-efficient coding practices, optimize algorithms, and reduce computational resource usage.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableIndustries: [IndustryType.TECHNOLOGY],
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.20,
        baseRoiMonths: 12,
        implementationCostFactor: 0.5,
        basePriority: 0.7
      },
      
      // Manufacturing Industry
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
        ruleId: "compressed_air_optimization",
        title: "Compressed Air System Optimization",
        description: "Optimize compressed air systems with leak detection, right-sizing, and pressure optimization.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableIndustries: [IndustryType.MANUFACTURING],
        minKwh: 3000,
        costSavingsFactor: 0.30,
        co2ReductionFactor: 0.25,
        baseRoiMonths: 18,
        implementationCostFactor: 1.2,
        basePriority: 0.8
      },
      {
        ruleId: "waste_heat_recovery",
        title: "Industrial Waste Heat Recovery",
        description: "Capture and reuse waste heat from manufacturing processes to reduce overall energy consumption.",
        category: "Energy Efficiency",
        difficulty: "Hard",
        applicableIndustries: [IndustryType.MANUFACTURING],
        minTherms: 200,
        costSavingsFactor: 0.25,
        co2ReductionFactor: 0.30,
        baseRoiMonths: 42,
        implementationCostFactor: 3.5,
        basePriority: 0.6
      },
      
      // Retail Industry
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
      },
      {
        ruleId: "demand_response_retail",
        title: "Demand Response Program Participation",
        description: "Participate in utility demand response programs to reduce peak energy usage and earn incentives.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableIndustries: [IndustryType.RETAIL],
        minKwh: 2000,
        costSavingsFactor: 0.08,
        co2ReductionFactor: 0.10,
        baseRoiMonths: 12,
        implementationCostFactor: 0.5,
        basePriority: 0.7
      },
      
      // Healthcare Industry
      {
        ruleId: "medical_equipment_efficiency",
        title: "Medical Equipment Energy Optimization",
        description: "Upgrade to energy-efficient medical equipment and implement smart power management for imaging systems.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableIndustries: [IndustryType.HEALTHCARE],
        minKwh: 4000,
        costSavingsFactor: 0.20,
        co2ReductionFactor: 0.18,
        baseRoiMonths: 36,
        implementationCostFactor: 2.0,
        basePriority: 0.6
      },
      {
        ruleId: "air_filtration_optimization",
        title: "Healthcare Air Filtration Optimization",
        description: "Optimize HVAC and air filtration systems while maintaining medical air quality standards.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableIndustries: [IndustryType.HEALTHCARE],
        minKwh: 2500,
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.15,
        baseRoiMonths: 30,
        implementationCostFactor: 1.5,
        basePriority: 0.6
      },
      
      // Hospitality Industry
      {
        ruleId: "guest_room_automation",
        title: "Guest Room Energy Automation",
        description: "Install smart room controls that adjust lighting, temperature, and electronics based on occupancy.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableIndustries: [IndustryType.HOSPITALITY],
        minKwh: 1500,
        costSavingsFactor: 0.25,
        co2ReductionFactor: 0.22,
        baseRoiMonths: 24,
        implementationCostFactor: 1.8,
        basePriority: 0.8
      },
      {
        ruleId: "water_heating_efficiency",
        title: "Hot Water System Optimization",
        description: "Upgrade to high-efficiency water heaters and implement heat recovery systems for laundry and kitchens.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableIndustries: [IndustryType.HOSPITALITY],
        minTherms: 150,
        costSavingsFactor: 0.30,
        co2ReductionFactor: 0.25,
        baseRoiMonths: 30,
        implementationCostFactor: 2.0,
        basePriority: 0.7
      },
      
      // Education Industry
      {
        ruleId: "campus_energy_management",
        title: "Campus-Wide Energy Management System",
        description: "Implement centralized energy management across multiple buildings with automated scheduling and controls.",
        category: "Energy Efficiency",
        difficulty: "Hard",
        applicableIndustries: [IndustryType.EDUCATION],
        minKwh: 5000,
        costSavingsFactor: 0.22,
        co2ReductionFactor: 0.20,
        baseRoiMonths: 36,
        implementationCostFactor: 2.5,
        basePriority: 0.7
      },
      {
        ruleId: "classroom_scheduling_optimization",
        title: "Smart Classroom Scheduling",
        description: "Optimize classroom and lab scheduling to reduce HVAC and lighting loads during unoccupied periods.",
        category: "Energy Efficiency",
        difficulty: "Easy",
        applicableIndustries: [IndustryType.EDUCATION],
        minKwh: 1000,
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.15,
        baseRoiMonths: 18,
        implementationCostFactor: 0.8,
        basePriority: 0.8
      }
    ];
  }
  
  private createSizeSpecificRules(): RecommendationRule[] {
    return [
      // Small Business Rules
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
        ruleId: "small_business_behavior_change",
        title: "Employee Energy Awareness Program",
        description: "Train employees on energy-saving behaviors and implement simple conservation practices.",
        category: "Behavioral",
        difficulty: "Easy",
        applicableSizes: [CompanySize.SMALL],
        costSavingsFactor: 0.10,
        co2ReductionFactor: 0.10,
        baseRoiMonths: 3,
        implementationCostFactor: 0.2,
        basePriority: 0.9
      },
      {
        ruleId: "small_business_utility_programs",
        title: "Utility Rebate and Incentive Programs",
        description: "Take advantage of local utility energy efficiency rebates and small business incentive programs.",
        category: "Financial",
        difficulty: "Easy",
        applicableSizes: [CompanySize.SMALL],
        costSavingsFactor: 0.20,
        co2ReductionFactor: 0.15,
        baseRoiMonths: 6,
        implementationCostFactor: 0.3,
        basePriority: 0.9
      },
      
      // Medium Business Rules
      {
        ruleId: "medium_business_monitoring",
        title: "Energy Monitoring and Analytics",
        description: "Install smart meters and energy monitoring systems to track and optimize energy usage patterns.",
        category: "Energy Efficiency",
        difficulty: "Medium",
        applicableSizes: [CompanySize.MEDIUM],
        minKwh: 1000,
        costSavingsFactor: 0.18,
        co2ReductionFactor: 0.15,
        baseRoiMonths: 18,
        implementationCostFactor: 1.2,
        basePriority: 0.8
      },
      {
        ruleId: "medium_business_sustainability_coordinator",
        title: "Sustainability Coordinator Program",
        description: "Designate sustainability coordinators and implement systematic environmental management practices.",
        category: "Organizational",
        difficulty: "Medium",
        applicableSizes: [CompanySize.MEDIUM],
        costSavingsFactor: 0.12,
        co2ReductionFactor: 0.18,
        baseRoiMonths: 12,
        implementationCostFactor: 0.8,
        basePriority: 0.7
      },
      
      // Large Business Rules
      {
        ruleId: "large_business_iso_certification",
        title: "ISO 14001 Environmental Management",
        description: "Implement ISO 14001 environmental management system for systematic sustainability improvements.",
        category: "Organizational",
        difficulty: "Hard",
        applicableSizes: [CompanySize.LARGE],
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.20,
        baseRoiMonths: 36,
        implementationCostFactor: 2.0,
        basePriority: 0.7
      },
      {
        ruleId: "large_business_sustainability_reporting",
        title: "Comprehensive Sustainability Reporting",
        description: "Implement GRI or SASB framework sustainability reporting with third-party verification.",
        category: "Reporting",
        difficulty: "Medium",
        applicableSizes: [CompanySize.LARGE, CompanySize.ENTERPRISE],
        costSavingsFactor: 0.05,
        co2ReductionFactor: 0.10,
        baseRoiMonths: 24,
        implementationCostFactor: 1.5,
        basePriority: 0.6
      },
      
      // Enterprise Rules
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
      },
      {
        ruleId: "enterprise_carbon_neutral_strategy",
        title: "Carbon Neutral Strategy Implementation",
        description: "Develop and implement comprehensive carbon neutral strategy with science-based targets.",
        category: "Strategic",
        difficulty: "Hard",
        applicableSizes: [CompanySize.ENTERPRISE],
        costSavingsFactor: 0.10,
        co2ReductionFactor: 0.40,
        baseRoiMonths: 60,
        implementationCostFactor: 3.0,
        basePriority: 0.8
      },
      {
        ruleId: "enterprise_supply_chain_engagement",
        title: "Supply Chain Sustainability Engagement",
        description: "Engage suppliers in sustainability initiatives and establish supplier sustainability requirements.",
        category: "Supply Chain",
        difficulty: "Hard",
        applicableSizes: [CompanySize.ENTERPRISE],
        costSavingsFactor: 0.08,
        co2ReductionFactor: 0.25,
        baseRoiMonths: 48,
        implementationCostFactor: 2.5,
        basePriority: 0.6
      },
      {
        ruleId: "enterprise_innovation_lab",
        title: "Sustainability Innovation Lab",
        description: "Establish dedicated R&D team for sustainability innovation and clean technology development.",
        category: "Innovation",
        difficulty: "Hard",
        applicableSizes: [CompanySize.ENTERPRISE],
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.30,
        baseRoiMonths: 72,
        implementationCostFactor: 4.0,
        basePriority: 0.7
      }
    ];
  }
  
  private createGoalSpecificRules(): RecommendationRule[] {
    return [
      // Renewable Energy Goals
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
        ruleId: "wind_energy_small",
        title: "Small Wind Energy System",
        description: "Install small-scale wind turbines for on-site renewable energy generation where wind conditions are favorable.",
        category: "Renewable Energy",
        difficulty: "Hard",
        requiredGoals: [GoalCategory.RENEWABLE_ENERGY],
        minKwh: 3000,
        applicableSizes: [CompanySize.LARGE, CompanySize.ENTERPRISE],
        costSavingsFactor: 0.25,
        co2ReductionFactor: 0.35,
        baseRoiMonths: 72,
        implementationCostFactor: 5.0,
        basePriority: 0.6
      },
      {
        ruleId: "geothermal_heating",
        title: "Geothermal Heating and Cooling",
        description: "Install geothermal heat pump system for efficient heating and cooling using earth's natural temperature.",
        category: "Renewable Energy",
        difficulty: "Hard",
        requiredGoals: [GoalCategory.RENEWABLE_ENERGY],
        minTherms: 100,
        costSavingsFactor: 0.40,
        co2ReductionFactor: 0.50,
        baseRoiMonths: 84,
        implementationCostFactor: 6.0,
        basePriority: 0.7
      },
      {
        ruleId: "green_energy_procurement",
        title: "Renewable Energy Procurement",
        description: "Purchase renewable energy credits (RECs) or sign power purchase agreements (PPAs) for clean energy.",
        category: "Renewable Energy",
        difficulty: "Easy",
        requiredGoals: [GoalCategory.RENEWABLE_ENERGY],
        minKwh: 1000,
        costSavingsFactor: 0.05,
        co2ReductionFactor: 0.60,
        baseRoiMonths: 12,
        implementationCostFactor: 0.2,
        basePriority: 0.8
      },
      
      // Waste Reduction Goals
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
        ruleId: "circular_economy_program",
        title: "Circular Economy Implementation",
        description: "Design products and processes for reuse, refurbishment, and recycling to eliminate waste.",
        category: "Waste Reduction",
        difficulty: "Hard",
        requiredGoals: [GoalCategory.WASTE_REDUCTION],
        applicableIndustries: [IndustryType.MANUFACTURING, IndustryType.TECHNOLOGY],
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.20,
        baseRoiMonths: 36,
        implementationCostFactor: 2.5,
        basePriority: 0.7
      },
      {
        ruleId: "food_waste_reduction",
        title: "Food Waste Reduction Program",
        description: "Implement food donation programs, composting, and portion optimization to reduce food waste.",
        category: "Waste Reduction",
        difficulty: "Medium",
        requiredGoals: [GoalCategory.WASTE_REDUCTION],
        applicableIndustries: [IndustryType.HOSPITALITY, IndustryType.RETAIL, IndustryType.EDUCATION],
        costSavingsFactor: 0.12,
        co2ReductionFactor: 0.15,
        baseRoiMonths: 12,
        implementationCostFactor: 0.8,
        basePriority: 0.8
      },
      
      // Transportation Goals
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
      },
      {
        ruleId: "fleet_electrification",
        title: "Fleet Vehicle Electrification",
        description: "Replace gas-powered company vehicles with electric or hybrid alternatives and install charging infrastructure.",
        category: "Transportation",
        difficulty: "Hard",
        requiredGoals: [GoalCategory.TRANSPORTATION],
        applicableSizes: [CompanySize.MEDIUM, CompanySize.LARGE, CompanySize.ENTERPRISE],
        costSavingsFactor: 0.20,
        co2ReductionFactor: 0.30,
        baseRoiMonths: 60,
        implementationCostFactor: 3.5,
        basePriority: 0.7
      },
      {
        ruleId: "telecommuting_program",
        title: "Remote Work and Telecommuting Program",
        description: "Implement flexible work arrangements to reduce employee commuting and office energy consumption.",
        category: "Transportation",
        difficulty: "Easy",
        requiredGoals: [GoalCategory.TRANSPORTATION],
        costSavingsFactor: 0.08,
        co2ReductionFactor: 0.12,
        baseRoiMonths: 6,
        implementationCostFactor: 0.3,
        basePriority: 0.9
      },
      
      // Water Conservation Goals
      {
        ruleId: "water_efficiency_upgrade",
        title: "Water Efficiency Upgrades",
        description: "Install low-flow fixtures, smart irrigation systems, and water recycling systems to reduce consumption.",
        category: "Water Conservation",
        difficulty: "Medium",
        requiredGoals: [GoalCategory.WATER_CONSERVATION],
        costSavingsFactor: 0.15,
        co2ReductionFactor: 0.05,
        baseRoiMonths: 30,
        implementationCostFactor: 1.5,
        basePriority: 0.6
      },
      {
        ruleId: "rainwater_harvesting",
        title: "Rainwater Harvesting System",
        description: "Install rainwater collection and storage systems for irrigation and non-potable water uses.",
        category: "Water Conservation",
        difficulty: "Medium",
        requiredGoals: [GoalCategory.WATER_CONSERVATION],
        costSavingsFactor: 0.10,
        co2ReductionFactor: 0.03,
        baseRoiMonths: 48,
        implementationCostFactor: 2.0,
        basePriority: 0.5
      },
      
      // Green Building Goals
      {
        ruleId: "leed_certification",
        title: "LEED Building Certification",
        description: "Pursue LEED certification through comprehensive green building improvements and sustainable practices.",
        category: "Green Building",
        difficulty: "Hard",
        requiredGoals: [GoalCategory.GREEN_BUILDING],
        minKwh: 2000,
        costSavingsFactor: 0.20,
        co2ReductionFactor: 0.25,
        baseRoiMonths: 60,
        implementationCostFactor: 4.0,
        basePriority: 0.8
      },
      {
        ruleId: "green_roof_installation",
        title: "Green Roof Installation",
        description: "Install vegetated roof systems to improve insulation, reduce stormwater runoff, and enhance air quality.",
        category: "Green Building",
        difficulty: "Hard",
        requiredGoals: [GoalCategory.GREEN_BUILDING],
        costSavingsFactor: 0.08,
        co2ReductionFactor: 0.12,
        baseRoiMonths: 84,
        implementationCostFactor: 5.0,
        basePriority: 0.6
      },
      
      // Supply Chain Goals
      {
        ruleId: "sustainable_sourcing",
        title: "Sustainable Supply Chain Sourcing",
        description: "Implement supplier sustainability requirements and local sourcing programs to reduce transportation emissions.",
        category: "Supply Chain",
        difficulty: "Medium",
        requiredGoals: [GoalCategory.SUPPLY_CHAIN],
        costSavingsFactor: 0.05,
        co2ReductionFactor: 0.15,
        baseRoiMonths: 24,
        implementationCostFactor: 1.0,
        basePriority: 0.7
      },
      {
        ruleId: "vendor_sustainability_program",
        title: "Vendor Sustainability Assessment Program",
        description: "Establish sustainability criteria for vendor selection and ongoing performance monitoring.",
        category: "Supply Chain",
        difficulty: "Medium",
        requiredGoals: [GoalCategory.SUPPLY_CHAIN],
        applicableSizes: [CompanySize.LARGE, CompanySize.ENTERPRISE],
        costSavingsFactor: 0.08,
        co2ReductionFactor: 0.12,
        baseRoiMonths: 30,
        implementationCostFactor: 1.2,
        basePriority: 0.6
      }
    ];
  }
  
  private initializeRegionalFactors(): Record<string, Record<string, number>> {
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
  
  generateRecommendations(businessData: BusinessData): RuleRecommendation[] {
    // Analyze business data
    const industry = BusinessDataAnalyzer.categorizeIndustry(businessData.industry);
    const companySize = BusinessDataAnalyzer.categorizeCompanySize(businessData.size);
    const goals = BusinessDataAnalyzer.categorizeGoals(businessData.sustainabilityGoals);
    
    const applicableRules: RecommendationRule[] = [];
    
    // Filter rules based on business data
    for (const rule of this.rules) {
      if (this.isRuleApplicable(rule, businessData, industry, companySize, goals)) {
        applicableRules.push(rule);
      }
    }
    
    // Generate recommendations from applicable rules
    const recommendations: RuleRecommendation[] = [];
    for (const rule of applicableRules) {
      const rec = this.createRecommendationFromRule(rule, businessData);
      recommendations.push(rec);
    }
    
    // Sort by priority score and return top recommendations
    recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
    return recommendations.slice(0, 8); // Return top 8 recommendations
  }
  
  private isRuleApplicable(
    rule: RecommendationRule,
    businessData: BusinessData,
    industry: IndustryType,
    companySize: CompanySize,
    goals: GoalCategory[]
  ): boolean {
    // Check energy usage thresholds
    if (rule.minKwh && businessData.monthlyKwh < rule.minKwh) {
      console.log(`Rule ${rule.ruleId} skipped: monthlyKwh ${businessData.monthlyKwh} < ${rule.minKwh}`);
      return false;
    }
    if (rule.maxKwh && businessData.monthlyKwh > rule.maxKwh) {
      console.log(`Rule ${rule.ruleId} skipped: monthlyKwh ${businessData.monthlyKwh} > ${rule.maxKwh}`);
      return false;
    }
    if (rule.minTherms && businessData.monthlyTherms < rule.minTherms) {
      console.log(`Rule ${rule.ruleId} skipped: monthlyTherms ${businessData.monthlyTherms} < ${rule.minTherms}`);
      return false;
    }
    if (rule.maxTherms && businessData.monthlyTherms > rule.maxTherms) {
      console.log(`Rule ${rule.ruleId} skipped: monthlyTherms ${businessData.monthlyTherms} > ${rule.maxTherms}`);
      return false;
    }
    
    // Check industry applicability
    if (rule.applicableIndustries && !rule.applicableIndustries.includes(industry)) {
      console.log(`Rule ${rule.ruleId} skipped: industry ${industry} not in ${rule.applicableIndustries}`);
      return false;
    }
    
    // Check company size applicability
    if (rule.applicableSizes && !rule.applicableSizes.includes(companySize)) {
      console.log(`Rule ${rule.ruleId} skipped: company size ${companySize} not in ${rule.applicableSizes}`);
      return false;
    }
    
    // Check required goals
    if (rule.requiredGoals && !rule.requiredGoals.some(goal => goals.includes(goal))) {
      console.log(`Rule ${rule.ruleId} skipped: goals do not include any of ${rule.requiredGoals}`);
      return false;
    }
    
    console.log(`Rule ${rule.ruleId} is applicable.`);
    return true;
  }
  
  private createRecommendationFromRule(rule: RecommendationRule, businessData: BusinessData): RuleRecommendation {
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
  
  private getRegionalFactor(factorType: string, location: string): number {
    const locationLower = location.toLowerCase();
    const factors = this.regionalFactors[factorType] || {};
    
    for (const [region, factor] of Object.entries(factors)) {
      if (region !== 'default' && locationLower.includes(region)) {
        return factor;
      }
    }
    
    return factors.default || 1.0;
  }
  
  private calculatePriorityScore(
    rule: RecommendationRule,
    businessData: BusinessData,
    estimatedSavings: number,
    roiMonths: number
  ): number {
    // Start with base priority
    let priority = rule.basePriority;
    
    // ROI bonus (shorter ROI = higher priority)
    if (roiMonths <= 12) {
      priority += 0.2;
    } else if (roiMonths <= 24) {
      priority += 0.1;
    } else if (roiMonths > 48) {
      priority -= 0.1;
    }
    
    // Savings bonus (higher savings = higher priority)
    if (estimatedSavings > 10000) {
      priority += 0.15;
    } else if (estimatedSavings > 5000) {
      priority += 0.1;
    } else if (estimatedSavings > 2000) {
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

// Create and export singleton instance
export const rulesEngine = new RulesBasedRecommendationEngine(); 