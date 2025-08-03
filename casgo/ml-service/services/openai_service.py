import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
from pydantic import BaseModel
from .prompt_engineering import prompt_engineering_service, RecommendationRequest as PromptRequest

logger = logging.getLogger(__name__)

class RecommendationRequest(BaseModel):
    business_name: str
    industry: str
    size: str
    location: str
    monthly_kwh: float
    monthly_therms: float
    sustainability_goals: List[str]
    current_challenges: Optional[List[str]] = None
    previous_recommendations: Optional[List[str]] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None

class AIRecommendation(BaseModel):
    id: str
    title: str
    description: str
    category: str
    estimated_cost_savings: float
    estimated_co2_reduction: float
    roi_months: int
    difficulty: str
    priority_score: float
    implementation_steps: List[str]
    reasoning: str

class AIRecommendationResponse(BaseModel):
    recommendations: List[AIRecommendation]
    total_potential_savings: float
    total_co2_reduction: float
    execution_timestamp: str

class OpenRouterAIService:
    def __init__(self):
        self.client = None
        self.is_configured: bool = False
        self.api_key: str = os.getenv("OPENROUTER_API_KEY", "")
        self.model: str = os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo")
        
        self._validate_configuration()
        
        if self.is_configured:
            self._initialize_client()
    
    def _validate_configuration(self) -> None:
        if not self.api_key:
            logger.warning("⚠️  OpenRouter API key not configured")
            self.is_configured = False
            return
        
        self.is_configured = True
        logger.info("✅ OpenRouter service configured successfully")
    
    def _initialize_client(self) -> None:
        if not self.is_configured:
            logger.info("📋 OpenRouter client not initialized - missing configuration")
            return
        
        if OpenAI is None:
            logger.error("❌ OpenAI package not installed")
            self.is_configured = False
            return
        
        try:
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=self.api_key,
                default_headers={
                    "HTTP-Referer": os.getenv("FRONTEND_URL", "http://localhost:3000"),
                    "X-Title": "EcoMind Sustainability App"
                }
            )
            logger.info("🤖 OpenRouter client initialized successfully")
        except Exception as error:
            logger.error(f"❌ Failed to initialize OpenRouter client: {error}")
            self.client = None
            self.is_configured = False
    
    def is_available(self) -> bool:
        return self.is_configured and self.client is not None
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "configured": self.is_configured,
            "client_initialized": self.client is not None,
            "api_key_configured": bool(self.api_key),
            "model": self.model,
            "service": "openrouter"
        }
    
    def _generate_advanced_prompt(self, request: RecommendationRequest) -> Tuple[str, str, Any]:
        prompt_request = PromptRequest(
            business_name=request.business_name,
            industry=request.industry,
            company_size=request.size,
            location=request.location,
            monthly_kwh=request.monthly_kwh,
            monthly_therms=request.monthly_therms,
            sustainability_goals=request.sustainability_goals,
            current_challenges=request.current_challenges or [],
            previous_recommendations=request.previous_recommendations or [],
            budget=request.budget,
            timeline=request.timeline
        )
        return prompt_engineering_service.generate_prompt(prompt_request)
    
    async def generate_recommendations(self, request: RecommendationRequest) -> AIRecommendationResponse:
        if not self.is_available():
            raise Exception("OpenRouter service is not available. Please check configuration.")
        
        try:
            system_prompt, user_prompt, template = self._generate_advanced_prompt(request)
            
            completion = self.client.chat.completions.create(  # type: ignore
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                max_tokens=template.max_tokens,
                temperature=template.temperature,
                response_format={"type": "json_object"}
            )
            
            content = completion.choices[0].message.content
            if not content:
                raise Exception("No response content from OpenRouter")
            
            ai_response = json.loads(content)
            
            # Transform AI response to our format
            recommendations = []
            for i, rec in enumerate(ai_response.get("recommendations", [])):
                recommendation = AIRecommendation(
                    id=rec.get("id", f"openrouter-rec-{i + 1}"),
                    title=rec.get("title", rec.get("recommendation", "Sustainability Recommendation")),
                    description=rec.get("description", rec.get("details", "")),
                    category=rec.get("category", "General"),
                    estimated_cost_savings=float(rec.get("estimated_cost_savings", rec.get("savings", 0))),
                    estimated_co2_reduction=float(rec.get("estimated_co2_reduction", rec.get("co2_reduction", 0))),
                    roi_months=int(rec.get("roi_months", rec.get("payback_months", 24))),
                    difficulty=rec.get("difficulty", "Medium"),
                    priority_score=float(rec.get("priority_score", rec.get("priority", 0.5))),
                    implementation_steps=rec.get("implementation_steps", rec.get("steps", [])),
                    reasoning=rec.get("reasoning", rec.get("explanation", ""))
                )
                recommendations.append(recommendation)
            
            # Calculate totals
            total_potential_savings = sum(rec.estimated_cost_savings for rec in recommendations)
            total_co2_reduction = sum(rec.estimated_co2_reduction for rec in recommendations)
            
            return AIRecommendationResponse(
                recommendations=recommendations,
                total_potential_savings=total_potential_savings,
                total_co2_reduction=total_co2_reduction,
                execution_timestamp=datetime.now().isoformat()
            )
            
        except Exception as error:
            logger.error(f"❌ OpenRouter recommendation generation failed: {error}")
            raise Exception(f"OpenRouter API error: {str(error)}")
    
    async def test_connection(self) -> bool:
        if not self.is_available():
            return False
        
        try:
            completion = self.client.chat.completions.create(  # type: ignore
                model=self.model,
                messages=[
                    {"role": "user", "content": "Hello! Just testing the connection. Please respond with 'Connection successful'."}
                ],
                max_tokens=50,
                temperature=0.1
            )
            
            response = completion.choices[0].message.content
            logger.info(f"✅ OpenRouter connection test successful: {response}")
            return True
            
        except Exception as error:
            logger.error(f"❌ OpenRouter connection test failed: {error}")
            return False

openrouter_ai_service = OpenRouterAIService() 