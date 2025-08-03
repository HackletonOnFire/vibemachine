import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import recommendationsRouter from './routes/recommendations';
import implementationRouter from './routes/implementation';
import userRouter from './routes/user'; // Import the new user router
import { supabase } from './lib/supabase';
import { openAIService } from './services/azureOpenAI';

class Server {
  private app: express.Application;
  private port: number;

  constructor(port: number = 5000) {
    this.app = express();
    this.port = port;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security
    this.app.use(helmet());

    // CORS
    const corsOptions = {
      origin: process.env.NODE_ENV === 'production'
        ? 'https://your-production-url.com'
        : 'http://localhost:3001', // Allow requests from the frontend development server
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204
    };
    this.app.use(cors(corsOptions));

    // Request logging
    this.app.use(morgan('dev'));

    // Body parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/', (req, res) => {
      res.status(200).send('EcoMind Backend is running!');
    });

    // API health check
    this.app.get('/api/health', (req, res) => {
      res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'EcoMind Backend'
      });
    });

    // API routes
    this.app.use('/api/recommendations', recommendationsRouter);
    this.app.use('/api/implementation', implementationRouter);
    this.app.use('/api/user', userRouter); // Add the new user router

    // Test endpoint for Supabase connection
    this.app.get('/api/test-db', async (req, res) => {
      try {
        const { data, error } = await supabase.from('users').select('id').limit(1);
        if (error) throw error;
        res.status(200).json({ success: true, message: 'Supabase connection successful.', data });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Supabase connection failed.', error });
      }
    });

    // Test endpoint for OpenAI connection
    this.app.get('/api/test-openai', async (req, res) => {
      try {
        const isAvailable = await openAIService.testConnection();
        if (isAvailable) {
          res.status(200).json({ success: true, message: 'OpenAI service is available.' });
        } else {
          res.status(500).json({ success: false, message: 'OpenAI service is not available.' });
        }
      } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to test OpenAI connection.', error });
      }
    });
  }

  private initializeErrorHandling(): void {
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server is listening on port ${this.port}`);
    });
  }
}

export default Server;

const server = new Server();
server.start();
