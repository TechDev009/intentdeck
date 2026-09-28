import type { CardKind } from "./cards"
import type { IntentResult, JevIntent } from "./jev"

export type ActiveIntent = CardKind
export type UiState =
  | { kind: "input" }
  | { kind: "ghost"; intent: ActiveIntent }
  | { kind: "choose"; options: [ActiveIntent, ActiveIntent] }
  | { kind: "committed"; intent: ActiveIntent; forced?: boolean }

export interface DecideMemory {
  ui: UiState
  challenger: { intent: ActiveIntent; wins: number } | null
  forcedText: string | null
}

export const INTENT_THRESHOLDS = {
  inputBelow: 0.4,
  commitAt: 0.7,
  chooseGap: 0.15,
  chooseFloor: 0.25,
  challengerOverride: 0.85,
  challengerWins: 2,
  dropBelow: 0.3,
  forcedChangeRatio: 0.3,
} as const

export const initialMemory: DecideMemory = { ui: { kind: "input" }, challenger: null, forcedText: null }

function editDistance(left: string, right: string): number {
  if (left === right) return 0
  if (!left.length) return right.length
  if (!right.length) return left.length
  let prev = Array.from({ length: right.length + 1 }, (_, i) => i)
  for (let i = 1; i <= left.length; i += 1) {
    const cur = [i]
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost)
    }
    prev = cur as number[]
  }
  return prev[right.length]!
}

export function changedSubstantially(before: string, after: string): boolean {
  const span = Math.max(before.length, after.length, 1)
  return editDistance(before, after) > INTENT_THRESHOLDS.forcedChangeRatio * span
}

function isUsable(intent: JevIntent): intent is ActiveIntent {
  return intent !== "none"
}

function ranked(result: IntentResult): [ActiveIntent, number][] {
  return (Object.entries(result.intent.probabilities) as [JevIntent, number][])
    .filter(([key]) => isUsable(key))
    .sort((a, b) => b[1] - a[1]) as [ActiveIntent, number][]
}

function nearTie(result: IntentResult): [ActiveIntent, ActiveIntent] | null {
  const list = ranked(result)
  if (list.length < 2) return null
  const [[first, firstP], [second, secondP]] = list as [[ActiveIntent, number], [ActiveIntent, number]]
  if (firstP! > INTENT_THRESHOLDS.chooseFloor && secondP! > INTENT_THRESHOLDS.chooseFloor && firstP! - secondP! < INTENT_THRESHOLDS.chooseGap) {
    return [first!, second!]
  }
  return null
}

export function rawState(result: IntentResult): UiState {
  const top = result.intent.value
  const confidence = result.intent.confidence
  if (!isUsable(top) || confidence < INTENT_THRESHOLDS.inputBelow) {
    const tie = nearTie(result)
    if (isUsable(top) && tie) return { kind: "choose", options: tie }
    return { kind: "input" }
  }
  const tie = nearTie(result)
  if (tie) return { kind: "choose", options: tie }
  if (confidence < INTENT_THRESHOLDS.commitAt) return { kind: "ghost", intent: top }
  return { kind: "committed", intent: top }
}

export function decide(memory: DecideMemory, result: IntentResult, text: string): DecideMemory {
  if (!text.trim()) return initialMemory
  const prev = memory.ui
  if (prev.kind === "committed" && prev.forced && memory.forcedText !== null) {
    if (!changedSubstantially(memory.forcedText, text)) return memory
  }
  const next = rawState(result)
  if (prev.kind === "committed" && !prev.forced) {
    const current = prev.intent
    const top = result.intent.value
    const topConfidence = result.intent.confidence
    const currentP = (result.intent.probabilities[current] ?? 0) as number
    if (top === current) return { ui: prev, challenger: null, forcedText: null }
    if (!isUsable(top)) {
      if (currentP < INTENT_THRESHOLDS.dropBelow) return { ui: { kind: "input" }, challenger: null, forcedText: null }
      return { ...memory, challenger: null }
    }
    if (topConfidence >= INTENT_THRESHOLDS.challengerOverride) {
      return { ui: { kind: "committed", intent: top }, challenger: null, forcedText: null }
    }
    const wins = memory.challenger?.intent === top ? memory.challenger.wins + 1 : 1
    if (wins >= INTENT_THRESHOLDS.challengerWins && topConfidence >= INTENT_THRESHOLDS.inputBelow) {
      return { ui: next, challenger: null, forcedText: null }
    }
    if (currentP < INTENT_THRESHOLDS.dropBelow && topConfidence < INTENT_THRESHOLDS.inputBelow) {
      return { ui: { kind: "input" }, challenger: null, forcedText: null }
    }
    return { ui: prev, challenger: { intent: top, wins }, forcedText: null }
  }
  return { ui: next, challenger: null, forcedText: null }
}

export function forceIntent(intent: ActiveIntent, text: string): DecideMemory {
  return { ui: { kind: "committed", intent, forced: true }, challenger: null, forcedText: text }
}

export function promoteGhost(memory: DecideMemory): DecideMemory {
  if (memory.ui.kind !== "ghost") return memory
  return { ui: { kind: "committed", intent: memory.ui.intent }, challenger: null, forcedText: null }
}

export function activeIntent(ui: UiState): ActiveIntent | null {
  return ui.kind === "committed" || ui.kind === "ghost" ? ui.intent : null
}
