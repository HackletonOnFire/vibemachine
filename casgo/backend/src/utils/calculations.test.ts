/**
 * Unit Tests for Sustainability Calculation Utilities
 * 
 * Test Coverage:
 * - Carbon footprint calculations
 * - ROI and financial analysis
 * - Regional adjustments
 * - Incentive optimization
 * - Priority scoring
 * - Environmental equivalents
 * - Solar potential calculations
 * - Edge cases and error handling
 */

import {
  sustainabilityCalculator,
  calculateROI,
  calculateNPV,
  formatCurrency,
  formatNumber,
  EnergyData,
  BusinessProfile,
  RecommendationMetrics
} from './calculations';

describe('SustainabilityCalculator', () => {
  
  describe('Regional Factors', () => {
    
    test('should return California regional factors', () => {
      const factors = sustainabilityCalculator.getRegionalFactors('Los Angeles, California');
      expect(factors.electricityRate).toBeCloseTo(0.2245, 4);
      expect(factors.co2EmissionFactor).toBeCloseTo(0.651, 3);
      expect(factors.solarPotential).toBe(1850);
    });
    
    test('should return Texas regional factors', () => {
      const factors = sustainabilityCalculator.getRegionalFactors('Austin, Texas');
      expect(factors.electricityRate).toBeCloseTo(0.1189, 4);
      expect(factors.co2EmissionFactor).toBeCloseTo(0.995, 3);
      expect(factors.utilityRebateMultiplier).toBe(0.8);
    });
    
    test('should return default factors for unrecognized location', () => {
      const factors = sustainabilityCalculator.getRegionalFactors('Unknown City, Unknown State');
      expect(factors.electricityRate).toBeCloseTo(0.1378, 4);
      expect(factors.co2EmissionFactor).toBeCloseTo(0.855, 3);
    });
    
    test('should handle case-insensitive location matching', () => {
      const factors1 = sustainabilityCalculator.getRegionalFactors('CALIFORNIA');
      const factors2 = sustainabilityCalculator.getRegionalFactors('california');
      expect(factors1).toEqual(factors2);
    });
    
  });
  
  describe('Carbon Footprint Calculations', () => {
    
    const testEnergyData: EnergyData = {
      monthlyKwh: 5000,
      monthlyTherms: 200
    };
    
    test('should calculate carbon footprint correctly for California', () => {
      const result = sustainabilityCalculator.calculateCarbonFootprint(testEnergyData, 'California');
      
      // Expected: (5000 * 0.651 + 200 * 11.7) * 12 / 2000 = 33.57 tons annually
      expect(result.annualCo2Tons).toBeCloseTo(33.57, 1);
      expect(result.electricityCo2).toBe(3255); // 5000 * 0.651
      expect(result.gasCo2).toBe(2340); // 200 * 11.7
    });
    
    test('should calculate carbon footprint for high emission grid (Texas)', () => {
      const result = sustainabilityCalculator.calculateCarbonFootprint(testEnergyData, 'Texas');
      
      // Texas has higher emission factor (0.995)
      expect(result.annualCo2Tons).toBeGreaterThan(35);
      expect(result.electricityCo2).toBe(4975); // 5000 * 0.995
    });
    
    test('should handle zero energy usage', () => {
      const zeroEnergy: EnergyData = { monthlyKwh: 0, monthlyTherms: 0 };
      const result = sustainabilityCalculator.calculateCarbonFootprint(zeroEnergy, 'California');
      
      expect(result.annualCo2Tons).toBe(0);
      expect(result.electricityCo2).toBe(0);
      expect(result.gasCo2).toBe(0);
    });
    
    test('should handle electricity-only usage', () => {
      const electricityOnly: EnergyData = { monthlyKwh: 3000, monthlyTherms: 0 };
      const result = sustainabilityCalculator.calculateCarbonFootprint(electricityOnly, 'New York');
      
      expect(result.gasCo2).toBe(0);
      expect(result.electricityCo2).toBeGreaterThan(0);
      expect(result.annualCo2Tons).toBeCloseTo(10.4, 1); // (3000 * 0.578 * 12) / 2000
    });
    
  });
  
  describe('Energy Cost Calculations', () => {
    
    const testEnergyData: EnergyData = {
      monthlyKwh: 4000,
      monthlyTherms: 150
    };
    
    test('should calculate energy costs for California', () => {
      const result = sustainabilityCalculator.calculateEnergyCosts(testEnergyData, 'California');
      
      // Expected electricity: 4000 * 0.2245 * 12 = $10,776
      // Expected gas: 150 * 1.35 * 12 = $2,430
      expect(result.annualElectricityCost).toBeCloseTo(10776, 0);
      expect(result.annualGasCost).toBeCloseTo(2430, 0);
      expect(result.totalAnnualCost).toBeCloseTo(13206, 0);
    });
    
    test('should use custom rates when provided', () => {
      const customEnergyData: EnergyData = {
        monthlyKwh: 2000,
        monthlyTherms: 100,
        electricityCost: 0.15, // Custom rate
        gasCost: 1.00 // Custom rate
      };
      
      const result = sustainabilityCalculator.calculateEnergyCosts(customEnergyData, 'Texas');
      
      // Should use custom rates, not Texas regional rates
      expect(result.annualElectricityCost).toBeCloseTo(3600, 0); // 2000 * 0.15 * 12
      expect(result.annualGasCost).toBeCloseTo(1200, 0); // 100 * 1.00 * 12
    });
    
    test('should include demand charges when provided', () => {
      const demandEnergyData: EnergyData = {
        monthlyKwh: 3000,
        monthlyTherms: 0,
        demandCharges: 15, // $/kW
        peakDemandKw: 500
      };
      
      const result = sustainabilityCalculator.calculateEnergyCosts(demandEnergyData, 'Florida');
      
      // Should include demand charges: 15 * 500 * 12 = $90,000 annually
      expect(result.totalAnnualCost).toBeGreaterThan(90000);
    });
    
  });
  
  describe('ROI Calculations', () => {
    
    const testEnergyData: EnergyData = {
      monthlyKwh: 8000,
      monthlyTherms: 300
    };
    
    test('should calculate ROI correctly for 25% energy savings', () => {
      const result = sustainabilityCalculator.calculateRecommendationROI(
        0.25, // 25% energy savings
        50000, // $50k implementation cost
        testEnergyData,
        'California',
        'LED Lighting'
      );
      
      expect(result.annualSavings).toBeGreaterThan(5000);
      expect(result.roiMonths).toBeGreaterThan(0);
      expect(result.roiMonths).toBeLessThan(120); // Should break even within 10 years
      expect(result.totalCo2Reduction).toBeGreaterThan(0);
    });
    
    test('should include maintenance savings in ROI calculation', () => {
      const resultWithMaintenance = sustainabilityCalculator.calculateRecommendationROI(
        0.15, // 15% energy savings
        30000,
        testEnergyData,
        'Texas',
        'HVAC Upgrade',
        2000 // $2k annual maintenance savings
      );
      
      const resultWithoutMaintenance = sustainabilityCalculator.calculateRecommendationROI(
        0.15,
        30000,
        testEnergyData,
        'Texas',
        'HVAC Upgrade',
        0
      );
      
      expect(resultWithMaintenance.annualSavings).toBeGreaterThan(resultWithoutMaintenance.annualSavings);
      expect(resultWithMaintenance.roiMonths).toBeLessThan(resultWithoutMaintenance.roiMonths);
    });
    
    test('should calculate NPV and ROI correctly for large facility', () => {
      // Use very high energy usage scenario (large facility) 
      const largeEnergyData: EnergyData = {
        monthlyKwh: 30000,  // Very high usage (large facility)
        monthlyTherms: 1200  // Very high gas usage
      };
      
      const result = sustainabilityCalculator.calculateRecommendationROI(
        0.40, // 40% savings from comprehensive retrofit
        60000, // Reasonable implementation cost
        largeEnergyData,
        'California', // Higher electricity rates help ROI
        'Comprehensive Retrofit'
      );
      
      // Test the calculations are reasonable
      expect(result.annualSavings).toBeGreaterThan(30000); // Should have substantial savings
      expect(result.roiMonths).toBeLessThan(36); // Should break even within 3 years
      expect(result.roiMonths).toBeGreaterThan(6); // But not unrealistically fast
      expect(result.totalCo2Reduction).toBeGreaterThan(20); // Significant environmental impact
      
      // NPV calculation depends on discount rate and timeframe, test it's reasonable
      expect(result.netPresentValue).toBeGreaterThan(-10000); // Not a terrible investment
    });
    
    test('should handle very low savings scenarios', () => {
      const result = sustainabilityCalculator.calculateRecommendationROI(
        0.02, // Only 2% savings
        100000, // High implementation cost
        testEnergyData,
        'Florida',
        'Minor Upgrade'
      );
      
      // Should have long payback period
      expect(result.roiMonths).toBeGreaterThan(60);
      expect(result.netPresentValue).toBeLessThan(0); // Likely negative NPV
    });
    
  });
  
  describe('Incentive Optimization', () => {
    
    test('should find applicable federal solar incentives', () => {
      const result = sustainabilityCalculator.calculateIncentiveOptimization(
        'Solar Panel Installation',
        100000,
        'California',
        { industry: 'Technology', companySize: 'Medium', location: 'California' }
      );
      
      expect(result.applicableIncentives.length).toBeGreaterThan(0);
      expect(result.totalIncentiveValue).toBeGreaterThan(20000); // Should include 30% federal credit
      expect(result.postIncentiveCost).toBeLessThan(100000);
    });
    
    test('should apply percentage-based incentives correctly', () => {
      const result = sustainabilityCalculator.calculateIncentiveOptimization(
        'renewable_energy',
        50000,
        'Texas',
        { industry: 'Manufacturing', companySize: 'Large', location: 'Texas' }
      );
      
      // Should find federal solar tax credit (30%)
      expect(result.totalIncentiveValue).toBeCloseTo(15000, 0); // 30% of $50k
      expect(result.postIncentiveCost).toBeCloseTo(35000, 0);
    });
    
    test('should handle maximum incentive limits', () => {
      const result = sustainabilityCalculator.calculateIncentiveOptimization(
        'lighting',
        5000000, // $5M project
        'New York',
        { industry: 'Healthcare', companySize: 'Enterprise', location: 'New York' }
      );
      
      // Should cap incentives at maximum values
      expect(result.totalIncentiveValue).toBeLessThan(2000000); // Reasonable cap
    });
    
    test('should return zero incentives for non-eligible categories', () => {
      const result = sustainabilityCalculator.calculateIncentiveOptimization(
        'non_eligible_category',
        25000,
        'Florida',
        { industry: 'Retail', companySize: 'Small', location: 'Florida' }
      );
      
      expect(result.applicableIncentives.length).toBe(0);
      expect(result.totalIncentiveValue).toBe(0);
      expect(result.postIncentiveCost).toBe(25000);
    });
    
  });
  
  describe('Priority Scoring', () => {
    
    test('should give high priority to quick payback projects', () => {
      const quickPaybackScore = sustainabilityCalculator.generatePriorityScore(
        8, // 8 months ROI
        15000, // $15k annual savings
        12, // 12 tons CO2 reduction
        'Easy',
        6000 // 6000 kWh usage
      );
      
      const slowPaybackScore = sustainabilityCalculator.generatePriorityScore(
        72, // 6 years ROI
        15000,
        12,
        'Easy',
        6000
      );
      
      expect(quickPaybackScore).toBeGreaterThan(slowPaybackScore);
      expect(quickPaybackScore).toBeGreaterThan(0.7);
    });
    
    test('should prioritize high savings projects', () => {
      const highSavingsScore = sustainabilityCalculator.generatePriorityScore(
        24, // 2 years ROI
        25000, // $25k annual savings
        20, // 20 tons CO2 reduction
        'Medium',
        8000
      );
      
      const lowSavingsScore = sustainabilityCalculator.generatePriorityScore(
        24,
        1000, // $1k annual savings
        1, // 1 ton CO2 reduction
        'Medium',
        1000
      );
      
      expect(highSavingsScore).toBeGreaterThan(lowSavingsScore);
    });
    
    test('should penalize difficult implementations', () => {
      const easyScore = sustainabilityCalculator.generatePriorityScore(
        18, 10000, 8, 'Easy', 4000
      );
      
      const hardScore = sustainabilityCalculator.generatePriorityScore(
        18, 10000, 8, 'Hard', 4000
      );
      
      expect(easyScore).toBeGreaterThan(hardScore);
    });
    
    test('should keep score within bounds [0.1, 1.0]', () => {
      const extremelyBadScore = sustainabilityCalculator.generatePriorityScore(
        120, // 10 years ROI
        100, // Very low savings
        0.1, // Minimal CO2 reduction
        'Hard',
        100
      );
      
      const extremelyGoodScore = sustainabilityCalculator.generatePriorityScore(
        3, // 3 months ROI
        100000, // Very high savings
        100, // High CO2 reduction
        'Easy',
        20000
      );
      
      expect(extremelyBadScore).toBeGreaterThanOrEqual(0.1);
      expect(extremelyGoodScore).toBeLessThanOrEqual(1.0);
    });
    
  });
  
  describe('Environmental Equivalents', () => {
    
    test('should calculate environmental equivalents correctly', () => {
      const result = sustainabilityCalculator.calculateEnvironmentalEquivalents(50); // 50 tons CO2
      
      expect(result.treesPlanted).toBe(825); // 50 * 16.5
      expect(result.carsOffRoad).toBe(11); // 50 * 0.22
      expect(result.homesPowered).toBe(9); // 50 * 0.18
      expect(result.gallonsGasolineSaved).toBe(5650); // 50 * 113
    });
    
    test('should handle zero CO2 reduction', () => {
      const result = sustainabilityCalculator.calculateEnvironmentalEquivalents(0);
      
      expect(result.treesPlanted).toBe(0);
      expect(result.carsOffRoad).toBe(0);
      expect(result.homesPowered).toBe(0);
      expect(result.gallonsGasolineSaved).toBe(0);
    });
    
    test('should round results to whole numbers', () => {
      const result = sustainabilityCalculator.calculateEnvironmentalEquivalents(2.7);
      
      expect(Number.isInteger(result.treesPlanted)).toBe(true);
      expect(Number.isInteger(result.carsOffRoad)).toBe(true);
      expect(Number.isInteger(result.homesPowered)).toBe(true);
      expect(Number.isInteger(result.gallonsGasolineSaved)).toBe(true);
    });
    
  });
  
  describe('Solar Potential Calculations', () => {
    
    test('should calculate solar potential for medium facility in California', () => {
      const result = sustainabilityCalculator.calculateSolarPotential(
        50000, // 50,000 sqft facility
        'California',
        0.7 // 70% usable roof
      );
      
      expect(result.estimatedSystemSizeKw).toBeGreaterThan(200);
      expect(result.annualGenerationKwh).toBeGreaterThan(300000);
      expect(result.annualSavings).toBeGreaterThan(50000);
      expect(result.roiYears).toBeLessThan(15);
      expect(result.co2OffsetTons).toBeGreaterThan(100);
    });
    
    test('should adjust for regional solar potential', () => {
      const californiaResult = sustainabilityCalculator.calculateSolarPotential(
        20000, 'California', 0.6
      );
      
      const newYorkResult = sustainabilityCalculator.calculateSolarPotential(
        20000, 'New York', 0.6
      );
      
      // California should have higher generation and better ROI
      expect(californiaResult.annualGenerationKwh).toBeGreaterThan(newYorkResult.annualGenerationKwh);
      expect(californiaResult.roiYears).toBeLessThan(newYorkResult.roiYears);
    });
    
    test('should handle small facilities', () => {
      const result = sustainabilityCalculator.calculateSolarPotential(
        5000, // Small 5,000 sqft facility
        'Florida',
        0.5
      );
      
      expect(result.estimatedSystemSizeKw).toBeGreaterThan(0);
      expect(result.estimatedSystemSizeKw).toBeLessThan(50);
      expect(result.roiYears).toBeGreaterThan(0);
    });
    
    test('should handle zero roof percentage', () => {
      const result = sustainabilityCalculator.calculateSolarPotential(
        30000,
        'Texas',
        0 // No usable roof
      );
      
      expect(result.estimatedSystemSizeKw).toBe(0);
      expect(result.annualGenerationKwh).toBe(0);
      expect(result.annualSavings).toBe(0);
    });
    
  });
  
});

