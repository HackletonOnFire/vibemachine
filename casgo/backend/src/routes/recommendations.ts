import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { openAIService, RecommendationRequest, AIRecommendation } from '../services/azureOpenAI';
import { RulesBasedRecommendationEngine, BusinessData, RuleRecommendation } from '../utils/rulesEngine';
import { supabase } from '../lib/supabase';
import { Recommendation } from '../../src/lib/types/database';

const router = Router();

// Validation schemas using Zod for robust input validation
const RecommendationRequestSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  businessName: z.string().min(1, "Business name is required").max(100),
  industry: z.string().min(1, "Industry is required").max(50),
  companySize: z.string().min(1, "Company size is required"),
  location: z.string().min(1, "Location is required").max(100),
  monthlyKwh: z.number().min(0, "Monthly kWh must be non-negative").max(1000000),
  monthlyTherms: z.number().min(0, "Monthly therms must be non-negative").max(100000),
  sustainabilityGoals: z.array(z.string()).min(1, "At least one sustainability goal is required"),
  currentChallenges: z.array(z.string()).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional()
});

// Unified recommendation interface that combines both sources
export interface HybridRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedCostSavings: number;
  estimatedCo2Reduction: number;
  roiMonths: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priorityScore: number;
  
  // Enhanced fields from AI service
  implementationSteps?: string[];
  reasoning?: string;
  
  // Metadata for transparency and debugging
  source: 'ai' | 'rules' | 'hybrid';
  confidence: number; // 0-1 score
  generated_at: string;
  
  // Additional computed fields
  paybackYears?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface HybridRecommendationResponse {
  newRecommendations: Recommendation[];
  metadata: {
    totalNewRecommendations: number;
    aiRecommendationsGenerated: number;
    rulesRecommendationsGenerated: number;
    totalPotentialSavings: number;
    totalCo2Reduction: number;
    processingTimeMs: number;
    aiServiceAvailable: boolean;
    rulesEngineStatus: 'success' | 'partial' | 'failed';
  };
  executionTimestamp: string;
}

// Initialize rules engine
const rulesEngine = new RulesBasedRecommendationEngine();

/**
 * POST /api/recommendations
 * 
 * Generates and saves new hybrid sustainability recommendations.
 * 
 * Business Logic:
 * 1. Fetches existing recommendations for the user.
 * 2. Excludes 'completed' recommendations from being re-recommended.
 * 3. Generates new recommendations from AI and rules engines.
 * 4. Saves the new recommendations to the database.
 * 5. Returns only the newly generated recommendations.
 */
