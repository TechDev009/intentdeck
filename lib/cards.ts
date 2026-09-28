export const MAX_INPUT_LENGTH = 1000
const MAX_TIMER_SECONDS = 24 * 60 * 60

export const CARD_KINDS = [
  "event", "reminder", "checklist", "shopping", "timer", "split", "expense", "calculation",
  "recipe", "workout", "habit", "agenda", "itinerary", "project", "note",
  "color", "convert", "poll", "countdown", "timezone", "random", "goal", "contact", "link", "travel",
] as const

export type CardKind = (typeof CARD_KINDS)[number]
export type Currency = "USD" | "EUR" | "GBP" | "INR"
export const COLLECTION_CARD_KINDS = ["checklist", "shopping", "workout", "agenda", "itinerary", "project"] as const
export type CollectionCardKind = (typeof COLLECTION_CARD_KINDS)[number]

export type CollectionDraft = {
  [Kind in CollectionCardKind]: { kind: Kind; title: string; items: { text: string }[] }
}[CollectionCardKind]

type CheckableItem = { id: string; text: string; done: boolean }
export type CollectionCard = {
  [Kind in CollectionCardKind]: CardBase & { kind: Kind; title: string; items: CheckableItem[] }
}[CollectionCardKind]

export const CARD_EXAMPLES: ReadonlyArray<{ kind: CardKind; text: string }> = [
  { kind: "event", text: "Accessibility review on 2026-10-16 at 14:30" },
  { kind: "reminder", text: "Remind me to return the equipment badge on 2026-10-02 at 16:15" },
  { kind: "checklist", text: "Create a checklist: confirm the deploy window, export the error report, notify support" },
  { kind: "shopping", text: "Shopping: oat milk, black beans, limes" },
  { kind: "timer", text: "Set timer for 8 minutes to steep green tea" },
  { kind: "split", text: "Split ₹1,275.50 among 4" },
  { kind: "expense", text: "Spent ₹430 on taxi today" },
  { kind: "calculation", text: "Calculate (2450 * 0.18) + 2450" },
  { kind: "recipe", text: "Recipe: tomato lentils; ingredients: lentils, tomatoes, ginger; steps: simmer lentils, temper spices, fold together" },
  { kind: "workout", text: "Workout: Upper body; rows 3x10, push-ups 3x8, stretch 5 minutes" },
  { kind: "habit", text: "Habit: take a 20-minute walk daily" },
  { kind: "agenda", text: "Agenda: Launch review; support readiness, rollback plan, documentation owner" },
  { kind: "itinerary", text: "Itinerary: Kyoto day one; 09:00 Fushimi Inari, 12:30 lunch at Nishiki Market, 15:00 check in" },
  { kind: "project", text: "Project plan: IntentDeck release; finish onboarding docs, record walkthrough, tag v1" },
  { kind: "note", text: "Record printer model PX-410 uses 63A toner cartridges" },
  { kind: "color", text: "#ff6b35" },
  { kind: "convert", text: "5 miles in km" },
  { kind: "poll", text: "Pizza or burgers for Friday?" },
  { kind: "countdown", text: "Days until Christmas" },
  { kind: "timezone", text: "3pm PST in IST" },
  { kind: "random", text: "Roll 2d6" },
  { kind: "goal", text: "Read 4 of 12 books" },
  { kind: "contact", text: "Rahul 9820012345 rahul@mail.com" },
  { kind: "link", text: "https://vercel.com/blog check later" },
  { kind: "travel", text: "Flight to Goa next weekend" },
]

export type IntentDraft =
  | {
      kind: "event" | "reminder"
      title: string
      scheduledAt: string | null
      scheduleAmbiguous: boolean
    }
  | CollectionDraft
  | { kind: "timer"; title: string; durationSeconds: number }
  | {
      kind: "split"
      title: string
      amountCents: number
      peopleCount: number
      currency: Currency
      shareAmountsCents: number[]
    }
  | { kind: "expense"; title: string; amountCents: number; currency: Currency; category: string; spentAt: string }
  | { kind: "calculation"; title: string; expression: string; result: number }
  | { kind: "recipe"; title: string; servings: number | null; ingredients: { text: string }[]; steps: { text: string }[] }
  | { kind: "habit"; title: string; cadence: "daily" | "weekly"; lastCompletedPeriod: string | null }
  | { kind: "note"; title: string; body: string }
  | { kind: "color"; title: string; hex: string; name: string }
  | { kind: "convert"; title: string; input: number; from: string; to: string; result: number }
  | { kind: "poll"; title: string; options: { text: string }[] }
  | { kind: "countdown"; title: string; target: string }
  | { kind: "timezone"; title: string; from: string; to: string; hour: number; minute: number }
  | { kind: "random"; title: string; expression: string; result: string }
  | { kind: "goal"; title: string; current: number; target: number; unit: string }
  | { kind: "contact"; title: string; phone: string | null; email: string | null }
  | { kind: "link"; title: string; url: string; note: string | null }
  | { kind: "travel"; title: string; destination: string; mode: string; when: string | null }

type CardBase = { id: string; createdAt: string; completed: boolean }
export type RecipeCard = CardBase & {
  kind: "recipe"
  title: string
  servings: number | null
  ingredients: CheckableItem[]
  steps: CheckableItem[]
}

export type PollCard = CardBase & {
  kind: "poll"
  title: string
  options: { id: string; text: string; votes: number }[]
}

export type IntentCard =
  | (CardBase & Extract<IntentDraft, { kind: "event" | "reminder" }>)
  | CollectionCard
  | (CardBase & {
      kind: "timer"
      title: string
      durationSeconds: number
      remainingSeconds: number
      endsAt: string | null
    })
  | (CardBase & Extract<IntentDraft, { kind: "split" }>)
  | (CardBase & Extract<IntentDraft, { kind: "expense" }>)
  | (CardBase & Extract<IntentDraft, { kind: "calculation" }>)
  | RecipeCard
  | PollCard
  | (CardBase & Extract<IntentDraft, { kind: "habit" }>)
  | (CardBase & Extract<IntentDraft, { kind: "note" }>)
  | (CardBase & Extract<IntentDraft, { kind: "color" }>)
  | (CardBase & Extract<IntentDraft, { kind: "convert" }>)
  | (CardBase & Extract<IntentDraft, { kind: "countdown" }>)
  | (CardBase & Extract<IntentDraft, { kind: "timezone" }>)
  | (CardBase & Extract<IntentDraft, { kind: "random" }>)
  | (CardBase & Extract<IntentDraft, { kind: "goal" }>)
  | (CardBase & Extract<IntentDraft, { kind: "contact" }>)
  | (CardBase & Extract<IntentDraft, { kind: "link" }>)
  | (CardBase & Extract<IntentDraft, { kind: "travel" }>)

export function isCollectionKind(kind: CardKind): kind is CollectionCardKind {
  return (COLLECTION_CARD_KINDS as readonly string[]).includes(kind)
}

export function isCollectionCard(card: IntentCard): card is CollectionCard {
  return isCollectionKind(card.kind)
}

export function isCollectionDraft(draft: IntentDraft): draft is CollectionDraft {
  return isCollectionKind(draft.kind)
}

export function habitPeriodKey(cadence: "daily" | "weekly", date = new Date()): string {
  const period = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (cadence === "weekly") period.setDate(period.getDate() - ((period.getDay() + 6) % 7))
  return localDateKey(period)
}

export function isHabitComplete(card: Extract<IntentCard, { kind: "habit" }>, now = new Date()): boolean {
  return card.lastCompletedPeriod === habitPeriodKey(card.cadence, now)
}

const weekdays: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

