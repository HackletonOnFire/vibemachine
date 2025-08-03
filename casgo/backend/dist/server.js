"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const services_1 = require("./services");
// Load environment variables
dotenv_1.default.config();
// Environment variable validation
const requiredEnvVars = {
    PORT: process.env.PORT || "5000",
    NODE_ENV: process.env.NODE_ENV || "development",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
    // Optional variables for MVP (will be required later)
    SUPABASE_URL: process.env.SUPABASE_URL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};
// Log environment status
console.log("🔧 Environment Configuration:");
console.log(`  - Port: ${requiredEnvVars.PORT}`);
console.log(`  - Environment: ${requiredEnvVars.NODE_ENV}`);
console.log(`  - Frontend URL: ${requiredEnvVars.FRONTEND_URL}`);
console.log(`  - Supabase configured: ${!!requiredEnvVars.SUPABASE_URL}`);
console.log(`  - OpenRouter configured: ${!!requiredEnvVars.OPENROUTER_API_KEY}`);
// Import routes (will be created in future tasks)
// import authRoutes from './routes/auth';
// import dataRoutes from './routes/data';
// import recommendationsRoutes from './routes/recommendations';
class Server {
    constructor() {
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 5000;
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: process.env.FRONTEND_URL || "http://localhost:3000",
            credentials: true,
        }));
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: "10mb" }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Logging middleware
        this.app.use((0, morgan_1.default)("combined"));
    }
    initializeRoutes() {
        // Health check endpoint
        this.app.get("/health", (req, res) => {
            const openRouterAIStatus = services_1.openRouterAIService.getStatus();
            res.status(200).json({
                status: "OK",
                message: "Casgo Backend API is running",
                timestamp: new Date().toISOString(),
                version: "1.0.0",
                environment: {
                    node_env: requiredEnvVars.NODE_ENV,
                    port: requiredEnvVars.PORT,
                    supabase_configured: !!requiredEnvVars.SUPABASE_URL,
                    frontend_url: requiredEnvVars.FRONTEND_URL,
                },
                openrouter: openRouterAIStatus,
            });
        });
        // API routes (will be implemented in future tasks)
        // this.app.use('/api/auth', authRoutes);
        // this.app.use('/api/data', dataRoutes);
        // this.app.use('/api/recommendations', recommendationsRoutes);
        // Test OpenRouter connection
        this.app.get("/test-ai-connection", async (req, res) => {
            if (!services_1.openRouterAIService.isAvailable()) {
                return res.status(503).json({
                    status: "unavailable",
                    message: "OpenRouter service is not configured or available",
                    service_status: services_1.openRouterAIService.getStatus()
                });
            }
            try {
                const connectionTest = await services_1.openRouterAIService.testConnection();
                res.status(200).json({
                    status: connectionTest ? "success" : "failed",
                    connection_test_passed: connectionTest,
                    message: "Connection test completed",
                    service_status: services_1.openRouterAIService.getStatus()
                });
            }
            catch (error) {
                res.status(500).json({
                    status: "error",
                    message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    service_status: services_1.openRouterAIService.getStatus()
                });
            }
        });
        // Default route
        this.app.get("/", (req, res) => {
            res.status(200).json({
                message: "Welcome to Casgo Backend API",
                documentation: "/api/docs",
                health: "/health",
                test_ai_connection: "/test-ai-connection",
            });
        });
        // 404 handler
        this.app.use("*", (req, res) => {
            res.status(404).json({
                error: "Route not found",
                path: req.originalUrl,
            });
        });
    }
    initializeErrorHandling() {
        // Global error handler
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.app.use((err, req, res, _next) => {
            // eslint-disable-next-line no-console
            console.error("Error:", err);
            res.status(500).json({
                error: "Internal Server Error",
                message: process.env.NODE_ENV === "development"
                    ? err.message
                    : "Something went wrong",
            });
        });
    }
    start() {
        this.app.listen(this.port, () => {
            // eslint-disable-next-line no-console
            console.log(`🚀 Casgo Backend Server running on port ${this.port}`);
            // eslint-disable-next-line no-console
            console.log(`📊 Health check available at http://localhost:${this.port}/health`);
            // eslint-disable-next-line no-console
            console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        });
    }
    getApp() {
        return this.app;
    }
}
// Start the server
const server = new Server();
server.start();
exports.default = server;