router.post('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Input validation
    const validationResult = RecommendationRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const requestData = validationResult.data;
    const { userId } = requestData;

    console.log(`🔄 Processing recommendations for user: ${userId}`);

    // 1. Fetch existing recommendations to avoid duplicates
    const { data: existingRecs, error: fetchError } = await supabase
      .from('recommendations')
      .select('title, status')
      .eq('user_id', userId);

    if (fetchError) {
      console.error('❌ Error fetching existing recommendations:', fetchError);
      throw new Error('Could not retrieve existing recommendations');
    }

    const implementedTitles = (existingRecs || [])
      .filter(rec => rec.status === 'completed')
      .map(rec => rec.title);
      
    const existingTitles = (existingRecs || []).map(rec => rec.title);

    // 2. Prepare data for recommendation engines
    const businessData: BusinessData = {
      businessName: requestData.businessName,
      industry: requestData.industry,
      size: requestData.companySize,
      location: requestData.location,
      monthlyKwh: requestData.monthlyKwh,
      monthlyTherms: requestData.monthlyTherms,
      sustainabilityGoals: requestData.sustainabilityGoals
    };

    const aiRequestData = {
      ...requestData,
      previousRecommendations: [...implementedTitles, ...existingTitles]
    };

    // 3. Execute both recommendation engines in parallel
    const [rulesResult, aiResult] = await Promise.allSettled([
      generateRulesRecommendations(businessData, existingTitles),
      generateAIRecommendations(aiRequestData)
    ]);

    // Process and merge results
    const rulesRecommendations = rulesResult.status === 'fulfilled' ? rulesResult.value : [];
    const aiRecommendations = aiResult.status === 'fulfilled' ? aiResult.value : [];
    
    const mergedRecommendations = intelligentMergeRecommendations(
      rulesRecommendations, 
      aiRecommendations
    );

    // 4. Save new recommendations to the database
    if (mergedRecommendations.length > 0) {
      const newRecsToInsert = mergedRecommendations.map(rec => ({
        user_id: userId,
        title: rec.title,
        description: rec.description,
        category: rec.category,
        priority: rec.priorityScore >= 80 ? 'high' : rec.priorityScore >= 60 ? 'medium' : 'low',
        estimated_annual_savings: rec.estimatedCostSavings,
        annual_co2_reduction_tons: rec.estimatedCo2Reduction,
        implementation_cost: rec.estimatedCostSavings / (12 / rec.roiMonths),
        payback_period_months: rec.roiMonths,
        difficulty_level: rec.difficulty === 'Easy' ? 1 : rec.difficulty === 'Medium' ? 2 : 3,
        status: 'pending' as const,
        generated_by: rec.source
      }));

      const { data: insertedRecs, error: insertError } = await supabase
        .from('recommendations')
        .insert(newRecsToInsert)
        .select();

      if (insertError) {
        console.error('❌ Error saving new recommendations:', insertError);
        throw new Error('Failed to save new recommendations');
      }

      console.log(`✅ Saved ${insertedRecs.length} new recommendations for user ${userId}`);
      
      const response: HybridRecommendationResponse = {
        newRecommendations: insertedRecs,
        metadata: {
          totalNewRecommendations: insertedRecs.length,
          aiRecommendationsGenerated: aiRecommendations.length,
          rulesRecommendationsGenerated: rulesRecommendations.length,
          totalPotentialSavings: mergedRecommendations.reduce((sum, r) => sum + r.estimatedCostSavings, 0),
          totalCo2Reduction: mergedRecommendations.reduce((sum, r) => sum + r.estimatedCo2Reduction, 0),
          processingTimeMs: Date.now() - startTime,
          aiServiceAvailable: aiResult.status === 'fulfilled',
          rulesEngineStatus: rulesResult.status === 'fulfilled' ? 'success' : 'failed'
        },
        executionTimestamp: new Date().toISOString()
      };
      
      return res.status(200).json(response);
    } else {
      console.log(`✅ No new recommendations generated for user ${userId}`);
      return res.status(200).json({
        newRecommendations: [],
        metadata: { message: 'No new recommendations to generate at this time.' }
      });
    }

  } catch (error) {
    console.error('❌ Hybrid recommendations endpoint error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Generate recommendations using rules-based engine
 */
async function generateRulesRecommendations(businessData: BusinessData, existingTitles: string[]): Promise<HybridRecommendation[]> {
  try {
    const ruleRecs = rulesEngine.generateRecommendations(businessData)
      .filter(rec => !existingTitles.includes(rec.title)); // Exclude existing recommendations

    return ruleRecs.map((rec: RuleRecommendation): HybridRecommendation => ({
      ...rec,
      id: `rule-${Math.random().toString(36).substr(2, 9)}`,
      source: 'rules',
      confidence: 0.9, // Rules are generally high confidence
      generated_at: new Date().toISOString(),
      paybackYears: Math.round((rec.roiMonths / 12) * 10) / 10,
      riskLevel: rec.difficulty === 'Easy' ? 'Low' : rec.difficulty === 'Medium' ? 'Medium' : 'High'
    }));
  } catch (error) {
    console.error('Rules engine error:', error);
    throw new Error(`Rules engine failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate recommendations using AI service
 */
async function generateAIRecommendations(requestData: RecommendationRequest): Promise<HybridRecommendation[]> {
  if (!openAIService.isAvailable()) {
    throw new Error('AI service is not available');
  }

  try {
    const aiResponse = await openAIService.generateRecommendations(requestData);
    
    return aiResponse.recommendations.map((rec: AIRecommendation): HybridRecommendation => ({
      ...rec,
      source: 'ai' as const,
      confidence: Math.min(rec.priorityScore / 100, 0.95),
      generated_at: new Date().toISOString(),
      paybackYears: Math.round((rec.roiMonths / 12) * 10) / 10,
      riskLevel: rec.difficulty === 'Easy' ? 'Low' : rec.difficulty === 'Medium' ? 'Medium' : 'High'
    }));
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Intelligently merge and deduplicate recommendations from both sources
 */
function intelligentMergeRecommendations(rulesRecs: HybridRecommendation[], aiRecs: HybridRecommendation[]): HybridRecommendation[] {
  const recommendationMap = new Map<string, HybridRecommendation>();

  // Prioritize AI recommendations
  aiRecs.forEach(rec => recommendationMap.set(rec.title.toLowerCase(), rec));

  // Add non-duplicate rules-based recommendations
  rulesRecs.forEach(rec => {
    if (!recommendationMap.has(rec.title.toLowerCase())) {
      recommendationMap.set(rec.title.toLowerCase(), rec);
    }
  });

  return Array.from(recommendationMap.values())
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * GET /api/recommendations/health
 * Health check endpoint for monitoring service status
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const aiStatus = openAIService.getStatus();
    const aiAvailable = openAIService.isAvailable();
    
    // Test rules engine
    const testBusinessData: BusinessData = {
      businessName: 'Test Corp',
      industry: 'Technology',
      size: 'Medium',
      location: 'California',
      monthlyKwh: 1000,
      monthlyTherms: 100,
      sustainabilityGoals: ['Energy Efficiency']
    };
    
    let rulesEngineWorking = false;
    try {
      const testRules = rulesEngine.generateRecommendations(testBusinessData);
      rulesEngineWorking = testRules.length > 0;
    } catch (error) {
      console.error('Rules engine health check failed:', error);
    }
    
    const overallHealth = aiAvailable && rulesEngineWorking ? 'healthy' : 'degraded';
    
    return res.json({
      status: overallHealth,
      services: {
        ai_service: {
          available: aiAvailable,
          ...aiStatus
        },
        rules_engine: {
          available: rulesEngineWorking,
          status: rulesEngineWorking ? 'operational' : 'failed'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

export { router as recommendationsRoutes };
export default router; 