import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.routes'

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