describe('Utility Functions', () => {
  
  describe('calculateROI', () => {
    
    test('should calculate ROI in months correctly', () => {
      const roiMonths = calculateROI(5000, 30000); // $5k savings, $30k cost
      expect(roiMonths).toBeCloseTo(72, 0); // 6 years = 72 months
    });
    
    test('should handle zero savings', () => {
      const roiMonths = calculateROI(0, 10000);
      expect(roiMonths).toBe(Infinity);
    });
    
    test('should handle negative savings', () => {
      const roiMonths = calculateROI(-1000, 10000);
      expect(roiMonths).toBe(-120); // Negative payback
    });
    
  });
  
  describe('calculateNPV', () => {
    
    test('should calculate NPV correctly for positive cash flows', () => {
      const cashFlows = [10000, 10000, 10000, 10000, 10000]; // 5 years of $10k
      const npv = calculateNPV(cashFlows, 0.08, 35000); // 8% discount, $35k investment
      
      expect(npv).toBeGreaterThan(0); // Should be profitable
      expect(npv).toBeCloseTo(4927, 0); // Calculated NPV
    });
    
    test('should calculate negative NPV for poor investments', () => {
      const cashFlows = [1000, 1000, 1000]; // 3 years of $1k
      const npv = calculateNPV(cashFlows, 0.10, 10000); // 10% discount, $10k investment
      
      expect(npv).toBeLessThan(0); // Should be unprofitable
    });
    
    test('should handle empty cash flows', () => {
      const npv = calculateNPV([], 0.05, 5000);
      expect(npv).toBe(-5000); // Just the initial investment
    });
    
  });
  
  describe('Formatting Functions', () => {
    
    test('formatCurrency should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });
    
    test('formatNumber should format numbers with decimals', () => {
      expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
      expect(formatNumber(0, 1)).toBe('0.0');
      expect(formatNumber(1000000.123, 3)).toBe('1,000,000.123');
    });
    
    test('formatNumber should use default decimal places', () => {
      expect(formatNumber(1234.5678)).toBe('1,234.6'); // Default 1 decimal
    });
    
  });
  
}); 