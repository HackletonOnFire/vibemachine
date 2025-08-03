"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openRouterAIService = void 0;
const openai_1 = require("openai");
const dotenv_1 = __importDefault(require("dotenv"));
const promptEngineering_1 = require("./promptEngineering");
// Load environment variables
dotenv_1.default.config();
class OpenRouterAIService {
    constructor() {
        this.client = null;
        this.isConfigured = false;
        this.apiKey = process.env.OPENROUTER_API_KEY || '';
        this.model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
        this.validateConfiguration();
        if (this.isConfigured) {
            this.initializeClient();
        }
    }
    validateConfiguration() {
        if (!this.apiKey) {
            console.warn('⚠️  OpenRouter API key not configured');
            this.isConfigured = false;
            return;
        }
        this.isConfigured = true;
        console.log('✅ OpenRouter service configured successfully');
    }
    initializeClient() {
        if (!this.isConfigured) {
            console.log('📋 OpenRouter client not initialized - missing configuration');
            return;
        }
        try {
            this.client = new openai_1.OpenAI({
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey: this.apiKey,
                defaultHeaders: {
                    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                    'X-Title': 'EcoMind Sustainability App'
                }
            });
            console.log('🤖 OpenRouter client initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize OpenRouter client:', error);
            this.client = null;
            this.isConfigured = false;
        }
    }
    isAvailable() {
        return this.isConfigured && this.client !== null;
    }
    getStatus() {
        return {
            configured: this.isConfigured,
            client_initialized: this.client !== null,
            api_key_configured: !!this.apiKey,
            model: this.model,
            service: 'openrouter'
        };
    }
    generateAdvancedPrompt(request) {
        return promptEngineering_1.promptEngineering.generatePrompt(request);
    }
    async generateRecommendations(request) {
        if (!this.isAvailable()) {
            throw new Error('OpenRouter service is not available. Please check configuration.');
        }
        try {
            const { systemPrompt, userPrompt, template } = this.generateAdvancedPrompt(request);
            const completion = await this.client.chat.completions.create({
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
            const recommendations = aiResponse.recommendations?.map((rec, index) => ({
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
        }
        catch (error) {
            console.error('❌ OpenRouter recommendation generation failed:', error);
            throw new Error(`OpenRouter API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async testConnection() {
        if (!this.isAvailable()) {
            return false;
        }
        try {
            const testCompletion = await this.client.chat.completions.create({
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
        }
        catch (error) {
            console.error('❌ OpenRouter connection test failed:', error);
            return false;
        }
    }
}
exports.openRouterAIService = new OpenRouterAIService();
exports.default = exports.openRouterAIService;
