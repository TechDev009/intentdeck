import { choice, defineDecision, noul, score } from "@nifrajs/decision"
import { createTypeSafeProvider } from "@nifrajs/decision-typesafe"
import { t } from "@nifrajs/schema"
import { CARD_KINDS, type CardKind } from "./cards"
import { countJevPromptCharacters, MIN_JEV_PROMPT_CHARACTERS } from "./jev-constraints"

export const JEV_CARD_KINDS = CARD_KINDS
export type JevCardKind = CardKind
export type JevIntent = CardKind | "none"

export const JEV_QUESTION_COUNT = 11
export const JEV_DECISION_NAME = "intentdeck.intent"
export const JEV_DECISION_VERSION = "2.0.0"

const intentDecision = defineDecision({
  name: JEV_DECISION_NAME,
  version: JEV_DECISION_VERSION,
  state: t.object({ text: t.string({ minLength: MIN_JEV_PROMPT_CHARACTERS, maxLength: 1000 }) }),
  questions: {
    kind: choice({
      instructions:
        "Pick the one card shape that fits the user's sentence. Decide only; never invent dates, money, durations, or list items. Use note when nothing else fits and none when the text is too short or unfinished to judge.",
      criteria: {
        event: "A dated occasion, gathering, meeting, or appointment with other people.",
        reminder: "A prompt to remember or do one thing later, often starting with remind me.",
        checklist: "Several actionable steps or to-dos to tick off.",
        shopping: "Groceries or products to buy and mark as bought.",
        timer: "A countdown, focus block, or stopwatch with a duration.",
        split: "An amount of money to divide between people.",
        expense: "Money already spent and what it went to.",
        calculation: "Arithmetic, percentages, or a numeric question to solve.",
        recipe: "A dish with ingredients plus ordered cooking steps.",
        workout: "Exercises or training sets to complete.",
        habit: "A behavior to repeat daily or weekly.",
        agenda: "Discussion points for a meeting or call.",
        itinerary: "Ordered stops, times, or places for a trip or day.",
        project: "Milestones or next steps for a project or launch.",
        color: "A hex code or a named color, without any other task attached.",
        convert: "A measurement with source and target units to convert between.",
        poll: "Two or more named options to choose or vote between.",
        countdown: "Days remaining until a named holiday, weekday, or date.",
        timezone: "A clock time in one zone asked in another zone.",
        random: "Dice notation, a coin flip, or picking randomly from options.",
        goal: "Current progress stated against a numeric target, like 4 of 12.",
        contact: "A person's name together with a phone number or email address.",
        link: "A URL with an optional short note attached.",
        travel: "A trip with a destination and optionally a transport mode.",
        note: "A reference, idea, or observation that fits no other shape.",
        none: "Too short, vague, or incomplete to classify yet.",
      },
    }),
    readiness: score({
      instructions: "How complete is the sentence for turning into a card right now.",
      criteria: [
        "Just started, key details missing",
        "Partly specified, some usable detail present",
        "Fully specified, ready to save",
      ] as const,
    }),
    is_question: noul({
      instructions: "The sentence asks a question instead of stating or requesting a card.",
    }),
    recurring: noul({
      instructions: "The sentence describes something repeating on a daily or weekly rhythm.",
    }),
    has_list: noul({
      instructions: "The sentence names two or more distinct items, steps, or options.",
    }),
    is_shopping: noul({
      instructions: "The listed items are groceries or things to purchase.",
    }),
    urgency: score({
      instructions: "How time-sensitive or urgent the wording sounds.",
      criteria: ["Not urgent", "Somewhat time-sensitive", "Urgent, needs attention now"] as const,
    }),
    tone: choice({
      instructions: "The emotional tone of the wording. Pick the closest match.",
      criteria: {
        neutral: "Plain and factual with no strong feeling.",
        positive: "Happy, grateful, or content.",
        excited: "Enthusiastic or looking forward to something.",
        stressed: "Worried, frustrated, or under pressure.",
        reflective: "Thoughtful, calm, or introspective.",
      },
    }),
    event_mode: choice({
      instructions: "How an event or meeting would happen. Use unspecified when not stated or not an event.",
      criteria: {
        in_person: "Meeting face to face at a place.",
        video_call: "A video call such as Zoom or Meet.",
        phone_call: "A voice or phone call.",
        unspecified: "Not stated or not about a meeting.",
      },
    }),
    timer_kind: choice({
      instructions: "What sort of timer is requested. Default to countdown when unsure.",
      criteria: {
        countdown: "A plain countdown for a duration.",
        focus: "A focus or deep-work block.",
        break: "A rest or short break.",
        stopwatch: "Counting up with no fixed end.",
      },
    }),
    expense_category: choice({
      instructions: "What an expense was for. Use other when unsure or not an expense.",
      criteria: {
        food: "Meals, groceries, cafes, or drinks.",
        transport: "Taxi, fuel, tickets, or commuting.",
        shopping: "Clothes, gadgets, or goods purchased.",
        bills: "Rent, utilities, subscriptions, or recharges.",
        entertainment: "Movies, events, games, or outings.",
        health: "Doctor, pharmacy, or fitness.",
        other: "Something else or not about spending.",
      },
    }),
  },
})

