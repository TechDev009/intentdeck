import { CARD_KINDS, type CardKind } from "./cards"
import { JEV_QUESTION_COUNT } from "./jev"
import type { IntentResult, JevIntent } from "./jev"

export const OFFLINE_MODEL = "intentdeck-offline"

type Scores = Partial<Record<JevIntent, number>>

function has(pattern: RegExp, text: string): boolean {
  return pattern.test(text)
}

function scoreText(raw: string): Scores {
  const text = raw.toLowerCase().trim()
  const words = text.split(/\s+/).filter(Boolean)
  const out: Scores = {}
  const add = (kind: JevIntent, value: number) => {
    out[kind] = (out[kind] ?? 0) + value
  }
  const numeric = /\d/.test(text)

  if (has(/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|dev|io|app|org|net|co|ai|in)\b/, text)) add("note", 1)
  if (has(/\b(remind|reminder|don't forget|remember to)\b/, text)) add("reminder", 6)
  if (has(/^(event|meeting)\s*:/, text)) add("event", 5)
  if (has(/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|20\d{2}-\d{2}-\d{2})\b/, text)) {
    add("event", words.length <= 8 ? 2.5 : 1)
  }
  if (has(/^(shopping|buy)\b/, text) || has(/^shopping\s*:/, text)) add("shopping", 5)
  if (has(/^(checklist|to-?do)\b/, text)) add("checklist", 5)
  if (has(/,|;|\band\b/, text) && words.length >= 4) {
    add("checklist", 2)
    if (has(/\b(buy|get|milk|eggs|bread|grocer)\b/, text)) add("shopping", 2)
  }
  if (has(/\btimer\b|\b\d+\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)\b/, text)) add("timer", 4)
  if (has(/\b(split|divide)\b/, text)) add("split", numeric ? 5 : 2.5)
  if (has(/\b(spent|spend|paid|pay|bought|expense)\b/, text)) add("expense", numeric ? 5 : 2.5)
  if (has(/^[\d\s+\-*/×÷().,%]+$/, text) && has(/\d\s*[+\-*/×÷%]\s*[\d(]/, text)) add("calculation", 6)
  if (has(/\b(calc|calculate|compute|what's|what is)\b/, text) && numeric) add("calculation", 3)
  if (has(/^recipe\s*:/, text)) add("recipe", 6)
  if (has(/^workout\s*:/, text)) add("workout", 5)
  if (has(/^habit\s*:/, text)) add("habit", 6)
  if (has(/\bagenda\s*:/, text)) add("agenda", 5)
  if (has(/\bitinerary\s*:/, text)) add("itinerary", 5)
  if (has(/^project(\s+plan)?\s*:/, text)) add("project", 5)
  if (has(/^#[0-9a-f]{3}$|^#[0-9a-f]{6}$/, text)) add("color", 7)
  else if (has(/\b(red|orange|yellow|green|blue|purple|pink|brown|black|white|gray|grey|navy|teal|mint|coral|gold|silver)\b/, text) && words.length <= 4) add("color", 2.5)
  if (has(/\b\d+(?:\.\d+)?\s*(km|kms|miles?|mi|kg|kgs|lbs?|pounds?|°?[cf]|celsius|fahrenheit)\s+(to|in|into|as)\s+(\S+)/, text)) add("convert", 6.5)
  if (has(/\b\w+\s+or\s+\w+/, text) && text.endsWith("?")) add("poll", 6)
  else if (has(/\b\w+\s+(or|vs\.?)\s+\w+/, text)) add("poll", 2.5)
  if (has(/\b(poll|vote)\b/, text)) add("poll", 3)
  if (has(/\b(days?|countdown)\s+(until|till|til|to)\b|\bhow (many days|long) (until|till)\b/, text)) add("countdown", 6)
  if (has(/\b\d{1,2}(:\d{2})?\s*(am|pm)?\s*(pst|pdt|est|edt|cst|cdt|mst|mdt|gmt|utc|cet|ist|jst)\b/, text) && has(/\b(in|to)\s+(pst|pdt|est|edt|cst|cdt|mst|mdt|gmt|utc|cet|ist|jst)\b/, text)) add("timezone", 6.5)
  if (has(/\b(roll|flip|toss)\b|\b\d{1,2}d\d{1,3}\b|\bcoin\b|\bdice\b|\b(pick|choose) (one|a random|for me)\b/, text)) add("random", 6)
  if (has(/\b\d[\d,]*\s*(of|\/)\s*\d[\d,]*\b/, text) && has(/[a-z]{3,}/, text)) add("goal", 4.5)
  if (has(/[\w.+-]+@[\w-]+\.\w+/, text)) add("contact", 5.5)
  else if (has(/(\+?\d[\d\s.-]{5,18}\d)/, text.replace(/\b20\d{2}-\d{2}-\d{2}\b/g, " ").replace(/\b\d{1,2}:\d{2}\b/g, " ")) && has(/[a-z]{2,}/, text)) add("contact", 3)
  if (has(/https?:\/\/|www\.|\b[a-z0-9-]+\.(com|dev|io|app|org|net|ai|in|co)\b/, text)) add("link", 5.5)
  if (has(/\b(flight|fly|trip|travel|vacation|holiday|train|bus|drive|getaway|visit)\b/, text)) add("travel", 4.5)
  if (words.length >= 7) add("note", 2)
  else if (words.length >= 4) add("note", 1)
  if (text.length < 3) add("none", 8)
  else if (words.length <= 1 && !numeric) add("none", 3)
  else add("none", 0.4)

  if ((out.split ?? 0) >= 5) out.calculation = Math.min(out.calculation ?? 0, 1)
  if ((out.convert ?? 0) >= 6) out.calculation = Math.min(out.calculation ?? 0, 1)
  if ((out.reminder ?? 0) >= 6) {
    out.event = Math.min(out.event ?? 0, 2)
    out.habit = Math.min(out.habit ?? 0, 2)
  }
  if ((out.poll ?? 0) >= 5) out.event = Math.min(out.event ?? 0, 2)
  if ((out.travel ?? 0) >= 4.5) out.event = Math.min(out.event ?? 0, 2)
  if ((out.contact ?? 0) >= 5) out.event = Math.min(out.event ?? 0, 2)
  if ((out.link ?? 0) >= 5) out.note = Math.min(out.note ?? 0, 1)
  if ((out.countdown ?? 0) >= 6) out.event = Math.min(out.event ?? 0, 2)
  if ((out.timezone ?? 0) >= 6) {
    out.event = Math.min(out.event ?? 0, 2)
    out.convert = Math.min(out.convert ?? 0, 1)
  }
  if ((out.random ?? 0) >= 6) {
    out.poll = Math.min(out.poll ?? 0, 2)
    out.calculation = Math.min(out.calculation ?? 0, 1)
  }
  if ((out.goal ?? 0) >= 4.5) out.calculation = Math.min(out.calculation ?? 0, 1)
  return out
}

function softmax(scores: Scores, temperature = 0.9): Record<JevIntent, number> {
  const keys: JevIntent[] = [...CARD_KINDS, "none"]
  const exps = keys.map((key) => Math.exp((scores[key] ?? 0) / temperature))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return Object.fromEntries(keys.map((key, index) => [key, exps[index]! / total])) as Record<JevIntent, number>
}

function choiceValue<T extends string>(values: readonly T[], value: T, confidence: number): { value: T; confidence: number } {
  void values
  return { value, confidence }
}

export function classifyOffline(text: string): IntentResult {
  const trimmed = text.trim()
  if (trimmed.length < 2) {
    return {
      intent: { value: "none", confidence: 1, probabilities: { none: 1 } },
      readiness: 0,
      signals: {
        isQuestion: 0,
        recurring: 0,
        hasList: 0,
        isShopping: 0,
        urgency: 0,
        tone: choiceValue(["neutral"] as const, "neutral", 1),
        eventMode: choiceValue(["unspecified"] as const, "unspecified", 1),
        timerKind: choiceValue(["countdown"] as const, "countdown", 1),
        expenseCategory: choiceValue(["other"] as const, "other", 1),
      },
      latencyMs: 1,
      questionCount: JEV_QUESTION_COUNT,
      model: OFFLINE_MODEL,
    }
  }
  const lower = trimmed.toLowerCase()
  const probabilities = softmax(scoreText(trimmed))
  const order = (Object.keys(probabilities) as JevIntent[]).sort((a, b) => probabilities[b]! - probabilities[a]!)
  const top = order[0]! as JevIntent

  const recurring = /\b(every|daily|weekly|each (day|week|morning)|\dx a week|repeat)\b/.test(lower) ? 0.88 : 0.07
  const urgentWord = /\b(urgent|asap|right now|important|!!)\b/.test(lower)
  const soonWord = /\b(today|tonight|tomorrow|deadline|soon)\b/.test(lower)
  const listHit = /,|;|\b\w+ or \w+\b/.test(lower) ? 0.85 : 0.08
  const shoppingHit = /\b(buy|grocer|shopping|milk|eggs|bread|pick up)\b/.test(lower) ? 0.86 : 0.1
  const questionHit = /\?\s*$|^(what|why|how|when|where|who|should|could|is|are|do)\b/.test(lower) ? 0.9 : 0.06

  let eventMode = "unspecified"
  if (/\b(zoom|meet|teams|facetime|video)\b/.test(lower)) eventMode = "video_call"
  else if (/\b(call|phone|ring)\b/.test(lower)) eventMode = "phone_call"
  else if (/\b(dinner|lunch|coffee|drinks|party|at [a-z]+)\b/.test(lower)) eventMode = "in_person"

  let timerKind = "countdown"
  if (/\b(focus|pomodoro|deep work|study)\b/.test(lower)) timerKind = "focus"
  else if (/\b(break|rest|nap)\b/.test(lower)) timerKind = "break"

  let expenseCategory = "other"
  if (/\b(uber|taxi|fuel|metro|bus|train|cab)\b/.test(lower)) expenseCategory = "transport"
  else if (/\b(food|lunch|dinner|coffee|grocer|pizza)\b/.test(lower)) expenseCategory = "food"
  else if (/\b(rent|electricity|wifi|internet|bill|subscription)\b/.test(lower)) expenseCategory = "bills"
  else if (/\b(movie|concert|game|tickets?)\b/.test(lower)) expenseCategory = "entertainment"
  else if (/\b(medicine|doctor|pharmacy|gym)\b/.test(lower)) expenseCategory = "health"
  else if (/\b(shoes|shirt|clothes|amazon|phone|laptop|gift)\b/.test(lower)) expenseCategory = "shopping"

  const tone = /\b(worried|stressed|anxious|ugh|panic|frustrat)\b/.test(lower)
    ? "stressed"
    : /\b(excited|can't wait|yay|pumped|!+$)/.test(lower)
      ? "excited"
      : /\b(grateful|happy|love|thankful|glad)\b/.test(lower)
        ? "positive"
        : /\b(wonder|thinking|realized|reflect|maybe|lately)\b/.test(lower)
          ? "reflective"
          : "neutral"

  return {
    intent: { value: top, confidence: probabilities[top]!, probabilities },
    readiness: top === "none" ? 0 : trimmed.length > 60 ? 1.6 : 1.0,
    signals: {
      isQuestion: questionHit,
      recurring,
      hasList: listHit,
      isShopping: shoppingHit,
      urgency: urgentWord ? 1.75 : soonWord ? 0.9 : 0.2,
      tone: choiceValue(["neutral", "positive", "excited", "stressed", "reflective"] as const, tone as "neutral", 0.8),
      eventMode: choiceValue(["in_person", "video_call", "phone_call", "unspecified"] as const, eventMode as "unspecified", 0.82),
      timerKind: choiceValue(["countdown", "focus", "break", "stopwatch"] as const, timerKind as "countdown", 0.8),
      expenseCategory: choiceValue(["food", "transport", "shopping", "bills", "entertainment", "health", "other"] as const, expenseCategory as "other", 0.8),
    },
    latencyMs: 1,
    questionCount: JEV_QUESTION_COUNT,
    model: OFFLINE_MODEL,
  }
}

export function isCardKind(value: JevIntent): value is CardKind {
  return (CARD_KINDS as readonly string[]).includes(value)
}
