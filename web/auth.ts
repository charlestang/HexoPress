import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import cookie from '@fastify/cookie'
import { timingSafeEqual } from 'node:crypto'
import { Buffer } from 'node:buffer'
import type { WebConfig } from './config'

const COOKIE_NAME = 'hexopress_session'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds

// Public auth routes that do not require authentication
const PUBLIC_PATHS = new Set(['/api/auth/login', '/api/auth/check'])

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8')
  const bufB = Buffer.from(b, 'utf-8')
  if (bufA.length !== bufB.length) {
    return false
  }
  return timingSafeEqual(bufA, bufB)
}

async function authPlugin(fastify: FastifyInstance, opts: { config: WebConfig }) {
  const { config } = opts

  // Register cookie plugin for signed cookies
  await fastify.register(cookie, {
    secret: config.secret,
    parseOptions: {},
  })

  // POST /api/auth/login
  fastify.post('/api/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { username?: string; password?: string } | undefined

    if (!body || !body.username || !body.password) {
      return reply.status(400).send({ error: 'Username and password are required' })
    }

    const usernameMatch = safeCompare(body.username, config.username)
    const passwordMatch = safeCompare(body.password, config.password)

    if (!usernameMatch || !passwordMatch) {
      return reply.status(401).send({ error: 'Invalid credentials' })
    }

    reply.setCookie(COOKIE_NAME, 'authenticated', {
      path: '/',
      httpOnly: true,
      signed: true,
      sameSite: 'strict',
      maxAge: COOKIE_MAX_AGE,
    })

    return { authenticated: true }
  })

  // POST /api/auth/logout
  fastify.post('/api/auth/logout', async (_request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie(COOKIE_NAME, { path: '/' })
    return { authenticated: false }
  })

  // GET /api/auth/check
  fastify.get('/api/auth/check', async (request: FastifyRequest, reply: FastifyReply) => {
    const cookieValue = request.cookies[COOKIE_NAME]
    if (!cookieValue) {
      return reply.status(401).send({ authenticated: false })
    }

    const unsigned = request.unsignCookie(cookieValue)
    if (!unsigned.valid || unsigned.value !== 'authenticated') {
      return reply.status(401).send({ authenticated: false })
    }

    return { authenticated: true }
  })

  // Auth guard for all /api/* routes except public auth endpoints
  fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url.split('?')[0]

    // Skip non-API routes
    if (!url.startsWith('/api/')) {
      return
    }

    // Skip public auth routes
    if (PUBLIC_PATHS.has(url)) {
      return
    }

    const cookieValue = request.cookies[COOKIE_NAME]
    if (!cookieValue) {
      return reply.status(401).send({ error: 'Authentication required' })
    }

    const unsigned = request.unsignCookie(cookieValue)
    if (!unsigned.valid || unsigned.value !== 'authenticated') {
      return reply.status(401).send({ error: 'Authentication required' })
    }
  })
}

export default fp(authPlugin, {
  name: 'hexopress-auth',
})
