import Fastify from 'fastify'
import cors from '@fastify/cors'

const server = Fastify({ logger: true })

const corsOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',')

await server.register(cors, { origin: corsOrigins, credentials: true })

// Health check
server.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

// Routes will be registered here as they're built
// server.register(import('./routes/songs.js'))
// server.register(import('./routes/lessons.js'))
// server.register(import('./routes/progress.js'))

const port = Number(process.env.PORT ?? 3001)
const host = process.env.HOST ?? '0.0.0.0'

try {
  await server.listen({ port, host })
  console.log(`Server running at http://${host}:${port}`)
} catch (err) {
  server.log.error(err)
  process.exit(1)
}
