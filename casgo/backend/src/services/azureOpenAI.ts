import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { promptEngineering, PromptTemplate } from './promptEngineering';

// Load environment variables
dotenv.config();

export interface RecommendationRequest {
  businessName: string;
  industry: string;
  companySize: string;
  location: string;
  monthlyKwh: number;
  monthlyTherms: number;
  sustainabilityGoals: string[];
  currentChallenges?: string[];
  previousRecommendations?: string[];
  budget?: string;
  timeline?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedCostSavings: number;
  estimatedCo2Reduction: number;
  roiMonths: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priorityScore: number;
  implementationSteps: string[];
  reasoning: string;
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  totalPotentialSavings: number;
  totalCo2Reduction: number;
  executionTimestamp: string;
}

class OpenAIService {
  private client: OpenAI | null = null;
  private isConfigured: boolean = false;
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    
    this.validateConfiguration();
    
    if (this.isConfigured) {
      this.initializeClient();
    }
  }

  private validateConfiguration(): void {
    if (!this.apiKey) {
      console.warn('⚠️  OpenAI API key not configured');
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;
    console.log('✅ OpenAI service configured successfully');
  }

  private initializeClient(): void {
    if (!this.isConfigured) {
      console.log('📋 OpenAI client not initialized - missing configuration');
      return;
    }

    try {
      this.client = new OpenAI({
        apiKey: this.apiKey
      });
      
      console.log('🤖 OpenAI client initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI client:', error);
      this.client = null;
      this.isConfigured = false;
    }
  }

  public isAvailable(): boolean {
    return this.isConfigured && this.client !== null;
  }

  public getStatus(): object {
    return {
      configured: this.isConfigured,
      client_initialized: this.client !== null,
      api_key_configured: !!this.apiKey,
      model: this.model,
      service: 'openrouter'
    };
  }

  private generateAdvancedPrompt(request: RecommendationRequest): { systemPrompt: string; userPrompt: string; template: PromptTemplate } {
    return promptEngineering.generatePrompt(request);
  }

  public async generateRecommendations(request: RecommendationRequest): Promise<AIRecommendationResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenRouter service is not available. Please check configuration.');
    }

    try {
      const { systemPrompt, userPrompt, template } = this.generateAdvancedPrompt(request);
      
      const completion = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: template.maxTokens,
        temperature: template.temperature,
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenRouter');
      }

      const aiResponse = JSON.parse(content);
      
      // Transform AI response to our format
      const recommendations: AIRecommendation[] = aiResponse.recommendations?.map((rec: any, index: number) => ({
        id: rec.id || `openrouter-rec-${index + 1}`,
        title: rec.title || rec.recommendation || 'Sustainability Recommendation',
        description: rec.description || rec.details || '',
        category: rec.category || 'General',
        estimatedCostSavings: rec.estimated_cost_savings || rec.savings || 0,
        estimatedCo2Reduction: rec.estimated_co2_reduction || rec.co2_reduction || 0,
        roiMonths: rec.roi_months || rec.payback_months || 24,
        difficulty: rec.difficulty || 'Medium',
        priorityScore: rec.priority_score || rec.priority || 0.5,
        implementationSteps: rec.implementation_steps || rec.steps || [],
        reasoning: rec.reasoning || rec.explanation || ''
      })) || [];

      // Calculate totals
      const totalPotentialSavings = recommendations.reduce((sum, rec) => sum + rec.estimatedCostSavings, 0);
      const totalCo2Reduction = recommendations.reduce((sum, rec) => sum + rec.estimatedCo2Reduction, 0);

      return {
        recommendations,
        totalPotentialSavings,
        totalCo2Reduction,
        executionTimestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ OpenRouter recommendation generation failed:', error);
      throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const testCompletion = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'user', content: 'Hello! Just testing the connection. Please respond with "Connection successful".' }
        ],
        max_tokens: 50,
        temperature: 0.1
      });

      const response = testCompletion.choices[0]?.message?.content;
      console.log('✅ OpenRouter connection test successful:', response);
      return true;
    } catch (error) {
      console.error('❌ OpenRouter connection test failed:', error);
      return false;
    }
  }
}

export const openAIService = new OpenAIService();
export default openAIService; 