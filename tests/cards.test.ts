import { describe, expect, it } from "bun:test"
import { CARD_EXAMPLES, convertUnitKind, convertUnits, evaluateArithmetic, extractEventEntities, habitPeriodKey, isHabitComplete, isIntentCard, materializeDraft, parseIntent, pauseTimer, remainingTimerSeconds, splitShares, startTimer } from "../lib/cards"

const now = new Date(2026, 8, 23, 12, 0, 0)

describe("live preview examples", () => {
  it("offers twenty-five distinct card kinds", () => {
    expect(CARD_EXAMPLES).toHaveLength(25)
    expect(new Set(CARD_EXAMPLES.map((example) => example.kind)).size).toBe(25)
  })

  for (const example of CARD_EXAMPLES) {
    it(`recognizes the ${example.kind} example locally`, () => {
      expect(parseIntent(example.text, now).kind).toBe(example.kind)
    })
  }
})

describe("parseIntent", () => {
  it("turns a clearly scheduled event into an event card", () => {
    const draft = parseIntent("Accessibility review on 2026-10-16 at 14:30", now)

    expect(draft).toMatchObject({
      kind: "event",
      title: "Accessibility review",
      scheduledAt: new Date(2026, 9, 16, 14, 30, 0).toISOString(),
      scheduleAmbiguous: false,
    })
  })

  it("keeps a reminder action separate from its due time", () => {
    const draft = parseIntent("Remind me to return the equipment badge on 2026-10-02 at 16:15", now)

    expect(draft).toMatchObject({
      kind: "reminder",
      title: "Return the equipment badge",
      scheduledAt: new Date(2026, 9, 2, 16, 15, 0).toISOString(),
    })
  })

  it("does not guess AM or PM for ambiguous times", () => {
    const draft = parseIntent("Accessibility review on 2026-10-16 at 8", now)

    expect(draft).toMatchObject({
      kind: "event",
      title: "Accessibility review",
      scheduledAt: "2026-10-16",
      scheduleAmbiguous: true,
    })
  })

  it("keeps date-only events and explicit 24-hour times precise", () => {
    expect(parseIntent("Dentist Friday", now)).toMatchObject({ kind: "event", title: "Dentist", scheduledAt: "2026-09-25", scheduleAmbiguous: false })
    expect(parseIntent("event: Archive review 2026-09-25 at 20:00", now)).toMatchObject({
      kind: "event",
      title: "Archive review",
      scheduledAt: new Date(2026, 8, 25, 20, 0, 0).toISOString(),
    })
  })

  it("rejects impossible calendar dates instead of moving them", () => {
    expect(() => parseIntent("Dinner 2026-02-30 at 7pm", now)).toThrow("date doesn't exist")
  })

  it("parses bounded timers", () => {
    expect(parseIntent("Set timer for 8 minutes to steep green tea", now)).toEqual({
      kind: "timer",
      title: "Steep green tea",
      durationSeconds: 480,
    })
  })

  it("parses checklist items without evaluating user text", () => {
    expect(parseIntent("Create a checklist: confirm the deploy window, export the error report, notify support", now)).toEqual({
      kind: "checklist",
      title: "Checklist",
      items: [{ text: "confirm the deploy window" }, { text: "export the error report" }, { text: "notify support" }],
    })
  })

  it("creates a categorized expense with cents and a local spend date", () => {
    const draft = parseIntent("Spent ₹430 on taxi today", now)
    expect(draft).toMatchObject({ kind: "expense", title: "Taxi", amountCents: 43000, currency: "INR", category: "Transport", spentAt: "2026-09-23" })
    expect(isIntentCard(materializeDraft(draft, now, "expense-1"))).toBe(true)
  })

  it("keeps recipe ingredients and steps as separate checkable lists", () => {
    const draft = parseIntent(CARD_EXAMPLES.find((example) => example.kind === "recipe")!.text, now)
    expect(draft).toMatchObject({ kind: "recipe", title: "Tomato lentils", ingredients: [{ text: "lentils" }, { text: "tomatoes" }, { text: "ginger" }] })
    if (draft.kind !== "recipe") throw new Error("Expected recipe draft")
    const card = materializeDraft(draft, now, "recipe-1")
    expect(card.kind === "recipe" && card.steps.map((step) => [step.id, step.done])).toEqual([
      ["recipe-1-step-1", false], ["recipe-1-step-2", false], ["recipe-1-step-3", false],
    ])
    expect(isIntentCard(card)).toBe(true)
  })

  it("tracks daily and weekly habit completion by local period", () => {
    const dailyDraft = parseIntent("Habit: take a 20-minute walk daily", now)
    expect(dailyDraft.kind).toBe("habit")
    if (dailyDraft.kind !== "habit") throw new Error("Expected habit draft")
    const daily = materializeDraft(dailyDraft, now, "habit-daily")
    if (daily.kind !== "habit") throw new Error("Expected materialized habit")
    const doneToday = { ...daily, lastCompletedPeriod: habitPeriodKey("daily", now) }
    expect(isHabitComplete(doneToday, now)).toBe(true)
    expect(isHabitComplete(doneToday, new Date(2026, 8, 24))).toBe(false)

    const weekly = { ...daily, cadence: "weekly" as const, lastCompletedPeriod: habitPeriodKey("weekly", now) }
    expect(isHabitComplete(weekly, now)).toBe(true)
    expect(isHabitComplete(weekly, new Date(2026, 8, 28))).toBe(false)
  })

  it("splits money into whole cents whose shares add back to the total", () => {
    const draft = parseIntent("Split ₹1,275.50 among 4", now)

    expect(draft).toMatchObject({
      kind: "split",
      amountCents: 127550,
      peopleCount: 4,
      currency: "INR",
    })
    if (draft.kind === "split") {
      expect(draft.shareAmountsCents.reduce((sum, cents) => sum + cents, 0)).toBe(127550)
      expect(draft.shareAmountsCents).toEqual([31888, 31888, 31887, 31887])
    }
  })

  it("evaluates arithmetic with a safe parser", () => {
    expect(parseIntent("Calculate (2450 * 0.18) + 2450", now)).toMatchObject({
      kind: "calculation",
      result: 2891,
    })
    expect(parseIntent("calculate 15% of 80", now)).toMatchObject({
      kind: "calculation",
      result: 12,
    })
  })

  it("rejects malformed and unsafe calculations", () => {
    expect(() => parseIntent("calc 100 / 0", now)).toThrow("Division by zero")
    expect(() => parseIntent("calc process.exit()", now)).toThrow("calculation")
  })

  it("splits with divide/by/into/share wording", () => {
    expect(parseIntent("divide 2400 by 3", now).kind).toBe("split")
    expect(parseIntent("share 2400 among 3 friends", now).kind).toBe("split")
    expect(parseIntent("split the bill $120 into 4 ways", now)).toMatchObject({ kind: "split", peopleCount: 4 })
    expect(parseIntent("divide $48 by 2 people", now)).toMatchObject({ kind: "split", peopleCount: 2 })
    expect(() => parseIntent("split the bill please", now)).toThrow("divide 2400 by 3")
  })

  it("accepts spend/pay expense verbs and bare-duration timers", () => {
    expect(parseIntent("spend $45 on lunch today", now).kind).toBe("expense")
    expect(parseIntent("25 min focus", now)).toMatchObject({ kind: "timer", durationSeconds: 1500 })
    expect(parseIntent("8 minutes to steep tea", now)).toMatchObject({ kind: "timer", title: "Steep tea" })
  })
  it("uses a note as a safe fallback for unsupported text", () => {
    expect(parseIntent("An idea to revisit later", now)).toEqual({
      kind: "note",
      title: "An idea to revisit later",
      body: "An idea to revisit later",
    })
  })

  it("rejects blank and oversized input", () => {
    expect(() => parseIntent("   ", now)).toThrow("Write a thought")
    expect(() => parseIntent("x".repeat(1001), now)).toThrow("1000 characters")
  })

  it("starts timers from the current wall clock and preserves paused time", () => {    const startedAt = new Date("2026-09-23T10:00:00.000Z")
    const card = materializeDraft(parseIntent("timer 5 seconds", now), startedAt, "timer-1")
    if (card.kind !== "timer") throw new Error("Expected a timer card")

    const running = startTimer(card, startedAt.getTime())
    expect(running.endsAt).toBe("2026-09-23T10:00:05.000Z")
    expect(remainingTimerSeconds(running, startedAt.getTime() + 1100)).toBe(4)
    const paused = pauseTimer(running, startedAt.getTime() + 1100)
    expect(paused.endsAt).toBeNull()
    expect(paused.remainingSeconds).toBe(4)
    expect(remainingTimerSeconds(paused, startedAt.getTime() + 60_000)).toBe(4)
  })
  it("extracts travel dates without touching the destination", () => {
    const friday = new Date(2026, 8, 25, 12, 0, 0)
    expect(parseIntent("Flight to Goa next weekend", friday)).toMatchObject({
      kind: "travel",
      destination: "Goa",
      mode: "flight",
      when: "2026-09-26",
    })
    expect(parseIntent("Train to Delhi tomorrow", friday)).toMatchObject({ kind: "travel", when: "2026-09-26" })
    expect(parseIntent("Trip to Paris 2026-11-02", friday)).toMatchObject({ kind: "travel", when: "2026-11-02" })
  })

  it("keeps item times intact instead of stripping leading digits", () => {
    const draft = parseIntent("Itinerary: Kyoto day one; 09:00 Fushimi Inari, 12:30 lunch", now)
    expect(draft.kind).toBe("itinerary")
    if (draft.kind !== "itinerary") throw new Error("Expected itinerary")
    expect(draft.items.map((item) => item.text)).toEqual(["09:00 Fushimi Inari", "12:30 lunch"])
  })

  it("extracts attendees and video without inventing them", () => {
    expect(extractEventEntities("dinner with priya friday 8pm on zoom", "dinner")).toEqual({
      title: "dinner",
      attendees: ["Priya"],
      video: "Zoom",
    })
    expect(extractEventEntities("lunch with rahul and anna tomorrow", "lunch")).toMatchObject({
      attendees: ["Rahul", "Anna"],
    })
    expect(extractEventEntities("Dentist appointment", "Dentist appointment")).toEqual({
      title: "Dentist appointment",
      attendees: [],
      video: null,
    })
    expect(extractEventEntities("Team standup via teams", "Team standup").video).toBe("Teams")
  })
})

describe("widget math (shared by interactive controls)", () => {  it("evaluates calculator input with the same bounded parser", () => {
    expect(evaluateArithmetic("2+3*4").result).toBe(14)
    expect(evaluateArithmetic("15% of 80").result).toBe(12)
    expect(() => evaluateArithmetic("100/0")).toThrow("Division by zero")
    expect(() => evaluateArithmetic("process.exit()")).toThrow("calculation")
  })

  it("splits shares exactly like saved cards", () => {
    expect(splitShares(127550, 4)).toEqual([31888, 31888, 31887, 31887])
    expect(splitShares(100, 3).reduce((sum, share) => sum + share, 0)).toBe(100)
  })

  it("converts units within a kind and refuses mixed kinds", () => {
    expect(convertUnits(5, "miles", "km")).toBe(8.0467)
    expect(convertUnits(72, "f", "c")).toBeCloseTo(22.2222, 4)
    expect(convertUnits(5, "miles", "kg")).toBeNull()
    expect(convertUnitKind("mi")).toBe("length")
    expect(convertUnitKind("f")).toBe("temperature")
    expect(convertUnitKind("usd")).toBeNull()
  })
})
