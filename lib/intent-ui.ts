import type { CardKind } from "./cards"
import type { SignalKey } from "./signal-gate"

export interface IntentUiSpec {
  label: string
  example: string
  usedSignals: readonly SignalKey[]
}

export const INTENT_UI: Record<CardKind, IntentUiSpec> = {
  event: { label: "Event", example: "Accessibility review on 2026-10-16 at 14:30", usedSignals: ["eventMode", "recurring", "urgency"] },
  reminder: { label: "Reminder", example: "Remind me to return the equipment badge on 2026-10-02 at 16:15", usedSignals: ["urgency", "recurring"] },
  checklist: { label: "Checklist", example: "Create a checklist: confirm the deploy window, export the error report, notify support", usedSignals: ["hasList", "urgency"] },
  shopping: { label: "Shopping", example: "Shopping: oat milk, black beans, limes", usedSignals: ["isShopping", "hasList"] },
  timer: { label: "Timer", example: "Set timer for 8 minutes to steep green tea", usedSignals: ["timerKind"] },
  split: { label: "Split", example: "Split ₹1,275.50 among 4", usedSignals: [] },
  expense: { label: "Expense", example: "Spent ₹430 on taxi today", usedSignals: ["expenseCategory"] },
  calculation: { label: "Calculation", example: "Calculate (2450 * 0.18) + 2450", usedSignals: [] },
  recipe: { label: "Recipe", example: "Recipe: tomato lentils; ingredients: lentils, tomatoes, ginger; steps: simmer lentils, temper spices, fold together", usedSignals: ["hasList"] },
  workout: { label: "Workout", example: "Workout: Upper body; rows 3x10, push-ups 3x8, stretch 5 minutes", usedSignals: ["hasList"] },
  habit: { label: "Habit", example: "Habit: take a 20-minute walk daily", usedSignals: ["recurring"] },
  agenda: { label: "Agenda", example: "Agenda: Launch review; support readiness, rollback plan, documentation owner", usedSignals: ["hasList"] },
  itinerary: { label: "Itinerary", example: "Itinerary: Kyoto day one; 09:00 Fushimi Inari, 12:30 lunch at Nishiki Market, 15:00 check in", usedSignals: ["hasList"] },
  project: { label: "Project", example: "Project plan: IntentDeck release; finish onboarding docs, record walkthrough, tag v1", usedSignals: ["hasList"] },
  note: { label: "Note", example: "Record printer model PX-410 uses 63A toner cartridges", usedSignals: ["tone", "isQuestion"] },
  color: { label: "Color", example: "#ff6b35", usedSignals: [] },
  convert: { label: "Convert", example: "5 miles in km", usedSignals: [] },
  poll: { label: "Poll", example: "Pizza or burgers for Friday?", usedSignals: ["hasList"] },
  countdown: { label: "Countdown", example: "Days until Christmas", usedSignals: ["urgency"] },
  timezone: { label: "Time zone", example: "3pm PST in IST", usedSignals: [] },
  random: { label: "Random", example: "Roll 2d6", usedSignals: [] },
  goal: { label: "Goal", example: "Read 4 of 12 books", usedSignals: [] },
  contact: { label: "Contact", example: "Rahul 9820012345 rahul@mail.com", usedSignals: [] },
  link: { label: "Link", example: "https://vercel.com/blog check later", usedSignals: [] },
  travel: { label: "Trip", example: "Flight to Goa next weekend", usedSignals: ["recurring"] },
}
