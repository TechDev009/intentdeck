import { describe, expect, it } from "bun:test"
import { parseIntent } from "../lib/cards"
import { classifyOffline } from "../lib/intent-local"
import { decide, initialMemory, rawState } from "../lib/intent-state"
import { needsDetail, resolveDraft } from "../lib/jev-draft"
import { gateSignals, neutralGated } from "../lib/signal-gate"
import type { IntentResult } from "../lib/jev"

function fakeResult(top: string, confidence: number, second?: [string, number]): IntentResult {
  const probabilities: Record<string, number> = { [top]: confidence, none: 0.01 }
  if (second) probabilities[second[0]] = second[1]
  return {
    intent: { value: top as IntentResult["intent"]["value"], confidence, probabilities: probabilities as IntentResult["intent"]["probabilities"] },
    readiness: 1.5,
    signals: {
      isQuestion: 0.06,
      recurring: 0.07,
      hasList: 0.08,
      isShopping: 0.1,
      urgency: 0.2,
      tone: { value: "neutral", confidence: 0.8 },
      eventMode: { value: "video_call", confidence: 0.82 },
      timerKind: { value: "countdown", confidence: 0.8 },
      expenseCategory: { value: "other", confidence: 0.8 },
    },
    latencyMs: 5,
    questionCount: 11,
    model: "test",
  }
}

describe("calm intent state", () => {
  it("stays in input below threshold", () => {
    expect(rawState(fakeResult("event", 0.2)).kind).toBe("input")
    expect(rawState(fakeResult("none", 0.9)).kind).toBe("input")
  })

  it("uses ghost for mid confidence and committed when sure", () => {
    expect(rawState(fakeResult("event", 0.55))).toMatchObject({ kind: "ghost" })
    expect(rawState(fakeResult("event", 0.85))).toMatchObject({ kind: "committed" })
  })

  it("offers choose on near-tie", () => {
    expect(rawState(fakeResult("event", 0.5, ["reminder", 0.45])).kind).toBe("choose")
  })

  it("requires a challenger to win twice before swapping", () => {
    const text = "Accessibility review on 2026-10-16 at 14:30 with team"
    let mem = decide(initialMemory, fakeResult("event", 0.85), text)
    expect(mem.ui).toMatchObject({ kind: "committed" })
    mem = decide(mem, fakeResult("reminder", 0.55), text)
    expect(mem.ui).toMatchObject({ kind: "committed", intent: "event" })
    mem = decide(mem, fakeResult("reminder", 0.58), text)
    expect(mem.ui.kind === "committed" && mem.ui.intent === "reminder" || mem.ui.kind === "ghost").toBe(true)
  })

  it("swaps immediately on very sure challenger", () => {
    const text = "Remind me to return the equipment badge tomorrow morning"
    let mem = decide(initialMemory, fakeResult("event", 0.85), text)
    mem = decide(mem, fakeResult("reminder", 0.9), text)
    expect(mem.ui).toMatchObject({ kind: "committed", intent: "reminder" })
  })
})

describe("signal gating", () => {
  it("keeps badges stable with hysteresis", () => {
    const base = fakeResult("event", 0.8)
    const on = gateSignals(neutralGated, { ...base, signals: { ...base.signals, eventMode: { value: "video_call", confidence: 0.7 } } }, ["eventMode"])
    expect(on.eventMode).toBe("video_call")
    const dip = gateSignals(on, { ...base, signals: { ...base.signals, eventMode: { value: "video_call", confidence: 0.55 } } }, ["eventMode"])
    expect(dip.eventMode).toBe("video_call")
    const off = gateSignals(on, { ...base, signals: { ...base.signals, eventMode: { value: "video_call", confidence: 0.4 } } }, ["eventMode"])
    expect(off.eventMode).toBeNull()
  })

  it("ignores unused signals", () => {
    const base = fakeResult("split", 0.9)
    const gated = gateSignals(neutralGated, base, [])
    expect(gated).toEqual(neutralGated)
  })
})

describe("jev-wins draft", () => {
  it("parses grocery alias as a shopping list", () => {
    const draft = parseIntent("grocery list milk, eggs, bread")
    expect(draft.kind).toBe("shopping")
    if (draft.kind !== "shopping") throw new Error("Expected shopping")
    expect(draft.items.map((item) => item.text)).toEqual(["milk", "eggs", "bread"])
  })

  it("forces list layout from jev kind even when local says event", () => {
    const local = parseIntent("dinner with priya friday 8pm on zoom, pizza, pasta")
    const resolved = resolveDraft("dinner with priya friday 8pm on zoom, pizza, pasta", "shopping", local)
    expect(resolved.kind).toBe("shopping")
    if (resolved.kind !== "shopping") throw new Error("Expected shopping")
    expect(resolved.items.length).toBeGreaterThan(1)
  })

  it("splits jev shopping text on commas and and", () => {
    const resolved = resolveDraft("buy milk, eggs, bread and coffee", "shopping", null)
    expect(resolved.kind).toBe("shopping")
    if (resolved.kind !== "shopping") throw new Error("Expected shopping")
    expect(resolved.items.map((item) => item.text)).toEqual(["milk", "eggs", "bread", "coffee"])
  })

  it("never invents timer values, asks for detail instead", () => {
    const local = parseIntent("a vague thought about time passing by slowly")
    const resolved = resolveDraft("a vague thought about time passing by slowly", "timer", local)
    expect(resolved.kind).toBe("note")
    expect(needsDetail("timer", resolved)).toContain("duration")
  })
})

describe("offline classifier", () => {
  it("classifies dated events and reminders without network", () => {
    expect(classifyOffline("Accessibility review on 2026-10-16 at 14:30").intent.value).toBe("event")
    expect(classifyOffline("Remind me to return the equipment badge tomorrow").intent.value).toBe("reminder")
  })

  it("reaches the ten new kinds offline", () => {
    expect(classifyOffline("#ff6b35").intent.value).toBe("color")
    expect(classifyOffline("5 miles in km").intent.value).toBe("convert")
    expect(classifyOffline("Pizza or burgers for Friday?").intent.value).toBe("poll")
    expect(classifyOffline("Days until Christmas").intent.value).toBe("countdown")
    expect(classifyOffline("3pm PST in IST").intent.value).toBe("timezone")
    expect(classifyOffline("Roll 2d6").intent.value).toBe("random")
    expect(classifyOffline("Read 4 of 12 books").intent.value).toBe("goal")
    expect(classifyOffline("Rahul 9820012345 rahul@mail.com").intent.value).toBe("contact")
    expect(classifyOffline("https://vercel.com/blog check later").intent.value).toBe("link")
    expect(classifyOffline("Flight to Goa next weekend").intent.value).toBe("travel")
  })

  it("returns none for empty input", () => {
    expect(classifyOffline("").intent.value).toBe("none")
  })

  it("keeps the same IntentResult shape as Jev", () => {
    const result = classifyOffline("Split the dinner bill of 2400 between 3 friends tonight")
    expect(result.questionCount).toBe(11)
    expect(typeof result.intent.confidence).toBe("number")
    expect(typeof result.signals.urgency).toBe("number")
  })
})
