# Environment Variables Setup Guide

This guide explains how to configure environment variables for all three services in the EcoMind application.

## Overview

The application consists of three services:

- **Frontend (Next.js)** - Port 3000
- **Backend (Express)** - Port 5000
- **ML Service (FastAPI)** - Port 8000

Each service requires specific environment variables for Supabase and Azure OpenAI integration.

## Setup Instructions

### 1. Frontend Environment Variables

Copy the template and create your environment file:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Supabase Configuration (Public - exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Private keys (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
NEXTAUTH_SECRET=your_nextauth_secret

# Service URLs (Public)
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8000
```

### 2. Backend Environment Variables

Copy the template and create your environment file:

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your actual values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Security
JWT_SECRET=your_jwt_secret_key
```

### 3. ML Service Environment Variables

Copy the template and create your environment file:

```bash
cd ml-service
cp env.example .env
```

Edit `ml-service/.env` with your actual values:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4

# Service Configuration
ML_SERVICE_PORT=8000
DEBUG=True

# Integration URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

## Required Services

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy your Project URL and anon public key
4. Copy your service_role secret key (for server-side operations)

### Azure OpenAI Setup

1. Create an Azure OpenAI resource in Azure Portal
2. Deploy a GPT-4 model
3. Copy the endpoint URL and API key
4. Note your deployment name

## Verification

### Test Environment Loading

**Frontend:**

```bash
npm run dev
# Check browser console for any environment variable errors
```

**Backend:**

```bash
cd backend
npm run dev
# Server should start without environment errors
```

**ML Service:**

```bash
cd ml-service
python main.py
# Visit http://localhost:8000/health - should show azure_openai_configured: true
```

### Health Checks

1. **Frontend**: http://localhost:3000
2. **Backend**: http://localhost:5000/health
3. **ML Service**: http://localhost:8000/health

All services should start without environment variable errors.

## Security Notes

- Never commit `.env*` files to version control
- Use different keys for development and production
- The `.env.local` file takes precedence over `.env` in Next.js
- Only `NEXT_PUBLIC_*` variables are exposed to the client-side
- Server-side environment variables (without `NEXT_PUBLIC_`) remain private

## Troubleshooting

### Common Issues

1. **"SUPABASE_URL is undefined"**
   - Ensure you copied the template correctly
   - Check variable names match exactly (case-sensitive)

2. **"azure_openai_configured: false"**
   - Verify Azure OpenAI keys are set correctly
   - Check endpoint URL format includes https://

3. **CORS errors between services**
   - Ensure FRONTEND_URL is set correctly in backend
   - Check port numbers match running services

### Testing Configuration

Run this in each service directory to verify environment loading:

**Frontend/Backend (Node.js):**

```javascript
console.log("Environment check:", {
  supabase: !!process.env.SUPABASE_URL,
  azure: !!process.env.AZURE_OPENAI_API_KEY,
});
```

**ML Service (Python):**

```python
import os
print('Environment check:', {
  'azure_key': bool(os.getenv('AZURE_OPENAI_API_KEY')),
  'azure_endpoint': bool(os.getenv('AZURE_OPENAI_ENDPOINT'))
})
```
