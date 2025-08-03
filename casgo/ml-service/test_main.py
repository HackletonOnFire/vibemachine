"""
Simple test to verify the ML service is working correctly
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "OK"
    assert "version" in data


def test_test_endpoint():
    """Test the test endpoint"""
    response = client.get("/test")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "endpoints" in data 