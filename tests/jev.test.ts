import { describe, expect, it } from "bun:test"
import { classifyIntent, suggestCardKind } from "../lib/jev"

function fullMockAnswers(choice = "event", confidence = 0.91) {
  const base: Record<string, number> = {
    event: 0.02,
    reminder: 0.02,
    checklist: 0.005,
    shopping: 0.005,
    timer: 0.005,
    split: 0.005,
    expense: 0.005,
    calculation: 0.005,
    recipe: 0.005,
    workout: 0.005,
    habit: 0.005,
    agenda: 0.005,
    itinerary: 0.005,
    project: 0.005,
    note: 0.01,
    none: 0.001,
    color: 0.004,
    convert: 0.004,
    poll: 0.004,
    countdown: 0.004,
    timezone: 0.004,
    random: 0.004,
    goal: 0.004,
    contact: 0.004,
    link: 0.004,
    travel: 0.004,
  }
  // Normalize so probabilities sum to 1 within epsilon.
  const restTotal = Object.entries(base).filter(([k]) => k !== choice).reduce((s, [, v]) => s + v, 0)
  const scale = restTotal > 0 ? (1 - confidence) / restTotal : 0
  const kindProbs: Record<string, number> = {}
  for (const [k, v] of Object.entries(base)) kindProbs[k] = k === choice ? confidence : v * scale
  return {
    kind: {
      type: "choice",
      choice,
      probabilities: kindProbs,
      confidence,
    },
    readiness: { type: "score", score: 1.6, probabilities: { "0": 0.1, "1": 0.2, "2": 0.7 }, confidence: 0.8 },
    is_question: { type: "noul", noul: 0.06 },
    recurring: { type: "noul", noul: 0.07 },
    has_list: { type: "noul", noul: 0.08 },
    is_shopping: { type: "noul", noul: 0.1 },
    urgency: { type: "score", score: 0.2, probabilities: { "0": 0.8, "1": 0.15, "2": 0.05 }, confidence: 0.8 },
    tone: { type: "choice", choice: "neutral", probabilities: { neutral: 0.8, positive: 0.05, excited: 0.05, stressed: 0.05, reflective: 0.05 }, confidence: 0.8 },
    event_mode: { type: "choice", choice: "video_call", probabilities: { in_person: 0.05, video_call: 0.82, phone_call: 0.03, unspecified: 0.1 }, confidence: 0.82 },
    timer_kind: { type: "choice", choice: "countdown", probabilities: { countdown: 0.8, focus: 0.1, break: 0.05, stopwatch: 0.05 }, confidence: 0.8 },
    expense_category: { type: "choice", choice: "other", probabilities: { food: 0.05, transport: 0.05, shopping: 0.05, bills: 0.05, entertainment: 0.05, health: 0.05, other: 0.7 }, confidence: 0.8 },
  }
}

describe("Jev card-kind suggestion", () => {
  it("rejects prompts shorter than 20 characters without calling the provider", async () => {
    let called = false
    const fakeFetch = (async () => {
      called = true
      return new Response("{}")
    }) as unknown as typeof fetch

    await expect(suggestCardKind("a".repeat(19), {
      apiKey: "unit-test-only-key",
      model: "jev-test",
      fetch: fakeFetch,
    })).rejects.toThrow("at least 20 characters")
    expect(called).toBe(false)
  })

  it("uses an injected fetch and returns only a validated choice", async () => {
    let capturedUrl = ""
    let capturedInit: RequestInit | undefined
    const fakeFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = String(input)
      capturedInit = init
      return new Response(JSON.stringify({
        model: "jev-test",
        answers: fullMockAnswers("event", 0.91),
      }), { status: 200, headers: { "content-type": "application/json" } })
    }) as unknown as typeof fetch

    const result = await suggestCardKind("Accessibility review on 2026-10-16 at 14:30", {
      apiKey: "unit-test-only-key",
      model: "jev-test",
      fetch: fakeFetch,
    })

    expect(result).toEqual({ kind: "event", confidence: 0.91 })
    expect(capturedUrl).toContain("/v1/systemone")
    expect((capturedInit?.headers as Record<string, string>).authorization).toBe("Bearer unit-test-only-key")
    expect(JSON.parse(String(capturedInit?.body))).toMatchObject({ model: "jev-test", state: { text: "Accessibility review on 2026-10-16 at 14:30" } })
  })

  it("classifies full fan-out signals without inventing values", async () => {
    const fakeFetch = (async () => new Response(JSON.stringify({
      model: "jev-test",
      answers: fullMockAnswers("event", 0.78),
    }), { status: 200, headers: { "content-type": "application/json" } })) as unknown as typeof fetch

    const result = await classifyIntent("Accessibility review on 2026-10-16 at 14:30 with video link", {
      apiKey: "unit-test-only-key",
      model: "jev-test",
      fetch: fakeFetch,
    })
    expect(result.intent.value).toBe("event")
    expect(result.questionCount).toBe(11)
    expect(result.signals.eventMode.value).toBe("video_call")
    expect(result.model).toBe("jev-test")
  })

  it("does not try a request when no key is configured", async () => {
    let called = false
    const fakeFetch = (async () => { called = true; return new Response("{}") }) as unknown as typeof fetch

    await expect(suggestCardKind("A thought with enough detail to pass the minimum", { apiKey: " ", model: "jev-test", fetch: fakeFetch })).rejects.toThrow("not configured")
    expect(called).toBe(false)
  })
})
