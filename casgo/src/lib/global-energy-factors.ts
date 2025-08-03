// Global Energy Factors Database
// Comprehensive database of energy costs, emissions, and regional factors worldwide

export interface GlobalRegionalFactors {
  electricityRate: number;        // Local currency per kWh, converted to USD
  electricityRateLocal: number;   // Local currency per kWh
  currency: string;               // Local currency code
  gasRate?: number;               // USD per therm (where applicable)
  co2EmissionFactor: number;      // kg CO2/kWh (standardized to metric)
  gasEmissionFactor?: number;     // kg CO2/therm (where applicable)
  solarPotential: number;         // kWh/kW/year
  heatingDegreeDays: number;      // Annual heating degree days
  coolingDegreeDays: number;      // Annual cooling degree days
  utilityRebateMultiplier: number; // Local incentive availability
  laborCostMultiplier: number;    // Relative installation costs
  gridCleanlinessScore: number;   // 0-100, higher = cleaner grid
  energySecurityIndex: number;    // 0-100, higher = more secure
  renewablePercentage: number;    // % of grid from renewables
  countryCode: string;            // ISO country code
  region: string;                 // Geographical region
}

export const GLOBAL_ENERGY_FACTORS: Record<string, GlobalRegionalFactors> = {
  // === INDIA ===
  'mumbai': {
    electricityRate: 0.080,         // ~₹6.5/kWh
    electricityRateLocal: 6.5,
    currency: 'INR',
    gasRate: 0.65,                  // Limited LPG availability
    co2EmissionFactor: 0.82,        // kg CO2/kWh (India grid average)
    gasEmissionFactor: 2.3,         // kg CO2/therm
    solarPotential: 1900,           // Excellent solar potential
    heatingDegreeDays: 200,         // Minimal heating needs
    coolingDegreeDays: 3200,        // High cooling demand
    utilityRebateMultiplier: 1.2,   // Strong solar incentives
    laborCostMultiplier: 0.3,       // Low labor costs
    gridCleanlinessScore: 45,       // Coal-heavy grid
    energySecurityIndex: 65,
    renewablePercentage: 18,
    countryCode: 'IN',
    region: 'South Asia'
  },
  
  'delhi': {
    electricityRate: 0.075,
    electricityRateLocal: 6.0,
    currency: 'INR',
    gasRate: 0.70,
    co2EmissionFactor: 0.85,
    gasEmissionFactor: 2.3,
    solarPotential: 1850,
    heatingDegreeDays: 800,         // Some winter heating
    coolingDegreeDays: 3500,        // Very high cooling demand
    utilityRebateMultiplier: 1.3,   // Delhi solar policy
    laborCostMultiplier: 0.35,
    gridCleanlinessScore: 42,
    energySecurityIndex: 68,
    renewablePercentage: 15,
    countryCode: 'IN',
    region: 'South Asia'
  },
  
  'madurai': {
    electricityRate: 0.078,         // Tamil Nadu rates
    electricityRateLocal: 6.2,
    currency: 'INR',
    gasRate: 0.60,                  // Limited gas infrastructure
    co2EmissionFactor: 0.78,        // Tamil Nadu has more renewables
    gasEmissionFactor: 2.3,
    solarPotential: 2050,           // Excellent solar in Tamil Nadu
    heatingDegreeDays: 0,           // No heating needed
    coolingDegreeDays: 3800,        // Very high cooling demand
    utilityRebateMultiplier: 1.4,   // Strong state solar incentives
    laborCostMultiplier: 0.28,      // Lower rural labor costs
    gridCleanlinessScore: 52,       // Better renewable mix
    energySecurityIndex: 62,
    renewablePercentage: 22,
    countryCode: 'IN',
    region: 'South Asia'
  },
  
  'bangalore': {
    electricityRate: 0.082,
    electricityRateLocal: 6.8,
    currency: 'INR',
    gasRate: 0.65,
    co2EmissionFactor: 0.80,
    gasEmissionFactor: 2.3,
    solarPotential: 1950,
    heatingDegreeDays: 100,
    coolingDegreeDays: 2200,        // Moderate climate
    utilityRebateMultiplier: 1.3,
    laborCostMultiplier: 0.32,
    gridCleanlinessScore: 48,
    energySecurityIndex: 66,
    renewablePercentage: 20,
    countryCode: 'IN',
    region: 'South Asia'
  },
  
  // === EUROPE ===
  'london': {
    electricityRate: 0.35,          // £0.28/kWh
    electricityRateLocal: 0.28,
    currency: 'GBP',
    gasRate: 1.20,
    co2EmissionFactor: 0.233,       // UK grid is quite clean
    gasEmissionFactor: 2.0,
    solarPotential: 950,            // Limited solar potential
    heatingDegreeDays: 3500,        // High heating demand
    coolingDegreeDays: 200,         // Minimal cooling
    utilityRebateMultiplier: 1.1,
    laborCostMultiplier: 1.8,       // High labor costs
    gridCleanlinessScore: 78,       // Clean UK grid
    energySecurityIndex: 72,
    renewablePercentage: 43,
    countryCode: 'GB',
    region: 'Europe'
  },
  
  'berlin': {
    electricityRate: 0.42,          // €0.38/kWh
    electricityRateLocal: 0.38,
    currency: 'EUR',
    gasRate: 1.35,
    co2EmissionFactor: 0.401,       // Germany grid mix
    gasEmissionFactor: 2.0,
    solarPotential: 1100,
    heatingDegreeDays: 3800,
    coolingDegreeDays: 300,
    utilityRebateMultiplier: 1.3,   // Strong German incentives
    laborCostMultiplier: 1.6,
    gridCleanlinessScore: 65,
    energySecurityIndex: 75,
    renewablePercentage: 46,
    countryCode: 'DE',
    region: 'Europe'
  },
  
  // === ASIA-PACIFIC ===
  'tokyo': {
    electricityRate: 0.26,          // ¥28/kWh
    electricityRateLocal: 28,
    currency: 'JPY',
    gasRate: 1.45,
    co2EmissionFactor: 0.518,       // Japan grid mix
    gasEmissionFactor: 2.0,
    solarPotential: 1250,
    heatingDegreeDays: 2200,
    coolingDegreeDays: 1800,
    utilityRebateMultiplier: 1.2,
    laborCostMultiplier: 1.4,
    gridCleanlinessScore: 58,
    energySecurityIndex: 68,
    renewablePercentage: 20,
    countryCode: 'JP',
    region: 'Asia-Pacific'
  },
  
  'singapore': {
    electricityRate: 0.18,          // S$0.24/kWh
    electricityRateLocal: 0.24,
    currency: 'SGD',
    gasRate: 0.85,
    co2EmissionFactor: 0.408,       // Natural gas dominant
    gasEmissionFactor: 2.0,
    solarPotential: 1580,
    heatingDegreeDays: 0,
    coolingDegreeDays: 4500,        // Year-round cooling
    utilityRebateMultiplier: 1.1,
    laborCostMultiplier: 1.2,
    gridCleanlinessScore: 72,       // Clean gas grid
    energySecurityIndex: 85,        // High security
    renewablePercentage: 3,         // Limited renewable space
    countryCode: 'SG',
    region: 'Asia-Pacific'
  },
  
  // === MIDDLE EAST ===
  'dubai': {
    electricityRate: 0.08,          // AED 0.29/kWh
    electricityRateLocal: 0.29,
    currency: 'AED',
    gasRate: 0.45,
    co2EmissionFactor: 0.54,        // Gas + some renewables
    gasEmissionFactor: 2.0,
    solarPotential: 2200,           // Excellent solar potential
    heatingDegreeDays: 100,
    coolingDegreeDays: 4800,        // Extreme cooling demand
    utilityRebateMultiplier: 1.2,   // Growing solar incentives
    laborCostMultiplier: 0.8,
    gridCleanlinessScore: 62,
    energySecurityIndex: 78,
    renewablePercentage: 14,
    countryCode: 'AE',
    region: 'Middle East'
  },
  
  // === US (Keep existing for compatibility) ===
  'california': {
    electricityRate: 0.2245,
    electricityRateLocal: 0.2245,
    currency: 'USD',
    gasRate: 1.35,
    co2EmissionFactor: 0.295,       // Clean CA grid (converted to kg)
    gasEmissionFactor: 2.0,
    solarPotential: 1850,
    heatingDegreeDays: 1500,
    coolingDegreeDays: 1200,
    utilityRebateMultiplier: 1.4,
    laborCostMultiplier: 1.3,
    gridCleanlinessScore: 82,
    energySecurityIndex: 78,
    renewablePercentage: 55,
    countryCode: 'US',
    region: 'North America'
  },
  
  'texas': {
    electricityRate: 0.1189,
    electricityRateLocal: 0.1189,
    currency: 'USD',
    gasRate: 1.12,
    co2EmissionFactor: 0.451,       // Fossil fuel heavy (converted to kg)
    gasEmissionFactor: 2.0,
    solarPotential: 1650,
    heatingDegreeDays: 1600,
    coolingDegreeDays: 2800,
    utilityRebateMultiplier: 0.8,
    laborCostMultiplier: 0.9,
    gridCleanlinessScore: 45,
    energySecurityIndex: 82,
    renewablePercentage: 26,
    countryCode: 'US',
    region: 'North America'
  },
  
  // === DEFAULT (Global Average) ===
  'default': {
    electricityRate: 0.15,          // Global weighted average
    electricityRateLocal: 0.15,
    currency: 'USD',
    gasRate: 1.0,
    co2EmissionFactor: 0.475,       // Global grid average (kg CO2/kWh)
    gasEmissionFactor: 2.0,
    solarPotential: 1400,
    heatingDegreeDays: 2000,
    coolingDegreeDays: 1500,
    utilityRebateMultiplier: 1.0,
    laborCostMultiplier: 1.0,
    gridCleanlinessScore: 55,
    energySecurityIndex: 65,
    renewablePercentage: 28,
    countryCode: 'XX',
    region: 'Global'
  }
};