function cap(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ")
  return clean ? clean[0]!.toLocaleUpperCase() + clean.slice(1) : "Quick note"
}

export function makeNote(text: string): Extract<IntentDraft, { kind: "note" }> {
  const trimmed = text.trim()
  const firstLine = trimmed.split("\n")[0] ?? ""
  const title = firstLine.length > 120 ? firstLine.slice(0, 120).trim() + "…" : cap(firstLine || trimmed)
  return { kind: "note", title, body: trimmed }
}

function boundedTitle(value: string, label: string): string {
  const title = cap(value)
  if (title.length > 240) throw new Error(`Keep ${label} titles under 240 characters.`)
  return title
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function isSchedule(value: unknown): value is string | null {
  if (value === null) return true
  if (typeof value !== "string") return false
  const dateOnly = value.match(/^(20\d{2})-(\d{2})-(\d{2})$/)
  if (dateOnly) return validLocalDate(Number(dateOnly[1]), Number(dateOnly[2]), Number(dateOnly[3])) !== null
  return /^20\d{2}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))
}

function validLocalDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

function dateFromPhrase(source: string, now: Date): { date: Date | null; explicit: boolean } {
  const iso = source.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (iso) {
    const date = validLocalDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
    if (!date) throw new Error("That calendar date doesn't exist.")
    return { date, explicit: true }
  }

  const relative = source.match(/\b(today|tomorrow)\b/i)?.[1]?.toLowerCase()
  if (relative) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    if (relative === "tomorrow") date.setDate(date.getDate() + 1)
    return { date, explicit: true }
  }

  const weekday = source.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i)?.[1]?.toLowerCase()
  if (weekday) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let daysAhead = (weekdays[weekday]! - date.getDay() + 7) % 7
    if (daysAhead === 0) daysAhead = 7
    date.setDate(date.getDate() + daysAhead)
    return { date, explicit: true }
  }

  return { date: null, explicit: false }
}

type Schedule = { scheduledAt: string | null; scheduleAmbiguous: boolean }

function parseSchedule(source: string, now: Date): Schedule {
  const relative = source.match(/\bin\s+(\d{1,4})\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?|days?)\b/i)
  if (relative) {
    const value = Number(relative[1])
    const unit = relative[2]!.toLowerCase()
    const scale = unit.startsWith("s") ? 1000 : unit.startsWith("m") ? 60_000 : unit.startsWith("h") ? 3_600_000 : 86_400_000
    return { scheduledAt: new Date(now.getTime() + value * scale).toISOString(), scheduleAmbiguous: false }
  }

  const parsedDate = dateFromPhrase(source, now)
  const meridiemTime = source.match(/\b(?:at\s+)?(\d{1,2})(?::([0-5]\d))?\s*(am|pm)\b/i)
  const twentyFourHourTime = source.match(/\bat\s+([01]?\d|2[0-3]):([0-5]\d)\b/i)
  const plainTime = source.match(/\bat\s+(\d{1,2})(?::([0-5]\d))?\b/i)
  const time = meridiemTime ?? twentyFourHourTime ?? plainTime
  if (!parsedDate.date && !time) return { scheduledAt: null, scheduleAmbiguous: false }

  const date = parsedDate.date ?? new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!time) return { scheduledAt: localDateKey(date), scheduleAmbiguous: false }

  const rawHour = Number(time[1])
  const minute = Number(time[2] ?? "0")
  const suffix = time[3]?.toLowerCase()
  if (suffix && (rawHour < 1 || rawHour > 12)) throw new Error("Use an AM/PM time between 1 and 12, or a 24-hour time.")
  if (!suffix && rawHour > 23) throw new Error("Use a time between 0 and 23.")
  const ambiguous = !suffix && !twentyFourHourTime && rawHour > 0 && rawHour <= 12
  if (ambiguous) return { scheduledAt: parsedDate.date ? localDateKey(date) : null, scheduleAmbiguous: true }

  let hour = rawHour
  if (suffix === "pm" && hour < 12) hour += 12
  if (suffix === "am" && hour === 12) hour = 0
  if (hour > 23) return { scheduledAt: parsedDate.date ? localDateKey(date) : null, scheduleAmbiguous: true }
  date.setHours(hour, minute, 0, 0)
  return { scheduledAt: date.toISOString(), scheduleAmbiguous: false }
}

