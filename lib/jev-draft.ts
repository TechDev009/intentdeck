import { buildCollectionItems, buildPollDraft, buildTravelDraft, contactDraft, linkDraft, makeNote, type CardKind, type IntentDraft } from "./cards"
import { isCardKind } from "./intent-local"
import type { JevIntent } from "./jev"

const COLLECTION_TITLES: Record<string, string> = {
  checklist: "Checklist",
  shopping: "Shopping list",
  workout: "Workout",
  agenda: "Meeting agenda",
  itinerary: "Itinerary",
  project: "Project plan",
}

function isCollectionKind(kind: CardKind): boolean {
  return kind === "checklist" || kind === "shopping" || kind === "workout" || kind === "agenda" || kind === "itinerary" || kind === "project"
}

function clipped(text: string, max = 240): string {
  const clean = text.trim().replace(/\s+/g, " ")
  return clean.slice(0, max) || "Untitled"
}

/**
 * Jev decides the shape. Code only fills values deterministically.
 * Collections always build a real split list, never a single fake item.
 * Value-heavy kinds (timer/split/expense/calculation/recipe) are never
 * invented: when the local parse lacks those values we keep the local
 * draft and let the caller show a "needs detail" hint.
 */
export function resolveDraft(text: string, liveKind: JevIntent | null, local: IntentDraft | null): IntentDraft {
  const trimmed = text.trim()
  if (!trimmed) return { kind: "note", title: "Quick note", body: "" }
  if (!liveKind || liveKind === "none") return local ?? makeNote(trimmed)
  if (!isCardKind(liveKind)) return local ?? makeNote(trimmed)
  const kind = liveKind as CardKind
  if (local?.kind === kind) return local

  if (isCollectionKind(kind)) {
    const label = kind === "shopping" ? "shopping item" : "list item"
    const items = buildCollectionItems(trimmed, label)
    const title = COLLECTION_TITLES[kind] ?? "List"
    if (kind === "shopping") return { kind: "shopping", title, items }
    if (kind === "checklist") return { kind: "checklist", title, items }
    if (kind === "workout") return { kind: "workout", title, items }
    if (kind === "agenda") return { kind: "agenda", title, items }
    if (kind === "itinerary") return { kind: "itinerary", title, items }
    return { kind: "project", title, items }
  }
  if (kind === "event" || kind === "reminder") {
    if (local && (local.kind === "event" || local.kind === "reminder")) {
      return { kind, title: local.title, scheduledAt: local.scheduledAt, scheduleAmbiguous: local.scheduleAmbiguous }
    }
    return { kind, title: clipped(trimmed), scheduledAt: null, scheduleAmbiguous: false }
  }
  if (kind === "habit") {
    if (local?.kind === "habit") return local
    const weekly = /\b(?:weekly|each week|every week)\b/i.test(trimmed)
    return { kind: "habit", title: clipped(trimmed), cadence: weekly ? "weekly" : "daily", lastCompletedPeriod: null }
  }
  if (kind === "note") return makeNote(trimmed)
  if (kind === "poll") {
    try {
      return buildPollDraft(trimmed)
    } catch {
      return local ?? makeNote(trimmed)
    }
  }
  if (kind === "travel") {
    try {
      return buildTravelDraft(trimmed)
    } catch {
      return local ?? makeNote(trimmed)
    }
  }
  if (kind === "contact") return contactDraft(trimmed) ?? local ?? makeNote(trimmed)
  if (kind === "link") return linkDraft(trimmed) ?? local ?? makeNote(trimmed)
  // Value-heavy: never invent numbers or steps. Keep local so no hallucination.
  return local ?? makeNote(trimmed)
}

export function needsDetail(liveKind: JevIntent | null, resolved: IntentDraft): string | null {
  if (!liveKind || liveKind === "none" || !isCardKind(liveKind)) return null
  if (resolved.kind === liveKind) return null
  switch (liveKind) {
    case "timer": return "Jev sees a timer — add a duration like “8 minutes”."
    case "split": return "Jev sees a split — add an amount and people like “₹1275.50 among 4”."
    case "expense": return "Jev sees an expense — add an amount like “₹430 on taxi”."
    case "calculation": return "Jev sees a calculation — add numbers like “(2450 * 0.18) + 2450”."
    case "recipe": return "Jev sees a recipe — add “ingredients: …; steps: …”."
    case "color": return "Jev sees a color — add a hex like “#ff6b35” or a color name."
    case "convert": return "Jev sees a conversion — add units like “5 miles in km”."
    case "countdown": return "Jev sees a countdown — name a holiday, weekday, or date."
    case "timezone": return "Jev sees a time zone — add a time like “3pm PST in IST”."
    case "random": return "Jev sees randomness — try “roll 2d6” or “flip a coin”."
    case "goal": return "Jev sees a goal — add progress like “read 4 of 12 books”."
    case "contact": return "Jev sees a contact — add a phone number or email."
    case "link": return "Jev sees a link — paste the URL."
    default: return null
  }
}
