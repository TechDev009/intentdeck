import { describe, expect, it } from "bun:test"
import { CARD_EXAMPLES, parseIntent, materializeDraft } from "../lib/cards"
import { STORAGE_KEY, exportDeck, importDeck, loadDeck, saveDeck, type StorageLike } from "../lib/storage"

class MemoryStorage implements StorageLike {
  values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
  removeItem(key: string) { this.values.delete(key) }
}

describe("local deck storage", () => {
  it("starts empty and round-trips validated cards", () => {
    const storage = new MemoryStorage()
    expect(loadDeck(storage)).toEqual({ cards: [], warning: null, blocked: false })

    const card = materializeDraft(parseIntent("timer 5 minutes for tea"), new Date("2026-09-23T10:00:00.000Z"), "card-1")
    saveDeck(storage, [card])
    expect(loadDeck(storage)).toEqual({ cards: [card], warning: null, blocked: false })
  })

  it("leaves malformed storage untouched and blocks accidental overwrite", () => {
    const storage = new MemoryStorage()
    const corrupted = "{not valid json"
    storage.values.set(STORAGE_KEY, corrupted)

    const result = loadDeck(storage)
    expect(result.blocked).toBe(true)
    expect(result.warning).toContain("couldn't be read")
    expect(storage.getItem(STORAGE_KEY)).toBe(corrupted)
  })

  it("exports and imports a versioned backup", () => {
    const card = materializeDraft(parseIntent("An idea worth keeping"), new Date("2026-09-23T10:00:00.000Z"), "card-1")
    expect(importDeck(exportDeck([card], new Date("2026-09-23T11:00:00.000Z")))).toEqual([card])
  })

  it("stores and restores every supported card kind", () => {
    const storage = new MemoryStorage()
    const createdAt = new Date(2026, 8, 23, 10)
    const cards = CARD_EXAMPLES.map((example, index) =>
      materializeDraft(parseIntent(example.text, createdAt), createdAt, `card-${index + 1}`),
    )

    saveDeck(storage, cards)
    expect(loadDeck(storage)).toEqual({ cards, warning: null, blocked: false })
    expect(importDeck(exportDeck(cards, createdAt))).toEqual(cards)
  })

  it("rejects unsupported backup versions and invalid cards", () => {
    expect(() => importDeck(JSON.stringify({ version: 9, cards: [] }))).toThrow("version")
    expect(() => importDeck(JSON.stringify({ version: 1, cards: [{ id: "bad" }] }))).toThrow("invalid or duplicate cards")
  })

  it("migrates pre-when travel cards instead of blocking the deck", () => {
    const storage = new MemoryStorage()
    const legacy = {
      id: "travel-1",
      createdAt: new Date(2026, 8, 23, 10).toISOString(),
      completed: false,
      kind: "travel",
      title: "Trip to Goa",
      destination: "Goa",
      mode: "flight",
    }
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, cards: [legacy] }))
    const result = loadDeck(storage)
    expect(result.blocked).toBe(false)
    expect(result.warning).toBeNull()
    expect(result.cards).toHaveLength(1)
    expect(result.cards[0]).toMatchObject({ kind: "travel", when: null })
    expect(importDeck(JSON.stringify({ version: 1, cards: [legacy] }))).toHaveLength(1)
  })
})