// Smart location matching function
export function getRegionalFactors(location: string): GlobalRegionalFactors {
  if (!location) return GLOBAL_ENERGY_FACTORS['default'];
  
  const locationLower = location.toLowerCase().trim();
  
  // Direct city matches first
  for (const [region, factors] of Object.entries(GLOBAL_ENERGY_FACTORS)) {
    if (region !== 'default' && locationLower.includes(region)) {
      return factors;
    }
  }
  
  // Country/region fuzzy matching
  const countryMappings: Record<string, string> = {
    'india': 'mumbai',
    'tamil nadu': 'madurai',
    'tamilnadu': 'madurai',
    'karnataka': 'bangalore',
    'maharashtra': 'mumbai',
    'delhi': 'delhi',
    'united kingdom': 'london',
    'england': 'london',
    'uk': 'london',
    'germany': 'berlin',
    'deutschland': 'berlin',
    'japan': 'tokyo',
    'uae': 'dubai',
    'emirates': 'dubai',
    'united arab emirates': 'dubai'
  };
  
  for (const [country, cityKey] of Object.entries(countryMappings)) {
    if (locationLower.includes(country)) {
      return GLOBAL_ENERGY_FACTORS[cityKey];
    }
  }
  
  return GLOBAL_ENERGY_FACTORS['default'];
}

