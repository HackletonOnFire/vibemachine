"use strict";
/**
 * Comprehensive Calculation Utilities for Sustainability Recommendations
 *
 * Features:
 * - Carbon footprint calculations with emission factors
 * - ROI and payback period analysis
 * - Cost savings calculations with regional adjustments
 * - Tax incentive and rebate optimization
 * - Implementation cost modeling
 * - Energy efficiency calculations
 * - Renewable energy potential assessment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = exports.formatCurrency = exports.calculateNPV = exports.calculateROI = exports.sustainabilityCalculator = exports.SustainabilityCalculator = void 0;
class SustainabilityCalculator {
    constructor() {
        this.regionalFactors = new Map();
        this.industryFactors = new Map();
        this.incentiveDatabase = new Map();
        this.initializeFactors();
    }
    initializeFactors() {
        this.initializeRegionalFactors();
        this.initializeIndustryFactors();
        this.initializeIncentiveDatabase();
    }
    initializeRegionalFactors() {
        // Major US regions with accurate energy data
        this.regionalFactors.set('california', {
            electricityRate: 0.2245, // $/kWh
            gasRate: 1.35, // $/therm
            co2EmissionFactor: 0.651, // lbs CO2/kWh (CA grid is cleaner)
            gasEmissionFactor: 11.7, // lbs CO2/therm
            solarPotential: 1850, // kWh/kW/year
            heatingDegreeDays: 1500,
            coolingDegreeDays: 1200,
            utilityRebateMultiplier: 1.4,
            laborCostMultiplier: 1.3
        });
        this.regionalFactors.set('texas', {
            electricityRate: 0.1189,
            gasRate: 1.12,
            co2EmissionFactor: 0.995, // Higher due to fossil fuel mix
            gasEmissionFactor: 11.7,
            solarPotential: 1650,
            heatingDegreeDays: 1600,
            coolingDegreeDays: 2800,
            utilityRebateMultiplier: 0.8,
            laborCostMultiplier: 0.9
        });
        this.regionalFactors.set('new york', {
            electricityRate: 0.1825,
            gasRate: 1.48,
            co2EmissionFactor: 0.578, // Clean NY grid
            gasEmissionFactor: 11.7,
            solarPotential: 1300,
            heatingDegreeDays: 4800,
            coolingDegreeDays: 900,
            utilityRebateMultiplier: 1.2,
            laborCostMultiplier: 1.4
        });
        this.regionalFactors.set('florida', {
            electricityRate: 0.1147,
            gasRate: 1.25,
            co2EmissionFactor: 0.892,
            gasEmissionFactor: 11.7,
            solarPotential: 1800,
            heatingDegreeDays: 600,
            coolingDegreeDays: 3500,
            utilityRebateMultiplier: 0.9,
            laborCostMultiplier: 0.95
        });
        // Default for unspecified regions
        this.regionalFactors.set('default', {
            electricityRate: 0.1378, // US average
            gasRate: 1.28,
            co2EmissionFactor: 0.855, // US grid average
            gasEmissionFactor: 11.7,
            solarPotential: 1500,
            heatingDegreeDays: 3000,
            coolingDegreeDays: 1500,
            utilityRebateMultiplier: 1.0,
            laborCostMultiplier: 1.0
        });
    }
    initializeIndustryFactors() {
        this.industryFactors.set('technology', {
            energyIntensity: 15.2, // kWh/sqft/year
            hvacShare: 0.45,
            lightingShare: 0.25,
            equipmentShare: 0.30,
            typicalUtilization: 0.65,
            peakDemandFactor: 0.7,
            seasonalVariation: 0.15
        });
        this.industryFactors.set('manufacturing', {
            energyIntensity: 28.5,
            hvacShare: 0.25,
            lightingShare: 0.15,
            equipmentShare: 0.60,
            typicalUtilization: 0.85,
            peakDemandFactor: 0.9,
            seasonalVariation: 0.10
        });
        this.industryFactors.set('retail', {
            energyIntensity: 14.1,
            hvacShare: 0.40,
            lightingShare: 0.35,
            equipmentShare: 0.25,
            typicalUtilization: 0.55,
            peakDemandFactor: 0.6,
            seasonalVariation: 0.25
        });
        this.industryFactors.set('healthcare', {
            energyIntensity: 31.8,
            hvacShare: 0.50,
            lightingShare: 0.20,
            equipmentShare: 0.30,
            typicalUtilization: 0.95,
            peakDemandFactor: 0.85,
            seasonalVariation: 0.05
        });
        this.industryFactors.set('default', {
            energyIntensity: 18.5,
            hvacShare: 0.40,
            lightingShare: 0.25,
            equipmentShare: 0.35,
            typicalUtilization: 0.70,
            peakDemandFactor: 0.75,
            seasonalVariation: 0.20
        });
    }
    initializeIncentiveDatabase() {
        // Federal incentives (available nationwide)
        const federalIncentives = [
            {
                type: 'tax_credit',
                name: 'Commercial Solar Investment Tax Credit',
                value: 30, // 30% through 2032
                percentage: 30,
                description: '30% federal tax credit for commercial solar installations',
                eligibility: ['solar', 'renewable_energy'],
                expirationDate: new Date('2032-12-31'),
                applicationProcess: 'File IRS Form 3468 with tax return'
            },
            {
                type: 'deduction',
                name: 'Section 179D Energy Efficient Commercial Building Deduction',
                value: 1.88, // $/sqft
                maxValue: 1000000,
                description: 'Tax deduction for energy-efficient building improvements',
                eligibility: ['hvac', 'lighting', 'building_envelope'],
                applicationProcess: 'IRS Form 3468 with energy certification'
            },
            {
                type: 'tax_credit',
                name: 'Commercial Energy Efficiency Tax Credit',
                value: 25,
                percentage: 25,
                description: '25% credit for qualifying energy efficiency improvements',
                eligibility: ['hvac', 'lighting', 'building_systems'],
                expirationDate: new Date('2024-12-31'),
                applicationProcess: 'IRS Form 3468'
            }
        ];
        // State-specific incentives
        this.incentiveDatabase.set('california', [
            ...federalIncentives,
            {
                type: 'rebate',
                name: 'Self-Generation Incentive Program (SGIP)',
                value: 150, // $/kWh for battery storage
                description: 'Rebate for energy storage and fuel cell systems',
                eligibility: ['battery_storage', 'fuel_cells'],
                applicationProcess: 'Apply through approved installers'
            },
            {
                type: 'rebate',
                name: 'Energy Efficiency Rebates',
                value: 500, // varies by measure
                description: 'Utility rebates for lighting, HVAC, and motor upgrades',
                eligibility: ['led_lighting', 'hvac', 'motors'],
                applicationProcess: 'Utility pre-approval required'
            }
        ]);
        this.incentiveDatabase.set('texas', [
            ...federalIncentives,
            {
                type: 'loan',
                name: 'Texas LoanSTAR Revolving Loan Program',
                value: 0, // Low interest loans
                description: 'Below-market rate loans for energy efficiency projects',
                eligibility: ['energy_efficiency', 'renewable_energy'],
                applicationProcess: 'Apply through State Energy Conservation Office'
            }
        ]);
        this.incentiveDatabase.set('default', federalIncentives);
    }
    getRegionalFactors(location) {
        const locationKey = location.toLowerCase();
        // Try to match major cities/states
        for (const [region, factors] of this.regionalFactors.entries()) {
            if (region !== 'default' && locationKey.includes(region)) {
                return factors;
            }
        }
        return this.regionalFactors.get('default');
    }
    calculateCarbonFootprint(energy, location) {
        const factors = this.getRegionalFactors(location);
        // Calculate monthly CO2 emissions
        const electricityCo2Lbs = energy.monthlyKwh * factors.co2EmissionFactor;
        const gasCo2Lbs = energy.monthlyTherms * factors.gasEmissionFactor;
        const totalMonthlyLbs = electricityCo2Lbs + gasCo2Lbs;
        // Convert to annual tons
        const annualCo2Tons = (totalMonthlyLbs * 12) / 2000;
        const monthlyCo2Tons = totalMonthlyLbs / 2000;
        return {
            annualCo2Tons: Math.round(annualCo2Tons * 100) / 100,
            monthlyCo2Tons: Math.round(monthlyCo2Tons * 100) / 100,
            electricityCo2: Math.round(electricityCo2Lbs * 100) / 100,
            gasCo2: Math.round(gasCo2Lbs * 100) / 100,
            totalCo2Lbs: Math.round(totalMonthlyLbs * 12 * 100) / 100
        };
    }
    calculateEnergyCosts(energy, location) {
        const factors = this.getRegionalFactors(location);
        const electricityRate = energy.electricityCost || factors.electricityRate;
        const gasRate = energy.gasCost || factors.gasRate;
        const monthlyElectricityCost = energy.monthlyKwh * electricityRate;
        const monthlyGasCost = energy.monthlyTherms * gasRate;
        // Add demand charges if applicable
        const demandCost = energy.demandCharges && energy.peakDemandKw
            ? energy.demandCharges * energy.peakDemandKw
            : 0;
        const totalMonthlyCost = monthlyElectricityCost + monthlyGasCost + demandCost;
        const totalAnnualCost = totalMonthlyCost * 12;
        return {
            annualElectricityCost: Math.round(monthlyElectricityCost * 12 * 100) / 100,
            annualGasCost: Math.round(monthlyGasCost * 12 * 100) / 100,
            totalAnnualCost: Math.round(totalAnnualCost * 100) / 100,
            monthlyElectricityCost: Math.round(monthlyElectricityCost * 100) / 100,
            monthlyGasCost: Math.round(monthlyGasCost * 100) / 100,
            averageRate: Math.round((totalAnnualCost / ((energy.monthlyKwh + energy.monthlyTherms * 3.412) * 12)) * 10000) / 10000
        };
    }
    calculateRecommendationROI(energySavingsPercent, implementationCost, energy, location, category, maintenanceSavings = 0) {
        const costs = this.calculateEnergyCosts(energy, location);
        const carbonData = this.calculateCarbonFootprint(energy, location);
        // Calculate annual savings
        const energySavings = costs.totalAnnualCost * energySavingsPercent;
        const totalAnnualSavings = energySavings + maintenanceSavings;
        // Calculate payback period
        const roiMonths = implementationCost / (totalAnnualSavings / 12);
        // Calculate NPV (assuming 7% discount rate, 10-year analysis)
        const discountRate = 0.07;
        const analysisYears = 10;
        let npv = -implementationCost;
        for (let year = 1; year <= analysisYears; year++) {
            const yearlyBenefit = totalAnnualSavings;
            npv += yearlyBenefit / Math.pow(1 + discountRate, year);
        }
        // Calculate IRR (simplified approximation)
        const irr = (totalAnnualSavings / implementationCost) - 1;
        // Calculate CO2 reduction
        const co2Reduction = carbonData.annualCo2Tons * energySavingsPercent;
        return {
            annualSavings: Math.round(totalAnnualSavings * 100) / 100,
            roiMonths: Math.round(roiMonths * 10) / 10,
            netPresentValue: Math.round(npv * 100) / 100,
            internalRateOfReturn: Math.round(irr * 10000) / 100, // as percentage
            breakEvenYear: Math.round((roiMonths / 12) * 10) / 10,
            totalCo2Reduction: Math.round(co2Reduction * 100) / 100
        };
    }
    calculateIncentiveOptimization(category, implementationCost, location, businessProfile) {
        const incentives = this.incentiveDatabase.get(location.toLowerCase()) ||
            this.incentiveDatabase.get('default');
        const applicableIncentives = incentives.filter(incentive => {
            return incentive.eligibility.some(eligibility => category.toLowerCase().includes(eligibility.toLowerCase()) ||
                eligibility.includes(category.toLowerCase()));
        });
        let totalIncentiveValue = 0;
        for (const incentive of applicableIncentives) {
            if (incentive.percentage) {
                const percentageValue = implementationCost * (incentive.percentage / 100);
                totalIncentiveValue += incentive.maxValue
                    ? Math.min(percentageValue, incentive.maxValue)
                    : percentageValue;
            }
            else {
                totalIncentiveValue += incentive.value;
            }
        }
        const postIncentiveCost = implementationCost - totalIncentiveValue;
        const paybackReduction = totalIncentiveValue / implementationCost;
        return {
            applicableIncentives,
            totalIncentiveValue: Math.round(totalIncentiveValue * 100) / 100,
            postIncentiveCost: Math.round(postIncentiveCost * 100) / 100,
            optimizedPaybackReduction: Math.round(paybackReduction * 1000) / 10 // as percentage
        };
    }
    generatePriorityScore(roiMonths, annualSavings, co2ReductionTons, implementationDifficulty, energyUsage) {
        let score = 0.5; // Base score
        // ROI factor (higher score for faster payback)
        if (roiMonths <= 12)
            score += 0.25;
        else if (roiMonths <= 24)
            score += 0.15;
        else if (roiMonths <= 36)
            score += 0.05;
        else if (roiMonths > 60)
            score -= 0.15;
        // Savings magnitude factor
        if (annualSavings > 20000)
            score += 0.20;
        else if (annualSavings > 10000)
            score += 0.15;
        else if (annualSavings > 5000)
            score += 0.10;
        else if (annualSavings > 2000)
            score += 0.05;
        // Environmental impact factor
        if (co2ReductionTons > 50)
            score += 0.15;
        else if (co2ReductionTons > 25)
            score += 0.10;
        else if (co2ReductionTons > 10)
            score += 0.05;
        // Implementation difficulty factor
        switch (implementationDifficulty) {
            case 'Easy':
                score += 0.10;
                break;
            case 'Medium': break; // neutral
            case 'Hard':
                score -= 0.10;
                break;
        }
        // High energy usage bonus
        if (energyUsage > 10000)
            score += 0.10;
        // Ensure score stays within bounds
        return Math.max(0.1, Math.min(1.0, Math.round(score * 100) / 100));
    }
    calculateEnvironmentalEquivalents(co2ReductionTons) {
        // EPA equivalency factors
        const treesPlanted = Math.round(co2ReductionTons * 16.5); // trees planted and grown for 10 years
        const carsOffRoad = Math.round(co2ReductionTons * 0.22); // passenger cars driven for one year
        const homesPowered = Math.round(co2ReductionTons * 0.18); // average homes' electricity use for one year
        const gallonsGasolineSaved = Math.round(co2ReductionTons * 113); // gallons of gasoline consumed
        return {
            treesPlanted,
            carsOffRoad,
            homesPowered,
            gallonsGasolineSaved
        };
    }
    calculateSolarPotential(facilitySize, location, roofPercentage = 0.6) {
        const factors = this.getRegionalFactors(location);
        // Estimate system size (typical: 6-8 watts per sqft of usable roof)
        const usableRoofArea = facilitySize * roofPercentage;
        const systemSizeKw = (usableRoofArea * 7) / 1000; // 7 watts per sqft
        // Annual generation
        const annualGenerationKwh = systemSizeKw * factors.solarPotential;
        // Financial calculations
        const annualSavings = annualGenerationKwh * factors.electricityRate;
        const estimatedCost = systemSizeKw * 2500; // $2.50/watt installed
        const roiYears = estimatedCost / annualSavings;
        // Environmental impact
        const co2OffsetTons = (annualGenerationKwh * factors.co2EmissionFactor) / 2000;
        return {
            estimatedSystemSizeKw: Math.round(systemSizeKw * 10) / 10,
            annualGenerationKwh: Math.round(annualGenerationKwh),
            annualSavings: Math.round(annualSavings * 100) / 100,
            estimatedCost: Math.round(estimatedCost * 100) / 100,
            roiYears: Math.round(roiYears * 10) / 10,
            co2OffsetTons: Math.round(co2OffsetTons * 100) / 100
        };
    }
}
exports.SustainabilityCalculator = SustainabilityCalculator;
// Export singleton instance
exports.sustainabilityCalculator = new SustainabilityCalculator();
// Export utility functions
const calculateROI = (annualSavings, implementationCost) => {
    return implementationCost / annualSavings * 12;
};
exports.calculateROI = calculateROI;
const calculateNPV = (cashFlows, discountRate, initialInvestment) => {
    let npv = -initialInvestment;
    cashFlows.forEach((cashFlow, index) => {
        npv += cashFlow / Math.pow(1 + discountRate, index + 1);
    });
    return Math.round(npv * 100) / 100;
};
exports.calculateNPV = calculateNPV;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const formatNumber = (num, decimals = 1) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
};
exports.formatNumber = formatNumber;