export interface JevOptions {
  apiKey: string
  model: string
  fetch?: typeof globalThis.fetch
  signal?: AbortSignal
}

export interface ClassifiedIntent {
  value: JevIntent
  confidence: number
  probabilities: Partial<Record<JevIntent, number>>
}

export interface ClassifiedChoice<T extends string> {
  value: T
  confidence: number
}

export interface IntentResult {
  intent: ClassifiedIntent
  readiness: number
  signals: {
    isQuestion: number
    recurring: number
    hasList: number
    isShopping: number
    urgency: number
    tone: ClassifiedChoice<string>
    eventMode: ClassifiedChoice<string>
    timerKind: ClassifiedChoice<string>
    expenseCategory: ClassifiedChoice<string>
  }
  latencyMs: number
  questionCount: number
  model: string
}

function clamp01(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback
}

function clampScore(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(2, value)) : 0
}

function pickChoice<T extends string>(answer: { value?: unknown; choice?: unknown; confidence?: unknown }, fallback: T): ClassifiedChoice<T> {
  const raw = (answer.value ?? answer.choice) as unknown
  const value = typeof raw === "string" ? (raw as T) : fallback
  return { value, confidence: clamp01(answer.confidence, 0) }
}

export async function classifyIntent(text: string, options: JevOptions): Promise<IntentResult> {
  const prompt = text.trim()
  if (countJevPromptCharacters(prompt) < MIN_JEV_PROMPT_CHARACTERS || text.length > 1000) {
    throw new Error(`Text must be at least ${MIN_JEV_PROMPT_CHARACTERS} characters and no more than 1000 characters.`)
  }
  if (!options.apiKey.trim()) throw new Error("Jev is not configured.")

  const startedAt = Date.now()
  const provider = createTypeSafeProvider({
    apiKey: options.apiKey,
    model: options.model,
    timeoutMs: 10_000,
    maxResponseBytes: 8_192,
    ...(options.fetch ? { fetch: options.fetch } : {}),
  })
  const result = await intentDecision.evaluate({ text: prompt }, {
    provider,
    maxStateBytes: 2_048,
    maxResponseBytes: 8_192,
    ...(options.signal ? { signal: options.signal } : {}),
  })
  if (!result.ok) throw new Error("Jev could not classify this thought.")

  const answers = result.answers as Record<string, {
    choice?: unknown; value?: unknown; confidence?: unknown; score?: unknown; noul?: unknown;
    probabilities?: Record<string, number>;
  }>
  const kindRaw = (answers.kind?.choice ?? answers.kind?.value) as string
  const allowed = new Set<string>([...CARD_KINDS, "none"])
  if (!allowed.has(kindRaw)) throw new Error("Jev returned an unsupported card kind.")
  const kindProbabilities = (answers.kind?.probabilities ?? {}) as Record<string, number>

  return {
    intent: {
      value: kindRaw as JevIntent,
      confidence: clamp01(answers.kind?.confidence, 0),
      probabilities: Object.fromEntries(
        Object.entries(kindProbabilities).filter(([key]) => allowed.has(key)).map(([key, value]) => [key, clamp01(value, 0)]),
      ),
    },
    readiness: clampScore((answers.readiness as { score?: unknown })?.score),
    signals: {
      isQuestion: clamp01((answers.is_question as { noul?: unknown })?.noul ?? (answers.isQuestion as { noul?: unknown })?.noul, 0),
      recurring: clamp01((answers.recurring as { noul?: unknown })?.noul, 0),
      hasList: clamp01((answers.has_list as { noul?: unknown })?.noul ?? (answers.hasList as { noul?: unknown })?.noul, 0),
      isShopping: clamp01((answers.is_shopping as { noul?: unknown })?.noul ?? (answers.isShopping as { noul?: unknown })?.noul, 0),
      urgency: clampScore((answers.urgency as { score?: unknown })?.score),
      tone: pickChoice((answers.tone ?? {}) as { value?: unknown; confidence?: unknown }, "neutral"),
      eventMode: pickChoice((answers.event_mode ?? answers.eventMode ?? {}) as { value?: unknown; choice?: unknown; confidence?: unknown }, "unspecified"),
      timerKind: pickChoice((answers.timer_kind ?? answers.timerKind ?? {}) as { value?: unknown; choice?: unknown; confidence?: unknown }, "countdown"),
      expenseCategory: pickChoice((answers.expense_category ?? answers.expenseCategory ?? {}) as { value?: unknown; choice?: unknown; confidence?: unknown }, "other"),
    },
    latencyMs: Math.max(0, Date.now() - startedAt),
    questionCount: JEV_QUESTION_COUNT,
    model: options.model,
  }
}

export async function suggestCardKind(text: string, options: JevOptions): Promise<{ kind: JevCardKind; confidence: number }> {
  const result = await classifyIntent(text, options)
  if (result.intent.value === "none") throw new Error("Jev could not classify this thought yet.")
  return { kind: result.intent.value as JevCardKind, confidence: result.intent.confidence }
}
