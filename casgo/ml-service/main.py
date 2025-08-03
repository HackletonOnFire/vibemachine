from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import logging
from dotenv import load_dotenv
import openai

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Environment variable validation and logging
ENVIRONMENT_CONFIG = {
    # Commented out Azure OpenAI - now using OpenRouter
    # 'AZURE_OPENAI_ENDPOINT': os.getenv("AZURE_OPENAI_ENDPOINT"),
    # 'AZURE_OPENAI_API_KEY': os.getenv("AZURE_OPENAI_API_KEY"), 
    # 'AZURE_OPENAI_API_VERSION': os.getenv("AZURE_OPENAI_API_VERSION", "2023-12-01-preview"),
    # 'AZURE_OPENAI_DEPLOYMENT': os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    
    # OpenRouter Configuration
    'OPENROUTER_API_KEY': os.getenv("OPENROUTER_API_KEY"),
    'OPENROUTER_MODEL': os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo"),
    
    'ML_SERVICE_PORT': int(os.getenv("ML_SERVICE_PORT", "8000")),
    'DEBUG': os.getenv("DEBUG", "True").lower() == "true"
}

# Log environment status
print("ML Service Environment Configuration:")
print(f"  - Port: {ENVIRONMENT_CONFIG['ML_SERVICE_PORT']}")
print(f"  - Debug mode: {ENVIRONMENT_CONFIG['DEBUG']}")
print(f"  - OpenRouter API key configured: {bool(ENVIRONMENT_CONFIG['OPENROUTER_API_KEY'])}")
print(f"  - OpenRouter model: {ENVIRONMENT_CONFIG['OPENROUTER_MODEL']}")

# Initialize FastAPI app
app = FastAPI(
    title="Casgo ML Service",
    description="AI-powered sustainability recommendations service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5000"],  # Frontend and backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import OpenRouter service
from services.openai_service import (
    openrouter_ai_service, 
    RecommendationRequest as AIRecommendationRequest,
    AIRecommendationResponse
)

# Import rules-based recommendation engine
from utils.rules_engine import rules_engine

# Pydantic models
class BusinessData(BaseModel):
    business_name: str
    industry: str
    size: str
    location: str
    monthly_kwh: float
    monthly_therms: float
    sustainability_goals: List[str]

class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    category: str
    estimated_cost_savings: float
    estimated_co2_reduction: float
    roi_months: int
    difficulty: str
    priority_score: float

class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
    total_potential_savings: float
    total_co2_reduction: float

# Health check endpoint
@app.get("/health")
async def health_check():
    openrouter_status = openrouter_ai_service.get_status()
    return {
        "status": "OK",
        "message": "Casgo ML Service is running",
        "version": "1.0.0",
        "environment": {
            "debug_mode": ENVIRONMENT_CONFIG['DEBUG'],
            "port": ENVIRONMENT_CONFIG['ML_SERVICE_PORT'],
            "openrouter_api_key_configured": bool(ENVIRONMENT_CONFIG['OPENROUTER_API_KEY']),
            "openrouter_model": ENVIRONMENT_CONFIG['OPENROUTER_MODEL'],
            "python_version": "3.13.2"
        },
        "openrouter": openrouter_status
    }

