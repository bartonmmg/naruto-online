import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.routes.js'
import guidesRouter from './routes/guides.routes.js'
import rankingRouter from './routes/ranking.routes.js'
import { apiKeyMiddleware } from './middleware/apiKey.js'

// Load environment variables (try .env.local first, then .env)
dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()
const PORT = process.env.BACKEND_PORT || 4000

// CORS Configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}

app.use(cors(corsOptions))
app.use(express.json())

// Health check endpoint (public, no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Public auth endpoints (no API key required)
app.use('/auth', authRouter)

// Protected endpoints (API key required)
app.use(apiKeyMiddleware)
app.use('/guides', guidesRouter)
app.use('/api/rankings', rankingRouter)

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

export default server