function cleanScheduledTitle(source: string, removeReminderPrefix = false): string {  let title = source
  if (removeReminderPrefix) title = title.replace(/^\s*remind(?:er)?\s+me\s+to\s+/i, "")
  title = title.replace(/^\s*(?:event|meeting)\s*:\s*/i, "")
  title = title
    .replace(/\bin\s+\d{1,4}\s*(?:seconds?|secs?|minutes?|mins?|hours?|hrs?|days?)\b/gi, " ")
    .replace(/\b(?:today|tomorrow|sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/gi, " ")
    .replace(/\b20\d{2}-\d{2}-\d{2}\b/g, " ")
    .replace(/\b(?:at\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/gi, " ")
    .replace(/\bat\s+\d{1,2}(?::\d{2})?\b/gi, " ")
    .replace(/\b(?:on|at)\s+(?=(?:with|via|over|on|at)\b)/gi, "")
    .replace(/\b(?:on|at|by)\s*$/i, " ")
    .replace(/[,.!?;:\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return cap(title)
}

function splitDraft(input: string): IntentDraft | null {
  const match = input.match(
    /^(?:split|divide|share)(?:\s+(?:the\s+)?(?:bill|cost|expense|total|check))?\s*([$€£₹]?)(\d[\d,]*(?:\.\d{1,2})?)\s+(?:between|among|for|by|into)\s+(\d{1,3})(?:\s+(?:people|persons?|ways|friends|each))?$/i,
  )
  if (!match) return null

  const amount = Number(match[2]!.replaceAll(",", ""))
  const peopleCount = Number(match[3])
  const amountCents = Math.round(amount * 100)
  if (!Number.isFinite(amount) || amount <= 0 || amountCents > 100_000_000) {
    throw new Error("Enter a positive amount below $1,000,000.")
  }
  if (peopleCount < 2 || peopleCount > 100) throw new Error("A split needs 2 to 100 people.")

  const currencyBySymbol: Record<string, "USD" | "EUR" | "GBP" | "INR"> = {
    "": "USD",
    "$": "USD",
    "€": "EUR",
    "£": "GBP",
    "₹": "INR",
  }
  return {
    kind: "split",
    title: "Split the bill",
    amountCents,
    peopleCount,
    currency: currencyBySymbol[match[1]!]!,
    shareAmountsCents: splitShares(amountCents, peopleCount),
  }
}

export function splitShares(amountCents: number, peopleCount: number): number[] {
  const baseShare = Math.floor(amountCents / peopleCount)
  const extraCents = amountCents % peopleCount
  return Array.from({ length: peopleCount }, (_, index) => baseShare + (index < extraCents ? 1 : 0))
}

function splitItems(raw: string, label: string, max = 50): { text: string }[] {
  const items = raw
    .split(/,|;|\n|\band\b/i)
    .map((item) => item.replace(/^\s*(?:[-*]|\d{1,3}[.)])\s+/, "").trim())
    .filter(Boolean)
  if (items.length === 0) throw new Error(`Add at least one ${label}.`)
  if (items.length > max || items.some((item) => item.length > 160)) {
    throw new Error(`Use up to ${max} ${label}s, each under 160 characters.`)
  }
  return items.map((text) => ({ text }))
}

export function splitListItems(raw: string, label: string, max = 50): { text: string }[] {
  return splitItems(raw, label, max)
}

function stripCollectionPrefix(input: string): string {
  return input
    .replace(/^(?:(?:make|create|new)\s+)?(?:shopping(?:\s+list)?|grocer(?:y|ies)(?:\s+list)?|buy)\s*[:\-]?\s*/i, "")
    .replace(/^(?:(?:a\s+)?(?:checklist|to[- ]?do))\s*[:\-]?\s*/i, "")
    .replace(/^(?:workout|exercise|training)\s*[:\-]?\s*/i, "")
    .replace(/^(?:(?:meeting|call)\s+)?agenda\s*[:\-]?\s*/i, "")
    .replace(/^(?:itinerary|trip\s+plan)\s*[:\-]?\s*/i, "")
    .replace(/^(?:project\s+plan|project)\s*[:\-]?\s*/i, "")
    .trim()
}

export function buildCollectionItems(text: string, label: string): { text: string }[] {
  const stripped = stripCollectionPrefix(text)
  const source = stripped || text.trim()
  try {
    return splitItems(source, label)
  } catch {
    return [{ text: text.trim().slice(0, 160) }]
  }
}

function collectionDraft(input: string, kind: Exclude<CollectionCardKind, "checklist">): CollectionDraft | null {
  const patterns: Record<Exclude<CollectionCardKind, "checklist">, RegExp> = {
    shopping: /^(?:(?:make|create|new)\s+)?(?:shopping(?:\s+list)?|grocer(?:y|ies)(?:\s+list)?|buy)\s*[:\-]?\s*(.*)$/i,
    workout: /^(?:workout|exercise|training)\s*[:\-]\s*(.*)$/i,
    agenda: /^(?:(?:meeting|call)\s+)?agenda\s*[:\-]\s*(.*)$/i,
    itinerary: /^(?:itinerary|trip\s+plan)\s*[:\-]\s*(.*)$/i,
    project: /^(?:project\s+plan|project)\s*[:\-]\s*(.*)$/i,
  }
  const match = input.match(patterns[kind])
  if (!match) return null
  const content = match[1]!.trim()
  const parts = content.split(/\s*(?:;|\|)\s*/).filter(Boolean)
  const titles: Record<Exclude<CollectionCardKind, "checklist">, string> = {
    shopping: "Shopping list",
    workout: "Workout",
    agenda: "Meeting agenda",
    itinerary: "Itinerary",
    project: "Project plan",
  }
  const hasNamedTitle = kind !== "shopping" && parts.length > 1
  const title = hasNamedTitle ? boundedTitle(parts.shift()!, titles[kind]) : titles[kind]
  const rawItems = hasNamedTitle ? parts.join(", ") : content
  return { kind, title, items: splitItems(rawItems, kind === "shopping" ? "shopping item" : "list item") } as CollectionDraft
}

function expenseCategory(description: string): string {
  const value = description.toLowerCase()
  if (/\b(coffee|cafe|lunch|dinner|grocer|food|restaurant|snack)\b/.test(value)) return "Food"
  if (/\b(taxi|cab|bus|train|flight|fuel|parking|metro)\b/.test(value)) return "Transport"
  if (/\b(rent|electricity|internet|water bill|utility)\b/.test(value)) return "Bills"
  if (/\b(movie|cinema|music|streaming|concert)\b/.test(value)) return "Entertainment"
  if (/\b(doctor|medicine|pharmacy|clinic|health)\b/.test(value)) return "Health"
  return "Other"
}

function expenseDraft(input: string, now: Date): IntentDraft | null {
  const match = input.match(/^(?:expense|expenses|spent|spend|paid|pay|bought)\s+([$€£₹]?)(\d[\d,]*(?:\.\d{1,2})?)(?:\s+(?:on|for)\s+(.+))?$/i)
  if (!match) return null
  const amount = Number(match[2]!.replaceAll(",", ""))
  const amountCents = Math.round(amount * 100)
  if (!Number.isFinite(amount) || amount <= 0 || amountCents > 100_000_000) {
    throw new Error("Expenses must be positive and below 1,000,000.")
  }
  const currencies: Record<string, Currency> = { "": "USD", "$": "USD", "€": "EUR", "£": "GBP", "₹": "INR" }
  const description = match[3] ?? ""
  const title = boundedTitle(cleanScheduledTitle(description).trim() || "Expense", "expense")
  return {
    kind: "expense",
    title,
    amountCents,
    currency: currencies[match[1]!]!,
    category: expenseCategory(title),
    spentAt: parseSchedule(description, now).scheduledAt ?? localDateKey(now),
  }
}

function recipeDraft(input: string): IntentDraft | null {
  const match = input.match(/^recipe\s*:\s*(.*)$/i)
  if (!match) return null
  let title = ""
  let ingredientSource = ""
  let stepSource = ""
  let servings: number | null = null
  for (const section of match[1]!.split(/\s*(?:;|\|)\s*/)) {
    const ingredient = section.match(/^ingredients?\s*:\s*(.*)$/i)
    const step = section.match(/^(?:steps?|method)\s*:\s*(.*)$/i)
    const serving = section.match(/^serves?\s+(\d{1,3})$/i)
    if (ingredient) ingredientSource = ingredient[1]!
    else if (step) stepSource = step[1]!
    else if (serving) servings = Number(serving[1])
    else if (!title) title = section
    else ingredientSource = ingredientSource ? `${ingredientSource}, ${section}` : section
  }
  const titleServings = title.match(/\bserves?\s+(\d{1,3})\b/i)
  if (titleServings) servings ??= Number(titleServings[1])
  if (servings !== null && (servings < 1 || servings > 100)) throw new Error("Recipe servings must be between 1 and 100.")
  const cleanTitle = boundedTitle(title.replace(/\bserves?\s+\d{1,3}\b/i, "").trim(), "recipe")
  if (!title.trim()) throw new Error("Add a recipe name before its ingredients and steps.")
  return {
    kind: "recipe",
    title: cleanTitle,
    servings,
    ingredients: splitItems(ingredientSource, "ingredient", 40),
    steps: splitItems(stepSource, "recipe step", 40),
  }
}

function habitDraft(input: string): IntentDraft | null {
  const match = input.match(/^habit\s*:\s*(.+)$/i)
  if (!match) return null
  const weekly = /\b(?:weekly|each week|every week)\b/i.test(match[1]!)
  const rawTitle = match[1]!
    .replace(/\b(?:daily|each day|every day|weekly|each week|every week)\b/gi, "")
    .trim()
  if (!rawTitle) throw new Error("Add a habit to track.")
  const title = boundedTitle(rawTitle, "habit")
  return { kind: "habit", title, cadence: weekly ? "weekly" : "daily", lastCompletedPeriod: null }
}

export function evaluateArithmetic(raw: string): { expression: string; result: number } {  if (raw.length > 120) throw new Error("Keep calculations under 120 characters.")
  let expression = raw
    .replace(/[,$€£₹]/g, "")
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replace(/(\d),(?=\d{3}(?:\D|$))/g, "$1")
    .replace(/\bof\b/gi, "*")
    .trim()

  const tokens = expression.match(/\d+(?:\.\d+)?|[()+\-*/%]/g)
  if (!tokens || tokens.length > 128 || tokens.join("") !== expression.replace(/\s+/g, "")) {
    throw new Error("That calculation contains unsupported characters or syntax.")
  }

  let position = 0
  const peek = () => tokens[position]
  const take = () => tokens[position++]

  const primary = (): number => {
    if (peek() === "+") {
      take()
      return primary()
    }
    if (peek() === "-") {
      take()
      return -primary()
    }
    if (peek() === "(") {
      take()
      const value = sum()
      if (take() !== ")") throw new Error("Check the parentheses in that calculation.")
      return value
    }
    const token = take()
    if (!token || !/^\d+(?:\.\d+)?$/.test(token)) throw new Error("Check the numbers in that calculation.")
    const value = Number(token)
    if (peek() === "%") {
      take()
      return value / 100
    }
    return value
  }

  const product = (): number => {
    let value = primary()
    while (peek() === "*" || peek() === "/") {
      const operator = take()
      const right = primary()
      if (operator === "/" && right === 0) throw new Error("Division by zero is not allowed.")
      value = operator === "*" ? value * right : value / right
    }
    return value
  }

  const sum = (): number => {
    let value = product()
    while (peek() === "+" || peek() === "-") {
      const operator = take()
      const right = product()
      value = operator === "+" ? value + right : value - right
    }
    return value
  }

  const result = sum()
  if (position !== tokens.length || !Number.isFinite(result) || Math.abs(result) > 1_000_000_000_000_000) {
    throw new Error("That calculation is outside the supported range.")
  }
  return { expression, result: Number(result.toFixed(10)) }
}

function calculationDraft(input: string): IntentDraft {
  const expression = input.replace(/^(?:calc(?:ulate)?|compute|what\s+is|what's)\s*/i, "").replace(/[?]+$/, "").trim()
  const evaluated = evaluateArithmetic(expression)
  return { kind: "calculation", title: "Calculation", ...evaluated }
}

const COLOR_NAMES: Record<string, string> = {
  red: "#E5484D", orange: "#F76B15", yellow: "#FFD60A", green: "#30A46C", blue: "#3E63DD",
  purple: "#8E4EC6", pink: "#D6409F", brown: "#AD5700", black: "#1B1B1B", white: "#FFFFFF",
  gray: "#8B8B8B", grey: "#8B8B8B", navy: "#1F3A5F", teal: "#12A594", mint: "#86EAD4",
  coral: "#EC735B", salmon: "#FA8072", gold: "#D9A400", silver: "#C0C0C0", crimson: "#DC143C",
  sky: "#5AA9E6", lime: "#8FCA45", beige: "#E8DCC8", maroon: "#7D2E2E", olive: "#6B7F2A",
  cyan: "#12A594", magenta: "#D6409F", indigo: "#3E63DD", violet: "#8E4EC6", turquoise: "#40C4AA",
}

function colorDraft(input: string): IntentDraft | null {
  const body = input.replace(/^(?:what(?:'s| is)\s+the\s+)?colou?r\s*:\s*/i, "").trim()
  const hex = body.match(/^(#[0-9a-f]{3}|#[0-9a-f]{6})$/i)?.[1]
  if (hex) {
    const full = hex.length === 4
      ? "#" + hex.slice(1).split("").map((c) => c + c).join("")
      : hex
    return { kind: "color", title: full.toUpperCase(), hex: full.toUpperCase(), name: "Custom color" }
  }
  const name = body.toLowerCase().replace(/^(?:a|the)\s+/, "")
  const named = COLOR_NAMES[name]
  if (named && /^[a-z]+(?:\s+[a-z]+)?$/.test(name)) {
    const label = name.split(" ").map((w) => w[0]!.toUpperCase() + w.slice(1)).join(" ")
    return { kind: "color", title: label, hex: named, name: label }
  }
  return null
}

const LENGTH_UNITS: Record<string, number> = {
  mm: 0.001, cm: 0.01, m: 1, meter: 1, meters: 1, metre: 1, metres: 1, km: 1000, kilometer: 1000, kilometers: 1000,
  kilometre: 1000, kilometres: 1000, kms: 1000, in: 0.0254, inch: 0.0254, inches: 0.0254, ft: 0.3048, foot: 0.3048,
  feet: 0.3048, yd: 0.9144, yard: 0.9144, yards: 0.9144, mi: 1609.344, mile: 1609.344, miles: 1609.344,
}
const MASS_UNITS: Record<string, number> = {
  g: 1, gram: 1, grams: 1, kg: 1000, kilo: 1000, kilos: 1000, kilogram: 1000, kilograms: 1000,
  oz: 28.3495, ounce: 28.3495, ounces: 28.3495, lb: 453.592, lbs: 453.592, pound: 453.592, pounds: 453.592,
}
const VOLUME_UNITS: Record<string, number> = {
  ml: 0.001, l: 1, liter: 1, liters: 1, litre: 1, litres: 1, cup: 0.236588, cups: 0.236588,
  gal: 3.78541, gallon: 3.78541, gallons: 3.78541,
}
const TEMP_UNITS = new Set(["c", "celsius", "f", "fahrenheit", "k", "kelvin"])

function toCelsius(value: number, unit: string): number {
  if (unit === "f" || unit === "fahrenheit") return (value - 32) * (5 / 9)
  if (unit === "k" || unit === "kelvin") return value - 273.15
  return value
}

function fromCelsius(value: number, unit: string): number {
  if (unit === "f" || unit === "fahrenheit") return value * (9 / 5) + 32
  if (unit === "k" || unit === "kelvin") return value + 273.15
  return value
}

function convertDraft(input: string): IntentDraft | null {
  const match = input.match(/^(\d+(?:\.\d+)?)\s*([a-z°]+)\s+(?:in|to|into|as)\s+([a-z°]+)[?.!]*$/i)
  if (!match) return null
  const value = Number(match[1])
  const from = match[2]!.toLowerCase().replace("°", "")
  const to = match[3]!.toLowerCase().replace("°", "")
  if (!Number.isFinite(value) || value < 0 || value > 1_000_000_000) throw new Error("Convert values between 0 and 1,000,000,000.")
  const result = convertUnits(value, from, to)
  if (result === null) throw new Error("Convert matching kinds: length, mass, volume, or temperature (e.g. “5 miles in km”).")
  return { kind: "convert", title: "Conversion", input: value, from, to, result }
}

export function convertUnits(value: number, from: string, to: string): number | null {
  if (!Number.isFinite(value)) return null
  let result: number
  if (TEMP_UNITS.has(from) && TEMP_UNITS.has(to)) {
    result = fromCelsius(toCelsius(value, from), to)
  } else {
    const table = [LENGTH_UNITS, MASS_UNITS, VOLUME_UNITS].find((t) => t[from] !== undefined && t[to] !== undefined)
    if (!table) return null
    result = (value * table[from]!) / table[to]!
  }
  if (!Number.isFinite(result)) return null
  return Number(result.toFixed(4))
}

export function convertUnitKind(unit: string): "length" | "mass" | "volume" | "temperature" | null {
  if (TEMP_UNITS.has(unit)) return "temperature"
  if (LENGTH_UNITS[unit] !== undefined) return "length"
  if (MASS_UNITS[unit] !== undefined) return "mass"
  if (VOLUME_UNITS[unit] !== undefined) return "volume"
  return null
}

export const CONVERT_UNITS: Record<string, string[]> = {
  length: ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"],
  mass: ["g", "kg", "oz", "lb"],
  volume: ["ml", "l", "cup", "gal"],
  temperature: ["c", "f", "k"],
}

const POLL_TAIL = /\s+(for|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|today|tonight|tomorrow|weekend)$/i

export function buildPollDraft(text: string): Extract<IntentDraft, { kind: "poll" }> {
  let body = text.trim().replace(/[?.!]+$/, "").replace(/^(?:poll|vote)\s*:\s*/i, "").trim()
  body = body.replace(POLL_TAIL, "")
  const options = body
    .split(/\s+or\s+|\s+vs\.?\s+|,|;/i)
    .map((part) => part.trim().replace(/^\s*[-*\d.)]+\s*/, ""))
    .filter(Boolean)
  if (options.length < 2) throw new Error("A poll needs at least two options, e.g. “pizza or burgers?”")
  if (options.length > 6 || options.some((option) => option.length > 80)) {
    throw new Error("Use 2 to 6 poll options, each under 80 characters.")
  }
  const title = body.length > 120 ? options.slice(0, 2).join(" or ") : body
  return { kind: "poll", title: cap(title), options: options.map((option) => ({ text: option })) }
}

function pollDraft(input: string): IntentDraft | null {
  if (!/^(?:poll|vote)\s*:/i.test(input) && !/\?\s*$/.test(input)) return null
  if (!/\bor\b|\bvs\b|,|;/.test(input.toLowerCase())) return null
  return buildPollDraft(input)
}

const HOLIDAYS: Record<string, [number, number]> = {
  christmas: [12, 25],
  "christmas day": [12, 25],
  "new year": [1, 1],
  "new year's day": [1, 1],
  halloween: [10, 31],
  valentine: [2, 14],
}

function countdownDraft(input: string, now: Date): IntentDraft | null {
  const match = input.match(/^(?:countdown\s+(?:to\s+)?|(?:how\s+many\s+)?days?\s+(?:until|till|til|left\s+until)\s+|time\s+until\s+|how\s+long\s+until\s+)(.+?)[?.!]*$/i)
  if (!match) return null
  const target = match[1]!.trim()
  if (!target) return null
  const lower = target.toLowerCase()
  let date: Date | null = null
  const holiday = HOLIDAYS[lower]
  if (holiday) {
    const [month, day] = holiday
    date = new Date(now.getFullYear(), month - 1, day)
    if (date.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
      date = new Date(now.getFullYear() + 1, month - 1, day)
    }
  } else {
    const iso = target.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
    if (iso) {
      date = validLocalDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
      if (!date) throw new Error("That calendar date doesn't exist.")
    } else {
      const weekday = target.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i)?.[1]?.toLowerCase()
      if (weekday) {
        date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        let daysAhead = (weekdays[weekday]! - date.getDay() + 7) % 7
        if (daysAhead === 0) daysAhead = 7
        date.setDate(date.getDate() + daysAhead)
      }
    }
  }
  if (!date) throw new Error("Name a holiday like Christmas, a weekday, or an ISO date (e.g. “days until 2026-12-25”).")
  const title = target.length > 80 ? "Countdown" : cap(target)
  return { kind: "countdown", title, target: localDateKey(date) }
}

export const TIME_ZONES: Record<string, number> = {
  pst: -8, pdt: -7, est: -5, edt: -4, cst: -6, cdt: -5, mst: -7, mdt: -6,
  gmt: 0, utc: 0, cet: 1, ist: 5.5, jst: 9, kst: 9, aest: 10,
}

const CITY_ZONES: Record<string, string> = {
  tokyo: "jst", london: "gmt", paris: "cet", berlin: "cet", mumbai: "ist", delhi: "ist",
  "new york": "est", chicago: "cst", denver: "mst", "los angeles": "pst", seattle: "pst",
  sydney: "aest", singapore: "cet", dubai: "cet",
}

function resolveZone(raw: string): string | null {
  const key = raw.trim().toLowerCase().replace(/\./g, "")
  if (TIME_ZONES[key] !== undefined) return key
  return CITY_ZONES[key] ?? null
}

function timezoneDraft(input: string): IntentDraft | null {
  const match = input.match(/^(?:at\s+)?(\d{1,2})(?::([0-5]\d))?\s*(am|pm)?\s*([a-z][a-z. ]*?)\s+(?:in|to)\s+([a-z][a-z. ]*?)[?.!]*$/i)
  if (!match) return null
  const from = resolveZone(match[4]!)
  const to = resolveZone(match[5]!)
  if (!from || !to) return null
  const rawHour = Number(match[1])
  const minute = Number(match[2] ?? "0")
  const suffix = match[3]?.toLowerCase()
  if (suffix && (rawHour < 1 || rawHour > 12)) throw new Error("Use an AM/PM time between 1 and 12, or a 24-hour time.")
  if (!suffix && rawHour > 23) throw new Error("Use a time between 0 and 23.")
  let hour = rawHour
  if (suffix === "pm" && hour < 12) hour += 12
  if (suffix === "am" && hour === 12) hour = 0
  const label = `${rawHour}${match[2] ? ":" + match[2] : ""}${suffix ? " " + suffix.toUpperCase() : ""} ${from.toUpperCase()} → ${to.toUpperCase()}`
  return { kind: "timezone", title: label, from, to, hour, minute }
}

export function rollRandomExpression(expression: string): string {
  const dice = expression.match(/^(\d{1,2})d(\d{1,3})$/i)
  if (dice) {
    const count = Number(dice[1])
    const sides = Number(dice[2])
    if (count < 1 || count > 20 || sides < 2 || sides > 100) throw new Error("Roll 1–20 dice with 2–100 sides (e.g. “roll 2d6”).")
    const rolls = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * sides))
    const total = rolls.reduce((sum, roll) => sum + roll, 0)
    return count === 1 ? String(total) : `${rolls.join(" + ")} = ${total}`
  }
  if (/^coin flip$/i.test(expression)) return Math.random() < 0.5 ? "Heads" : "Tails"
  const pick = expression.match(/^pick:\s*(.+)$/i)?.[1]
  if (pick) {
    const options = pick.split(/\s*\|\s*/).filter(Boolean)
    return options[Math.floor(Math.random() * options.length)] ?? "?"
  }
  throw new Error("Roll dice (2d6), flip a coin, or pick from options.")
}

function randomDraft(input: string): IntentDraft | null {
  const dice = input.match(/^(?:roll\s+)?(\d{1,2})d(\d{1,3})$/i)
  if (dice) {
    const expression = `${dice[1]}d${dice[2]}`.toLowerCase()
    return { kind: "random", title: "Dice roll", expression, result: rollRandomExpression(expression) }
  }
  if (/^(?:flip|toss)(?:\s+a)?\s+coin$/i.test(input.trim())) {
    return { kind: "random", title: "Coin flip", expression: "coin flip", result: rollRandomExpression("coin flip") }
  }
  const pick = input.match(/^(?:pick|choose)(?:\s+one)?\s*:\s*(.+)$/i) ?? input.match(/^(?:pick|choose)\s+one\s+(?:of\s+)?(.+)$/i)
  if (pick) {
    const options = pick[1]!.split(/,|;|\s+or\s+/i).map((part) => part.trim()).filter(Boolean)
    if (options.length < 2 || options.length > 8 || options.some((option) => option.length > 60)) return null
    const expression = "pick: " + options.join(" | ")
    return { kind: "random", title: "Random pick", expression, result: rollRandomExpression(expression) }
  }
  return null
}

function goalDraft(input: string): IntentDraft | null {
  const match = input.match(/^(.*?),\s*(\d[\d,]*)\s+done\s+of\s+(\d[\d,]*)\s*([a-zA-Z]{0,20})$/) ??
    input.match(/^(.*?)\s+(\d[\d,]*)\s*(?:of|\/)\s*(\d[\d,]*)\s*([a-zA-Z]{0,20})$/)
  if (!match) return null
  if (/^(?:split|divide|share|calc|calculate|spent|spend|paid)\b/i.test(input.trim())) return null
  const current = Number(match[2]!.replaceAll(",", ""))
  const target = Number(match[3]!.replaceAll(",", ""))
  const unit = (match[4] ?? "").trim().slice(0, 20)
  if (!Number.isInteger(current) || !Number.isInteger(target) || target < 1 || target > 1_000_000 || current < 0 || current > target) {
    return null
  }
  const rawTitle = match[1]!.trim()
  if (!rawTitle) return null
  return { kind: "goal", title: boundedTitle(rawTitle, "goal"), current, target, unit }
}

export function contactDraft(input: string): IntentDraft | null {
  let rest = ` ${input.trim()} `
  let email: string | null = null
  const emailMatch = rest.match(/([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/)
  if (emailMatch) {
    email = emailMatch[1]!.slice(0, 254)
    rest = rest.replace(emailMatch[0], " ")
  }
  const dateless = rest.replace(/\b20\d{2}-\d{2}-\d{2}\b/g, " ").replace(/\b\d{1,2}:\d{2}\b/g, " ")
  let phone: string | null = null
  const phoneMatch = dateless.match(/(\+?\d[\d\s.-]{5,18}\d)/)
  if (phoneMatch) {
    const digits = phoneMatch[1]!.replace(/\D/g, "")
    if (digits.length >= 7 && digits.length <= 15) {
      phone = phoneMatch[1]!.trim().slice(0, 24)
      rest = rest.replace(phoneMatch[0], " ")
    }
  }
  if (!phone && !email) return null
  const name = rest.replace(/[,;]+/g, " ").replace(/\s+/g, " ").trim()
  if (!/[a-zA-Z]/.test(name)) {
    if (!email) return null
    const local = email.split("@")[0] ?? "Contact"
    return { kind: "contact", title: boundedTitle(local, "contact"), phone, email }
  }
  if (name.length > 80) return null
  return { kind: "contact", title: boundedTitle(name, "contact"), phone, email }
}

export function linkDraft(input: string): IntentDraft | null {
  const match = input.trim().match(/((?:https?:\/\/|www\.)\S+|[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|dev|io|app|org|net|ai|in|co|so|me)(?:\/\S*)?)(?:\s+(?:-\s+)?(.+))?$/i)
  if (!match) return null
  let url = match[1]!
  if (url.length > 500) throw new Error("Keep links under 500 characters.")
  if (!/^https?:\/\//i.test(url)) url = "https://" + url
  const note = match[2]?.trim().slice(0, 200) || null
  const domain = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0] ?? url
  const title = (note ?? domain).slice(0, 120) || domain
  return { kind: "link", title, url, note }
}

export function extractTravelWhen(text: string, now = new Date()): string | null {
  const lower = text.toLowerCase()
  const iso = lower.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (iso) {
    const date = validLocalDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
    return date ? localDateKey(date) : null
  }
  if (/\btoday\b/.test(lower)) return localDateKey(now)
  if (/\btomorrow\b/.test(lower)) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    return localDateKey(date)
  }
  if (/\b(?:next\s+|this\s+)?weekend\b/.test(lower)) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let daysAhead = (6 - date.getDay() + 7) % 7
    if (daysAhead === 0) daysAhead = 7
    date.setDate(date.getDate() + daysAhead)
    return localDateKey(date)
  }
  const weekday = lower.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/)?.[1]
  if (weekday) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let daysAhead = (weekdays[weekday]! - date.getDay() + 7) % 7
    if (daysAhead === 0) daysAhead = 7
    date.setDate(date.getDate() + daysAhead)
    return localDateKey(date)
  }
  return null
}

export function buildTravelDraft(text: string, now = new Date()): Extract<IntentDraft, { kind: "travel" }> {
  const lower = text.toLowerCase()
  const mode = /\b(flight|fly|flying|plane|airport)\b/.test(lower) ? "flight"
    : /\b(train|rail)\b/.test(lower) ? "train"
    : /\b(bus|coach)\b/.test(lower) ? "bus"
    : /\b(car|drive|driving|road\s?trip)\b/.test(lower) ? "car"
    : "trip"
  const when = extractTravelWhen(text, now)
  const destination = text
    .replace(/^(?:flight|fly|flying|plane|train|rail|bus|coach|car|drive|driving|trip|travel|vacation|holiday|getaway|visit|road\s?trip)\s+(?:to\s+)?/i, "")
    .replace(/^(?:to\s+)/i, "")
    .replace(/\s+(?:(?:next|this)\s+weekend|today|tomorrow|sunday|monday|tuesday|wednesday|thursday|friday|saturday|20\d{2}-\d{2}-\d{2})\s*$/i, "")
    .trim()
  if (!destination) throw new Error("Name a destination, e.g. “flight to Goa”.")
  if (destination.length > 120) throw new Error("Keep destinations under 120 characters.")
  return { kind: "travel", title: boundedTitle(`Trip to ${destination}`, "travel"), destination, mode, when }
}

function travelDraft(input: string, now: Date): IntentDraft | null {
  if (!/^(?:flight|fly|flying|plane|train|rail|bus|coach|car|drive|driving|trip|travel|vacation|holiday|getaway|visit|road\s?trip)\b/i.test(input.trim())) return null
  return buildTravelDraft(input, now)
}

const VIDEO_LABELS: Record<string, string> = {
  zoom: "Zoom",
  "google meet": "Meet",
  meet: "Meet",
  teams: "Teams",
  facetime: "FaceTime",
  skype: "Skype",
  discord: "Discord",
}

const ATTENDEE_DATEWORDS = new Set([
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december", "today", "tomorrow", "tonight",
  "morning", "evening", "afternoon", "noon", "midnight", "am", "pm",
])

const ATTENDEE_STOPWORDS = new Set([
  "zoom", "meet", "meeting", "teams", "call", "video", "phone", "lunch", "dinner", "breakfast",
  "coffee", "drinks", "party", "today", "tomorrow", "tonight", "morning", "evening", "office",
  "home", "team", "all", "everyone",
])

export interface EventEntities {
  title: string
  attendees: string[]
  video: string | null
}

/**
 * Display-layer enrichment for events and reminders. Extracts attendee names
 * ("with Priya", "Rahul and Anna") and video-call services ("on Zoom") with
 * plain regexes so titles render clean ("Dinner") with entity rows below.
 * Never invents: anything unmatched simply yields no rows.
 */
export function extractEventEntities(text: string, fallbackTitle: string): EventEntities {
  const normalized = text.trim().replace(/\s+/g, " ")
  let video: string | null = null
  for (const [keyword, label] of Object.entries(VIDEO_LABELS)) {
    const pattern = keyword.includes(" ") ? `\\b${keyword}\\b` : `\\b${keyword}\\b(?!ing\\b)`
    if (new RegExp(pattern, "i").test(normalized)) {
      video = label
      break
    }
  }
  const attendees: string[] = []
  const seen = new Set<string>()
  const pattern = /\b(?:with|and)\s+(?:(?:the|my|our)\s+)?([A-Za-z]+)(?:\s+(?!(?:and|or|with|on|at|for|to|of)\b)([A-Za-z]+))?/g
  let match: RegExpExecArray | null
  while ((match = pattern.exec(normalized)) !== null && attendees.length < 4) {
    const first = match[1]!.toLowerCase()
    if (ATTENDEE_STOPWORDS.has(first) || ATTENDEE_DATEWORDS.has(first) || /^\d+$/.test(match[1]!)) continue
    const words = [match[1]!]
    const second = match[2]?.toLowerCase()
    if (second && !ATTENDEE_STOPWORDS.has(second) && !ATTENDEE_DATEWORDS.has(second) &&
      !["and", "or", "with", "on", "at", "for", "to", "of"].includes(second)) {
      words.push(match[2]!)
    }
    const name = words.map((word) => word[0]!.toUpperCase() + word.slice(1)).join(" ")
    if (name.length > 24 || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    attendees.push(name)
  }
  let title = fallbackTitle
  for (const name of attendees) {
    title = title.replace(new RegExp(`\\b(?:with|and)\\s+(?:the\\s+|my\\s+|our\\s+)?${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "")
  }
  if (video) {
    title = title.replace(/\b(?:on|over|via|through)\s+(?:zoom|google meet|meet(?!ing)|teams|facetime|skype|discord)\b/i, "")
    title = title.replace(/\b(?:zoom|google meet|teams|facetime|skype|discord)\b/i, "")
  }
  title = title.replace(/\s+/g, " ").replace(/[,.!?;:\s]+$/g, "").trim()
  return { title: title || fallbackTitle, attendees, video }
}

export function parseIntent(input: string, now = new Date()): IntentDraft {
  const text = input.trim().replace(/\s+/g, " ")
  if (!text) throw new Error("Write a thought first.")
  if (text.length > MAX_INPUT_LENGTH) throw new Error(`Keep thoughts under ${MAX_INPUT_LENGTH} characters.`)

  const timer = text.match(
    /^(?:set\s+)?timer\s+(?:for\s+)?(\d{1,4})\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)(?:\s+(?:for|to)\s+(.+))?$/i,
  )
  if (timer) {
    const amount = Number(timer[1])
    const unit = timer[2]!.toLowerCase()
    const multiplier = unit.startsWith("s") ? 1 : unit.startsWith("m") ? 60 : 3600
    const durationSeconds = amount * multiplier
    if (durationSeconds < 1 || durationSeconds > MAX_TIMER_SECONDS) throw new Error("Timers must be between 1 second and 24 hours.")
    return { kind: "timer", title: cap(timer[3] ?? "Timer"), durationSeconds }
  }

  const bareTimer = text.match(
    /^(?:pomodoro\s+)?(\d{1,4})\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)(?:\s+(focus|break|rest|nap|deep work|study|pomodoro))?(?:\s+(?:for|to)\s+(.+))?$/i,
  )
  if (bareTimer) {
    const amount = Number(bareTimer[1])
    const unit = bareTimer[2]!.toLowerCase()
    const multiplier = unit.startsWith("s") ? 1 : unit.startsWith("m") ? 60 : 3600
    const durationSeconds = amount * multiplier
    if (durationSeconds < 1 || durationSeconds > MAX_TIMER_SECONDS) throw new Error("Timers must be between 1 second and 24 hours.")
    return { kind: "timer", title: cap(bareTimer[4] ?? bareTimer[3] ?? "Timer"), durationSeconds }
  }

  const expense = expenseDraft(text, now)
  if (expense) return expense
  const recipe = recipeDraft(text)
  if (recipe) return recipe
  const habit = habitDraft(text)
  if (habit) return habit
  const color = colorDraft(text)
  if (color) return color
  for (const kind of ["shopping", "workout", "agenda", "itinerary", "project"] as const) {
    const collection = collectionDraft(text, kind)
    if (collection) return collection
  }
  const checklist = text.match(/^(?:(?:make|create|new)\s+)?(?:a\s+)?(?:checklist|to[- ]?do)\s*(?::|-)?\s*(.*)$/i)
  if (checklist) {
    const items = (checklist[1] ?? "")
      .split(/,|;|\n|\band\b/i)
      .map((item) => item.replace(/^\s*(?:[-*]|\d{1,3}[.)])\s+/, "").trim())
      .filter(Boolean)
    if (items.length === 0) throw new Error("Add at least one item to the checklist.")
    if (items.length > 50 || items.some((item) => item.length > 160)) throw new Error("Use up to 50 checklist items, each under 160 characters.")
    return { kind: "checklist", title: "Checklist", items: items.map((text) => ({ text })) }
  }

  const poll = pollDraft(text)
  if (poll) return poll

  const split = splitDraft(text)
  if (split) return split
  if (/^(?:split|divide|share)\b/i.test(text)) throw new Error("Try “split $48 between 3 people” or “divide 2400 by 3”.")

  const convert = convertDraft(text)
  if (convert) return convert

  if (/^(?:calc(?:ulate)?|compute|what\s+is|what's)\b/i.test(text)) return calculationDraft(text)

  const contact = contactDraft(text)
  if (contact) return contact
  const link = linkDraft(text)
  if (link) return link
  const countdown = countdownDraft(text, now)
  if (countdown) return countdown
  const timezone = timezoneDraft(text)
  if (timezone) return timezone
  const random = randomDraft(text)
  if (random) return random
  const goal = goalDraft(text)
  if (goal) return goal
  const travel = travelDraft(text, now)
  if (travel) return travel

  const isReminder = /^\s*remind(?:er)?\s+me\s+to\s+/i.test(text)
  const explicitEvent = /^\s*(?:event|meeting)\s*:/i.test(text)
  const hasSchedule = /\b(?:today|tomorrow|sunday|monday|tuesday|wednesday|thursday|friday|saturday|20\d{2}-\d{2}-\d{2})\b/i.test(text)
  if (isReminder || explicitEvent || hasSchedule) {
    const title = cleanScheduledTitle(text, isReminder || explicitEvent)
    if (!title) throw new Error("Add a title for this event or reminder.")
    if (title.length > 240) throw new Error("Keep event and reminder titles under 240 characters.")
    return {
      kind: isReminder ? "reminder" : "event",
      title,
      ...parseSchedule(text, now),
    }
  }

  return makeNote(text)
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `card-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function materializeDraft(draft: IntentDraft, now = new Date(), id = createId()): IntentCard {
  const base = { id, createdAt: now.toISOString(), completed: false }
  switch (draft.kind) {
    case "checklist":
    case "shopping":
    case "workout":
    case "agenda":
    case "itinerary":
    case "project":
      return {
        ...base,
        ...draft,
        items: draft.items.map((item, index) => ({ id: `${id}-item-${index + 1}`, text: item.text, done: false })),
      }
    case "recipe":
      return {
        ...base,
        ...draft,
        ingredients: draft.ingredients.map((item, index) => ({ id: `${id}-ingredient-${index + 1}`, text: item.text, done: false })),
        steps: draft.steps.map((item, index) => ({ id: `${id}-step-${index + 1}`, text: item.text, done: false })),
      }
    case "timer":
      return { ...base, ...draft, remainingSeconds: draft.durationSeconds, endsAt: null }
    case "poll":
      return {
        ...base,
        ...draft,
        options: draft.options.map((option, index) => ({ id: `${id}-option-${index + 1}`, text: option.text, votes: 0 })),
      }
    default:
      return { ...base, ...draft }
  }
}

function isCheckableItems(value: unknown, max = 50): boolean {
  return Array.isArray(value) && value.length > 0 && value.length <= max && value.every((item) =>
    item && typeof item.id === "string" && item.id.length <= 160 &&
    typeof item.text === "string" && item.text.length > 0 && item.text.length <= 160 && typeof item.done === "boolean",
  )
}

function isLocalDateKey(value: unknown): value is string {
  if (typeof value !== "string") return false
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return !!match && validLocalDate(Number(match[1]), Number(match[2]), Number(match[3])) !== null
}

/**
 * Forward-migrate a stored card from older shapes (e.g. travel cards saved
 * before the `when` field existed). Returns the migrated card, or null when
 * the data is genuinely unusable. Missing nullable fields become null;
 * anything else must still pass full validation.
 */
export function migrateIntentCard(value: unknown): IntentCard | null {
  if (isIntentCard(value)) return value
  if (!value || typeof value !== "object") return null
  const candidate = { ...(value as Record<string, unknown>) }
  for (const field of ["scheduledAt", "spentAt", "endsAt", "servings", "lastCompletedPeriod", "phone", "email", "note", "when"]) {
    if (!(field in candidate)) continue
    if ((candidate as Record<string, unknown>)[field] === undefined) {
      ;(candidate as Record<string, unknown>)[field] = null
    }
  }
  if (candidate["kind"] === "travel" && !("when" in candidate)) {
    ;(candidate as Record<string, unknown>)["when"] = null
  }
  if (candidate["kind"] === "note" && (candidate as Record<string, unknown>)["title"] === "Quick note") {
    const body = (candidate as Record<string, unknown>)["body"]
    if (typeof body === "string" && body.trim()) {
      ;(candidate as Record<string, unknown>)["title"] = makeNote(body).title
    }
  }
  return isIntentCard(candidate) ? candidate : null
}

export function isIntentCard(value: unknown): value is IntentCard {
  if (!value || typeof value !== "object") return false
  const card = value as Record<string, unknown>
  if (
    typeof card.id !== "string" || !card.id || card.id.length > 160 ||
    typeof card.createdAt !== "string" || !Number.isFinite(Date.parse(card.createdAt)) ||
    typeof card.completed !== "boolean" || typeof card.title !== "string" || !card.title || card.title.length > 240
  ) return false

  switch (card.kind) {
    case "event":
    case "reminder":
      return isSchedule(card.scheduledAt) && typeof card.scheduleAmbiguous === "boolean"
    case "checklist":
    case "shopping":
    case "workout":
    case "agenda":
    case "itinerary":
    case "project":
      return isCheckableItems(card.items)
    case "timer":
      return Number.isInteger(card.durationSeconds) && Number(card.durationSeconds) > 0 && Number(card.durationSeconds) <= MAX_TIMER_SECONDS &&
        Number.isInteger(card.remainingSeconds) && Number(card.remainingSeconds) >= 0 && Number(card.remainingSeconds) <= Number(card.durationSeconds) &&
        (card.endsAt === null || (typeof card.endsAt === "string" && Number.isFinite(Date.parse(card.endsAt))))
    case "split":
      return Number.isInteger(card.amountCents) && Number(card.amountCents) > 0 && Number(card.amountCents) <= 100_000_000 &&
        Number.isInteger(card.peopleCount) && Number(card.peopleCount) >= 2 && Number(card.peopleCount) <= 100 &&
        ["USD", "EUR", "GBP", "INR"].includes(String(card.currency)) && Array.isArray(card.shareAmountsCents) &&
        card.shareAmountsCents.length === card.peopleCount && card.shareAmountsCents.every((amount) => Number.isInteger(amount) && Number(amount) >= 0) &&
        card.shareAmountsCents.reduce((sum, amount) => sum + Number(amount), 0) === card.amountCents
    case "expense":
      return Number.isInteger(card.amountCents) && Number(card.amountCents) > 0 && Number(card.amountCents) <= 100_000_000 &&
        ["USD", "EUR", "GBP", "INR"].includes(String(card.currency)) && typeof card.category === "string" &&
        card.category.length > 0 && card.category.length <= 60 && isSchedule(card.spentAt)
    case "calculation":
      return typeof card.expression === "string" && card.expression.length <= 120 && typeof card.result === "number" && Number.isFinite(card.result)
    case "recipe":
      return (card.servings === null || (Number.isInteger(card.servings) && Number(card.servings) >= 1 && Number(card.servings) <= 100)) &&
        isCheckableItems(card.ingredients, 40) && isCheckableItems(card.steps, 40)
    case "habit":
      return (card.cadence === "daily" || card.cadence === "weekly") &&
        (card.lastCompletedPeriod === null || isLocalDateKey(card.lastCompletedPeriod))
    case "note":
      return typeof card.body === "string" && card.body.length > 0 && card.body.length <= MAX_INPUT_LENGTH
    case "color":
      return typeof card.hex === "string" && /^#[0-9A-F]{6}$/i.test(card.hex) &&
        typeof card.name === "string" && card.name.length > 0 && card.name.length <= 40
    case "convert":
      return typeof card.input === "number" && Number.isFinite(card.input) && Math.abs(card.input) <= 1_000_000_000 &&
        typeof card.from === "string" && typeof card.to === "string" &&
        (LENGTH_UNITS[card.from] !== undefined || MASS_UNITS[card.from] !== undefined || VOLUME_UNITS[card.from] !== undefined || TEMP_UNITS.has(card.from)) &&
        (LENGTH_UNITS[card.to] !== undefined || MASS_UNITS[card.to] !== undefined || VOLUME_UNITS[card.to] !== undefined || TEMP_UNITS.has(card.to)) &&
        typeof card.result === "number" && Number.isFinite(card.result)
    case "poll":
      return Array.isArray(card.options) && card.options.length >= 2 && card.options.length <= 6 && card.options.every((option) =>
        option && typeof option.id === "string" && option.id.length <= 160 &&
        typeof option.text === "string" && option.text.length > 0 && option.text.length <= 80 &&
        Number.isInteger(option.votes) && Number(option.votes) >= 0 && Number(option.votes) <= 1_000_000)
    case "countdown":
      return isLocalDateKey(card.target)
    case "timezone":
      return typeof card.from === "string" && TIME_ZONES[card.from] !== undefined &&
        typeof card.to === "string" && TIME_ZONES[card.to] !== undefined &&
        Number.isInteger(card.hour) && Number(card.hour) >= 0 && Number(card.hour) <= 23 &&
        Number.isInteger(card.minute) && Number(card.minute) >= 0 && Number(card.minute) <= 59
    case "random":
      return typeof card.expression === "string" && card.expression.length > 0 && card.expression.length <= 120 &&
        typeof card.result === "string" && card.result.length > 0 && card.result.length <= 120
    case "goal":
      return Number.isInteger(card.current) && Number.isInteger(card.target) &&
        Number(card.target) >= 1 && Number(card.target) <= 1_000_000 &&
        Number(card.current) >= 0 && Number(card.current) <= Number(card.target) &&
        typeof card.unit === "string" && card.unit.length <= 20
    case "contact":
      return (card.phone === null || (typeof card.phone === "string" && card.phone.length > 0 && card.phone.length <= 24)) &&
        (card.email === null || (typeof card.email === "string" && card.email.length > 0 && card.email.length <= 254)) &&
        (card.phone !== null || card.email !== null)
    case "link":
      return typeof card.url === "string" && card.url.length > 0 && card.url.length <= 500 && /^https?:\/\//i.test(card.url) &&
        (card.note === null || (typeof card.note === "string" && card.note.length <= 200))
    case "travel":
      return typeof card.destination === "string" && card.destination.length > 0 && card.destination.length <= 120 &&
        typeof card.mode === "string" && ["flight", "train", "bus", "car", "trip"].includes(card.mode) &&
        (card.when === null || isLocalDateKey(card.when))
    default:
      return false
  }
}

export function remainingTimerSeconds(card: Extract<IntentCard, { kind: "timer" }>, now = Date.now()): number {
  if (!card.endsAt) return card.remainingSeconds
  return Math.max(0, Math.ceil((Date.parse(card.endsAt) - now) / 1000))
}

export function startTimer(card: Extract<IntentCard, { kind: "timer" }>, now = Date.now()) {
  const remainingSeconds = remainingTimerSeconds(card, now)
  return { ...card, remainingSeconds, endsAt: new Date(now + remainingSeconds * 1000).toISOString() }
}

export function pauseTimer(card: Extract<IntentCard, { kind: "timer" }>, now = Date.now()) {
  return { ...card, remainingSeconds: remainingTimerSeconds(card, now), endsAt: null }
}

export function resetTimer(card: Extract<IntentCard, { kind: "timer" }>) {
  return { ...card, remainingSeconds: card.durationSeconds, endsAt: null, completed: false }
}
