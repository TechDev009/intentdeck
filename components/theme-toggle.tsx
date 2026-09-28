import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

const THEME_KEY = "intentdeck.theme"

function currentTheme(): "light" | "dark" {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark") return "dark"
  return "light"
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    setTheme(currentTheme())
  }, [])

  function toggle() {
    const next = theme === "dark" ? "light" : "dark"
    document.documentElement.dataset.theme = next
    try {
      window.localStorage.setItem(THEME_KEY, next)
    } catch {
      /* private mode: theme simply doesn't persist */
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </button>
  )
}
