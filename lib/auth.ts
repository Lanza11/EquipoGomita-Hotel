import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'hotel_session';

export type SessionRole = 'ADMIN' | 'USER';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: SessionRole;
};

type SessionPayload = SessionUser & {
  exp: number;
};

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'hotel-dev-secret';

function getSignature(value: string) {
  return createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodePayload(encodedPayload: string) {
  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload;
}

export function createSessionToken(user: SessionUser) {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
  const encodedPayload = encodePayload(payload);
  const signature = getSignature(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split('.');

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = getSignature(encodedPayload);

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = decodePayload(encodedPayload);

    if (!payload.exp || payload.exp < Date.now()) {
      return null;
    }

    return {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      image: payload.image,
      role: payload.role,
    } satisfies SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  // `cookies()` can be async in newer Next.js versions; await to be safe
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  const token = cookie?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export function getSessionUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
