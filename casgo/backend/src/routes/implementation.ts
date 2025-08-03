import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { BackendGoalIntegrationService } from '../services/goalIntegration';

const router = Router();

// Validation schemas
const CreateImplementationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  recommendationId: z.string().uuid('Invalid recommendation ID').optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  estimatedCostSavings: z.number().min(0, 'Cost savings must be positive'),
  estimatedCo2Reduction: z.number().min(0, 'CO2 reduction must be positive'),
  roiMonths: z.number().int().min(1, 'ROI months must be at least 1').max(120),
  difficulty: z.enum(['Easy', 'Medium', 'Hard'])
});

const UpdateImplementationSchema = z.object({
  status: z.enum(['started', 'in-progress', 'completed']).optional(),
  progressPercentage: z.number().int().min(0).max(100).optional()
});

// Helper function to calculate estimated completion weeks based on difficulty
function getEstimatedWeeks(difficulty: string): number {
  switch (difficulty) {
    case 'Easy': return 2;
    case 'Medium': return 4;
    case 'Hard': return 8;
    default: return 4;
  }
}

/**
 * POST /api/implementation
 * Create a new implementation record
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validationResult = CreateImplementationSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const data = validationResult.data;
    const estimatedWeeks = getEstimatedWeeks(data.difficulty);

    const { data: implementation, error } = await supabase
      .from('implementations')
      .insert({
        user_id: data.userId,
        recommendation_id: data.recommendationId,
        title: data.title,
        description: data.description,
        category: data.category,
        estimated_cost_savings: data.estimatedCostSavings,
        estimated_co2_reduction: data.estimatedCo2Reduction,
        roi_months: data.roiMonths,
        difficulty: data.difficulty,
        estimated_completion_weeks: estimatedWeeks,
        status: 'started',
        progress_percentage: 5 // Start with 5% to show activity
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating implementation:', error);
      return res.status(500).json({
        error: 'Failed to create implementation',
        details: error.message
      });
    }

    res.status(201).json({
      success: true,
      implementation,
      message: 'Implementation created successfully'
    });

  } catch (error) {
    console.error('Error creating implementation:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/implementation/user/:userId
 * Get all implementations for a user with automatic progress updates
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    let query = supabase
      .from('implementations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data: implementations, error } = await query;

    if (error) {
      console.error('Database error fetching implementations:', error);
      return res.status(500).json({
        error: 'Failed to fetch implementations',
        details: error.message
      });
    }

    // Update progress for non-completed implementations
    const updatedImplementations = implementations?.map((impl: any) => {
      if (impl.status !== 'completed') {
        const weeksElapsed = (Date.now() - new Date(impl.started_at).getTime()) / (7 * 24 * 60 * 60 * 1000);
        const calculatedProgress = Math.min(95, Math.max(5, Math.floor((weeksElapsed / impl.estimated_completion_weeks) * 100)));
        return { ...impl, progress_percentage: calculatedProgress };
      }
      return impl;
    }) || [];

    res.json({
      success: true,
      implementations: updatedImplementations,
      totalCount: updatedImplementations.length
    });

  } catch (error) {
    console.error('Error fetching implementations:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/implementation/:id
 * Update implementation status or progress
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validationResult = UpdateImplementationSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;
    
    // If marking as completed, set completed_at and progress to 100%
    if (updateData.status === 'completed') {
      updateData.progressPercentage = 100;
      (updateData as any).completed_at = new Date().toISOString();
    }

    const { data: implementation, error } = await supabase
      .from('implementations')
      .update({
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.progressPercentage !== undefined && { progress_percentage: updateData.progressPercentage }),
        ...(updateData.status === 'completed' && { completed_at: new Date().toISOString() })
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating implementation:', error);
      return res.status(500).json({
        error: 'Failed to update implementation',
        details: error.message
      });
    }

    // If implementation was completed, update sustainability goals
    let goalUpdateResult = null;
    if (updateData.status === 'completed' && implementation) {
      try {
        console.log('🎯 Implementation completed, updating sustainability goals...');
        goalUpdateResult = await BackendGoalIntegrationService.updateGoalsOnImplementationCompletion(
          implementation,
          implementation.user_id
        );
        
        if (goalUpdateResult.success) {
          console.log(`✅ Goal integration successful: ${goalUpdateResult.goalsUpdated} goals updated`);
        } else {
          console.warn(`⚠️ Goal integration failed: ${goalUpdateResult.error}`);
        }
      } catch (goalError) {
        console.error('❌ Error in goal integration:', goalError);
        // Don't fail the implementation update if goal integration fails
      }
    }

    res.json({
      success: true,
      implementation,
      message: 'Implementation updated successfully',
      goalIntegration: goalUpdateResult ? {
        success: goalUpdateResult.success,
        goalsUpdated: goalUpdateResult.goalsUpdated,
        totalImpact: goalUpdateResult.totalImpact,
        error: goalUpdateResult.error
      } : null
    });

  } catch (error) {
    console.error('Error updating implementation:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/implementation/stats/:userId
 * Get implementation statistics for dashboard
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: implementations, error } = await supabase
      .from('implementations')
      .select('status, estimated_cost_savings, estimated_co2_reduction')
      .eq('user_id', userId);

    if (error) {
      console.error('Database error fetching implementation stats:', error);
      return res.status(500).json({
        error: 'Failed to fetch implementation statistics',
        details: error.message
      });
    }

    const stats = {
      totalImplementations: implementations?.length || 0,
      completedImplementations: implementations?.filter((i: any) => i.status === 'completed').length || 0,
      inProgressImplementations: implementations?.filter((i: any) => i.status === 'in-progress').length || 0,
      totalEstimatedSavings: implementations?.reduce((sum: number, i: any) => sum + (i.estimated_cost_savings || 0), 0) || 0,
      totalEstimatedCo2Reduction: implementations?.reduce((sum: number, i: any) => sum + (i.estimated_co2_reduction || 0), 0) || 0,
      completedSavings: implementations?.filter((i: any) => i.status === 'completed').reduce((sum: number, i: any) => sum + (i.estimated_cost_savings || 0), 0) || 0,
      completedCo2Reduction: implementations?.filter((i: any) => i.status === 'completed').reduce((sum: number, i: any) => sum + (i.estimated_co2_reduction || 0), 0) || 0
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching implementation stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 