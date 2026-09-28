import { client } from "@nifrajs/client"
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import { toast, Toaster } from "sonner"
import {
  ArrowLeftRight, BarChart3, Bell, Briefcase, Calculator, CalendarClock, CalendarDays, Check, ChefHat, ChevronDown, ClipboardList, Clock,
  Coins, Contact as ContactIcon, Copy, Dices, Download, Dumbbell, Equal, Globe, Hourglass, LayoutGrid, Link2, ListChecks, ListPlus, Map as MapIcon,
  Minus, Palette as PaletteIcon, Pin, PinOff, Plane, Plus, Repeat, RotateCcw, Ruler, Search, ShoppingCart, Split as SplitIcon, StickyNote,
  Target, Timer as TimerIcon, Trash2, Upload, Users, Video, Vote, Wallet, X,
} from "lucide-react"
import type { backend } from "../backend"
import { CARD_EXAMPLES, CONVERT_UNITS, convertUnitKind, convertUnits, evaluateArithmetic, extractEventEntities, habitPeriodKey, isCollectionCard, isCollectionDraft, isHabitComplete, materializeDraft, parseIntent, pauseTimer, remainingTimerSeconds, resetTimer, rollRandomExpression, splitShares, startTimer, TIME_ZONES, type CardKind, type Currency, type IntentCard, type IntentDraft } from "../lib/cards"
import { classifyOffline, isCardKind } from "../lib/intent-local"
import { activeIntent, decide, forceIntent, initialMemory, promoteGhost, type DecideMemory } from "../lib/intent-state"
import { INTENT_UI } from "../lib/intent-ui"
import { needsDetail, resolveDraft } from "../lib/jev-draft"
import type { IntentResult } from "../lib/jev"
import { countJevPromptCharacters, MIN_JEV_PROMPT_CHARACTERS } from "../lib/jev-constraints"
import { gateSignals, neutralGated, type GatedSignals } from "../lib/signal-gate"
import { BACKUP_VERSION, importDeck, loadDeck, saveDeck } from "../lib/storage"
import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input, Label, Separator, Skeleton } from "../components/ui/input"
import { Checkbox, Progress, Switch } from "../components/ui/controls"
import { Tabs, TabsContent, TabsList, TabsTrigger, Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/tabs-accordion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../components/ui/alert-dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/overlays"
import { Avatar, AvatarFallback, Collapsible, CollapsibleContent, CollapsibleTrigger, ScrollArea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Slider, ToggleGroup, ToggleGroupItem } from "../components/ui/widgets"
import { Alert, AlertDescription, AlertTitle, Pagination, PaginationButton, PaginationList, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/data"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut } from "../components/ui/command"

const api = client<typeof backend>("")

export const meta = {
  title: "IntentDeck — one thought, one useful card",
  link: [{ rel: "icon", href: "/api/favicon.svg", type: "image/svg+xml" }],
  meta: [
    {
      name: "description",
      content: "Type one thought and watch a useful, interactive card take shape. Preview locally and save it in your browser.",
    },
  ],
}

const labels: Record<CardKind, string> = {
  event: "Event",
  reminder: "Reminder",
  checklist: "Checklist",
  shopping: "Shopping",
  timer: "Timer",
  split: "Split",
  expense: "Expense",
  calculation: "Calculation",
  recipe: "Recipe",
  workout: "Workout",
  habit: "Habit",
  agenda: "Agenda",
  itinerary: "Itinerary",
  project: "Project",
  note: "Note",
  color: "Color",
  convert: "Convert",
  poll: "Poll",
  countdown: "Countdown",
  timezone: "Time zone",
  random: "Random",
  goal: "Goal",
  contact: "Contact",
  link: "Link",
  travel: "Trip",
}

const QUICK_EXAMPLES = CARD_EXAMPLES.filter(({ kind }) => kind === "event" || kind === "recipe" || kind === "split")
const PIN_KEY = "intentdeck.pinned.v1"
const PAGE_SIZE = 12

const KIND_ICONS = {
  event: CalendarDays,
  reminder: Bell,
  checklist: ListChecks,
  shopping: ShoppingCart,
  timer: TimerIcon,
  split: SplitIcon,
  expense: Wallet,
  calculation: Calculator,
  recipe: ChefHat,
  workout: Dumbbell,
  habit: Repeat,
  agenda: ClipboardList,
  itinerary: MapIcon,
  project: Briefcase,
  note: StickyNote,
  color: PaletteIcon,
  convert: Ruler,
  poll: Vote,
  countdown: Hourglass,
  timezone: Globe,
  random: Dices,
  goal: Target,
  contact: ContactIcon,
  link: Link2,
  travel: Plane,
} as const

const KIND_ACCENTS: Record<CardKind, string> = {
  event: "#5b7fa6",
  reminder: "#b7794c",
  checklist: "#8a6034",
  shopping: "#8a6034",
  timer: "#3d6965",
  split: "#8e5143",
  expense: "#8e5143",
  calculation: "#4e6b47",
  recipe: "#8a5738",
  workout: "#7a4a2e",
  habit: "#665879",
  agenda: "#4b6570",
  itinerary: "#4b6570",
  project: "#6b5a3e",
  note: "#656a5f",
  color: "#b0486b",
  convert: "#4a6b8a",
  poll: "#5a6b8a",
  countdown: "#6b5a8a",
  timezone: "#3f7a8a",
  random: "#7a5a9e",
  goal: "#4e7a4e",
  contact: "#5a7a6b",
  link: "#4a6b8a",
  travel: "#3f7a8a",
}

function KindBadge({ kind, variant = "default" }: { kind: CardKind; variant?: "default" | "secondary" | "outline" | "success" | "warning" }) {
  const Icon = KIND_ICONS[kind]
  return (
    <Badge variant={variant}>
      <Icon size={11} aria-hidden="true" style={{ marginRight: 4 }} />
      {labels[kind]}
    </Badge>
  )
}

type Filter = "all" | "open" | "done"
type Sort = "newest" | "oldest" | "kind"

function currency(cents: number, code: Currency): string {
  const locale = code === "INR" ? "en-IN" : "en-US"
  return new Intl.NumberFormat(locale, { style: "currency", currency: code }).format(cents / 100)
}

function groupShares(amounts: number[]): { amount: number; count: number }[] {
  const counts = new Map<number, number>()
  for (const amount of amounts) counts.set(amount, (counts.get(amount) ?? 0) + 1)
  return Array.from(counts, ([amount, count]) => ({ amount, count }))
}

function dateLabel(value: string | null): string {
  if (!value) return "No date set"
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? (() => { const [year, month, day] = value.split("-").map(Number); return new Date(year!, month! - 1, day!) })()
    : new Date(value)
  if (!Number.isFinite(date.getTime())) return "Date needs review"
  const day = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(date)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return day
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)
  return `${day} · ${time}`
}

function timerLabel(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const rest = safe % 60
  return hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

function previewDescription(draft: IntentDraft): string {
  switch (draft.kind) {
    case "event":
    case "reminder":
      return draft.scheduleAmbiguous ? `${dateLabel(draft.scheduledAt)} · choose AM or PM in the text` : dateLabel(draft.scheduledAt)
    case "checklist":
    case "shopping":
    case "workout":
    case "agenda":
    case "itinerary":
    case "project":
      return `${draft.items.length} ${draft.items.length === 1 ? "item" : "items"}`
    case "timer":
      return timerLabel(draft.durationSeconds)
    case "split":
      return `${currency(draft.amountCents, draft.currency)} among ${draft.peopleCount}`
    case "expense":
      return `${currency(draft.amountCents, draft.currency)} · ${draft.category}`
    case "calculation":
      return `${draft.expression} = ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 10 }).format(draft.result)}`
    case "recipe":
      return `${draft.ingredients.length} ingredients · ${draft.steps.length} steps`
    case "habit":
      return `Repeats ${draft.cadence}`
    case "note":
      return draft.body
    case "color":
      return `${draft.name} · ${draft.hex}`
    case "convert":
      return `${draft.input} ${draft.from} = ${draft.result} ${draft.to}`
    case "poll":
      return `${draft.options.length} options`
    case "countdown":
      return dateLabel(draft.target)
    case "timezone":
      return `${draft.from.toUpperCase()} → ${draft.to.toUpperCase()}`
    case "random":
      return `${draft.expression} → ${draft.result}`
    case "goal":
      return `${draft.current}/${draft.target}${draft.unit ? " " + draft.unit : ""}`
    case "contact":
      return [draft.phone, draft.email].filter(Boolean).join(" · ") || "Contact"
    case "link":
      return draft.note ?? draft.url
    case "travel":
      return `${draft.mode} · ${draft.destination}`
  }
}

function describeCard(card: IntentCard, now: number): string {
  switch (card.kind) {
    case "event":
    case "reminder":
      return card.scheduleAmbiguous ? `${dateLabel(card.scheduledAt)} · time needs AM/PM` : dateLabel(card.scheduledAt)
    case "checklist":
    case "shopping":
    case "workout":
    case "agenda":
    case "itinerary":
    case "project":
      return `${card.items.filter((item) => item.done).length} of ${card.items.length} checked`
    case "timer": {
      const remaining = remainingTimerSeconds(card, now)
      return remaining === 0 ? "Time is up" : card.endsAt ? "Running" : "Ready when you are"
    }
    case "split":
      return `${currency(card.amountCents, card.currency)} split ${card.peopleCount} ways`
    case "expense":
      return `${card.category} · ${dateLabel(card.spentAt)}`
    case "calculation":
      return card.expression
    case "recipe":
      return `${card.steps.filter((step) => step.done).length} of ${card.steps.length} steps done`
    case "habit":
      return isHabitComplete(card, new Date(now)) ? `Done this ${card.cadence === "daily" ? "day" : "week"}` : `Due ${card.cadence}`
    case "note":
      return "Saved in your deck"
    case "color":
      return `${card.name} · ${card.hex}`
    case "convert":
      return `${card.input} ${card.from} = ${card.result} ${card.to}`
    case "poll": {
      const votes = card.options.reduce((sum, option) => sum + option.votes, 0)
      return `${card.options.length} options · ${votes} votes`
    }
    case "countdown": {
      const days = countdownDays(card.target, now)
      return days === 0 ? "Today" : days > 0 ? `${days} days left` : `${Math.abs(days)} days ago`
    }
    case "timezone":
      return `${card.from.toUpperCase()} → ${card.to.toUpperCase()}`
    case "random":
      return `${card.expression} → ${card.result}`
    case "goal":
      return `${card.current}/${card.target}${card.unit ? " " + card.unit : ""}`
    case "contact":
      return [card.phone, card.email].filter(Boolean).join(" · ") || "Contact"
    case "link":
      return card.note ?? card.url
    case "travel":
      return card.when ? `${card.mode} · ${card.destination} · ${dateLabel(card.when)}` : `${card.mode} · ${card.destination}`
  }
}

function countdownDays(target: string, now: number): number {
  const [year, month, day] = target.split("-").map(Number)
  const targetDate = new Date(year!, month! - 1, day!)
  const today = new Date(now)
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((targetDate.getTime() - todayStart.getTime()) / 86_400_000)
}

function timezoneResult(card: { from: string; to: string; hour: number; minute: number }): string {  const fromOffset = TIME_ZONES[card.from] ?? 0
  const toOffset = TIME_ZONES[card.to] ?? 0
  const utcMinutes = card.hour * 60 + card.minute - Math.round(fromOffset * 60)
  const toMinutes = utcMinutes + Math.round(toOffset * 60)
  const dayShift = Math.floor(toMinutes / 1440)
  const wrapped = ((toMinutes % 1440) + 1440) % 1440
  const hour24 = Math.floor(wrapped / 60)
  const minute = wrapped % 60
  const suffix = hour24 >= 12 ? "PM" : "AM"
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const dayNote = dayShift === 0 ? "" : dayShift > 0 ? ` (+${dayShift}d)` : ` (${dayShift}d)`
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix} ${card.to.toUpperCase()}${dayNote}`
}

const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"] as const

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)]
}

function mixHex(hex: string, target: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex)
  const mix = (source: number, goal: number) => Math.round(source + (goal - source) * amount)
  const toHex = (value: number) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0")
  return `#${toHex(mix(r, target[0]))}${toHex(mix(g, target[1]))}${toHex(mix(b, target[2]))}`.toUpperCase()
}

function colorShades(hex: string): { hex: string; label: string }[] {
  return [
    { hex: mixHex(hex, [0, 0, 0], 0.35), label: "Shade" },
    { hex: mixHex(hex, [0, 0, 0], 0.15), label: "Deep" },
    { hex: hex.toUpperCase(), label: "Base" },
    { hex: mixHex(hex, [255, 255, 255], 0.3), label: "Tint" },
    { hex: mixHex(hex, [255, 255, 255], 0.6), label: "Mist" },
  ]
}

function rgbLabel(hex: string): string {
  const [r, g, b] = hexToRgb(hex)
  return `rgb(${r}, ${g}, ${b})`
}

function TimerRing({ remaining, duration, size = 84 }: { remaining: number; duration: number; size?: number }) {
  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius
  const fraction = duration <= 0 ? 0 : Math.max(0, Math.min(1, remaining / duration))
  return (
    <svg className="timer-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${timerLabel(remaining)} left`}>
      <circle className="ring-bg" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={8} />
      <circle
        className="ring-fg"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
      />
    </svg>
  )
}

const CALC_PAD: { key: string; insert?: string; kind: "digit" | "op" | "action" | "eq" }[] = [
  { key: "C", kind: "action" },
  { key: "(", kind: "op" },
  { key: ")", kind: "op" },
  { key: "⌫", kind: "action" },
  { key: "7", kind: "digit" },
  { key: "8", kind: "digit" },
  { key: "9", kind: "digit" },
  { key: "÷", insert: "/", kind: "op" },
  { key: "4", kind: "digit" },
  { key: "5", kind: "digit" },
  { key: "6", kind: "digit" },
  { key: "×", insert: "*", kind: "op" },
  { key: "1", kind: "digit" },
  { key: "2", kind: "digit" },
  { key: "3", kind: "digit" },
  { key: "−", insert: "-", kind: "op" },
  { key: "0", kind: "digit" },
  { key: ".", kind: "digit" },
  { key: "%", kind: "op" },
  { key: "+", kind: "op" },
]

function tryEvaluate(expr: string): number | null {
  try {
    return evaluateArithmetic(expr).result
  } catch {
    return null
  }
}

function parseWorkoutRow(text: string): { name: string; scheme: string | null } {
  const match = text.match(/^(.*?)(?:\s+(\d+\s*x\s*\d+|\d+\s*(?:min|mins|minutes|sec|secs|seconds|km|miles?|sets?|reps?|rounds?))\.?)$/i)
  if (!match || !match[1]!.trim()) return { name: text, scheme: null }
  return { name: match[1]!.trim(), scheme: match[2]!.replace(/\s+/g, " ") }
}

function parseItineraryStop(text: string): { time: string | null; place: string } {
  const match = text.match(/^(?:(\d{1,2}(?::[0-5]\d)?(?:\s*(?:am|pm))?)\s+)?(.+)$/i)
  const time = match?.[1]?.trim() || null
  const place = (match?.[2]?.trim() || text).replace(/^(?:at|@)\s+/i, "")
  if (time && !/^\d/.test(time)) return { time: null, place: text }
  return { time, place }
}

function ItineraryTimeline({ stops, renderNode }: {
  stops: { time: string | null; place: string }[]
  renderNode?: (index: number) => React.ReactNode
}) {
  return (
    <ol className="tl-rail" aria-label="Stops in order">
      {stops.map((stop, index) => (
        <li key={index} className="tl-stop">
          <span className="tl-node" aria-hidden="true">
            {renderNode ? renderNode(index) : <span className="tl-dot" />}
          </span>
          <div className="tl-body">
            {stop.time && <span className="tl-time">{stop.time}</span>}
            <span className="tl-place">{stop.place}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

function ProjectSteps({ steps, renderNode }: {
  steps: string[]
  renderNode: (index: number) => React.ReactNode
}) {
  return (
    <ol className="tl-rail steps-rail" aria-label="Milestones in order">
      {steps.map((step, index) => (
        <li key={index} className="tl-stop">
          <span className="tl-node" aria-hidden="true">
            <span className="live-stepnum">{index + 1}</span>
          </span>
          <div className="tl-body">
            <span className="tl-place">{step}</span>
            {renderNode(index)}
          </div>
        </li>
      ))}
    </ol>
  )
}

function cardIsComplete(card: IntentCard, now: number): boolean {
  return card.kind === "habit" ? isHabitComplete(card, new Date(now)) : card.completed
}

function cardSearchText(card: IntentCard): string {
  const parts = [card.title, card.kind]
  if (card.kind === "note") parts.push(card.body)
  if (card.kind === "calculation") parts.push(card.expression)
  if (card.kind === "expense") parts.push(card.category)
  if (card.kind === "poll" && "options" in card && Array.isArray((card as { options: { text: string }[] }).options)) {
    parts.push(...(card as { options: { text: string }[] }).options.map((option) => option.text))
  }
  if (card.kind === "contact") {
    if (card.phone) parts.push(card.phone)
    if (card.email) parts.push(card.email)
  }
  if (card.kind === "link") {
    parts.push(card.url)
    if (card.note) parts.push(card.note)
  }
  if (card.kind === "travel") parts.push(card.destination, card.mode)
  if (card.kind === "goal" && card.unit) parts.push(card.unit)
  if (card.kind === "color") parts.push(card.name, card.hex)
  if (isCollectionCard(card)) parts.push(...card.items.map((item) => item.text))
  if (card.kind === "recipe") parts.push(...card.ingredients.map((item) => item.text), ...card.steps.map((item) => item.text))
  return parts.join(" ").toLocaleLowerCase()
}

function liveBadges(gated: GatedSignals): string[] {
  const badges: string[] = []
  if (gated.eventMode && gated.eventMode !== "unspecified") {
    badges.push(gated.eventMode === "video_call" ? "Video" : gated.eventMode === "phone_call" ? "Call" : "In person")
  }
  if (gated.timerKind && gated.timerKind !== "countdown") {
    badges.push(gated.timerKind === "focus" ? "Focus" : gated.timerKind === "break" ? "Break" : "Stopwatch")
  }
  if (gated.expenseCategory) badges.push(gated.expenseCategory[0]!.toUpperCase() + gated.expenseCategory.slice(1))
  if (gated.urgent) badges.push("Urgent")
  if (gated.recurring) badges.push("Repeats")
  if (gated.isShopping) badges.push("Shopping")
  else if (gated.hasList) badges.push("List")
  if (gated.isQuestion) badges.push("Question")
  if (gated.tone && gated.tone !== "neutral") badges.push(gated.tone[0]!.toUpperCase() + gated.tone.slice(1))
  return badges.slice(0, 4)
}

function initials(name: string): string {
  const clean = name.trim()
  if (!clean) return "•"
  const parts = clean.split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || clean.slice(0, 2).toUpperCase()
}

function readPinned(): string[] {
  try {
    const raw = window.localStorage.getItem(PIN_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : []
  } catch {
    return []
  }
}

function monthGrid(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

function parseScheduledDate(value: string | null): Date | null {
  if (!value) return null
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? (() => { const [y, m, d] = value.split("-").map(Number); return new Date(y!, m! - 1, d!) })()
    : new Date(value)
  return Number.isFinite(date.getTime()) ? date : null
}

export default function Home() {
  const [cards, setCards] = useState<IntentCard[]>([])
  const [deckOpen, setDeckOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)
  const [storageBlocked, setStorageBlocked] = useState(false)
  const [text, setText] = useState("")
  const thoughtRef = useRef("")
  const [draft, setDraft] = useState<IntentDraft | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [kindFilter, setKindFilter] = useState<CardKind | "all">("all")
  const [sort, setSort] = useState<Sort>("newest")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [now, setNow] = useState(Date.now())
  const [jevAvailable, setJevAvailable] = useState(false)
  const [jevBusy, setJevBusy] = useState(false)
  const [liveResult, setLiveResult] = useState<IntentResult | null>(null)
  const [liveSource, setLiveSource] = useState<"jev" | "offline" | null>(null)
  const [liveModel, setLiveModel] = useState<string | null>(null)
  const [liveLatency, setLiveLatency] = useState<number | null>(null)
  const [liveCached, setLiveCached] = useState(false)
  const [memory, setMemory] = useState<DecideMemory>(initialMemory)
  const [gated, setGated] = useState<GatedSignals>(neutralGated)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [pinned, setPinned] = useState<string[]>([])
  const [previewChecks, setPreviewChecks] = useState<Set<number>>(new Set())
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [confirmReset, setConfirmReset] = useState(false)
  const [pendingImport, setPendingImport] = useState<IntentCard[] | null>(null)
  const [calView, setCalView] = useState<string | null>(null)
  const [calcOverride, setCalcOverride] = useState<{ forExpr: string; expr: string } | null>(null)
  const [chanceAnim, setChanceAnim] = useState<{ busy: boolean; display: string | null }>({ busy: false, display: null })
  const [reducedMotion] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
  const chanceTimers = useRef<number[]>([])
  const liveAbort = useRef<AbortController | null>(null)
  const jevPromptLength = countJevPromptCharacters(text)
  const jevPromptReady = jevPromptLength >= MIN_JEV_PROMPT_CHARACTERS

  useEffect(() => {
    const saved = loadDeck(window.localStorage)
    setCards(saved.cards)
    setStorageWarning(saved.warning)
    setStorageBlocked(saved.blocked)
    setPinned(readPinned())
    setHydrated(true)

    void api.api.jev.status.get()
      .then((response) => setJevAvailable(response.ok && response.data.available === true))
      .catch(() => setJevAvailable(false))
  }, [])

  function ingestLiveResult(result: IntentResult, source: "jev" | "offline", snapshot: string, model: string | null, latency: number | null, cached: boolean) {
    if (thoughtRef.current !== snapshot) return
    setLiveResult(result)
    setLiveSource(source)
    setLiveModel(model)
    setLiveLatency(latency)
    setLiveCached(cached)
    setMemory((prev) => {
      const next = decide(prev, result, snapshot)
      const intent = activeIntent(next.ui)
      const used = intent ? INTENT_UI[intent].usedSignals : []
      setGated((prevGated) => gateSignals(prevGated, result, used))
      return next
    })
  }

  useEffect(() => {
    const snapshot = text
    if (!snapshot.trim()) {
      liveAbort.current?.abort()
      liveAbort.current = null
      setLiveResult(null)
      setLiveSource(null)
      setLiveModel(null)
      setLiveLatency(null)
      setLiveCached(false)
      setMemory(initialMemory)
      setGated(neutralGated)
      return
    }
    if (countJevPromptCharacters(snapshot) < MIN_JEV_PROMPT_CHARACTERS) {
      liveAbort.current?.abort()
      liveAbort.current = null
      const offline = classifyOffline(snapshot)
      setLiveResult(offline)
      setLiveSource("offline")
      setLiveModel(offline.model)
      setLiveLatency(offline.latencyMs)
      setLiveCached(false)
      setMemory((prev) => {
        const next = decide(prev, offline, snapshot)
        const intent = activeIntent(next.ui)
        const used = intent ? INTENT_UI[intent].usedSignals : []
        setGated((prevGated) => gateSignals(prevGated, offline, used))
        return next
      })
      return
    }
    if (!jevAvailable) {
      const offline = classifyOffline(snapshot)
      ingestLiveResult(offline, "offline", snapshot, offline.model, offline.latencyMs, false)
      return
    }
    const timer = window.setTimeout(async () => {
      liveAbort.current?.abort()
      const controller = new AbortController()
      liveAbort.current = controller
      setJevBusy(true)
      const startedAt = Date.now()
      try {
        const response = await api.api.intent.post({ text: snapshot }, { signal: controller.signal })
        if (thoughtRef.current !== snapshot || controller.signal.aborted) return
        if (!response.ok) throw new Error("live intent unavailable")
        const body = response.data as unknown as IntentResult & { error?: string; source?: string; cached?: boolean; model?: string; latencyMs?: number }
        if ("error" in body && typeof body.error === "string") throw new Error(body.error)
        if (!body || typeof body !== "object" || !("intent" in body)) throw new Error("bad live intent")
        const typed = body as IntentResult
        ingestLiveResult(typed, "jev", snapshot, typeof body.model === "string" ? body.model : null, typeof body.latencyMs === "number" ? body.latencyMs : Date.now() - startedAt, body.cached === true)
      } catch (cause) {
        if (controller.signal.aborted || thoughtRef.current !== snapshot) return
        if (cause instanceof DOMException && cause.name === "AbortError") return
        const offline = classifyOffline(snapshot)
        ingestLiveResult(offline, "offline", snapshot, offline.model, offline.latencyMs, false)
      } finally {
        if (liveAbort.current === controller && thoughtRef.current === snapshot) setJevBusy(false)
      }
    }, 280)
    return () => {
      window.clearTimeout(timer)
    }
  }, [text, jevAvailable, storageBlocked])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setPaletteOpen(true)
      } else if (event.key === "/" && !typing && !storageBlocked) {
        event.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [storageBlocked])

  useEffect(() => {
    const startedAt = Date.now()
    const hasHabits = cards.some((card) => card.kind === "habit")
    const hasRunningTimer = cards.some((card) => card.kind === "timer" && card.endsAt && remainingTimerSeconds(card, startedAt) > 0)
    if (!hasHabits && !hasRunningTimer) return
    const interval = window.setInterval(() => {
      const currentTime = Date.now()
      setNow(currentTime)
      if (!hasHabits && !cards.some((card) => card.kind === "timer" && card.endsAt && remainingTimerSeconds(card, currentTime) > 0)) {
        window.clearInterval(interval)
      }
    }, hasRunningTimer ? 1000 : 60_000)
    return () => window.clearInterval(interval)
  }, [cards])

  const visibleCards = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase()
    const sorted = [...cards].sort((left, right) => {
      const pinDelta = Number(pinned.includes(right.id)) - Number(pinned.includes(left.id))
      if (pinDelta !== 0) return pinDelta
      if (sort === "kind") return left.kind.localeCompare(right.kind) || right.createdAt.localeCompare(left.createdAt)
      return sort === "oldest" ? left.createdAt.localeCompare(right.createdAt) : right.createdAt.localeCompare(left.createdAt)
    })
    return sorted
      .filter((card) => filter === "all" || (filter === "done" ? cardIsComplete(card, now) : !cardIsComplete(card, now)))
      .filter((card) => kindFilter === "all" || card.kind === kindFilter)
      .filter((card) => !needle || cardSearchText(card).includes(needle))
  }, [cards, filter, kindFilter, sort, search, now, pinned])

  const pageCount = Math.max(1, Math.ceil(visibleCards.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pagedCards = visibleCards.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const spendByCategory = useMemo(() => {
    const totals = new Map<string, number>()
    for (const card of cards) {
      if (card.kind !== "expense") continue
      totals.set(card.category, (totals.get(card.category) ?? 0) + card.amountCents)
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1])
  }, [cards])

  const insights = useMemo(() => {
    const kindCounts = new Map<CardKind, number>()
    for (const card of cards) kindCounts.set(card.kind, (kindCounts.get(card.kind) ?? 0) + 1)
    const mix = [...kindCounts.entries()].sort((a, b) => b[1] - a[1])
    const days: { key: string; label: string; count: number }[] = []
    for (let i = 13; i >= 0; i -= 1) {
      const date = new Date(now - i * 86_400_000)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      days.push({
        key,
        label: new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(date),
        count: cards.filter((card) => card.createdAt.slice(0, 10) === key).length,
      })
    }
    const done = cards.filter((card) => cardIsComplete(card, now)).length
    return { mix, days, done, total: cards.length, maxDay: Math.max(1, ...days.map((day) => day.count)) }
  }, [cards, now])

  const calcHistory = useMemo(() => {
    return cards.filter((card) => card.kind === "calculation").slice(-5).reverse()
  }, [cards])

  function persistCards(next: IntentCard[]) {
    if (storageBlocked) return false
    try {
      saveDeck(window.localStorage, next)
      setCards(next)
      setStorageWarning(null)
      return true
    } catch (cause) {
      setStorageWarning(cause instanceof Error ? cause.message : "The deck could not be saved.")
      return false
    }
  }

  function updateThought(value: string) {
    thoughtRef.current = value
    setText(value)
    setError(null)
    setPreviewChecks(new Set())
    setCalcOverride(null)
    clearChanceTimers()
    if (!value.trim()) {
      setDraft(null)
      return
    }
    try {
      setDraft(parseIntent(value))
    } catch (cause) {
      setDraft(null)
      setError(cause instanceof Error ? cause.message : "That thought couldn't be previewed.")
    }
  }

  function resetComposer() {
    thoughtRef.current = ""
    setText("")
    setDraft(null)
    setLiveResult(null)
    setLiveSource(null)
    setLiveModel(null)
    setLiveLatency(null)
    setLiveCached(false)
    setMemory(initialMemory)
    setGated(neutralGated)
    setPreviewChecks(new Set())
    setCalcOverride(null)
    clearChanceTimers()
    setChanceAnim({ busy: false, display: null })
    setError(null)
  }

  function clearChanceTimers() {
    chanceTimers.current.forEach((id) => window.clearTimeout(id))
    chanceTimers.current = []
  }

  useEffect(() => {
    return () => {
      chanceTimers.current.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  function animatedChance(expression: string, apply: (result: string) => void) {
    clearChanceTimers()
    let finalResult: string
    try {
      finalResult = rollRandomExpression(expression)
    } catch {
      return
    }
    if (reducedMotion) {
      apply(finalResult)
      return
    }
    setChanceAnim({ busy: true, display: "…" })
    const ticks = expression.startsWith("coin") ? 0 : 6
    for (let i = 0; i < ticks; i += 1) {
      const id = window.setTimeout(() => {
        try {
          setChanceAnim({ busy: true, display: rollRandomExpression(expression) })
        } catch {
          /* keep last frame */
        }
      }, 90 * (i + 1))
      chanceTimers.current.push(id)
    }
    const doneId = window.setTimeout(() => {
      setChanceAnim({ busy: false, display: null })
      apply(finalResult)
    }, expression.startsWith("coin") ? 900 : 90 * (ticks + 1) + 250)
    chanceTimers.current.push(doneId)
  }

  function chooseLiveIntent(kind: CardKind) {
    setMemory(forceIntent(kind, thoughtRef.current))
  }

  function promoteLiveGhost() {
    setMemory((prev) => promoteGhost(prev))
  }

  const liveKind = liveResult && isCardKind(liveResult.intent.value) ? liveResult.intent.value : null
  const forcedKind = activeIntent(memory.ui)
  const effectiveKind = forcedKind ?? liveKind
  const resolved: IntentDraft | null = text.trim() ? resolveDraft(text, effectiveKind ?? liveKind, draft) : null
  const scheduledMonthKey = resolved && (resolved.kind === "event" || resolved.kind === "reminder") && resolved.scheduledAt
    ? (() => {
        const parsed = parseScheduledDate(resolved.scheduledAt)
        return parsed ? `${parsed.getFullYear()}-${parsed.getMonth()}` : null
      })()
    : null

  useEffect(() => {
    setCalView(null)
  }, [scheduledMonthKey])
  const detailHint = text.trim() && resolved ? needsDetail(effectiveKind ?? liveKind, resolved) : null
  const badges = liveBadges(gated)
    .filter((badge) => resolved && badge.toLowerCase() !== labels[resolved.kind].toLowerCase())
    .filter((badge) => {
      if (!resolved || (badge !== "List" && badge !== "Shopping")) return true
      return resolved.kind !== "checklist" && resolved.kind !== "shopping" && resolved.kind !== "workout" &&
        resolved.kind !== "agenda" && resolved.kind !== "itinerary" && resolved.kind !== "project" && resolved.kind !== "poll"
    })
  const previewEntities = resolved && (resolved.kind === "event" || resolved.kind === "reminder")
    ? extractEventEntities(text, resolved.title)
    : null
  const visibleBadges = previewEntities?.video
    ? badges.filter((badge) => badge !== "Video" && badge !== "Call" && badge !== "In person")
    : badges
  const countdownKey = resolved?.kind === "countdown" ? resolved.target : null

  useEffect(() => {
    if (!countdownKey) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [countdownKey])

  function addDraft() {
    if (!resolved || storageBlocked || !text.trim()) return
    if (resolved.kind === "note" && !resolved.body.trim()) return
    if (cards.length >= 500) {
      setError("Your deck has reached 500 cards. Export a backup, then remove a few cards to continue.")
      return
    }
    const card = materializeDraft(resolved)
    if (persistCards([...cards, card])) {
      setDeckOpen(true)
      resetComposer()
      toast.success("Card saved to your deck.")
    }
  }

  function updateCard(id: string, transform: (card: IntentCard) => IntentCard) {
    persistCards(cards.map((card) => card.id === id ? transform(card) : card))
  }

  function toggleComplete(id: string) {
    const actionTime = Date.now()
    setNow(actionTime)
    updateCard(id, (card) => {
      const completed = !cardIsComplete(card, actionTime)
      if (isCollectionCard(card)) {
        const items = card.items.map((item) => ({ ...item, done: completed }))
        return { ...card, completed, items }
      }
      if (card.kind === "recipe") {
        return {
          ...card,
          completed,
          ingredients: card.ingredients.map((item) => ({ ...item, done: completed })),
          steps: card.steps.map((item) => ({ ...item, done: completed })),
        }
      }
      if (card.kind === "habit") {
        return { ...card, completed, lastCompletedPeriod: completed ? habitPeriodKey(card.cadence, new Date(actionTime)) : null }
      }
      return { ...card, completed: !card.completed }
    })
  }

  function toggleCardItem(cardId: string, itemId: string, section: "items" | "ingredients" | "steps" = "items") {
    updateCard(cardId, (card) => {
      if (isCollectionCard(card) && section === "items") {
        const items = card.items.map((item) => item.id === itemId ? { ...item, done: !item.done } : item)
        return { ...card, items, completed: items.every((item) => item.done) }
      }
      if (card.kind !== "recipe" || section === "items") return card
      if (section === "ingredients") {
        const ingredients = card.ingredients.map((item) => item.id === itemId ? { ...item, done: !item.done } : item)
        return { ...card, ingredients, completed: ingredients.every((item) => item.done) && card.steps.every((item) => item.done) }
      }
      const steps = card.steps.map((item) => item.id === itemId ? { ...item, done: !item.done } : item)
      return { ...card, steps, completed: card.ingredients.every((item) => item.done) && steps.every((item) => item.done) }
    })
  }

  function timerAction(card: Extract<IntentCard, { kind: "timer" }>, action: "start" | "pause" | "reset") {
    const actionTime = Date.now()
    setNow(actionTime)
    if (action === "start") {
      updateCard(card.id, (current) => current.kind === "timer"
        ? startTimer(current, actionTime)
        : current)
    } else if (action === "pause") {
      updateCard(card.id, (current) => current.kind === "timer"
        ? pauseTimer(current, actionTime)
        : current)
    } else {
      updateCard(card.id, (current) => current.kind === "timer"
        ? resetTimer(current)
        : current)
    }
  }

  function deleteCard(id: string) {
    const index = cards.findIndex((card) => card.id === id)
    if (index < 0) return
    const removed = cards[index]!
    const next = cards.filter((card) => card.id !== id)
    if (persistCards(next)) {
      setPinned((prev) => {
        const kept = prev.filter((pid) => pid !== id)
        try {
          window.localStorage.setItem(PIN_KEY, JSON.stringify(kept))
        } catch {
          /* private mode: pins simply don't persist */
        }
        return kept
      })
      toast("Card deleted.", {
        action: {
          label: "Undo",
          onClick: () => {
            setCards((prev) => {
              const restored = [...prev]
              restored.splice(Math.min(index, restored.length), 0, removed)
              try {
                saveDeck(window.localStorage, restored)
              } catch {
                return prev
              }
              return restored
            })
          },
        },
      })
    }
  }

  function togglePin(id: string) {
    setPinned((prev) => {
      const next = prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
      try {
        window.localStorage.setItem(PIN_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function copyText(value: string, label: string) {
    const done = () => toast.success(`${label} copied.`)
    try {
      const result = navigator.clipboard?.writeText(value)
      if (result && typeof result.then === "function") {
        result.then(done, () => toast.error("Copy failed in this browser."))
      } else {
        done()
      }
    } catch {
      toast.error("Copy failed in this browser.")
    }
  }

  function exportBackup() {
    const contents = JSON.stringify({ version: BACKUP_VERSION, exportedAt: new Date().toISOString(), cards }, null, 2)
    const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `intentdeck-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    toast.success("Backup downloaded. It contains your cards and no API key.")
  }

  async function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ""
    if (!file) return
    try {
      if (file.size > 2_000_000) throw new Error("Backup files must be smaller than 2 MB.")
      const imported = importDeck(await file.text())
      setPendingImport(imported)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The backup could not be imported.")
    }
  }

  function confirmImport() {
    if (!pendingImport) return
    try {
      saveDeck(window.localStorage, pendingImport)
      setCards(pendingImport)
      setStorageWarning(null)
      setStorageBlocked(false)
      setPage(0)
      toast.success(`${pendingImport.length} ${pendingImport.length === 1 ? "card" : "cards"} restored.`)
    } catch (cause) {
      setStorageWarning(cause instanceof Error ? cause.message : "The imported deck could not be saved.")
    }
    setPendingImport(null)
  }

  function doReset() {
    try {
      window.localStorage.removeItem("intentdeck.deck.v1")
      setCards([])
      setPinned([])
      setPage(0)
      setStorageWarning(null)
      setStorageBlocked(false)
      toast.success("This browser's deck was reset.")
    } catch {
      setStorageWarning("Browser storage could not be reset. Check your browser's storage settings.")
    }
    setConfirmReset(false)
  }

  function useTimerMinutes() {
    const title = text.trim().replace(/\s+/g, " ").slice(0, 120) || "Timer"
    setDraft({ kind: "timer", title, durationSeconds: Math.max(1, timerMinutes * 60) })
    toast.success(`Timer set for ${timerMinutes} min — press Enter to save.`)
  }

  if (!hydrated) return <p className="loading-state" role="status">Opening your deck…</p>

  const scheduledDate = resolved && (resolved.kind === "event" || resolved.kind === "reminder") ? parseScheduledDate(resolved.scheduledAt) : null

  const calYearMonth = (() => {
    if (calView) {
      const [y, m] = calView.split("-").map(Number)
      if (Number.isInteger(y) && Number.isInteger(m)) return { y: y!, m: m! }
    }
    const fallback = scheduledDate ?? new Date()
    return { y: fallback.getFullYear(), m: fallback.getMonth() }
  })()

  function shiftCalMonth(delta: number) {
    const date = new Date(calYearMonth.y, calYearMonth.m + delta, 1)
    setCalView(`${date.getFullYear()}-${date.getMonth()}`)
  }

  return (
    <TooltipProvider>
      <Toaster position="bottom-center" />
      <div className="page-shell morph-page">
        <section className="shape-wrap" aria-label="Create a card">
          <div className={cn("morph-shell", memory.ui.kind === "ghost" && "is-ghost")}>
          {resolved && <span className="morph-accent" aria-hidden="true" style={{ background: KIND_ACCENTS[resolved.kind] }} />}
          <Label className="sr-only" htmlFor="thought-input">Type anything</Label>
          <Input
            id="thought-input"
            name="thought"
            value={text}
            onChange={(event) => updateThought(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && resolved) {
                event.preventDefault()
                addDraft()
              }
              if (event.key === "Tab" && memory.ui.kind === "ghost") {
                event.preventDefault()
                promoteLiveGhost()
              }
              if (event.key === "Escape" && text) {
                event.preventDefault()
                resetComposer()
              }
            }}
            maxLength={1000}
            placeholder="Accessibility review on Oct 16 at 2:30 pm"
            autoComplete="off"
            aria-describedby="shape-hud"
            className="shape-input"
          />
          <div id="shape-hud" className="hud-bar" aria-live="off">
            {(() => {
              const state = jevBusy
                ? { dot: "reading", text: "Reading intent…" }
                : !text.trim()
                  ? { dot: "idle", text: "Type a plan, a list, or a sum — it becomes a card." }
                  : !jevPromptReady
                    ? { dot: "idle", text: `Add ${MIN_JEV_PROMPT_CHARACTERS - jevPromptLength} more for live intent` }
                    : liveSource === "jev"
                      ? { dot: "live", text: `${liveModel ?? "jev"} · ${liveLatency ?? 0}ms${liveCached ? " · cached" : ""}` }
                      : { dot: "offline", text: "Offline · on-device intent" }
              return (
                <>
                  <span className="hud-status">
                    <span className={`hud-dot hud-${state.dot}`} aria-hidden="true" />
                    <span className="hud-text">{state.text}</span>
                  </span>
                  <span className="hud-keys" aria-hidden="true">
                    <kbd>↵</kbd> save
                    <kbd>/</kbd> palette
                    <kbd>esc</kbd>
                  </span>
                </>
              )
            })()}
          </div>
          {memory.ui.kind === "choose" && (
            <div className="examples choose-chips" aria-label="Did you mean">
              <span>Did you mean</span>
              {memory.ui.options.map((option) => (
                <Button key={option} type="button" variant="outline" size="sm" onClick={() => chooseLiveIntent(option)}>
                  {labels[option]}
                </Button>
              ))}
            </div>
          )}
          {!text.trim() && (
            <div className="examples" aria-label="Try a sample thought">
              <span>Try</span>
              {QUICK_EXAMPLES.map((example) => (
                <Button
                  key={example.kind}
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={example.text}
                  aria-label={"Try " + labels[example.kind] + ": " + example.text}
                  onClick={() => updateThought(example.text)}
                >
                  {labels[example.kind]}
                </Button>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => setPaletteOpen(true)}>
                All {CARD_EXAMPLES.length} ↓
              </Button>
            </div>
          )}
          {jevBusy && !liveResult && text.trim() && (
            <Card aria-label="Reading intent">
              <CardContent>
                <Skeleton style={{ height: 22, width: "45%", marginBottom: 10 }} />
                <Skeleton style={{ height: 14, width: "90%", marginBottom: 8 }} />
                <Skeleton style={{ height: 14, width: "70%" }} />
              </CardContent>
            </Card>
          )}
          <div className={cn("morph-expand", resolved && "open")}>
            <div className="morph-inner">
          {resolved && (() => {
            const view: IntentDraft = resolved
            const checked = previewChecks.size
            const total = isCollectionDraft(view) ? view.items.length : 0
            const entities = view.kind === "event" || view.kind === "reminder" ? extractEventEntities(text, view.title) : null
            const displayTitle = entities && (entities.attendees.length > 0 || entities.video) ? entities.title : view.title
            const EntityIcon = KIND_ICONS[view.kind]
            return (
              <div className="morph-body">
                  <div className="preview-topline">
                    <span className="topline-left">
                      <span className="kind-tile" aria-hidden="true"><EntityIcon size={16} /></span>
                      <span className="kind-name">{labels[view.kind]}</span>
                      {visibleBadges.map((badge) => <Badge key={badge} variant="secondary">{badge}</Badge>)}
                    </span>
                  </div>
                  <CardTitle id="preview-title">{displayTitle}</CardTitle>
                  {(view.kind === "event" || view.kind === "reminder") && scheduledDate && (() => {
                    const parts = dateLabel(view.scheduledAt).split(" · ")
                    return (
                      <div className="topline-left detail-chips" aria-label={dateLabel(view.scheduledAt)}>
                        <span className="detail-chip"><CalendarDays size={12} aria-hidden="true" />{parts[0]}</span>
                        {parts[1] && <span className="detail-chip"><Clock size={12} aria-hidden="true" />{parts[1]}</span>}
                      </div>
                    )
                  })()}
                  {(view.kind === "event" || view.kind === "reminder") && !scheduledDate && (
                    <CardDescription>No date set</CardDescription>
                  )}
                  {view.kind === "note" && view.body.toLowerCase() !== view.title.toLowerCase() && (
                    <CardDescription>{view.body}</CardDescription>
                  )}
                  {entities && entities.video && (
                    <p className="entity-row"><Video size={14} aria-hidden="true" />{entities.video}</p>
                  )}
                  {entities && entities.attendees.map((name) => (
                    <p key={name} className="entity-row">
                      <Avatar><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>{name}
                    </p>
                  ))}
                <CardContent>
                  {view.kind === "timer" && (
                    <div className="timer-ring-wrap">
                      <TimerRing remaining={view.durationSeconds} duration={view.durationSeconds} />
                      <p className="timer-display morph-timer" style={{ margin: 0 }}>{timerLabel(view.durationSeconds)}</p>
                    </div>
                  )}
                  {view.kind === "calculation" && (() => {
                    const padExpr = calcOverride && calcOverride.forExpr === view.expression ? calcOverride.expr : view.expression
                    const liveResultValue = padExpr.trim() ? tryEvaluate(padExpr) : null
                    return (
                      <div>
                        <div className="morph-calculation">
                          <p>{view.expression}</p>
                          <strong>= {new Intl.NumberFormat(undefined, { maximumFractionDigits: 10 }).format(view.result)}</strong>
                        </div>
                        <Label htmlFor="calc-display">Calculator — tap or type, live result</Label>
                        <div id="calc-display" className="calc-display" role="status">{padExpr || "0"}</div>
                        <p className="calc-live">{liveResultValue === null ? (padExpr.trim() ? "…" : "") : `= ${new Intl.NumberFormat(undefined, { maximumFractionDigits: 10 }).format(liveResultValue)}`}</p>
                        <div className="calc-pad" role="group" aria-label="Calculator pad">
                          {CALC_PAD.map(({ key, insert, kind }) => (
                            <button
                              key={key}
                              type="button"
                              className={cn("calc-key", kind === "op" && "op", key === "=" && "eq")}
                              aria-label={key === "=" ? "Equals" : key === "⌫" ? "Backspace" : key === "C" ? "Clear" : key}
                              onClick={() => {
                                if (key === "C") {
                                  setCalcOverride({ forExpr: view.expression, expr: "" })
                                } else if (key === "⌫") {
                                  setCalcOverride({ forExpr: view.expression, expr: padExpr.slice(0, -1) })
                                } else {
                                  const next = (padExpr + (insert ?? key)).slice(0, 120)
                                  setCalcOverride({ forExpr: view.expression, expr: next })
                                }
                              }}
                            >
                              {key}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="calc-key eq"
                            aria-label="Equals"
                            style={{ gridColumn: "span 4" }}
                            disabled={liveResultValue === null}
                            onClick={() => {
                              if (liveResultValue === null) return
                              setDraft({ kind: "calculation", title: "Calculation", expression: padExpr, result: liveResultValue })
                              setCalcOverride(null)
                            }}
                          >
                            <Equal size={16} aria-hidden="true" /> Use result
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                  {view.kind === "expense" && (
                    <>
                      <div className="morph-expense">
                        <strong>{currency(view.amountCents, view.currency)}</strong>
                        <Badge variant="warning">{view.category}</Badge>
                        <span>{dateLabel(view.spentAt)}</span>
                      </div>
                      <div className="topline-left" style={{ marginTop: 10 }} role="group" aria-label="Fix category">
                        {EXPENSE_CATEGORIES.map((category) => (
                          <Button
                            key={category}
                            type="button"
                            variant={view.category === category ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setDraft({ ...view, category })}
                          >
                            {view.category === category && <Check size={12} aria-hidden="true" />} {category}
                          </Button>
                        ))}
                      </div>
                    </>
                  )}
                  {(view.kind === "checklist" || view.kind === "shopping") && (
                    <>
                      <div className="preview-progress">
                        <Progress value={total === 0 ? 0 : (checked / total) * 100} />
                        <span className="confidence">{checked}/{total} checked</span>
                      </div>
                      <ul className="preview-checklist live-list">
                        {view.items.map((item, index) => (
                          <li key={index + "-" + item.text}>
                            <Checkbox
                              checked={previewChecks.has(index)}
                              onCheckedChange={(state) => setPreviewChecks((prev) => {
                                const next = new Set(prev)
                                if (state === true) next.add(index)
                                else next.delete(index)
                                return next
                              })}
                              aria-label={"Try " + item.text}
                            />
                            <span className={cn(previewChecks.has(index) && "item-done")}>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {view.kind === "workout" && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Done</TableHead>
                          <TableHead>Exercise</TableHead>
                          <TableHead>Plan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {view.items.map((item, index) => {
                          const row = parseWorkoutRow(item.text)
                          return (
                            <TableRow key={index + "-" + item.text}>
                              <TableCell>
                                <Checkbox
                                  checked={previewChecks.has(index)}
                                  onCheckedChange={(state) => setPreviewChecks((prev) => {
                                    const next = new Set(prev)
                                    if (state === true) next.add(index)
                                    else next.delete(index)
                                    return next
                                  })}
                                  aria-label={item.text}
                                />
                              </TableCell>
                              <TableCell className={cn(previewChecks.has(index) && "item-done")}>{row.name}</TableCell>
                              <TableCell>{row.scheme ?? "—"}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                  {view.kind === "agenda" && (
                    <Accordion type="multiple">
                      {view.items.map((item, index) => (
                        <AccordionItem key={index} value={"topic-" + index}>
                          <AccordionTrigger>{item.text}</AccordionTrigger>
                          <AccordionContent>
                            <span className="topline-left">
                              <Checkbox
                                checked={previewChecks.has(index)}
                                onCheckedChange={(state) => setPreviewChecks((prev) => {
                                  const next = new Set(prev)
                                  if (state === true) next.add(index)
                                  else next.delete(index)
                                  return next
                                })}
                                aria-label={"Mark discussed: " + item.text}
                              />
                              <span>{previewChecks.has(index) ? "Discussed" : "Mark discussed"}</span>
                            </span>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                  {view.kind === "itinerary" && (
                    <ItineraryTimeline stops={view.items.map((item) => parseItineraryStop(item.text))} />
                  )}
                  {view.kind === "project" && (
                    <ProjectSteps
                      steps={view.items.map((item) => item.text)}
                      renderNode={(index) => (
                        <Button
                          type="button"
                          variant={previewChecks.has(index) ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPreviewChecks((prev) => {
                            const next = new Set(prev)
                            if (next.has(index)) next.delete(index)
                            else next.add(index)
                            return next
                          })}
                        >
                          {previewChecks.has(index) && <Check size={12} aria-hidden="true" />}
                          {previewChecks.has(index) ? "Done" : "Mark done"}
                        </Button>
                      )}
                    />
                  )}
                  {view.kind === "recipe" && (
                    <Tabs defaultValue="ingredients">
                      <TabsList aria-label="Recipe sections">
                        <TabsTrigger value="ingredients">Ingredients ({view.ingredients.length})</TabsTrigger>
                        <TabsTrigger value="steps">Method ({view.steps.length})</TabsTrigger>
                      </TabsList>
                      <TabsContent value="ingredients">
                        <ul className="preview-checklist live-list">
                          {view.ingredients.map((item, index) => (
                            <li key={"i-" + index + "-" + item.text}>
                              <Checkbox
                                checked={previewChecks.has(index)}
                                onCheckedChange={(state) => setPreviewChecks((prev) => {
                                  const next = new Set(prev)
                                  if (state === true) next.add(index)
                                  else next.delete(index)
                                  return next
                                })}
                                aria-label={item.text}
                              />
                              <span>{item.text}</span>
                            </li>
                          ))}
                        </ul>
                      </TabsContent>
                      <TabsContent value="steps">
                        <ol className="live-steps">
                          {view.steps.map((item, index) => (
                            <li key={"s-" + index + "-" + item.text}>
                              <span className="live-stepnum" aria-hidden="true">{index + 1}</span>{item.text}
                            </li>
                          ))}
                        </ol>
                      </TabsContent>
                    </Tabs>
                  )}
                  {view.kind === "split" && (
                    <>
                      <div className="topline-left" style={{ marginTop: 4 }} role="group" aria-label="People count">
                        <span className="confidence">Split between</span>
                        <span className="stepper">
                          <button
                            type="button"
                            className="stepper-btn"
                            aria-label="Fewer people"
                            disabled={view.peopleCount <= 2}
                            onClick={() => {
                              const peopleCount = Math.max(2, view.peopleCount - 1)
                              setDraft({ ...view, peopleCount, shareAmountsCents: splitShares(view.amountCents, peopleCount) })
                            }}
                          >
                            <Minus size={13} aria-hidden="true" />
                          </button>
                          <strong>{view.peopleCount}</strong>
                          <button
                            type="button"
                            className="stepper-btn"
                            aria-label="More people"
                            disabled={view.peopleCount >= 100}
                            onClick={() => {
                              const peopleCount = Math.min(100, view.peopleCount + 1)
                              setDraft({ ...view, peopleCount, shareAmountsCents: splitShares(view.amountCents, peopleCount) })
                            }}
                          >
                            <Plus size={13} aria-hidden="true" />
                          </button>
                        </span>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Person</TableHead>
                            <TableHead>Share</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {view.shareAmountsCents.slice(0, 12).map((amount, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <span className="topline-left">
                                  <Avatar><AvatarFallback>{initials("Person " + (index + 1))}</AvatarFallback></Avatar>
                                  Person {index + 1}
                                </span>
                              </TableCell>
                              <TableCell>{currency(amount, view.currency)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}
                  {view.kind === "color" && (
                    <>
                      <div className="topline-left" style={{ marginTop: 12 }}>
                        <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 12, background: view.hex, border: "1px solid rgba(0,0,0,.15)", flex: "0 0 auto" }} />
                        <div>
                          <strong style={{ fontSize: 18 }}>{view.hex}</strong>
                          <p className="preview-detail">{view.name} · {rgbLabel(view.hex)}</p>
                        </div>
                      </div>
                      <div className="shade-row" role="group" aria-label="Shades — tap to copy">
                        {colorShades(view.hex).map((shade) => (
                          <Tooltip key={shade.hex}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className="shade-swatch"
                                style={{ background: shade.hex }}
                                aria-label={`Copy ${shade.label} ${shade.hex}`}
                                title={`${shade.label} ${shade.hex}`}
                                onClick={() => copyText(shade.hex, shade.label)}
                              />
                            </TooltipTrigger>
                            <TooltipContent>{shade.label} {shade.hex}</TooltipContent>
                          </Tooltip>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => copyText(rgbLabel(view.hex), "RGB")}>
                          <Copy size={13} aria-hidden="true" /> RGB
                        </Button>
                      </div>
                    </>
                  )}
                  {view.kind === "convert" && (() => {
                    const kind = convertUnitKind(view.from)
                    const units = kind ? CONVERT_UNITS[kind] ?? [] : []
                    return (
                      <>
                        <div className="morph-calculation">
                          <p>{view.input} {view.from}</p>
                          <strong>= {view.result} {view.to}</strong>
                        </div>
                        {units.length > 0 && (
                          <div className="topline-left" style={{ marginTop: 10 }}>
                            <Label className="sr-only" htmlFor="conv-from">From unit</Label>
                            <Select
                              value={view.from}
                              onValueChange={(value) => {
                                const result = convertUnits(view.input, value, view.to)
                                if (result === null) {
                                  toast.error("Those units don't convert together.")
                                  return
                                }
                                setDraft({ ...view, from: value, result })
                              }}
                            >
                              <SelectTrigger id="conv-from" aria-label="From unit"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Swap units"
                                  onClick={() => {
                                    const result = convertUnits(view.input, view.to, view.from)
                                    if (result === null) return
                                    setDraft({ ...view, from: view.to, to: view.from, result })
                                  }}
                                >
                                  <ArrowLeftRight size={15} aria-hidden="true" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Swap units</TooltipContent>
                            </Tooltip>
                            <Label className="sr-only" htmlFor="conv-to">To unit</Label>
                            <Select
                              value={view.to}
                              onValueChange={(value) => {
                                const result = convertUnits(view.input, view.from, value)
                                if (result === null) {
                                  toast.error("Those units don't convert together.")
                                  return
                                }
                                setDraft({ ...view, to: value, result })
                              }}
                            >
                              <SelectTrigger id="conv-to" aria-label="To unit"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )
                  })()}
                  {view.kind === "poll" && (
                    <>
                      <ToggleGroup
                        type="single"
                        value={previewChecks.size === 1 ? String([...previewChecks][0]) : ""}
                        onValueChange={(value) => setPreviewChecks(value === "" ? new Set() : new Set([Number(value)]))}
                        aria-label="Pick one option"
                        className="toggle-col"
                        style={{ display: "grid", gap: 8, marginTop: 12 }}
                      >
                        {view.options.map((option, index) => (
                          <ToggleGroupItem key={index + "-" + option.text} value={String(index)} aria-label={"Vote " + option.text}>
                            {previewChecks.has(index) && <Check size={13} aria-hidden="true" />} {option.text}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                      <p className="inline-hint">{previewChecks.size === 1 ? "1 picked — Enter saves it as a votable card." : "Pick one to try it."}</p>
                    </>
                  )}
                  {view.kind === "countdown" && (
                    <div className="morph-calculation">
                      <p>{dateLabel(view.target)}</p>
                      <strong>{(() => {
                        const days = countdownDays(view.target, now)
                        return days === 0 ? "Today" : days > 0 ? `${days} days left` : `${Math.abs(days)} days ago`
                      })()}</strong>
                      <p className="preview-detail" style={{ fontVariantNumeric: "tabular-nums" }}>{(() => {
                        const [year, month, day] = view.target.split("-").map(Number)
                        const diff = new Date(year!, month! - 1, day!).getTime() - now
                        if (diff <= 0) return "Counting since that date."
                        const totalSeconds = Math.floor(diff / 1000)
                        const hours = Math.floor(totalSeconds / 3600)
                        const minutes = Math.floor((totalSeconds % 3600) / 60)
                        const seconds = totalSeconds % 60
                        return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s to go`
                      })()}</p>
                    </div>
                  )}
                  {view.kind === "timezone" && (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>{view.title.split("→")[0]?.trim() ?? view.from.toUpperCase()}</TableCell>
                            <TableCell>{timezoneResult(view)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                      <div style={{ marginTop: 12 }}>
                        <Label htmlFor="tz-hour">Scrub the hour — {String(view.hour).padStart(2, "0")}:{String(view.minute).padStart(2, "0")}</Label>
                        <Slider
                          id="tz-hour"
                          min={0}
                          max={23}
                          step={1}
                          value={[view.hour]}
                          onValueChange={(values) => setDraft({ ...view, hour: values[0] ?? view.hour })}
                        />
                      </div>
                    </>
                  )}
                  {view.kind === "random" && (() => {
                    const isCoin = view.expression === "coin flip"
                    const diceSingle = view.expression.match(/^1d(\d{1,3})$/i)?.[1]
                    return (
                      <div className="coin-stage">
                        {isCoin ? (
                          <div className={cn("coin", chanceAnim.busy && "flipping")} aria-live="polite">
                            {chanceAnim.busy ? (chanceAnim.display === "Heads" || chanceAnim.display === "Tails" ? chanceAnim.display[0] : "?") : view.result === "Heads" ? "H" : view.result === "Tails" ? "T" : "?"}
                          </div>
                        ) : diceSingle ? (
                          <div className={cn("dice-face", chanceAnim.busy && "rolling")} aria-live="polite">
                            {["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][Math.max(0, Math.min(5, Number(view.result) - 1))] ?? "⚄"}
                          </div>
                        ) : null}
                        <p style={{ margin: 0 }}><strong style={{ fontSize: 20 }}>{chanceAnim.busy && chanceAnim.display ? chanceAnim.display : view.result}</strong></p>
                        <p className="preview-detail" style={{ margin: 0 }}>{view.expression}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={chanceAnim.busy}
                          onClick={() => animatedChance(view.expression, (result) => setDraft({ ...view, result }))}
                        >
                          {isCoin ? <Coins size={14} aria-hidden="true" /> : <Dices size={14} aria-hidden="true" />}
                          {chanceAnim.busy ? "Rolling…" : isCoin ? "Flip coin" : "Re-roll"}
                        </Button>
                      </div>
                    )
                  })()}
                  {view.kind === "goal" && (
                    <>
                      <div className="preview-progress">
                        <Progress value={view.target === 0 ? 0 : (view.current / view.target) * 100} />
                        <span className="confidence">{view.current}/{view.target}{view.unit ? " " + view.unit : ""}</span>
                      </div>
                    </>
                  )}
                  {view.kind === "contact" && (
                    <Table>
                      <TableBody>
                        {view.phone && (
                          <TableRow>
                            <TableCell>
                              <span className="topline-left">
                                <Avatar><AvatarFallback>{initials(view.title)}</AvatarFallback></Avatar>
                                {view.phone}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" onClick={() => copyText(view.phone ?? "", "Phone")}>
                                <Copy size={13} aria-hidden="true" /> Copy
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                        {view.email && (
                          <TableRow>
                            <TableCell>{view.email}</TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="sm" onClick={() => copyText(view.email ?? "", "Email")}>
                                <Copy size={13} aria-hidden="true" /> Copy
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                  {view.kind === "link" && (
                    <div className="topline-left" style={{ marginTop: 12 }}>
                      <Button type="button" variant="outline" size="sm" asChild>
                        <a href={view.url} target="_blank" rel="noreferrer">Open link ↗</a>
                      </Button>
                      <span className="preview-detail" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{view.url}</span>
                    </div>
                  )}
                  {view.kind === "travel" && (
                    <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                      <div className="topline-left">
                        <Badge variant="secondary">{view.mode}</Badge>
                        <strong style={{ fontSize: 16 }}>{view.destination}</strong>
                      </div>
                      {view.when && <span className="preview-detail">{dateLabel(view.when)}</span>}
                    </div>
                  )}
                  {view.kind === "split" && view.shareAmountsCents.length > 12 && (
                    <p className="inline-hint">+ {view.shareAmountsCents.length - 12} more people</p>
                  )}
                  {(view.kind === "event" || view.kind === "reminder") && scheduledDate && (
                    <div className="shape-cal" aria-label="Calendar — pick a month, tap a day to move it">
                      <div className="topline-left cal-nav">
                        <Button type="button" variant="ghost" size="icon" aria-label="Previous month" onClick={() => shiftCalMonth(-1)}>
                          <span aria-hidden="true">←</span>
                        </Button>
                        <Label className="sr-only" htmlFor="cal-month">Month</Label>
                        <Select
                          value={String(calYearMonth.m)}
                          onValueChange={(value) => setCalView(`${calYearMonth.y}-${Number(value)}`)}
                        >
                          <SelectTrigger id="cal-month" aria-label="Month"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((name, m) => (
                              <SelectItem key={m} value={String(m)}>{name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Label className="sr-only" htmlFor="cal-year">Year</Label>
                        <Select
                          value={String(calYearMonth.y)}
                          onValueChange={(value) => setCalView(`${Number(value)}-${calYearMonth.m}`)}
                        >
                          <SelectTrigger id="cal-year" aria-label="Year"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 1 + i).map((y) => (
                              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button type="button" variant="ghost" size="icon" aria-label="Next month" onClick={() => shiftCalMonth(1)}>
                          <span aria-hidden="true">→</span>
                        </Button>
                      </div>
                      <div className="shape-streak">
                        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i} className="shape-streak-day" aria-hidden="true">{d}</span>)}
                        {monthGrid(calYearMonth.y, calYearMonth.m).flat().map((day, i) => day === null ? (
                          <span key={i} className="shape-streak-day" aria-hidden="true" />
                        ) : (
                          <button
                            key={i}
                            type="button"
                            className="day-pick"
                            aria-label={`Move to ${calYearMonth.y}-${String(calYearMonth.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`}
                            aria-pressed={scheduledDate.getFullYear() === calYearMonth.y && scheduledDate.getMonth() === calYearMonth.m && day === scheduledDate.getDate()}
                            onClick={() => {
                              const existing = view.scheduledAt && !/^\d{4}-\d{2}-\d{2}$/.test(view.scheduledAt)
                                ? new Date(view.scheduledAt)
                                : null
                              const moved = new Date(calYearMonth.y, calYearMonth.m, day)
                              if (existing && Number.isFinite(existing.getTime())) {
                                moved.setHours(existing.getHours(), existing.getMinutes(), 0, 0)
                                setDraft({ ...view, scheduledAt: moved.toISOString(), scheduleAmbiguous: view.scheduleAmbiguous })
                              } else {
                                const key = `${moved.getFullYear()}-${String(moved.getMonth() + 1).padStart(2, "0")}-${String(moved.getDate()).padStart(2, "0")}`
                                setDraft({ ...view, scheduledAt: key, scheduleAmbiguous: view.scheduleAmbiguous })
                              }
                            }}
                          >
                            <span className={cn("shape-streak-day", scheduledDate.getFullYear() === calYearMonth.y && scheduledDate.getMonth() === calYearMonth.m && day === scheduledDate.getDate() && "is-done")}>{day}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {view.kind === "habit" && (
                    <div className="habit-controls">
                      {(() => {
                        const today = new Date()
                        const monday = new Date(today)
                        monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
                        return (
                          <div className="shape-streak" aria-label="This week" style={{ marginTop: 0, flex: "0 0 auto" }}>
                            {Array.from({ length: 7 }, (_, i) => {
                              const day = new Date(monday)
                              day.setDate(monday.getDate() + i)
                              const isToday = day.toDateString() === today.toDateString()
                              return (
                                <span key={i} className={cn("shape-streak-day", isToday && "is-today")} title={day.toDateString()}>
                                  {"SMTWTFS"[day.getDay()]}
                                </span>
                              )
                            })}
                          </div>
                        )
                      })()}
                      <ToggleGroup type="single" value={view.cadence} onValueChange={(value) => {
                        if ((value === "daily" || value === "weekly") && draft?.kind === "habit") {
                          setDraft({ ...draft, cadence: value })
                        }
                      }} aria-label="Repeat cadence">
                        <ToggleGroupItem value="daily">Daily</ToggleGroupItem>
                        <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
                      </ToggleGroup>
                      <span className="confidence">Due {view.cadence}</span>
                    </div>
                  )}
                  {view.kind === "calculation" && calcHistory.length > 0 && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="history">
                        <AccordionTrigger>Recent calculations ({calcHistory.length})</AccordionTrigger>
                        <AccordionContent>
                          {calcHistory.map((card) => (
                            <p key={card.id} style={{ margin: "4px 0" }}>{card.kind === "calculation" ? `${card.expression} = ${card.result}` : ""}</p>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  {gated.urgent && (view.kind === "reminder" || view.kind === "event") && (
                    <Alert variant="destructive" style={{ marginTop: 12 }}>
                      <Bell size={14} aria-hidden="true" />
                      <AlertTitle>Urgent</AlertTitle>
                      <AlertDescription>This one reads time-sensitive. Save it before it slips.</AlertDescription>
                    </Alert>
                  )}
                  {detailHint && view.kind === "timer" && (
                    <div className="timer-picker">
                      <Label htmlFor="timer-minutes">No duration found — pick one</Label>
                      <Slider
                        id="timer-minutes"
                        min={1}
                        max={120}
                        step={1}
                        value={[timerMinutes]}
                        onValueChange={(values) => setTimerMinutes(values[0] ?? 25)}
                      />
                      <div className="topline-left">
                        <Badge variant="secondary">{timerLabel(timerMinutes * 60)}</Badge>
                        <Button type="button" size="sm" onClick={useTimerMinutes}>Use {timerMinutes} min</Button>
                      </div>
                    </div>
                  )}
                  {detailHint && view.kind !== "timer" && <p className="inline-hint">{detailHint}</p>}
                  {view.kind === "event" || view.kind === "reminder" ? view.scheduleAmbiguous && <p className="inline-hint">Add AM or PM if the exact time matters.</p> : null}
                  {view.kind === "split" && view.currency === "USD" && <p className="inline-hint">Amounts without a currency symbol are treated as USD.</p>}
                </CardContent>
              </div>
            )
          })()}
            </div>
          </div>
          {resolved && (
            <div className="morph-foot">
              <span className="confidence">Esc to clear{memory.ui.kind === "ghost" ? " · Tab to keep" : ""}</span>
              <Button type="button" size="sm" onClick={addDraft}>Add {labels[resolved.kind]} ↵</Button>
            </div>
          )}
          </div>
        </section>

        {storageWarning && (
          <div className={`notice ${storageBlocked ? "notice-warning" : ""}`} role="alert">
            <span>{storageWarning}</span>
            {storageBlocked && <Button variant="ghost" size="sm" type="button" onClick={() => setConfirmReset(true)}>Reset saved deck</Button>}
          </div>
        )}
        {error && <p className="notice notice-error" role="alert">{error}</p>}

        <details id="deck-title" className="saved-deck" open={deckOpen} onToggle={(event) => setDeckOpen(event.currentTarget.open)}>
      <summary className="saved-deck-summary">
        <span>Your deck</span><span className="count-badge">{cards.length}</span><span className="deck-toggle-hint" aria-hidden="true"><ChevronDown size={15} /></span>
      </summary>
          <section className="deck-section" aria-label="Saved cards">
            <div className="deck-heading">
              <div>
                <p className="eyebrow">YOUR PERSONAL DECK</p>
                <h2 id="deck-heading">Things worth keeping</h2>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!cards.length && !storageBlocked}>Deck tools</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Backup</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={exportBackup} disabled={!cards.length}>
                    <Download size={14} aria-hidden="true" /> Export backup
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => document.getElementById("backup-input")?.click()}>
                    <Upload size={14} aria-hidden="true" /> Import backup
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => setConfirmReset(true)}>
                    <Trash2 size={14} aria-hidden="true" /> Clear this deck
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input id="backup-input" type="file" accept="application/json,.json" onChange={importBackup} />
            </div>

            {cards.length > 0 && (
              <Collapsible defaultOpen>
                <Card style={{ marginBottom: 14 }}>
                  <CardHeader>
                    <CollapsibleTrigger asChild>
                      <button type="button" className="insights-toggle" aria-label="Toggle insights">
                        <span className="topline-left">
                          <BarChart3 size={15} aria-hidden="true" />
                          <CardTitle>Deck insights</CardTitle>
                        </span>
                        <Badge variant="secondary">{insights.done}/{insights.total} done</Badge>
                      </button>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="insights-grid">
                        <div>
                          <p className="live-recipe-head"><strong>Completion</strong></p>
                          <div className="topline-left" style={{ marginTop: 8 }}>
                            <svg width={72} height={72} viewBox="0 0 72 72" role="img" aria-label={`${insights.total === 0 ? 0 : Math.round((insights.done / insights.total) * 100)} percent complete`}>
                              <circle cx={36} cy={36} r={30} fill="none" strokeWidth={9} className="ring-bg" stroke="#e4e8dc" />
                              <circle
                                cx={36}
                                cy={36}
                                r={30}
                                fill="none"
                                strokeWidth={9}
                                className="ring-fg"
                                stroke="var(--forest)"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 30}
                                strokeDashoffset={2 * Math.PI * 30 * (1 - (insights.total === 0 ? 0 : insights.done / insights.total))}
                                transform="rotate(-90 36 36)"
                              />
                            </svg>
                            <div>
                              <strong style={{ fontSize: 20 }}>{insights.total === 0 ? 0 : Math.round((insights.done / insights.total) * 100)}%</strong>
                              <p className="preview-detail">{insights.done} of {insights.total} complete</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="live-recipe-head"><strong>Kind mix</strong></p>
                          <div className="shape-bars">
                            {insights.mix.slice(0, 5).map(([kind, count]) => (
                              <div key={kind} className="shape-bar-row">
                                <span className="shape-bar-cat">{labels[kind]}</span>
                                <span className="shape-bar-track"><span className="shape-bar-fill" style={{ width: `${Math.max(5, Math.round((count / Math.max(1, insights.mix[0]?.[1] ?? 1)) * 100))}%` }} /></span>
                                <span className="shape-bar-amt">{count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="live-recipe-head"><strong>Last 14 days</strong></p>
                          <div className="activity-bars" aria-hidden="true">
                            {insights.days.map((day) => (
                              <span key={day.key} className="activity-col" title={`${day.key}: ${day.count}`}>
                                <span className="activity-fill" style={{ height: `${Math.max(4, Math.round((day.count / insights.maxDay) * 100))}%`, opacity: day.count === 0 ? 0.25 : 1 }} />
                              </span>
                            ))}
                          </div>
                          <p className="preview-detail">{insights.days.reduce((sum, day) => sum + day.count, 0)} saved in 14 days</p>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {spendByCategory.length > 0 && (
              <Card style={{ marginBottom: 14 }}>
                <CardHeader>
                  <CardTitle>Spend by category</CardTitle>
                  <CardDescription>From {cards.filter((c) => c.kind === "expense").length} saved expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="shape-bars">
                    {spendByCategory.slice(0, 6).map(([category, cents]) => {
                      const max = spendByCategory[0]?.[1] ?? 1
                      const currencyCode = cards.find((c) => c.kind === "expense" && c.category === category)?.kind === "expense"
                        ? (cards.find((c) => c.kind === "expense" && c.category === category) as Extract<IntentCard, { kind: "expense" }>).currency
                        : "USD"
                      return (
                        <div key={category} className="shape-bar-row">
                          <span className="shape-bar-cat">{category}</span>
                          <span className="shape-bar-track"><span className="shape-bar-fill" style={{ width: `${Math.max(4, Math.round((cents / max) * 100))}%` }} /></span>
                          <span className="shape-bar-amt">{currency(cents, currencyCode)}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="deck-toolbar" role="group" aria-label="Deck filters">
              <Tabs value={filter} onValueChange={(value) => { setFilter(value as Filter); setPage(0) }}>
                <TabsList aria-label="Filter cards">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="open">In progress</TabsTrigger>
                  <TabsTrigger value="done">Done</TabsTrigger>
                </TabsList>
              </Tabs>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" aria-label="Deck filters">
                    <LayoutGrid size={14} aria-hidden="true" /> Filters{(kindFilter !== "all" || sort !== "newest") ? " •" : ""}
                  </Button>
                </PopoverTrigger>
                <PopoverContent style={{ padding: 6, minWidth: 220 }}>
                  <p className="u-menu-label">Kind</p>
                  <Button variant="ghost" size="sm" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => { setKindFilter("all"); setPage(0) }}>
                    {kindFilter === "all" && <Check size={13} aria-hidden="true" />} All kinds
                  </Button>
                  {(Object.keys(labels) as CardKind[]).map((kind) => (
                    <Button key={kind} variant="ghost" size="sm" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => { setKindFilter(kind); setPage(0) }}>
                      {kindFilter === kind && <Check size={13} aria-hidden="true" />} {labels[kind]}
                    </Button>
                  ))}
                  <p className="u-menu-label" style={{ marginTop: 6 }}>Sort</p>
                  {(["newest", "oldest", "kind"] as Sort[]).map((value) => (
                    <Button key={value} variant="ghost" size="sm" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => { setSort(value); setPage(0) }}>
                      {sort === value && <Check size={13} aria-hidden="true" />}
                      {value === "newest" ? "Newest first" : value === "oldest" ? "Oldest first" : "By kind"}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
              <div className="search-box">
                <span aria-hidden="true"><Search size={15} /></span>
                <Label className="sr-only" htmlFor="deck-search">Search your deck</Label>
                <Input id="deck-search" value={search} onChange={(event) => { setSearch(event.currentTarget.value); setPage(0) }} placeholder="Search your deck" style={{ border: 0, padding: 0 }} />
                {search && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={15} aria-hidden="true" /></button>
                    </TooltipTrigger>
                    <TooltipContent>Clear search</TooltipContent>
                  </Tooltip>
                )}
              </div>
              <Button className="palette-open-btn" variant="outline" size="sm" type="button" onClick={() => setPaletteOpen(true)}>
                <ListPlus size={14} aria-hidden="true" /> Card palette
              </Button>
            </div>

            {cards.length === 0 ? (
              <div className="empty-state">
                <div className="empty-glyph" aria-hidden="true">✳</div>
                <h3>Your deck is a clean slate.</h3>
                <p>Start with one small thought. Preview it locally, then decide if it belongs here.</p>
              </div>
            ) : visibleCards.length === 0 ? (
              <div className="empty-state compact-empty"><h3>No cards match that view.</h3><p>Try another search or switch the filter.</p></div>
            ) : (
              <>
                <ScrollArea style={{ maxHeight: 560 }}>
                  <div className="card-grid">
                    {pagedCards.map((card) => (
                      <Card key={card.id} className={cn(cardIsComplete(card, now) && "is-complete", card.kind === "goal" && card.current >= card.target && "goal-done")}>
                        <span className="morph-accent" aria-hidden="true" style={{ background: KIND_ACCENTS[card.kind] }} />
                        <CardHeader>
                          <div className="intent-card-top">
                            <span className="topline-left">
                              <KindBadge kind={card.kind} variant={card.kind === "note" ? "secondary" : "default"} />
                              {pinned.includes(card.id) && <Badge variant="outline"><Pin size={10} aria-hidden="true" /> Pinned</Badge>}
                            </span>
                            <span className="topline-left">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label={`Actions for ${card.title}`} title="Card actions">
                                    <span aria-hidden="true">···</span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                  <div style={{ display: "grid", gap: 4 }}>
                                    <Button variant="ghost" size="sm" style={{ justifyContent: "flex-start" }} onClick={() => copyText(card.title, "Title")}>
                                      <Copy size={13} aria-hidden="true" /> Copy title
                                    </Button>
                                    {card.kind === "note" && (
                                      <Button variant="ghost" size="sm" style={{ justifyContent: "flex-start" }} onClick={() => togglePin(card.id)}>
                                        {pinned.includes(card.id) ? <PinOff size={13} aria-hidden="true" /> : <Pin size={13} aria-hidden="true" />}
                                        {pinned.includes(card.id) ? "Unpin" : "Pin to top"}
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="sm" style={{ justifyContent: "flex-start" }} onClick={() => deleteCard(card.id)}>
                                      <Trash2 size={13} aria-hidden="true" /> Delete
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="icon-button delete-button" type="button" aria-label={`Delete ${card.title}`} title="Delete card" onClick={() => deleteCard(card.id)}>×</button>
                                </TooltipTrigger>
                                <TooltipContent>Delete (undo available)</TooltipContent>
                              </Tooltip>
                            </span>
                          </div>
                          <CardTitle>{(() => {
                            if (card.kind !== "event" && card.kind !== "reminder") return card.title
                            const found = extractEventEntities(card.title, card.title)
                            return found.attendees.length > 0 || found.video ? found.title : card.title
                          })()}</CardTitle>
                          {card.kind !== "goal" && card.kind !== "poll" && (
                            <CardDescription>{describeCard(card, now)}</CardDescription>
                          )}
                          {(card.kind === "event" || card.kind === "reminder") && (() => {
                            const found = extractEventEntities(card.title, card.title)
                            if (found.attendees.length === 0 && !found.video) return null
                            return (
                              <>
                                {found.video && <p className="entity-row"><Video size={14} aria-hidden="true" />{found.video}</p>}
                                {found.attendees.map((name) => (
                                  <p key={name} className="entity-row">
                                    <Avatar><AvatarFallback>{initials(name)}</AvatarFallback></Avatar>{name}
                                  </p>
                                ))}
                              </>
                            )
                          })()}
                        </CardHeader>
                        <CardContent>
                          {(card.kind === "checklist" || card.kind === "shopping") && (
                            <>
                              <Progress value={card.items.length === 0 ? 0 : (card.items.filter((item) => item.done).length / card.items.length) * 100} />
                              <ul className="checklist-items">
                                {card.items.map((item) => (
                                  <li key={item.id} className={item.done ? "item-done" : ""}>
                                    <Checkbox checked={item.done} onCheckedChange={() => toggleCardItem(card.id, item.id)} aria-label={item.text} />
                                    <span>{item.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                          {card.kind === "workout" && (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Done</TableHead>
                                  <TableHead>Exercise</TableHead>
                                  <TableHead>Plan</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {card.items.map((item) => {
                                  const row = parseWorkoutRow(item.text)
                                  return (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        <Checkbox checked={item.done} onCheckedChange={() => toggleCardItem(card.id, item.id)} aria-label={item.text} />
                                      </TableCell>
                                      <TableCell className={cn(item.done && "item-done")}>{row.name}</TableCell>
                                      <TableCell>{row.scheme ?? "—"}</TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          )}
                          {card.kind === "agenda" && (
                            <Accordion type="multiple" defaultValue={card.items.filter((item) => !item.done).map((item) => item.id)}>
                              {card.items.map((item) => (
                                <AccordionItem key={item.id} value={item.id}>
                                  <AccordionTrigger>
                                    <span className={cn(item.done && "item-done")}>{item.text}</span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <span className="topline-left">
                                      <Checkbox checked={item.done} onCheckedChange={() => toggleCardItem(card.id, item.id)} aria-label={"Discussed: " + item.text} />
                                      <span>{item.done ? "Discussed" : "Mark discussed"}</span>
                                    </span>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          )}
                          {card.kind === "itinerary" && (
                            <ItineraryTimeline
                              stops={card.items.map((item) => parseItineraryStop(item.text))}
                              renderNode={(index) => {
                                const item = card.items[index]!
                                return (
                                  <Checkbox checked={item.done} onCheckedChange={() => toggleCardItem(card.id, item.id)} aria-label={item.text} />
                                )
                              }}
                            />
                          )}
                          {card.kind === "project" && (
                            <ProjectSteps
                              steps={card.items.map((item) => item.text)}
                              renderNode={(index) => {
                                const item = card.items[index]!
                                return (
                                  <Button
                                    type="button"
                                    variant={item.done ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleCardItem(card.id, item.id)}
                                  >
                                    {item.done && <Check size={12} aria-hidden="true" />}
                                    {item.done ? "Done" : "Mark done"}
                                  </Button>
                                )
                              }}
                            />
                          )}
                          {card.kind === "recipe" && (
                            <Tabs defaultValue="ingredients">
                              <TabsList aria-label="Recipe sections">
                                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                                <TabsTrigger value="steps">Method</TabsTrigger>
                              </TabsList>
                              <TabsContent value="ingredients">
                                <ul className="checklist-items">
                                  {card.ingredients.map((item) => (
                                    <li key={item.id} className={item.done ? "item-done" : ""}>
                                      <Checkbox checked={item.done} onCheckedChange={() => toggleCardItem(card.id, item.id, "ingredients")} aria-label={item.text} />
                                      <span>{item.text}</span>
                                    </li>
                                  ))}
                                </ul>
                              </TabsContent>
                              <TabsContent value="steps">
                                <ol className="recipe-steps">
                                  {card.steps.map((item) => (
                                    <li key={item.id} className={item.done ? "item-done" : ""}>
                                      <Checkbox checked={item.done} onCheckedChange={() => toggleCardItem(card.id, item.id, "steps")} aria-label={item.text} />
                                      <span>{item.text}</span>
                                    </li>
                                  ))}
                                </ol>
                              </TabsContent>
                            </Tabs>
                          )}
                          {card.kind === "timer" && (
                            <div className="timer-ring-wrap">
                              <TimerRing remaining={remainingTimerSeconds(card, now)} duration={card.durationSeconds} size={64} />
                              <p className="timer-display" aria-live="off" style={{ margin: 0, fontSize: 30 }}>{timerLabel(remainingTimerSeconds(card, now))}</p>
                            </div>
                          )}
                          {card.kind === "split" && (
                            <div className="split-result">
                              {groupShares(card.shareAmountsCents).map(({ amount, count }) => (
                                <span key={`${amount}-${count}`}>{currency(amount, card.currency)} <small>× {count}</small></span>
                              ))}
                            </div>
                          )}
                          {card.kind === "color" && (
                            <div className="topline-left" style={{ marginTop: 12 }}>
                              <span aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 9, background: card.hex, border: "1px solid rgba(0,0,0,.15)", flex: "0 0 auto" }} />
                              <strong>{card.hex}</strong>
                              <span className="preview-detail">{card.name}</span>
                            </div>
                          )}
                          {card.kind === "convert" && (
                            <p className="calculation-result">{card.input} {card.from} = {card.result} {card.to}</p>
                          )}
                          {card.kind === "poll" && (
                            <>
                              <Progress value={card.options.length === 0 ? 0 : (card.options.reduce((sum, option) => sum + option.votes, 0) / Math.max(1, card.options.length)) * 20} />
                              <ul className="checklist-items">
                                {card.options.map((option) => {
                                  const maxVotes = Math.max(1, ...card.options.map((entry) => entry.votes))
                                  return (
                                    <li key={option.id}>
                                      <Button variant="outline" size="sm" type="button" onClick={() => updateCard(card.id, (current) => current.kind === "poll"
                                        ? { ...current, options: current.options.map((entry) => entry.id === option.id ? { ...entry, votes: Math.min(1_000_000, entry.votes + 1) } : entry) }
                                        : current)}>
                                        Vote · {option.votes}
                                      </Button>
                                      <span style={{ flex: 1 }}>{option.text}</span>
                                      <span className="shape-bar-track" style={{ flex: "0 0 72px" }}>
                                        <span className="shape-bar-fill" style={{ width: `${Math.round((option.votes / maxVotes) * 100)}%` }} />
                                      </span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </>
                          )}
                          {card.kind === "countdown" && (
                            <p className="calculation-result">{(() => {
                              const days = countdownDays(card.target, now)
                              return days === 0 ? "Today" : days > 0 ? `${days} days left` : `${Math.abs(days)} days ago`
                            })()}</p>
                          )}
                          {card.kind === "timezone" && <p className="calculation-result" style={{ fontSize: 16 }}>{timezoneResult(card)}</p>}
                          {card.kind === "random" && (
                            <div className="topline-left" style={{ marginTop: 10 }}>
                              <p className="calculation-result" style={{ margin: 0 }}>{card.result}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                type="button"
                                onClick={() => {
                                  try {
                                    const result = rollRandomExpression(card.expression)
                                    updateCard(card.id, (current) => current.kind === "random" ? { ...current, result } : current)
                                  } catch {
                                    /* keep current roll */
                                  }
                                }}
                              >
                                Re-roll
                              </Button>
                            </div>
                          )}
                          {card.kind === "goal" && (
                            <>
                              <Progress value={card.target === 0 ? 0 : (card.current / card.target) * 100} />
                              <div className="topline-left" style={{ marginTop: 8 }}>
                                <span className="confidence">{card.current}/{card.target}{card.unit ? " " + card.unit : ""}</span>
                                <Button variant="outline" size="sm" type="button" disabled={card.current >= card.target} onClick={() => updateCard(card.id, (current) => {
                                  if (current.kind !== "goal") return current
                                  const next = { ...current, current: Math.min(current.target, current.current + 1) }
                                  if (next.current >= next.target && current.current < current.target) {
                                    window.setTimeout(() => toast.success("Goal complete — nice work."), 0)
                                  }
                                  return next
                                })}>
                                  +1
                                </Button>
                              </div>
                            </>
                          )}
                          {card.kind === "contact" && (
                            <div className="expense-details">
                              <Avatar><AvatarFallback>{initials(card.title)}</AvatarFallback></Avatar>
                              {card.phone && <span>{card.phone}</span>}
                              {card.email && <span>{card.email}</span>}
                            </div>
                          )}
                          {card.kind === "link" && (
                            <div className="topline-left" style={{ marginTop: 10 }}>
                              <Button variant="outline" size="sm" type="button" asChild>
                                <a href={card.url} target="_blank" rel="noreferrer">Open ↗</a>
                              </Button>
                              {card.note && <span className="preview-detail">{card.note}</span>}
                            </div>
                          )}
                          {card.kind === "travel" && (
                            <div className="topline-left" style={{ marginTop: 10 }}>
                              <Badge variant="secondary">{card.mode}</Badge>
                              <strong>{card.destination}</strong>
                              {card.when && <span className="preview-detail">{dateLabel(card.when)}</span>}
                            </div>
                          )}
                          {card.kind === "expense" && (
                            <div className="expense-details">
                              <strong>{currency(card.amountCents, card.currency)}</strong>
                              <Badge variant="warning">{card.category}</Badge>
                              <time dateTime={card.spentAt}>{dateLabel(card.spentAt)}</time>
                            </div>
                          )}
                          {card.kind === "calculation" && <p className="calculation-result">= {new Intl.NumberFormat(undefined, { maximumFractionDigits: 10 }).format(card.result)}</p>}
                          {card.kind === "note" && card.body.toLowerCase() !== card.title.toLowerCase() && <p className="note-body">{card.body}</p>}
                          {(card.kind === "event" || card.kind === "reminder") && card.scheduleAmbiguous && <p className="inline-hint">Choose AM or PM to make this time exact.</p>}
                        </CardContent>
                        <CardFooter>
                          {card.kind === "timer" ? (
                            <div className="timer-actions">
                              {card.endsAt ? (
                                <Button size="sm" type="button" onClick={() => timerAction(card, "pause")}>Pause</Button>
                              ) : remainingTimerSeconds(card, now) > 0 ? (
                                <Button size="sm" type="button" onClick={() => timerAction(card, "start")}>{card.remainingSeconds === card.durationSeconds ? "Start timer" : "Resume"}</Button>
                              ) : null}
                              <Button variant="ghost" size="sm" type="button" onClick={() => timerAction(card, "reset")}>Reset</Button>
                            </div>
                          ) : (
                            <span className="topline-left">
                              <Switch
                                checked={cardIsComplete(card, now)}
                                onCheckedChange={() => toggleComplete(card.id)}
                                aria-label={card.kind === "habit" ? "Mark habit period" : "Mark card done"}
                              />
                              <span className="confidence">{cardIsComplete(card, now) ? "Done" : card.kind === "habit" ? (card.cadence === "daily" ? "Today?" : "This week?") : "Done?"}</span>
                            </span>
                          )}
                          <time dateTime={card.createdAt} style={{ marginLeft: "auto" }}>{new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(card.createdAt))}</time>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                {pageCount > 1 && (
                  <Pagination style={{ marginTop: 14 }}>
                    <PaginationList>
                      <li><PaginationButton disabled={safePage === 0} onClick={() => setPage(safePage - 1)} aria-label="Previous page">←</PaginationButton></li>
                      {Array.from({ length: pageCount }, (_, i) => i).slice(Math.max(0, safePage - 2), safePage + 3).map((i) => (
                        <li key={i}><PaginationButton active={i === safePage} onClick={() => setPage(i)}>{i + 1}</PaginationButton></li>
                      ))}
                      <li><PaginationButton disabled={safePage >= pageCount - 1} onClick={() => setPage(safePage + 1)} aria-label="Next page">→</PaginationButton></li>
                    </PaginationList>
                  </Pagination>
                )}
              </>
            )}
          </section>
        </details>

        <footer className="privacy-footer">
          <span><b>Nothing leaves by default.</b> This deck lives in your browser.</span>
        </footer>
      </div>

      <Dialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <DialogContent aria-label="Card palette" style={{ width: "min(520px, calc(100vw - 32px))", padding: 0 }}>
          <Command label="Card palette">
            <CommandInput placeholder="Type a thought or pick a card…" autoFocus />
            <CommandList>
              <CommandEmpty>No matching card. Keep typing — Jev reads free text.</CommandEmpty>
              <CommandGroup heading="Live guess">
                {liveKind && (
                  <CommandItem
                    key={"live-" + liveKind}
                    value={"live " + liveKind}
                    onSelect={() => {
                      chooseLiveIntent(liveKind)
                      setPaletteOpen(false)
                      document.getElementById("thought-input")?.focus()
                    }}
                  >
                    <KindBadge kind={liveKind} />
                    {liveResult ? Math.round(liveResult.intent.confidence * 100) + "%" : ""}
                    <CommandShortcut>jev</CommandShortcut>
                  </CommandItem>
                )}
                {!liveKind && <CommandItem value="typing" disabled>Keep typing…</CommandItem>}
              </CommandGroup>
              <CommandGroup heading={`All ${CARD_EXAMPLES.length} cards`}>
                {CARD_EXAMPLES.map((example) => (
                  <CommandItem
                    key={example.kind}
                    value={example.kind + " " + example.text}
                    onSelect={() => {
                      updateThought(example.text)
                      setPaletteOpen(false)
                      document.getElementById("thought-input")?.focus()
                    }}
                  >
                    <KindBadge kind={example.kind} variant="secondary" />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{example.text}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandGroup heading="Actions">
                <CommandItem
                  value="save card"
                  disabled={!resolved}
                  onSelect={() => {
                    addDraft()
                    setPaletteOpen(false)
                  }}
                >
                  Save current card <CommandShortcut>↵</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value="clear input"
                  onSelect={() => {
                    resetComposer()
                    setPaletteOpen(false)
                  }}
                >
                  Clear input <CommandShortcut>esc</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this deck?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes every saved card from this browser. Export a backup first if anything matters. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep my deck</AlertDialogCancel>
            <AlertDialogAction onClick={doReset}>Clear everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingImport !== null} onOpenChange={(open) => { if (!open) setPendingImport(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace this deck?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingImport ? `Import ${pendingImport.length} ${pendingImport.length === 1 ? "card" : "cards"} and replace what is saved here?` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Replace deck</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  )
}