// Helper function to format currency
export function formatLocalCurrency(amount: number, factors: GlobalRegionalFactors): string {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'INR': '₹',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'SGD': 'S$',
    'AED': 'AED '
  };
  
  const symbol = currencySymbols[factors.currency] || factors.currency + ' ';
  const localAmount = amount * (factors.electricityRateLocal / factors.electricityRate);
  
  return `${symbol}${localAmount.toFixed(2)}`;
}

// Helper to get location insights
export function getLocationInsights(location: string): {
  factors: GlobalRegionalFactors;
  insights: string[];
  recommendations: string[];
} {
  const factors = getRegionalFactors(location);
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  // Generate location-specific insights
  if (factors.gridCleanlinessScore > 70) {
    insights.push(`Your region has a clean electricity grid (${factors.renewablePercentage}% renewable)`);
    recommendations.push("Focus on energy efficiency rather than just renewable generation");
  } else if (factors.gridCleanlinessScore < 50) {
    insights.push(`Your grid is carbon-intensive (${factors.renewablePercentage}% renewable)`);
    recommendations.push("Solar panels will have high carbon impact in your region");
  }
  
  if (factors.solarPotential > 1800) {
    insights.push("Excellent solar potential in your location");
    recommendations.push("Solar installation should be a top priority");
  }
  
  if (factors.coolingDegreeDays > 3000) {
    insights.push("High cooling demand in your climate");
    recommendations.push("Focus on efficient HVAC systems and building insulation");
  }
  
  if (factors.electricityRate > 0.25) {
    insights.push("High electricity costs in your region");
    recommendations.push("Energy efficiency measures will have quick payback");
  }
  
  return { factors, insights, recommendations };
} 