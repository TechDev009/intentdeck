import type { ReactNode } from "react"
import { ThemeToggle } from "../components/theme-toggle"

const themeInit = `(function(){try{var t=localStorage.getItem("intentdeck.theme");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;}catch(e){}})();`

const css = `
  :root {
    color-scheme: light;
    --paper: #f3f0e8;
    --paper-light: #fbfaf6;
    --ink: #172c28;
    --muted: #66736d;
    --line: #d8ddd3;
    --forest: #20483e;
    --lime: #d5f36a;
    --coral: #ec735b;
    --shadow: 0 18px 48px rgba(28, 55, 47, .08);
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--paper); color: var(--ink); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
  button, input, textarea { font: inherit; }
  button { cursor: pointer; }
  button:disabled { cursor: not-allowed; opacity: .55; }
  button:focus-visible, input:focus-visible, textarea:focus-visible, a:focus-visible, label:focus-visible { outline: 3px solid #8dad2b; outline-offset: 3px; }
  ::selection { background: var(--lime); color: var(--ink); }
  .site-frame { min-height: 100vh; overflow: hidden; background: radial-gradient(ellipse at 80% 2%, rgba(213,243,106,.19), transparent 25rem); }
  .site-header { height: 78px; border-bottom: 1px solid rgba(23,44,40,.12); }
  .header-inner { width: min(1160px, calc(100% - 48px)); height: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
  .brand { color: var(--ink); display: inline-flex; gap: 10px; align-items: center; font-weight: 820; letter-spacing: -.035em; text-decoration: none; font-size: 20px; }
  .brand-icon { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 11px 11px 11px 3px; background: var(--lime); font-size: 20px; color: var(--forest); transform: rotate(-5deg); }
  .header-right { display: flex; align-items: center; gap: 28px; color: var(--muted); font-size: 12px; font-weight: 650; }
  .header-status { display: inline-flex; align-items: center; gap: 8px; }
  .status-dot { width: 7px; height: 7px; display: inline-block; background: #76a349; border-radius: 50%; box-shadow: 0 0 0 3px rgba(118,163,73,.13); }
  .header-right a { color: var(--forest); text-decoration: none; }
  .app-main { width: min(1160px, calc(100% - 48px)); margin: 0 auto; padding: 78px 0 42px; }
  .page-shell { display: block; }
  .hero-grid { display: grid; grid-template-columns: minmax(0, .77fr) minmax(0, 1.23fr); gap: clamp(34px, 5vw, 66px); align-items: center; padding-bottom: 62px; }
  .live-demo-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; min-width: 0; }
  .hero-copy { padding: 4px 0 20px; }
  .eyebrow { margin: 0 0 17px; color: #648039; font-size: 10px; line-height: 1.3; font-weight: 850; letter-spacing: .17em; text-transform: uppercase; }
  .hero-copy .eyebrow { display: flex; gap: 9px; align-items: center; }
  .eyebrow-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--coral); display: inline-block; }
  h1, h2, h3, p { margin-top: 0; }
  .hero-copy h1 { margin: 0; color: var(--ink); font: 500 clamp(48px, 6.2vw, 78px)/.99 Georgia, "Times New Roman", serif; letter-spacing: -.055em; }
  .hero-copy h1 em { color: #4f705e; font-weight: 400; }
  .hero-deck { max-width: 425px; margin: 25px 0 23px; color: #56645c; font-size: 16px; line-height: 1.75; }
  .privacy-chip { display: inline-flex; align-items: center; gap: 9px; padding: 9px 13px; border: 1px solid #cbd4c1; border-radius: 999px; color: #3e5b45; font-size: 11px; font-weight: 720; background: rgba(251,250,246,.55); }
  .privacy-chip span { font-size: 14px; }
  .privacy-chip i { height: 3px; width: 3px; border-radius: 50%; background: #9aa998; }
  .composer { padding: 27px 29px 20px; border: 1px solid #e0e3db; border-radius: 18px 18px 18px 4px; background: var(--paper-light); box-shadow: var(--shadow); }
  .composer-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; }
  .composer-heading .eyebrow { margin-bottom: 9px; }
  .composer h2, .preview-panel h2, .deck-heading h2 { margin: 0; color: var(--ink); font: 500 27px/1.1 Georgia, "Times New Roman", serif; letter-spacing: -.03em; }
  .shortcut { margin-top: 4px; padding: 7px 9px; border-radius: 6px; background: #e9efd9; color: #4f693c; font-size: 9px; font-weight: 850; letter-spacing: .12em; }
  .composer-form { margin-top: 22px; }
  .composer textarea { width: 100%; min-height: 104px; resize: vertical; border: 1px solid #d9ded5; border-radius: 10px; background: #fff; color: var(--ink); padding: 15px 16px; font-size: 14px; line-height: 1.6; }
  .composer textarea::placeholder { color: #99a29a; }
  .composer-meta { margin: 8px 1px 15px; display: flex; justify-content: space-between; gap: 12px; color: #79847c; font-size: 10px; }
  .composer-meta p { margin: 0; }
  .composer-actions { display: flex; flex-wrap: wrap; gap: 9px; }
  .button { min-height: 42px; display: inline-flex; align-items: center; justify-content: center; gap: 11px; border: 1px solid transparent; border-radius: 8px; padding: 0 15px; font-size: 12px; font-weight: 760; transition: transform .15s ease, background .15s ease, border-color .15s ease; }
  .button:not(:disabled):hover { transform: translateY(-1px); }
  .button-primary { background: var(--forest); color: #fbfaf6; }
  .button-primary:not(:disabled):hover { background: #2e6254; }
  .button-ai { color: #4d6335; background: #eff4df; border-color: #dce7bd; }
  .button-ai:not(:disabled):hover { background: #e5efc9; }
  .button-secondary { border-color: #c5d39f; background: #f6f8ed; color: var(--forest); }
  .examples { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 18px; color: #78837a; font-size: 10px; }
  .examples button { padding: 5px 9px; color: #445d4c; border: 1px solid #e3e7de; border-radius: 999px; background: transparent; font-size: 10px; }
  .examples button:hover { border-color: #aab99a; background: #f2f5e8; }
  .ai-disclosure { margin: 13px 0 0; color: #78827a; font-size: 10px; line-height: 1.55; }
  .loading-state { width: min(1160px, calc(100% - 48px)); margin: 120px auto; color: var(--muted); }
  .notice { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin: 12px 0; padding: 13px 16px; border: 1px solid #d6e0c2; border-radius: 8px; background: #f7f9ed; color: #455b3c; font-size: 12px; line-height: 1.5; }
  .notice-error { border-color: #eed3c9; background: #fff7f3; color: #904535; }
  .notice-success { border-color: #d6e0c2; }
  .notice-warning { border-color: #e8c58f; background: #fff9ee; color: #765520; }
  .suggestion-banner { display: grid; grid-template-columns: 1fr minmax(180px, 1fr) auto; gap: 22px; align-items: center; margin: -30px 0 42px; padding: 17px 20px; border: 1px solid #cdd9ad; border-radius: 11px; background: #f8faee; }
  .suggestion-banner .eyebrow { margin-bottom: 7px; }
  .suggestion-banner strong { margin-right: 10px; }
  .confidence { color: #79836c; font-size: 10px; }
  .suggestion-note { margin: 0; color: var(--muted); font-size: 11px; line-height: 1.5; }
  .preview-panel { display: flex; flex-direction: column; justify-content: flex-start; align-items: stretch; gap: 0; min-width: 0; margin: 0; padding: 20px 17px; border: 1px solid #d4dcc8; border-radius: 14px 14px 14px 4px; background: #e8eddd; }
  .preview-panel.is-empty { min-height: 142px; align-items: center; justify-content: flex-start; border-style: dashed; background: rgba(251,250,246,.78); }
  .preview-empty { display: flex; width: 100%; max-width: 680px; align-items: center; gap: 18px; }
  .preview-empty-mark { display: grid; width: 48px; height: 48px; flex: 0 0 auto; place-items: center; border: 1px solid #dce2d5; border-radius: 14px 14px 14px 4px; background: #eef1e7; color: #52715d; font-size: 22px; }
  .preview-empty h2 { margin: 0 0 7px; color: var(--ink); font: 500 23px/1.2 Georgia, "Times New Roman", serif; }
  .preview-empty-copy { max-width: 460px; margin: 0; color: #69776d; font-size: 12px; line-height: 1.55; }
  .preview-panel.is-ready .preview-card { animation: preview-arrive 180ms ease-out; }
  @keyframes preview-arrive { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .preview-panel .eyebrow { margin-bottom: 8px; }
  .preview-card { min-width: min(460px, 100%); margin-top: 18px; padding: 18px 20px; border: 1px solid rgba(41,75,57,.14); border-radius: 10px; background: rgba(255,255,255,.72); }
  .preview-topline, .intent-card-top { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
  .preview-topline > span { color: #819080; font-size: 10px; }
  .preview-card h3 { margin: 14px 0 6px; color: var(--ink); font: 500 22px/1.2 Georgia, "Times New Roman", serif; }
.preview-detail { margin: 0; color: #55655c; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; white-space: pre-wrap; }
.preview-checklist { display: grid; gap: 7px; margin: 14px 0 1px; padding: 12px 0 0 19px; border-top: 1px solid #e8eae3; color: #43564b; font-size: 12px; line-height: 1.45; }
.preview-split-result { margin-top: 12px; }
.split-result span small { margin-left: 3px; color: #94766b; font-size: 9px; font-weight: 600; }
  .inline-hint { margin: 9px 0 0; color: #8a6331; font-size: 10px; line-height: 1.5; }
  .preview-actions { display: flex; min-width: 0; align-items: center; justify-content: space-between; flex-direction: row; gap: 12px; margin-top: 18px; }
  .preview-actions .button { width: auto; flex: 0 0 auto; }
  .text-button { display: inline; border: 0; padding: 3px 0; background: transparent; color: #496453; font-size: 11px; font-weight: 700; text-decoration: underline; text-decoration-color: #aebba8; text-underline-offset: 3px; }
  .text-button:hover:not(:disabled) { color: #1b4639; text-decoration-color: #1b4639; }
  .deck-section { padding-top: 8px; }
  .deck-heading { display: flex; justify-content: space-between; align-items: end; gap: 18px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
  .deck-heading .eyebrow { margin-bottom: 10px; }
  .deck-heading h2 { font-size: 31px; }
  .count-badge { display: inline-grid; place-items: center; min-width: 25px; height: 25px; margin-left: 4px; border-radius: 50%; background: #dce9bb; color: #40543a; vertical-align: middle; font: 700 11px ui-sans-serif, system-ui; letter-spacing: 0; }
  .deck-tools { display: flex; gap: 18px; align-items: center; }
  #backup-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); clip-path: inset(50%); white-space: nowrap; }
  .import-button { cursor: pointer; }
  .deck-controls { display: flex; justify-content: space-between; align-items: center; gap: 18px; padding: 19px 0 23px; }
  .filter-tabs { display: flex; gap: 4px; padding: 4px; border: 1px solid #d9ded5; border-radius: 8px; background: rgba(251,250,246,.58); }
  .filter-tabs button { border: 0; border-radius: 5px; padding: 7px 11px; color: #65736b; background: transparent; font-size: 10px; font-weight: 700; }
  .filter-tabs button.filter-active { background: #fff; color: var(--forest); box-shadow: 0 1px 3px rgba(24,45,39,.12); }
  .search-box { display: flex; align-items: center; gap: 8px; width: min(260px, 100%); min-height: 36px; padding: 0 10px; border: 1px solid #d9ded5; border-radius: 7px; background: rgba(251,250,246,.7); color: #819087; }
  .search-box > span:first-child { font-size: 18px; }
  .search-box input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 11px; }
  .search-box input:focus-visible { outline: 0; }
  .search-box button { border: 0; background: transparent; color: #738078; font-size: 17px; }
  .card-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
  .intent-card { position: relative; min-width: 0; padding: 19px 20px 15px; border: 1px solid #dfe3da; border-radius: 12px 12px 12px 3px; background: var(--paper-light); box-shadow: 0 6px 18px rgba(28,55,47,.035); transition: box-shadow .18s ease, transform .18s ease; }
  .intent-card:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(28,55,47,.08); }
  .intent-card.is-complete { background: #f0f1e9; }
  .intent-card.is-complete h3 { color: #6d7d70; text-decoration: line-through; text-decoration-color: #a3ae9f; }
  .kind-mark { display: inline-flex; min-height: 22px; align-items: center; padding: 0 8px; border-radius: 4px; background: #eaf0dc; color: #52683e; font-size: 9px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; }
  .kind-event, .kind-reminder { background: #e8efdc; color: #49613e; }
.kind-checklist, .kind-shopping, .kind-workout, .kind-project { background: #f5e9d8; color: #8a6034; }
.kind-agenda, .kind-itinerary { background: #e6edf0; color: #4b6570; }
.kind-habit { background: #ece8f3; color: #665879; }
.kind-recipe { background: #f6e8dc; color: #8a5738; }
  .kind-timer { background: #e3eeee; color: #3d6965; }
.kind-split, .kind-expense, .kind-calculation { background: #f6e6df; color: #8e5143; }
.kind-note { background: #e9e9e4; color: #656a5f; }
  .icon-button { display: inline-grid; place-items: center; width: 25px; height: 25px; border: 0; border-radius: 50%; background: transparent; color: #8c9890; font-size: 20px; line-height: 1; }
  .delete-button:hover { background: #f8e9e4; color: #a04e3d; }
  .intent-card h3 { margin: 14px 0 5px; color: var(--ink); overflow-wrap: anywhere; font: 500 21px/1.2 Georgia, "Times New Roman", serif; letter-spacing: -.02em; }
  .card-summary { margin: 0; color: #718078; font-size: 11px; line-height: 1.55; }
  .checklist-items { display: grid; gap: 8px; margin: 15px 0 2px; padding: 13px 0 0; border-top: 1px solid #e8eae3; list-style: none; }
  .checklist-items > li { display: flex; gap: 9px; align-items: flex-start; }
  .checklist-items label { display: flex; gap: 9px; align-items: flex-start; color: #43564b; cursor: pointer; font-size: 12px; line-height: 1.45; }
  .checklist-items input { width: 15px; height: 15px; flex: 0 0 auto; margin: 0; accent-color: #567548; }
  .item-done span { color: #879187; text-decoration: line-through; }
  .timer-display { margin: 16px 0 2px; color: var(--forest); font: 500 39px/1 Georgia, "Courier New", monospace; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
  .split-result { display: flex; flex-wrap: wrap; gap: 5px; margin: 15px 0 2px; }
  .split-result span { padding: 6px 8px; border: 1px solid #ede2db; border-radius: 5px; background: #fffaf7; color: #785448; font-size: 10px; font-weight: 700; }
  .calculation-result { margin: 14px 0 0; color: #4e6b47; font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .note-body { margin: 13px 0 0; color: #495b51; font-size: 12px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
  .recipe-preview { display: grid; gap: 6px; margin-top: 12px; color: #43564b; font-size: 11px; line-height: 1.5; overflow-wrap: anywhere; }
  .recipe-preview p { margin: 0; }
  .recipe-card-details { display: grid; gap: 15px; margin-top: 13px; }
  .recipe-card-details h4 { margin: 0; color: #7f5d44; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  .recipe-card-details .checklist-items { margin-top: 8px; }
  .recipe-steps { display: grid; gap: 8px; margin: 8px 0 0; padding: 0; list-style: none; }
  .recipe-steps > li { display: flex; gap: 9px; align-items: flex-start; }
  .recipe-steps label { display: flex; gap: 9px; align-items: flex-start; color: #43564b; cursor: pointer; font-size: 12px; line-height: 1.45; }
  .recipe-steps input { width: 15px; height: 15px; flex: 0 0 auto; margin: 0; accent-color: #8a6034; }
  .expense-details { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px; margin-top: 13px; color: #785448; font-size: 10px; }
  .expense-details strong { font-size: 20px; font-variant-numeric: tabular-nums; }
  .expense-details time { color: #8d827c; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 16px; padding-top: 11px; border-top: 1px solid #e8eae3; }
  .card-footer time { color: #9aa39c; font-size: 9px; }
  .complete-action { display: inline-flex; align-items: center; gap: 7px; border: 0; padding: 3px 0; background: transparent; color: #607565; font-size: 10px; font-weight: 750; }
  .complete-action:hover { color: var(--forest); }
  .complete-action span { font-size: 14px; }
  .timer-actions { display: flex; align-items: center; gap: 13px; }
  .small-action { border: 0; border-radius: 5px; padding: 6px 9px; background: #e8efdc; color: #405b3f; font-size: 10px; font-weight: 750; }
  .small-action:hover { background: #dce8c7; }
  .small-reset { font-size: 10px; }
  .empty-state { display: grid; justify-items: center; min-height: 235px; align-content: center; padding: 32px 20px; text-align: center; }
  .empty-glyph { display: grid; place-items: center; width: 44px; height: 44px; margin-bottom: 17px; border-radius: 14px 14px 14px 4px; background: var(--lime); color: #49623c; font-size: 22px; }
  .empty-state h3 { margin: 0 0 7px; color: var(--ink); font: 500 22px/1.2 Georgia, "Times New Roman", serif; }
  .empty-state p { max-width: 360px; margin: 0; color: #78837a; font-size: 12px; line-height: 1.6; }
  .compact-empty { min-height: 145px; }
  .compact-empty h3 { font-size: 19px; }
  .privacy-footer { display: flex; justify-content: space-between; gap: 18px; margin-top: 54px; padding: 17px 0 4px; border-top: 1px solid var(--line); color: #79857c; font-size: 10px; line-height: 1.5; }
  .privacy-footer b { color: #49614e; font-weight: 750; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  @media (max-width: 980px) {
    .app-main { padding-top: 51px; }
    .hero-grid { grid-template-columns: 1fr; gap: 35px; padding-bottom: 49px; }
    .live-demo-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
    .hero-copy { padding-bottom: 0; }
    .hero-copy h1 { font-size: clamp(52px, 11vw, 76px); }
    .hero-deck { max-width: 560px; margin: 18px 0; }
    .composer { max-width: none; }
    .preview-panel { align-items: stretch; }
    .suggestion-banner { grid-template-columns: 1fr auto; }
    .suggestion-note { grid-column: 1 / -1; grid-row: 2; }
  }
  @media (max-width: 560px) {
    .site-header { height: 65px; }
    .header-inner, .app-main, .loading-state { width: min(100% - 32px, 1160px); }
    .header-right { gap: 14px; font-size: 10px; }
    .header-status { display: none; }
    .app-main { padding-top: 37px; }
    .hero-grid { gap: 27px; padding-bottom: 39px; }
    .live-demo-grid { grid-template-columns: 1fr; gap: 14px; }
    .hero-copy h1 { font-size: clamp(47px, 13vw, 64px); }
    .hero-deck { margin: 15px 0; font-size: 14px; }
    .composer { padding: 21px 17px 16px; }
    .composer h2 { font-size: 23px; }
    .shortcut { font-size: 8px; }
    .composer textarea { min-height: 96px; }
    .composer-actions { display: grid; grid-template-columns: 1fr; }
    .composer-actions .button { width: 100%; }
    .notice { align-items: flex-start; flex-direction: column; margin-top: 12px; margin-bottom: 16px; }
    .suggestion-banner { grid-template-columns: 1fr; gap: 10px; margin-top: -10px; margin-bottom: 28px; }
    .suggestion-note { grid-column: auto; grid-row: auto; }
    .suggestion-banner .button { justify-self: start; }
    .preview-panel { flex-direction: column; margin: 0; padding: 19px 15px; }
    .preview-card { min-width: 0; padding: 15px; }
    .preview-actions { min-width: 0; align-items: flex-start; }
    .preview-actions .button { width: auto; }
    .deck-heading { align-items: flex-start; flex-direction: column; }
    .deck-heading h2 { font-size: 27px; }
    .deck-tools { gap: 17px; }
    .deck-controls { align-items: stretch; flex-direction: column; gap: 12px; }
    .filter-tabs { width: fit-content; }
    .search-box { width: 100%; }
    .card-grid { grid-template-columns: 1fr; }
    .intent-card { padding: 17px 16px 13px; }
    .privacy-footer { align-items: flex-start; flex-direction: column; margin-top: 35px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
  }

  /* Single-box morph shell: one input, card morphs directly below. */
  .shape-intro { margin-bottom: 10px; }
  .shape-wrap { display: grid; gap: 10px; }
  .shape-wrap #thought-input { display: block; width: 100%; min-height: 64px; padding: 18px 20px; border: 1px solid #d9dfd4; border-radius: 16px; background: #fff; color: var(--ink); font-size: 20px; line-height: 1.4; box-shadow: 0 12px 34px rgba(28,55,47,.06); }
  .shape-wrap #thought-input::placeholder { color: #929c94; }
  .hud { margin: 0; color: #758078; font-size: 11px; }
  .choose-chips { margin-top: 0; }
  .morph-preview.is-ghost { opacity: .55; }
  .morph-preview.is-ghost:focus-within { opacity: .85; }
  .topline-left { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
  .signal-pill { display: inline-flex; align-items: center; min-height: 22px; padding: 0 9px; border: 1px solid #d5dcc8; border-radius: 999px; background: #f4f6ec; color: #5c6f52; font-size: 9px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; white-space: nowrap; }
  .live-list { list-style: none; display: grid; gap: 2px; margin: 14px 0 2px; padding: 12px 0 0; border-top: 1px solid #e8eae3; }
  .live-list li { display: flex; align-items: flex-start; gap: 11px; padding: 7px 2px; color: #3d5045; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
  .live-list li + li { border-top: 1px dashed #e6e8e0; }
  .live-check { flex: 0 0 auto; width: 16px; height: 16px; margin-top: 2px; border: 1.5px solid #8aa184; border-radius: 5px; background: #fff; }
  .live-recipe-head { margin: 14px 0 0; color: #7f5d44; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
  .live-recipe-head strong { font-weight: 800; }
  .live-steps { list-style: none; display: grid; gap: 2px; margin: 8px 0 0; padding: 0; }
  .live-steps li { display: flex; align-items: flex-start; gap: 11px; padding: 7px 2px; color: #3d5045; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
  .live-steps li + li { border-top: 1px dashed #e6e8e0; }
  .live-stepnum { flex: 0 0 auto; display: grid; place-items: center; min-width: 20px; height: 20px; margin-top: 1px; padding: 0 5px; border-radius: 999px; background: #e8efdc; color: #49613e; font-size: 11px; font-weight: 800; }

  /* shadcn-style ui kit on IntentDeck tokens (Bun-only, no Tailwind pipeline). */
  .u-btn { min-height: 38px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 1px solid transparent; border-radius: 8px; padding: 0 14px; font-size: 12px; font-weight: 700; white-space: nowrap; transition: transform .15s ease, background .15s ease, border-color .15s ease; }
  .u-btn:not(:disabled):hover { transform: translateY(-1px); }
  .u-btn-default { background: var(--forest); color: #fbfaf6; }
  .u-btn-default:not(:disabled):hover { background: #2e6254; }
  .u-btn-secondary { background: #e9efd9; color: #40543a; }
  .u-btn-secondary:not(:disabled):hover { background: #dce8c7; }
  .u-btn-outline { border-color: #c5d39f; background: #f6f8ed; color: var(--forest); }
  .u-btn-outline:not(:disabled):hover { background: #edf2df; }
  .u-btn-ghost { background: transparent; color: #496453; }
  .u-btn-ghost:not(:disabled):hover { background: #ecefe4; }
  .u-btn-destructive { background: #a04e3d; color: #fff7f3; }
  .u-btn-destructive:not(:disabled):hover { background: #8c4234; }
  .u-btn-sm { min-height: 30px; padding: 0 10px; font-size: 11px; }
  .u-btn-lg { min-height: 46px; padding: 0 20px; font-size: 14px; }
  .u-btn-icon { min-width: 34px; width: 34px; height: 34px; min-height: 0; padding: 0; border-radius: 50%; }
  .u-badge { display: inline-flex; align-items: center; min-height: 22px; padding: 0 9px; border-radius: 6px; font-size: 9px; font-weight: 850; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
  .u-badge-default { background: #eaf0dc; color: #52683e; }
  .u-badge-secondary { background: #eef1e7; color: #5c6f52; }
  .u-badge-outline { border: 1px solid #c5d39f; background: transparent; color: #49613e; }
  .u-badge-success { background: #dce9bb; color: #40543a; }
  .u-badge-warning { background: #f8e9c8; color: #8a6034; }
  .u-card { border: 1px solid #dfe3da; border-radius: 12px; background: var(--paper-light); box-shadow: 0 6px 18px rgba(28,55,47,.035); }
  .u-card-header { padding: 16px 18px 0; }
  .u-card-title { margin: 0; font: 500 21px/1.2 Georgia, "Times New Roman", serif; letter-spacing: -.02em; }
  .u-card-desc { margin: 4px 0 0; color: #718078; font-size: 12px; }
  .u-card-content { padding: 12px 18px; }
  .u-card-footer { display: flex; align-items: center; gap: 10px; padding: 0 18px 16px; }
  .u-input { display: block; width: 100%; border: 1px solid #d9ded5; border-radius: 10px; background: #fff; color: var(--ink); padding: 10px 13px; font-size: 14px; line-height: 1.5; }
  .u-input::placeholder { color: #99a29a; }
  textarea.u-input { min-height: 88px; resize: vertical; }
  .u-label { display: block; margin-bottom: 6px; color: #496453; font-size: 11px; font-weight: 750; }
  .u-sep { background: #e3e7de; }
  .u-sep:not(.u-sep-v) { height: 1px; width: 100%; margin: 10px 0; }
  .u-sep-v { width: 1px; align-self: stretch; margin: 0 10px; }
  .u-skeleton { border-radius: 8px; background: linear-gradient(100deg, #e8ebdf 40%, #f4f6ee 50%, #e8ebdf 60%); background-size: 200% 100%; animation: u-shimmer 1.4s linear infinite; }
  @keyframes u-shimmer { to { background-position: -200% 0; } }
  .u-check { display: inline-grid; place-items: center; width: 17px; height: 17px; flex: 0 0 auto; border: 1.5px solid #8aa184; border-radius: 5px; background: #fff; padding: 0; }
  .u-check[data-state="checked"] { background: var(--forest); border-color: var(--forest); color: #fbfaf6; }
  .u-check-ind { display: grid; place-items: center; }
  .u-switch { display: inline-flex; align-items: center; width: 36px; height: 21px; border: 0; border-radius: 999px; background: #cfd6c9; padding: 2px; flex: 0 0 auto; }
  .u-switch[data-state="checked"] { background: var(--forest); }
  .u-switch-thumb { display: block; width: 17px; height: 17px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .15s ease; }
  .u-switch[data-state="checked"] .u-switch-thumb { transform: translateX(15px); }
  .u-progress { height: 8px; overflow: hidden; border-radius: 999px; background: #e4e8dc; }
  .u-progress-ind { height: 100%; border-radius: 999px; background: var(--forest); transition: width .25s ease; }
  .u-tabs-list { display: inline-flex; gap: 2px; padding: 3px; border: 1px solid #d9ded5; border-radius: 9px; background: rgba(251,250,246,.7); }
  .u-tabs-trigger { border: 0; border-radius: 6px; padding: 7px 13px; background: transparent; color: #65736b; font-size: 11px; font-weight: 750; }
  .u-tabs-trigger[data-state="active"] { background: #fff; color: var(--forest); box-shadow: 0 1px 3px rgba(24,45,39,.12); }
  .u-tabs-content { margin-top: 10px; }
  .u-tabs-content:focus-visible { outline: 0; }
  .u-acc-item { border-bottom: 1px solid #e8eae3; }
  .u-acc-item:first-child { border-top: 1px solid #e8eae3; }
  .u-acc-header { margin: 0; }
  .u-acc-trigger { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 10px; border: 0; background: transparent; padding: 10px 2px; color: var(--ink); font-size: 13px; font-weight: 700; text-align: left; }
  .u-acc-trigger:hover { color: var(--forest); }
  .u-acc-chevron { transition: transform .18s ease; color: #819080; }
  .u-acc-trigger[data-state="open"] .u-acc-chevron { transform: rotate(180deg); }
  .u-acc-content { overflow: hidden; }
  .u-acc-inner { padding: 2px 2px 12px; color: #43564b; font-size: 12px; line-height: 1.55; }
  .u-overlay { position: fixed; inset: 0; z-index: 60; background: rgba(23,44,40,.45); animation: u-fade .15s ease; }
  @keyframes u-fade { from { opacity: 0; } to { opacity: 1; } }
  .u-dialog { position: fixed; left: 50%; top: 50%; z-index: 61; width: min(440px, calc(100vw - 32px)); transform: translate(-50%,-50%); border: 1px solid #d9ded5; border-radius: 14px; background: var(--paper-light); padding: 22px; box-shadow: 0 24px 64px rgba(23,44,40,.25); animation: u-pop .18s ease; }
  @keyframes u-pop { from { opacity: 0; transform: translate(-50%,-48%) scale(.98); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
  .u-dialog-header { margin-bottom: 8px; padding-right: 28px; }
  .u-dialog-title { margin: 0; font: 500 20px/1.2 Georgia, "Times New Roman", serif; }
  .u-dialog-desc { margin: 6px 0 0; color: #718078; font-size: 12px; line-height: 1.55; }
  .u-dialog-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
  .u-dialog-x { position: absolute; top: 14px; right: 14px; display: grid; place-items: center; width: 28px; height: 28px; border: 0; border-radius: 50%; background: transparent; color: #8c9890; }
  .u-dialog-x:hover { background: #ecefe4; color: var(--ink); }
  .u-menu { z-index: 62; min-width: 190px; padding: 5px; border: 1px solid #d9ded5; border-radius: 10px; background: var(--paper-light); box-shadow: 0 14px 40px rgba(23,44,40,.16); animation: u-pop2 .14s ease; }
  @keyframes u-pop2 { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }
  .u-menu-item { display: flex; align-items: center; gap: 9px; width: 100%; border: 0; border-radius: 6px; background: transparent; padding: 8px 10px; color: var(--ink); font-size: 12px; font-weight: 600; text-align: left; cursor: pointer; }
  .u-menu-item[data-highlighted], .u-menu-item:hover { background: #edf2df; outline: 0; }
  .u-menu-check { display: inline-grid; place-items: center; width: 16px; color: var(--forest); }
  .u-menu-label { padding: 7px 10px 4px; color: #819080; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .u-menu-sep { height: 1px; margin: 5px 4px; background: #e3e7de; }
  .u-tip { z-index: 63; max-width: 240px; border-radius: 7px; background: var(--forest); color: #fbfaf6; padding: 7px 10px; font-size: 11px; line-height: 1.45; animation: u-pop2 .14s ease; }
  .u-pop { z-index: 62; border: 1px solid #d9ded5; border-radius: 10px; background: var(--paper-light); padding: 12px; box-shadow: 0 14px 40px rgba(23,44,40,.16); animation: u-pop2 .14s ease; }
  .u-avatar { display: inline-grid; place-items: center; width: 30px; height: 30px; flex: 0 0 auto; overflow: hidden; border-radius: 50%; background: #e4e9d4; }
  .u-avatar-fb { color: #49613e; font-size: 11px; font-weight: 850; letter-spacing: .02em; }
  .u-select { display: inline-flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 150px; border: 1px solid #d9ded5; border-radius: 8px; background: rgba(251,250,246,.8); padding: 8px 11px; color: var(--ink); font-size: 12px; font-weight: 650; }
  .u-select:hover { border-color: #aab99a; }
  .u-slider { position: relative; display: flex; align-items: center; width: 100%; height: 22px; touch-action: none; user-select: none; }
  .u-slider-track { position: relative; height: 6px; flex-grow: 1; border-radius: 999px; background: #e4e8dc; }
  .u-slider-range { position: absolute; height: 100%; border-radius: 999px; background: var(--forest); }
  .u-slider-thumb { display: block; width: 18px; height: 18px; border: 2px solid var(--forest); border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(23,44,40,.3); }
  .u-slider-thumb:hover { background: #eef3e2; }
  .u-slider-thumb:focus-visible { outline: 3px solid #8dad2b; outline-offset: 2px; }
  .u-scroll-vp { width: 100%; height: 100%; }
  .u-scrollbar { width: 8px; padding: 2px; }
  .u-scroll-thumb { border-radius: 999px; background: #c3ccb6; }
  .u-toggle-item { border: 1px solid #d9ded5; background: transparent; padding: 7px 13px; color: #65736b; font-size: 11px; font-weight: 750; }
  .u-toggle-item:first-child { border-radius: 8px 0 0 8px; }
  .u-toggle-item:last-child { border-radius: 0 8px 8px 0; }
  .u-toggle-item + .u-toggle-item { border-left: 0; }
  .u-toggle-item[data-state="on"] { background: var(--forest); border-color: var(--forest); color: #fbfaf6; }
  .u-table-wrap { overflow-x: auto; border: 1px solid #e3e7de; border-radius: 10px; }
  .u-table { width: 100%; border-collapse: collapse; background: rgba(255,255,255,.6); font-size: 12px; }
  .u-th { padding: 9px 12px; background: #eef1e7; color: #5c6f52; font-size: 10px; font-weight: 850; letter-spacing: .07em; text-transform: uppercase; text-align: left; white-space: nowrap; }
  .u-td { padding: 9px 12px; border-top: 1px solid #e8eae3; color: #3d5045; }
  .u-tr:first-child .u-td { border-top: 0; }
  .u-tr:hover .u-td { background: rgba(237,242,223,.5); }
  .u-alert { display: grid; gap: 4px; border: 1px solid #d6e0c2; border-radius: 10px; background: #f7f9ed; padding: 12px 14px; color: #455b3c; }
  .u-alert-bad { border-color: #e5b8a6; background: #fff5f0; color: #8c4234; }
  .u-alert-title { margin: 0; font-size: 12px; font-weight: 850; }
  .u-alert-desc { font-size: 12px; line-height: 1.55; }
  .u-crumb-list { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 10px 0 0; padding: 0; list-style: none; }
  .u-crumb-item { color: #496453; font-size: 11px; font-weight: 700; }
  .u-crumb-sep { color: #a3ae9f; font-size: 11px; }
  .u-pager-list { display: flex; align-items: center; gap: 4px; margin: 0; padding: 0; list-style: none; }
  .u-pager-btn { min-width: 30px; height: 30px; border: 1px solid transparent; border-radius: 7px; background: transparent; color: #65736b; font-size: 11px; font-weight: 750; padding: 0 8px; }
  .u-pager-btn:hover { border-color: #d9ded5; background: #f2f5e8; }
  .u-pager-active { background: var(--forest); color: #fbfaf6; }
  .u-cmd { overflow: hidden; border: 1px solid #d9ded5; border-radius: 12px; background: var(--paper-light); box-shadow: 0 24px 64px rgba(23,44,40,.25); }
  .u-cmd-search { display: flex; align-items: center; gap: 9px; padding: 12px 14px; border-bottom: 1px solid #e3e7de; color: #819080; }
  .u-cmd-input { flex: 1; border: 0; outline: 0; background: transparent; color: var(--ink); font-size: 14px; }
  .u-cmd-list { max-height: 320px; overflow-y: auto; padding: 6px; }
  .u-cmd-empty { padding: 18px; text-align: center; color: #819080; font-size: 12px; }
  .u-cmd-group { padding: 6px 8px 3px; color: #819080; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .u-cmd-item { display: flex; align-items: center; gap: 10px; border-radius: 8px; padding: 9px 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .u-cmd-item[data-selected="true"] { background: #edf2df; }
  .u-cmd-key { margin-left: auto; color: #819080; font-size: 10px; font-weight: 700; }
  .shape-streak { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; margin-top: 12px; }
  .shape-streak-day { aspect-ratio: 1; display: grid; place-items: center; border-radius: 7px; background: #ecefe4; color: #819080; font-size: 9px; font-weight: 700; }
  .shape-streak-day.is-done { background: var(--forest); color: #fbfaf6; }
  .shape-streak-day.is-today { outline: 2px solid #8dad2b; outline-offset: 1px; }
  .shape-bars { display: grid; gap: 8px; margin-top: 12px; }
  .shape-bar-row { display: grid; grid-template-columns: 92px 1fr 52px; align-items: center; gap: 10px; font-size: 11px; }
  .shape-bar-track { height: 9px; overflow: hidden; border-radius: 999px; background: #e4e8dc; }
  .shape-bar-fill { height: 100%; border-radius: 999px; background: var(--forest); }
  .shape-bar-cat { color: #496453; font-weight: 750; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .shape-bar-amt { text-align: right; color: #3d5045; font-weight: 750; font-variant-numeric: tabular-nums; }
  .deck-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 14px 0; }
  .preview-progress { display: grid; gap: 5px; margin-top: 12px; }
  .palette-open-btn { margin-left: auto; }
  .morph-shell { border: 1px solid #d9dfd4; border-radius: 18px; background: #fff; box-shadow: 0 12px 34px rgba(28,55,47,.06); overflow: hidden; transition: border-color .25s ease, box-shadow .25s ease; }
  .morph-accent { display: block; height: 3px; margin: -1px -1px 0; }
  .u-card { overflow: hidden; }
  .morph-shell:focus-within { border-color: #7fb069; box-shadow: 0 0 0 3px rgba(127,176,105,.25), 0 12px 34px rgba(28,55,47,.06); }
  [data-theme="dark"] .morph-shell { background: #1a2320; border-color: var(--line); }
  [data-theme="dark"] .morph-shell #thought-input { background: transparent; }
  [data-theme="dark"] .kind-tile { background: #2a3531; color: #a9c78f; }
  [data-theme="dark"] .kind-name { color: #b9c7b4; }
  [data-theme="dark"] .detail-chip { background: #232e2a; color: #cfd8cf; }
  [data-theme="dark"] .entity-row { color: #cfd8cf; }
  .morph-shell #thought-input { border: 0; border-radius: 18px 18px 0 0; box-shadow: none; background: transparent; }
  .morph-shell #thought-input:focus-visible { outline: 0; }
  .morph-expand { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
  .morph-expand.open { grid-template-rows: 1fr; }
  .morph-inner { overflow: hidden; min-height: 0; }
  .morph-body { padding: 0 2px; animation: card-arrive .22s ease-out; }
  .morph-body > .u-card-content { padding: 10px 18px 16px; }
  .morph-body > .preview-topline { margin-top: 10px; }
  .morph-body > .preview-topline,
  .morph-body > .u-card-title,
  .morph-body > .detail-chips,
  .morph-body > .entity-row,
  .morph-body > .preview-detail { margin-left: 18px; margin-right: 18px; }
  .morph-shell > .hud-bar { margin: 9px 20px 0; }
  .morph-shell > .examples { margin: 12px 20px 16px; }
  .morph-shell > .u-card { margin: 12px 20px 16px; }
  .morph-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 20px 16px; }
  .morph-shell.is-ghost .morph-body { opacity: .55; }
  .kind-tile { display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; background: #eef1e7; color: #52715d; }
  .kind-name { font-size: 12px; font-weight: 750; color: #5c6a5e; }
  .detail-chips { margin-top: 10px; }
  .detail-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; background: #eef1e7; color: #43564b; font-size: 11px; font-weight: 700; }
  .entity-row { display: flex; align-items: center; gap: 9px; margin: 8px 0 0; color: #43564b; font-size: 13px; font-weight: 600; }
  .hud-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 9px 2px 0; min-height: 22px; }
  .hud-status { display: inline-flex; align-items: center; gap: 8px; min-width: 0; color: #758078; font-size: 11px; }
  .hud-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
  .hud-dot { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: #b9c2b6; }
  .hud-dot.hud-live { background: #5f9e4f; box-shadow: 0 0 0 3px rgba(95,158,79,.16); }
  .hud-dot.hud-offline { background: #d9a13b; box-shadow: 0 0 0 3px rgba(217,161,59,.16); }
  .hud-dot.hud-reading { background: #5f9e4f; animation: u-pulse 1s ease-in-out infinite; }
  @keyframes u-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .35; } }
  .hud-keys { display: inline-flex; align-items: center; gap: 5px; flex: 0 0 auto; color: #8a948c; font-size: 10px; }
  .hud-keys kbd { display: inline-grid; place-items: center; min-width: 20px; height: 20px; padding: 0 5px; border: 1px solid #d5dacd; border-bottom-width: 2px; border-radius: 5px; background: #f5f6ef; color: #5c6a5e; font: 700 10px ui-sans-serif, system-ui; }
  @media (max-width: 560px) {
    .hud-bar { align-items: flex-start; }
    .hud-keys { font-size: 0; gap: 4px; }
    .hud-keys kbd { font-size: 10px; }
  }
  .insights-toggle { display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 10px; border: 0; background: transparent; padding: 0; color: var(--ink); }
  .insights-grid { display: grid; grid-template-columns: auto 1fr 1fr; gap: 22px; align-items: start; }
  .activity-bars { display: flex; align-items: flex-end; gap: 4px; height: 56px; margin-top: 10px; }
  .activity-col { flex: 1; display: flex; align-items: flex-end; height: 100%; min-width: 0; }
  .activity-fill { display: block; width: 100%; border-radius: 3px; background: var(--forest); }
  @media (max-width: 700px) {
    .insights-grid { grid-template-columns: 1fr; }
  }
  .u-table-wrap { margin-top: 12px; }
  .shape-cal { margin-top: 12px; max-width: 330px; }
  .cal-nav { margin-bottom: 6px; }
  .cal-nav .u-select { min-width: 0; flex: 1; padding: 6px 8px; font-size: 11px; }
  .shape-cal .shape-streak { gap: 3px; }
  .shape-cal .shape-streak-day { font-size: 10px; }
  .habit-controls { display: flex; align-items: center; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
  .timer-picker { display: grid; gap: 8px; margin-top: 12px; }
  .preview-topline + h2, .preview-topline + .u-card-title { margin-top: 10px; }
  .toggle-col .u-toggle-item { border-radius: 8px; justify-content: flex-start; }
  .toggle-col .u-toggle-item + .u-toggle-item { border-left: 1px solid #d9ded5; }
  .tl-rail { list-style: none; display: grid; margin: 12px 0 0; padding: 0; }
  .tl-stop { display: grid; grid-template-columns: 28px 1fr; gap: 10px; position: relative; padding: 7px 0; }
  .tl-stop:not(:last-child) .tl-node::after { content: ""; position: absolute; top: 30px; bottom: -8px; left: 50%; width: 2px; transform: translateX(-50%); background: #d9ded5; border-radius: 2px; }
  .tl-node { position: relative; display: grid; justify-items: center; padding-top: 1px; }
  .tl-dot { width: 12px; height: 12px; margin-top: 3px; border-radius: 50%; background: var(--forest); border: 2px solid #dce9bb; }
  .tl-body { display: grid; gap: 3px; min-width: 0; }
  .tl-time { color: #496453; font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
  .tl-place { color: #3d5045; font-size: 14px; line-height: 1.45; overflow-wrap: anywhere; }
  .steps-rail .tl-stop:not(:last-child) .tl-node::after { top: 26px; }
  @media (max-width: 560px) {
    .u-dialog { padding: 18px; }
    .shape-bar-row { grid-template-columns: 76px 1fr 48px; }
  }

  /* Lively widgets: calculator pad, coin flip, timer ring, day picker, shades. */
  .theme-toggle { display: inline-grid; place-items: center; width: 32px; height: 32px; border: 1px solid #d9ded5; border-radius: 50%; background: transparent; color: #496453; }
  .theme-toggle:hover { border-color: #aab99a; background: #edf2df; }
  .calc-pad { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-top: 12px; }
  .calc-key { min-height: 42px; border: 1px solid #d9ded5; border-radius: 9px; background: rgba(255,255,255,.7); color: var(--ink); font-size: 15px; font-weight: 750; font-variant-numeric: tabular-nums; }
  .calc-key:hover { border-color: #aab99a; background: #edf2df; }
  .calc-key.op { background: #e9efd9; color: #40543a; }
  .calc-key.eq { background: var(--forest); border-color: var(--forest); color: #fbfaf6; }
  .calc-display { margin-top: 12px; padding: 12px 14px; border: 1px solid #d9ded5; border-radius: 10px; background: rgba(255,255,255,.7); font-size: 22px; font-weight: 700; text-align: right; overflow-x: auto; white-space: nowrap; font-variant-numeric: tabular-nums; }
  .calc-live { margin: 6px 0 0; color: #4e6b47; font-size: 14px; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }
  .coin-stage { display: grid; justify-items: center; gap: 10px; margin-top: 12px; }
  .coin { display: grid; place-items: center; width: 74px; height: 74px; border-radius: 50%; background: radial-gradient(circle at 32% 30%, #f2f5e8, #d9e0c6 70%); border: 3px solid #aab99a; color: #40543a; font-size: 15px; font-weight: 850; }
  .coin.flipping { animation: u-coinflip .9s cubic-bezier(.3,.7,.4,1); }
  @keyframes u-coinflip { 0% { transform: rotateY(0); } 100% { transform: rotateY(1440deg); } }
  .dice-face { font-size: 40px; line-height: 1; }
  .dice-face.rolling { animation: u-dice .48s linear; }
  @keyframes u-dice { 0% { transform: rotate(0) scale(1); } 50% { transform: rotate(180deg) scale(1.25); } 100% { transform: rotate(360deg) scale(1); } }
  .timer-ring-wrap { display: flex; align-items: center; gap: 14px; margin-top: 12px; }
  .timer-ring { transform: rotate(-90deg); }
  .timer-ring .ring-bg { stroke: #e4e8dc; }
  .timer-ring .ring-fg { stroke: var(--forest); stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  .day-pick { border: 0; background: transparent; padding: 0; border-radius: 7px; }
  button.day-pick:hover .shape-streak-day { outline: 2px solid #8dad2b; outline-offset: 1px; }
  .shade-row { display: flex; gap: 6px; margin-top: 10px; }
  .shade-swatch { width: 30px; height: 30px; border: 1px solid rgba(0,0,0,.18); border-radius: 8px; padding: 0; }
  .shade-swatch:hover { transform: translateY(-2px); }
  .stepper { display: inline-flex; align-items: center; gap: 8px; }
  .stepper-btn { width: 28px; height: 28px; border: 1px solid #d9ded5; border-radius: 8px; background: #f5f6ef; color: var(--ink); font-size: 15px; font-weight: 800; line-height: 1; }
  .stepper-btn:hover:not(:disabled) { border-color: #aab99a; background: #edf2df; }
  .pick-flash { animation: u-pickflash .5s ease; }
  @keyframes u-pickflash { 0% { opacity: .2; transform: scale(.96); } 100% { opacity: 1; transform: scale(1); } }
  .goal-done { animation: u-goalpop .45s ease; }
  @keyframes u-goalpop { 0% { transform: scale(.9); } 60% { transform: scale(1.04); } 100% { transform: scale(1); } }

  /* Full dark theme. Light-mode rules above are untouched. */
  [data-theme="dark"] { color-scheme: dark; --paper: #101514; --paper-light: #18201d; --ink: #e9efe9; --muted: #9aa79d; --line: #2b3633; --forest: #7fb069; --lime: #d5f36a; }
  [data-theme="dark"] body { background: var(--paper); color: var(--ink); }
  [data-theme="dark"] .site-frame { background: radial-gradient(ellipse at 80% 2%, rgba(213,243,106,.07), transparent 25rem); }
  [data-theme="dark"] .site-header { border-bottom-color: rgba(233,239,233,.12); }
  [data-theme="dark"] .brand, [data-theme="dark"] .header-right a { color: var(--ink); }
  [data-theme="dark"] .header-right { color: var(--muted); }
  [data-theme="dark"] .theme-toggle { border-color: var(--line); color: var(--ink); }
  [data-theme="dark"] .theme-toggle:hover { background: #243028; }
  [data-theme="dark"] .shape-wrap #thought-input, [data-theme="dark"] .u-input, [data-theme="dark"] .u-select { background: #1e2825; border-color: var(--line); color: var(--ink); }
  [data-theme="dark"] .shape-wrap #thought-input::placeholder, [data-theme="dark"] .u-input::placeholder { color: #6d7a70; }
  [data-theme="dark"] .preview-detail, [data-theme="dark"] .card-summary, [data-theme="dark"] .u-card-desc { color: var(--muted); }
  [data-theme="dark"] .hud-status, [data-theme="dark"] .hud-keys { color: var(--muted); }
  [data-theme="dark"] .hud-keys kbd { background: #1e2825; border-color: var(--line); color: #b9c7b4; }
  [data-theme="dark"] .hud-keys kbd { background: #1e2825; border-color: var(--line); color: #b9c7b4; }
  [data-theme="dark"] .u-card, [data-theme="dark"] .intent-card, [data-theme="dark"] .morph-preview .preview-card, [data-theme="dark"] .u-menu, [data-theme="dark"] .u-dialog, [data-theme="dark"] .u-pop, [data-theme="dark"] .u-cmd { background: var(--paper-light); border-color: var(--line); }
  [data-theme="dark"] .u-card-title, [data-theme="dark"] .intent-card h3, [data-theme="dark"] .morph-preview .preview-card h2, [data-theme="dark"] .u-dialog-title { color: var(--ink); }
  [data-theme="dark"] .intent-card.is-complete { background: #141b19; }
  [data-theme="dark"] .intent-card.is-complete h3 { color: #7d8a7f; }
  [data-theme="dark"] .preview-topline > span, [data-theme="dark"] .confidence, [data-theme="dark"] .card-footer time, [data-theme="dark"] .privacy-footer, [data-theme="dark"] .deck-toggle-hint { color: var(--muted); }
  [data-theme="dark"] .preview-checklist, [data-theme="dark"] .checklist-items, [data-theme="dark"] .u-acc-item, [data-theme="dark"] .u-acc-item:first-child { border-color: var(--line); }
  [data-theme="dark"] .preview-checklist li, [data-theme="dark"] .checklist-items label, [data-theme="dark"] .live-steps li, [data-theme="dark"] .u-acc-inner, [data-theme="dark"] .u-td, [data-theme="dark"] .u-menu-item { color: #cfd8cf; }
  [data-theme="dark"] .live-list li + li, [data-theme="dark"] .live-steps li + li { border-color: var(--line); }
  [data-theme="dark"] .u-menu-item[data-highlighted], [data-theme="dark"] .u-menu-item:hover, [data-theme="dark"] .u-cmd-item[data-selected="true"] { background: #243028; }
  [data-theme="dark"] .u-tabs-list, [data-theme="dark"] .filter-tabs { background: #1a2320; border-color: var(--line); }
  [data-theme="dark"] .u-tabs-trigger { color: var(--muted); }
  [data-theme="dark"] .u-tabs-trigger[data-state="active"], [data-theme="dark"] .filter-tabs button.filter-active { background: #2a3531; color: var(--ink); }
  [data-theme="dark"] .filter-tabs button { color: var(--muted); }
  [data-theme="dark"] .u-badge-default { background: #2a3531; color: #cfe0b8; }
  [data-theme="dark"] .u-badge-secondary, [data-theme="dark"] .signal-pill, [data-theme="dark"] .kind-mark { background: #232e2a; color: #b9c7b4; }
  [data-theme="dark"] .u-badge-outline { border-color: #3d4a43; color: #cfe0b8; }
  [data-theme="dark"] .u-badge-success { background: #2e3d2c; color: #cfe0b8; }
  [data-theme="dark"] .u-btn-secondary { background: #2a3531; color: #d5e0cf; }
  [data-theme="dark"] .u-btn-outline { background: transparent; border-color: #3d4a43; color: #cfe0b8; }
  [data-theme="dark"] .u-btn-ghost { color: #b9c7b4; }
  [data-theme="dark"] .u-btn-ghost:not(:disabled):hover { background: #232e2a; }
  [data-theme="dark"] .u-progress, [data-theme="dark"] .u-slider-track, [data-theme="dark"] .shape-bar-track { background: #2a3531; }
  [data-theme="dark"] .u-check { background: transparent; }
  [data-theme="dark"] .u-switch { background: #3a4642; }
  [data-theme="dark"] .u-table { background: transparent; }
  [data-theme="dark"] .u-th { background: #1e2825; color: #9aa79d; }
  [data-theme="dark"] .u-td { border-color: var(--line); }
  [data-theme="dark"] .u-tr:hover .u-td { background: rgba(127,176,105,.08); }
  [data-theme="dark"] .u-alert { background: #1a2620; border-color: #2e3d2c; color: #cfe0b8; }
  [data-theme="dark"] .u-alert-bad { background: #2a1d18; border-color: #5a3226; color: #f0b9a4; }
  [data-theme="dark"] .u-sep, [data-theme="dark"] .u-menu-sep, [data-theme="dark"] .deck-heading, [data-theme="dark"] .saved-deck, [data-theme="dark"] .privacy-footer, [data-theme="dark"] .card-footer { border-color: var(--line); }
  [data-theme="dark"] .search-box { background: #1a2320; border-color: var(--line); color: var(--muted); }
  [data-theme="dark"] .search-box input { color: var(--ink); }
  [data-theme="dark"] .examples button, [data-theme="dark"] .stepper-btn, [data-theme="dark"] .calc-key { background: #1e2825; border-color: var(--line); color: var(--ink); }
  [data-theme="dark"] .examples button:hover, [data-theme="dark"] .stepper-btn:hover:not(:disabled), [data-theme="dark"] .calc-key:hover { background: #243028; }
  [data-theme="dark"] .calc-key.op { background: #2a3531; color: #cfe0b8; }
  [data-theme="dark"] .calc-display { background: #1e2825; border-color: var(--line); }
  [data-theme="dark"] .calc-live { color: #a9c78f; }
  [data-theme="dark"] .split-result span { background: #1e2825; border-color: var(--line); color: #cfd8cf; }
  [data-theme="dark"] .timer-display, [data-theme="dark"] .calculation-result, [data-theme="dark"] .morph-calculation strong, [data-theme="dark"] .morph-expense strong { color: var(--ink); }
  [data-theme="dark"] .note-body, [data-theme="dark"] .morph-calculation p, [data-theme="dark"] .recipe-preview { color: #cfd8cf; }
  [data-theme="dark"] .inline-hint { color: #c9a86a; }
  [data-theme="dark"] .text-button { color: #a9bfa4; }
  [data-theme="dark"] .count-badge, [data-theme="dark"] .live-stepnum { background: #2a3531; color: #cfe0b8; }
  [data-theme="dark"] .empty-glyph { background: #2a3531; color: #a9c78f; }
  [data-theme="dark"] .empty-state h3, [data-theme="dark"] .saved-deck-summary { color: var(--ink); }
  [data-theme="dark"] .empty-state p { color: var(--muted); }
  [data-theme="dark"] .u-toggle-item { border-color: var(--line); color: var(--muted); }
  [data-theme="dark"] .u-slider-thumb { background: #1e2825; }
  [data-theme="dark"] .shape-streak-day { background: #232e2a; color: #7d8a7f; }
  [data-theme="dark"] .u-pager-btn { color: var(--muted); }
  [data-theme="dark"] .u-pager-btn:hover { background: #232e2a; }
  [data-theme="dark"] .u-crumb-item { color: #b9c7b4; }
  [data-theme="dark"] .u-scroll-thumb { background: #3a4642; }
  [data-theme="dark"] .u-cmd-input { color: var(--ink); }
  [data-theme="dark"] .u-cmd-group, [data-theme="dark"] .u-cmd-empty, [data-theme="dark"] .u-menu-label, [data-theme="dark"] .u-dialog-desc { color: var(--muted); }
  [data-theme="dark"] .u-overlay { background: rgba(0,0,0,.6); }
  [data-theme="dark"] .shape-bar-cat, [data-theme="dark"] .shape-bar-amt { color: #cfd8cf; }
  [data-theme="dark"] .coin { background: radial-gradient(circle at 32% 30%, #2a3531, #1a2320 70%); border-color: #3d4a43; color: #cfe0b8; }
  [data-theme="dark"] .notice { background: #1a2620; border-color: #2e3d2c; color: #cfe0b8; }
  [data-theme="dark"] .notice-error { background: #2a1d18; border-color: #5a3226; color: #f0b9a4; }
  @media (prefers-reduced-motion: reduce) {
    .coin.flipping, .dice-face.rolling, .pick-flash, .goal-done { animation: none !important; }
  }
  .app-main { width: 100%; max-width: none; padding: 0 24px; }
  .page-shell.morph-page { width: min(760px, 100%); margin: 0 auto; padding: clamp(32px, 4vh, 44px) 0 64px; }
  .morph-intro { max-width: 780px; margin: 0 auto 20px; text-align: center; }
  .morph-intro .eyebrow { margin-bottom: 17px; }
  .morph-intro h1 { margin: 0; color: var(--ink); font: 500 clamp(43px, 6vw, 60px)/.99 Georgia, "Times New Roman", serif; letter-spacing: -.055em; }
  .morph-intro h1 em { color: #4f705e; font-weight: 400; }
  .morph-intro > p:last-child { max-width: 490px; margin: 18px auto 0; color: #5d6962; font-size: 15px; line-height: 1.6; }
  .morph-stack { display: grid; gap: 12px; }
  .morph-composer { padding: clamp(17px, 3vw, 22px); border: 1px solid #d9dfd4; border-radius: 16px; background: var(--paper-light); box-shadow: 0 12px 34px rgba(28,55,47,.06); }
  .composer-heading { align-items: center; margin-bottom: 14px; }
  .composer-heading label { color: var(--ink); font: 500 21px/1.2 Georgia, "Times New Roman", serif; }
  .shortcut { margin: 0; white-space: nowrap; }
  .morph-composer textarea { display: block; width: 100%; min-height: 88px; resize: vertical; padding: 15px 18px; border: 1px solid #dce1d7; border-radius: 11px; background: #fff; color: var(--ink); font-size: 17px; line-height: 1.55; }
  .morph-composer textarea::placeholder { color: #929c94; }
  .composer-meta { display: flex; justify-content: space-between; gap: 14px; margin-top: 9px; color: #758078; font-size: 11px; }
  .composer-meta p { margin: 0; }
  .morph-controls { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 14px; margin-top: 14px; }
  .examples { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
  .examples > span { margin-right: 2px; color: #758078; font-size: 11px; }
  .examples button { min-height: 32px; padding: 0 11px; border: 1px solid #dce2d6; border-radius: 999px; background: #f5f6ef; color: #42594b; font-size: 11px; font-weight: 650; }
  .examples button:hover { border-color: #aab99a; background: #edf2df; }
  .morph-jev-control { display: flex; align-items: center; gap: 9px; }
  .morph-jev-control > span { color: #7b857d; font-size: 10px; }
  .morph-jev-control .button { min-height: 34px; padding: 0 12px; font-size: 11px; }
  .morph-preview { display: block; margin: 0; padding: clamp(17px, 4vw, 24px); border: 1px solid #dce1d4; border-radius: 16px; background: #edf0e6; animation: card-arrive .2s ease-out; }
  @keyframes card-arrive { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  .preview-main { min-width: 0; }
  .preview-main > .eyebrow { margin-bottom: 11px; }
  .morph-preview .preview-card { width: 100%; max-width: none; min-width: 0; margin: 0; padding: clamp(18px, 4vw, 25px); border: 1px solid rgba(41,75,57,.14); border-radius: 12px; background: rgba(255,255,255,.82); box-shadow: 0 5px 18px rgba(28,55,47,.045); }
  .preview-topline { display: flex; justify-content: space-between; align-items: center; gap: 12px; color: #819080; font-size: 10px; }
  .morph-preview .preview-card h2 { margin: 18px 0 7px; color: var(--ink); font: 500 clamp(23px, 4vw, 31px)/1.15 Georgia, "Times New Roman", serif; letter-spacing: -.03em; overflow-wrap: anywhere; }
  .morph-preview .preview-detail { margin: 0; color: #56655c; font-size: 14px; line-height: 1.55; }
  .morph-preview .preview-checklist { margin-top: 17px; padding-top: 14px; font-size: 13px; }
  .morph-preview .recipe-preview { margin-top: 16px; gap: 12px; font-size: 13px; }
  .morph-calculation { margin-top: 12px; color: #51665a; font-size: 15px; }
  .morph-calculation p { margin: 0 0 4px; }
  .morph-calculation strong { color: #35583f; font-size: 23px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .morph-expense { display: flex; flex-wrap: wrap; align-items: baseline; gap: 7px 12px; margin-top: 14px; color: #765448; }
  .morph-expense strong { font-size: 26px; font-variant-numeric: tabular-nums; }
  .morph-expense span { font-size: 12px; }
  @media (min-width: 561px) {
    .site-header { height: 64px; }
    .page-shell.morph-page { padding-top: 18px; }
    .morph-intro { margin-bottom: 12px; }
    .morph-intro .eyebrow { margin-bottom: 8px; }
    .morph-intro h1 { font-size: clamp(38px, 4vw, 44px); }
    .morph-intro h1 br { display: none; }
    .morph-intro > p:last-child { max-width: 700px; margin-top: 10px; font-size: 13px; line-height: 1.4; }
    .morph-stack { gap: 8px; }
    .morph-composer { padding: 14px 16px; }
    .composer-heading { margin-bottom: 8px; }
    .composer-heading label { font-size: 18px; }
    .morph-composer textarea { min-height: 74px; padding: 12px 14px; }
    .composer-meta { margin-top: 5px; }
    .morph-controls { margin-top: 8px; }
    .examples button { min-height: 28px; padding: 0 9px; }
    .morph-jev-control .button { min-height: 30px; }
    .morph-preview { padding: 12px 16px; }
    .preview-main > .eyebrow { margin-bottom: 8px; }
    .morph-preview .preview-card { padding: 14px 17px; }
    .morph-preview .preview-card h2 { margin-top: 12px; font-size: 24px; }
    .morph-preview .preview-detail { font-size: 12px; }
    .morph-preview .recipe-preview { margin-top: 10px; gap: 8px; font-size: 11px; }
    .morph-preview .preview-checklist { margin-top: 12px; padding-top: 10px; }
    .morph-preview .preview-actions { margin-top: 10px; }
  }
  .morph-timer { margin: 15px 0 0; font-size: clamp(36px, 7vw, 52px); }
  .morph-preview .preview-actions { align-items: center; margin-top: 15px; }
  .morph-preview .preview-actions > span { color: #728078; font-size: 10px; }
  .saved-deck { margin-top: 39px; border-top: 1px solid var(--line); }
  .saved-deck-summary { display: flex; align-items: center; gap: 10px; padding: 19px 2px; color: var(--ink); cursor: pointer; font-size: 15px; font-weight: 700; list-style: none; }
  .saved-deck-summary::-webkit-details-marker { display: none; }
  .saved-deck-summary::before { content: "+"; display: grid; width: 23px; height: 23px; place-items: center; border-radius: 50%; background: #e3e9d8; color: #49614e; font-size: 17px; font-weight: 500; }
  .saved-deck[open] .saved-deck-summary::before { content: "−"; }
  .saved-deck-summary .count-badge { margin-left: 0; }
  .deck-toggle-hint { margin-left: auto; display: inline-grid; place-items: center; color: #718078; }
  .deck-toggle-hint svg { transition: transform .18s ease; }
  .saved-deck[open] .deck-toggle-hint svg { transform: rotate(180deg); }
  .u-dialog .u-cmd-search { padding-right: 46px; }
  .u-cmd-item { align-items: center; }
  .saved-deck .deck-section { padding: 0 0 10px; }
  .saved-deck .deck-heading h2 { font-size: 26px; }
  .saved-deck .empty-state { min-height: 190px; }
  .privacy-footer { margin-top: 38px; }
  @media (max-width: 560px) {
    .app-main { padding: 0 16px; }
    .page-shell.morph-page { padding-top: 30px; }
    .morph-intro { margin-bottom: 24px; }
    .morph-intro h1 { font-size: clamp(42px, 12vw, 57px); }
    .morph-intro > p:last-child { margin-top: 13px; font-size: 13px; }
    .morph-composer { border-radius: 13px; }
    .composer-heading { align-items: flex-start; gap: 8px; }
    .composer-heading label { font-size: 19px; }
    .shortcut { padding: 6px 7px; font-size: 8px; }
    .morph-composer textarea { min-height: 100px; padding: 14px; font-size: 16px; }
    .composer-meta { font-size: 10px; }
    .morph-controls { align-items: flex-start; }
    .examples { gap: 6px; }
    .examples button { min-height: 30px; }
    .morph-jev-control { width: 100%; }
    .morph-preview { border-radius: 13px; }
    .morph-preview .preview-actions { align-items: flex-start; }
    .morph-preview .preview-actions > span { align-self: center; }
    .saved-deck .deck-heading { align-items: flex-start; }
    .saved-deck .deck-tools { gap: 14px; }
  }
`

export function Layout(props: { children: ReactNode }) {
  return (
    <div className="site-frame">
      <style>{css}</style>
      <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      <header className="site-header">
        <div className="header-inner">
          <a href="/" className="brand" aria-label="IntentDeck home"><span className="brand-icon" aria-hidden="true">✳</span><span>IntentDeck</span></a>
          <div className="header-right">
            <span className="header-status"><i className="status-dot" /> Local by nature</span>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="app-main">{props.children}</main>
    </div>
  )
}

export default Layout
