import { server } from "@nifrajs/core/server"
import { t } from "@nifrajs/schema"
import { classifyIntent, suggestCardKind } from "./lib/jev"
import { countJevPromptCharacters, MIN_JEV_PROMPT_CHARACTERS } from "./lib/jev-constraints"

interface IntentDeckEnv {
  TYPESAFE_API_KEY?: string
  INTENTDECK_JEV_ENABLED?: string
  JEV_MODEL?: string
}

const MAX_CALLS_PER_MINUTE = 5
const MAX_CALLS_PER_DAY = 50
const FAVICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#20483e"/><path d="M32 8 39 25 56 32 39 39 32 56 25 39 8 32 25 25Z" fill="#d5f36a"/></svg>'
let activeMinute = -1
let callsThisMinute = 0
let activeDay = -1
let callsToday = 0

function readProcessEnv(): Record<string, string | undefined> {
  return (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
}

function value(env: IntentDeckEnv | undefined, processEnv: Record<string, string | undefined>, key: keyof IntentDeckEnv): string {
  const fromPlatform = env?.[key]
  return typeof fromPlatform === "string" ? fromPlatform : processEnv[key] ?? ""
}

function configuration(env: IntentDeckEnv | undefined) {
  const processEnv = readProcessEnv()
  const enabled = value(env, processEnv, "INTENTDECK_JEV_ENABLED").toLowerCase() === "true"
  const apiKey = value(env, processEnv, "TYPESAFE_API_KEY").trim()
  const model = value(env, processEnv, "JEV_MODEL").trim() || "jev-1.13.0"
  return { enabled: enabled && apiKey.length > 0, apiKey, model }
}

function takeJevSlot(now = Date.now()): boolean {
  const minute = Math.floor(now / 60_000)
  const day = Math.floor(now / 86_400_000)
  if (minute !== activeMinute) {
    activeMinute = minute
    callsThisMinute = 0
  }
  if (day !== activeDay) {
    activeDay = day
    callsToday = 0
  }
  if (callsThisMinute >= MAX_CALLS_PER_MINUTE || callsToday >= MAX_CALLS_PER_DAY) return false
  callsThisMinute += 1
  callsToday += 1
  return true
}

const intentCache = new Map<string, { expires: number; payload: unknown }>()
function readIntentCache(key: string, now = Date.now()): unknown | null {
  const entry = intentCache.get(key)
  if (!entry) return null
  if (entry.expires <= now) {
    intentCache.delete(key)
    return null
  }
  return entry.payload
}

function writeIntentCache(key: string, payload: unknown, now = Date.now()): void {
  if (intentCache.size >= 100) {
    const oldest = intentCache.keys().next().value
    if (oldest) intentCache.delete(oldest)
  }
  intentCache.set(key, { expires: now + 60_000, payload })
}

export const backend = server<IntentDeckEnv>()
  .get("/api/favicon.svg", () => new Response(FAVICON, {
    headers: {
      "cache-control": "public, max-age=86400",
      "content-type": "image/svg+xml; charset=utf-8",
    },
  }))
  .get("/api/jev/status", (c) => ({ available: configuration(c.env).enabled }))
  .post(
    "/api/intent",
    { body: t.object({ text: t.string({ minLength: 1, maxLength: 1000 }) }) },
    async (c) => {
      const prompt = c.body.text.trim()
      if (countJevPromptCharacters(prompt) < MIN_JEV_PROMPT_CHARACTERS) {
        c.set.status = 422
        return { error: `Jev needs at least ${MIN_JEV_PROMPT_CHARACTERS} characters. Your local preview works with shorter thoughts.` }
      }
      const config = configuration(c.env)
      if (!config.enabled) {
        c.set.status = 503
        return { error: "Jev assist is not configured. Your local deck still works without it." }
      }
      const cacheKey = `${config.model}::${prompt.slice(0, 500)}`
      const cached = readIntentCache(cacheKey)
      if (cached) return { ...(cached as Record<string, unknown>), cached: true }
      if (!takeJevSlot()) {
        c.set.status = 429
        return { error: "Jev assist is temporarily rate limited. Try again in a minute." }
      }
      try {
        const result = await classifyIntent(prompt, { apiKey: config.apiKey, model: config.model })
        const payload = { ...result, source: "jev" as const }
        writeIntentCache(cacheKey, payload)
        return payload
      } catch {
        c.set.status = 502
        return { error: "Jev couldn't classify that thought. Your text remains in this browser; try previewing locally." }
      }
    },
  )
  .post(
    "/api/jev/suggest",
    { body: t.object({ text: t.string({ minLength: 1, maxLength: 1000 }) }) },
    async (c) => {
      const prompt = c.body.text.trim()
      if (countJevPromptCharacters(prompt) < MIN_JEV_PROMPT_CHARACTERS) {
        c.set.status = 422
        return { error: `Ask Jev needs at least ${MIN_JEV_PROMPT_CHARACTERS} characters. Your local preview works with shorter thoughts.` }
      }
      const config = configuration(c.env)
      if (!config.enabled) {
        c.set.status = 503
        return { error: "Jev assist is not configured. Your local deck still works without it." }
      }
      if (!takeJevSlot()) {
        c.set.status = 429
        return { error: "Jev assist is temporarily rate limited. Try again in a minute." }
      }
      try {
        const suggestion = await suggestCardKind(prompt, { apiKey: config.apiKey, model: config.model })
        return suggestion
      } catch {
        c.set.status = 502
        return { error: "Jev couldn't classify that thought. Your text remains in this browser; try previewing locally." }
      }
    },
  )
