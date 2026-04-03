import Fastify from 'fastify'
import cors from '@fastify/cors'
import progressRoutes from './routes/progress.js'
import songRoutes from './routes/songs.js'
import lessonRoutes from './routes/lessons.js'

const server = Fastify({ logger: true })

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174').split(',')

await server.register(cors, { origin: corsOrigins, credentials: true })

// Health check
server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// API routes
await server.register(progressRoutes)
await server.register(songRoutes)
await server.register(lessonRoutes)

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await server.listen({ port, host })
  console.log(`Server running at http://${host}:${port}`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
