// app/utils/session.server.js

import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "your-secret";

const storage = createCookieSessionStorage({
  cookie: {
    name: "auth_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
  },
});

export async function createSession(token) {
  const session = await storage.getSession();
  session.set("token", token);
  return storage.commitSession(session);
}

export async function getSession(cookieHeader) {
  return storage.getSession(cookieHeader);
}

export async function destroySession(cookieHeader) {
  const session = await storage.getSession(cookieHeader);
  return storage.destroySession(session);
}
