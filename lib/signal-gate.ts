import type { IntentResult } from "./jev"

export type SignalKey =
  | "isQuestion"
  | "recurring"
  | "hasList"
  | "isShopping"
  | "urgency"
  | "tone"
  | "eventMode"
  | "timerKind"
  | "expenseCategory"

export interface GatedSignals {
  isQuestion: boolean
  recurring: boolean
  hasList: boolean
  isShopping: boolean
  urgency: number
  urgent: boolean
  tone: string | null
  eventMode: string | null
  timerKind: string | null
  expenseCategory: string | null
}

export const neutralGated: GatedSignals = {
  isQuestion: false,
  recurring: false,
  hasList: false,
  isShopping: false,
  urgency: 0,
  urgent: false,
  tone: null,
  eventMode: null,
  timerKind: null,
  expenseCategory: null,
}

const SIGNAL_LIMITS = {
  choiceMin: 0.6,
  choiceKeep: 0.5,
  noulOn: 0.65,
  noulOff: 0.45,
  urgentOn: 1.2,
  urgentOff: 1.0,
} as const

const ESCAPES = new Set(["unspecified", "other", "neutral", "countdown"])

function gateChoice(value: string, confidence: number, prev: string | null, allowDefault = false): string | null {
  if (ESCAPES.has(value) && !allowDefault) {
    // countdown is a real timerKind default, keep it only when timer uses it explicitly
    if (value !== "countdown") return null
    return null
  }
  if (confidence >= SIGNAL_LIMITS.choiceMin) return value
  if (prev === value && confidence >= SIGNAL_LIMITS.choiceKeep) return prev
  return null
}

function gateFlag(probability: number, prev: boolean): boolean {
  if (probability >= SIGNAL_LIMITS.noulOn) return true
  if (probability <= SIGNAL_LIMITS.noulOff) return false
  return prev
}

export function gateSignals(prev: GatedSignals, result: IntentResult, used: readonly SignalKey[]): GatedSignals {
  const next: GatedSignals = { ...neutralGated }
  const wants = new Set(used)
  if (wants.has("isQuestion")) next.isQuestion = gateFlag(result.signals.isQuestion, prev.isQuestion)
  if (wants.has("recurring")) next.recurring = gateFlag(result.signals.recurring, prev.recurring)
  if (wants.has("hasList")) next.hasList = gateFlag(result.signals.hasList, prev.hasList)
  if (wants.has("isShopping")) next.isShopping = gateFlag(result.signals.isShopping, prev.isShopping)
  if (wants.has("tone")) {
    const gated = gateChoice(result.signals.tone.value, result.signals.tone.confidence, prev.tone, true)
    next.tone = gated === "neutral" ? null : gated
  }
  if (wants.has("eventMode")) next.eventMode = gateChoice(result.signals.eventMode.value, result.signals.eventMode.confidence, prev.eventMode)
  if (wants.has("timerKind")) {
    const raw = result.signals.timerKind.value
    const conf = result.signals.timerKind.confidence
    next.timerKind = conf >= SIGNAL_LIMITS.choiceMin ? raw : prev.timerKind === raw && conf >= SIGNAL_LIMITS.choiceKeep ? prev.timerKind : null
  }
  if (wants.has("expenseCategory")) next.expenseCategory = gateChoice(result.signals.expenseCategory.value, result.signals.expenseCategory.confidence, prev.expenseCategory)
  if (wants.has("urgency")) {
    next.urgency = result.signals.urgency
    next.urgent = prev.urgent ? result.signals.urgency > SIGNAL_LIMITS.urgentOff : result.signals.urgency > SIGNAL_LIMITS.urgentOn
  }
  return next
}
