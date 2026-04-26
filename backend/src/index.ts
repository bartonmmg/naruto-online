import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.routes.js'
import guidesRouter from './routes/guides.routes.js'
import rankingRouter from './routes/ranking.routes.js'

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
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())

app.use('/auth', authRouter)
app.use('/guides', guidesRouter)
app.use('/api/rankings', rankingRouter)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason)
})

export default server
