import { isIntentCard, migrateIntentCard, type IntentCard } from "./cards"

export const STORAGE_KEY = "intentdeck.deck.v1"
export const BACKUP_VERSION = 1
export const MAX_DECK_SIZE = 500
const MAX_BACKUP_BYTES = 2_000_000

export interface StorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface DeckLoadResult {
  cards: IntentCard[]
  warning: string | null
  blocked: boolean
}

export function loadDeck(storage: StorageLike): DeckLoadResult {
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { cards: [], warning: "Browser storage is unavailable. Your deck has not been changed.", blocked: true }
  }
  if (raw === null) return { cards: [], warning: null, blocked: false }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { cards: [], warning: "Your saved deck couldn't be read. Reset it to start fresh; the saved data is still untouched.", blocked: true }
  }
  if (!parsed || typeof parsed !== "object" || (parsed as { version?: unknown }).version !== BACKUP_VERSION) {
    return { cards: [], warning: "This deck uses an unsupported format. Reset it to start fresh; the saved data is still untouched.", blocked: true }
  }
  const candidates = (parsed as { cards?: unknown }).cards
  if (!Array.isArray(candidates) || candidates.length > MAX_DECK_SIZE) {
    return { cards: [], warning: "Your saved deck has an invalid card list. Reset it to start fresh; the saved data is still untouched.", blocked: true }
  }

  const cards: IntentCard[] = []
  const ids = new Set<string>()
  let invalidCount = 0
  let migratedCount = 0
  for (const candidate of candidates) {
    const migrated = migrateIntentCard(candidate)
    if (!migrated || ids.has(migrated.id)) {
      invalidCount += 1
      continue
    }
    if (migrated !== candidate) migratedCount += 1
    ids.add(migrated.id)
    cards.push(migrated)
  }
  if (invalidCount > 0) {
    return {
      cards,
      warning: `${invalidCount} saved ${invalidCount === 1 ? "card was" : "cards were"} invalid and have been kept untouched. Reset the deck before making changes.`,
      blocked: true,
    }
  }
  if (migratedCount > 0) {
    try {
      saveDeck(storage, cards)
    } catch {
      /* keep the migrated cards in memory even if persisting fails */
    }
    return {
      cards,
      warning: null,
      blocked: false,
    }
  }
  return { cards, warning: null, blocked: false }
}

export function saveDeck(storage: StorageLike, cards: IntentCard[]): void {
  if (cards.length > MAX_DECK_SIZE) throw new Error(`A deck can hold up to ${MAX_DECK_SIZE} cards.`)
  if (cards.some((card) => !isIntentCard(card))) throw new Error("The deck contains a card with invalid data.")
  const ids = new Set<string>()
  for (const card of cards) {
    if (ids.has(card.id)) throw new Error("Every card in a deck needs a unique ID.")
    ids.add(card.id)
  }
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: BACKUP_VERSION, cards }))
}

export function exportDeck(cards: IntentCard[], exportedAt = new Date()): string {
  return JSON.stringify({ version: BACKUP_VERSION, exportedAt: exportedAt.toISOString(), cards }, null, 2)
}

export function importDeck(contents: string): IntentCard[] {
  if (new TextEncoder().encode(contents).byteLength > MAX_BACKUP_BYTES) throw new Error("Backup files must be smaller than 2 MB.")
  let parsed: unknown
  try {
    parsed = JSON.parse(contents)
  } catch {
    throw new Error("That backup isn't valid JSON.")
  }
  if (!parsed || typeof parsed !== "object" || (parsed as { version?: unknown }).version !== BACKUP_VERSION) {
    throw new Error(`This backup uses an unsupported version. Expected version ${BACKUP_VERSION}.`)
  }
  const candidates = (parsed as { cards?: unknown }).cards
  if (!Array.isArray(candidates) || candidates.length > MAX_DECK_SIZE) {
    throw new Error(`Backups must contain up to ${MAX_DECK_SIZE} cards.`)
  }
  const cards = candidates as unknown[]
  const ids = new Set<string>()
  const validCards: IntentCard[] = []
  for (const card of cards) {
    const migrated = migrateIntentCard(card)
    if (!migrated || ids.has(migrated.id)) throw new Error("The backup contains invalid or duplicate cards.")
    ids.add(migrated.id)
    validCards.push(migrated)
  }
  return validCards
}
