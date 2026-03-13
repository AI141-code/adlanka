import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export type SessionUser = {
  userId: string
  phoneNumber: string
  isAdmin: boolean
}

const COOKIE_NAME = 'adlanka_session'

function getSessionSecret() {
  return process.env.SESSION_SECRET || 'dev-session-secret-change-me'
}

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === 'string' ? Buffer.from(input) : input
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecodeToString(input: string) {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  return Buffer.from(b64, 'base64').toString('utf8')
}

function sign(payloadB64: string) {
  return base64UrlEncode(crypto.createHmac('sha256', getSessionSecret()).update(payloadB64).digest())
}

export function createSessionValue(user: SessionUser) {
  const payload = {
    ...user,
    iat: Date.now(),
  }
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const sig = sign(payloadB64)
  return `${payloadB64}.${sig}`
}

export function parseSessionValue(value: string | undefined | null): SessionUser | null {
  if (!value) return null
  const [payloadB64, sig] = value.split('.')
  if (!payloadB64 || !sig) return null
  const expected = sign(payloadB64)
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  try {
    const json = JSON.parse(base64UrlDecodeToString(payloadB64)) as SessionUser & { iat?: number }
    if (!json?.userId || !json?.phoneNumber) return null
    return { userId: json.userId, phoneNumber: json.phoneNumber, isAdmin: !!json.isAdmin }
  } catch {
    return null
  }
}

export async function getSessionFromCookies(): Promise<SessionUser | null> {
  const jar = await cookies()
  const value = jar.get(COOKIE_NAME)?.value
  return parseSessionValue(value)
}

export function setSessionCookie(res: NextResponse, user: SessionUser) {
  const value = createSessionValue(user)
  res.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}

