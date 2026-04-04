import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth.routes'

dotenv.config()

const app = express()
const PORT = process.env.BACKEND_PORT || 4000

app.use(cors())
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
