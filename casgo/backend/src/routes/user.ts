import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

/**
 * GET /api/user/:userId/recommendations
 * 
 * Retrieves all non-completed recommendations for a given user.
 * This is the primary endpoint for displaying recommendations to the user.
 */
router.get('/:userId/recommendations', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('user_id', userId)
      .not('status', 'eq', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user recommendations:', error);
      throw error;
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 