# Basic recommendation endpoint (rules-based for now)
@app.post("/recommendations", response_model=RecommendationResponse)
async def generate_recommendations(business_data: BusinessData):
    try:
        # For MVP, we'll use rules-based recommendations
        # This will be enhanced with OpenRouter AI in future tasks
        recommendations = generate_rules_based_recommendations(business_data)
        
        total_savings = sum(rec.estimated_cost_savings for rec in recommendations)
        total_co2 = sum(rec.estimated_co2_reduction for rec in recommendations)
        
        return RecommendationResponse(
            recommendations=recommendations,
            total_potential_savings=total_savings,
            total_co2_reduction=total_co2
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

# AI-powered recommendations endpoint
@app.post("/ai-recommendations", response_model=AIRecommendationResponse)
async def generate_ai_recommendations(business_data: BusinessData):
    """Generate AI-powered sustainability recommendations using OpenRouter."""
    if not openrouter_ai_service.is_available():
        raise HTTPException(
            status_code=503, 
            detail="OpenRouter service is not available. Check configuration or use /recommendations for rules-based alternatives."
        )
    
    try:
        # Convert BusinessData to AIRecommendationRequest
        ai_request = AIRecommendationRequest(
            business_name=business_data.business_name,
            industry=business_data.industry,
            size=business_data.size,
            location=business_data.location,
            monthly_kwh=business_data.monthly_kwh,
            monthly_therms=business_data.monthly_therms,
            sustainability_goals=business_data.sustainability_goals
        )
        
        # Generate AI recommendations
        ai_response = await openrouter_ai_service.generate_recommendations(ai_request)
        
        return ai_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating AI recommendations: {str(e)}")

# Test OpenRouter connection
@app.get("/test-ai-connection")
async def test_ai_connection():
    """Test the connection to OpenRouter service."""
    if not openrouter_ai_service.is_available():
        return {
            "status": "unavailable",
            "message": "OpenRouter service is not configured or available",
            "service_status": openrouter_ai_service.get_status()
        }
    
    try:
        connection_test = await openrouter_ai_service.test_connection()
        return {
            "status": "success" if connection_test else "failed",
            "connection_test_passed": connection_test,
            "message": "Connection test completed",
            "service_status": openrouter_ai_service.get_status()
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Connection test failed: {str(e)}",
            "service_status": openrouter_ai_service.get_status()
        }

def generate_rules_based_recommendations(business_data: BusinessData) -> List[Recommendation]:
    """Generate recommendations based on comprehensive business rules engine"""
    try:
        # Use the comprehensive rules engine
        rule_recommendations = rules_engine.generate_recommendations(business_data)
        
        # Convert to Recommendation objects
        recommendations = []
        for rec_data in rule_recommendations:
            recommendation = Recommendation(
                id=rec_data["id"],
                title=rec_data["title"],
                description=rec_data["description"],
                category=rec_data["category"],
                estimated_cost_savings=rec_data["estimated_cost_savings"],
                estimated_co2_reduction=rec_data["estimated_co2_reduction"],
                roi_months=rec_data["roi_months"],
                difficulty=rec_data["difficulty"],
                priority_score=rec_data["priority_score"]
            )
            recommendations.append(recommendation)
        
        return recommendations
        
    except Exception as e:
        # Fallback to basic recommendations if rules engine fails
        logger.warning(f"Rules engine failed, using fallback recommendations: {e}")
        return _generate_fallback_recommendations(business_data)

def _generate_fallback_recommendations(business_data: BusinessData) -> List[Recommendation]:
    """Fallback recommendations if the rules engine fails"""
    recommendations = []
    
    # Basic LED lighting recommendation
    if business_data.monthly_kwh > 800:
        led_savings = business_data.monthly_kwh * 0.25 * 0.12  # 25% reduction, $0.12/kWh
        recommendations.append(Recommendation(
            id="led-retrofit-fallback",
            title="LED Lighting Retrofit",
            description="Replace traditional lighting with energy-efficient LED bulbs",
            category="Energy Efficiency",
            estimated_cost_savings=led_savings * 12,
            estimated_co2_reduction=business_data.monthly_kwh * 0.25 * 0.92 * 12,
            roi_months=18,
            difficulty="Easy",
            priority_score=0.8
        ))
    
    # Basic energy audit recommendation
    recommendations.append(Recommendation(
        id="energy-audit-fallback",
        title="Professional Energy Audit",
        description="Comprehensive assessment to identify energy savings opportunities",
        category="Assessment",
        estimated_cost_savings=business_data.monthly_kwh * 0.1 * 0.12 * 12,
        estimated_co2_reduction=business_data.monthly_kwh * 0.1 * 0.92 * 12,
        roi_months=6,
        difficulty="Easy",
        priority_score=0.9
    ))
    
    return recommendations

# Carbon footprint calculation endpoint
@app.post("/calculate-footprint")
async def calculate_carbon_footprint(business_data: BusinessData):
    """Calculate baseline carbon footprint"""
    try:
        # Basic CO2 calculations (simplified)
        electricity_co2 = business_data.monthly_kwh * 0.92  # lbs CO2 per kWh
        gas_co2 = business_data.monthly_therms * 11.7  # lbs CO2 per therm
        
        monthly_total = electricity_co2 + gas_co2
        annual_total = monthly_total * 12
        
        return {
            "monthly_co2_lbs": round(monthly_total, 2),
            "annual_co2_lbs": round(annual_total, 2),
            "annual_co2_tons": round(annual_total / 2000, 2),
            "breakdown": {
                "electricity_co2_lbs": round(electricity_co2, 2),
                "gas_co2_lbs": round(gas_co2, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating footprint: {str(e)}")

# Test endpoint for development
@app.get("/test")
async def test_endpoint():
    return {
        "message": "Casgo ML Service test endpoint",
        "environment": "development",
        "endpoints": [
            "/health",
            "/recommendations",
            "/ai-recommendations",
            "/calculate-footprint",
            "/test-ai-connection",
            "/docs",
            "/redoc"
        ],
        "openrouter_status": openrouter_ai_service.get_status()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=ENVIRONMENT_CONFIG['ML_SERVICE_PORT'], 
        reload=ENVIRONMENT_CONFIG['DEBUG']
    ) 