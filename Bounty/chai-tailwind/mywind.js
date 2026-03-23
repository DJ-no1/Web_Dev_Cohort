(function () {
  // ─── TOKENS ───────────────────────────────────────────────────────────────

  const colors = {
    red: "#ef4444",
    orange: "#f97316",
    yellow: "#eab308",
    green: "#22c55e",
    blue: "#3b82f6",
    purple: "#a855f7",
    pink: "#ec4899",
    white: "#ffffff",
    black: "#000000",
    gray: "#6b7280",
  };

  const spacing = {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
  };

  const fontSizes = {
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "32px",
    "3xl": "48px",
  };

  const fontWeights = {
    thin: "100",
    light: "300",
    normal: "400",
    medium: "500",
    bold: "700",
    black: "900",
  };

  const radii = {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  };

  const shadows = {
    sm: "0 1px 3px rgba(0,0,0,0.12)",
    md: "0 4px 12px rgba(0,0,0,0.15)",
    lg: "0 8px 24px rgba(0,0,0,0.18)",
    xl: "0 16px 48px rgba(0,0,0,0.22)",
    none: "none",
  };

  const opacity = {
    0: "0",
    25: "0.25",
    50: "0.5",
    75: "0.75",
    100: "1",
  };

  const zIndex = {
    0: "0",
    10: "10",
    20: "20",
    30: "30",
    40: "40",
    50: "50",
    auto: "auto",
  };

  // ─── RULE BUILDER ─────────────────────────────────────────────────────────

  const rules = [];

  function add(selector, declarations) {
    rules.push(`${selector} { ${declarations} }`);
  }

  // ─── COLORS ───────────────────────────────────────────────────────────────

  for (const [name, value] of Object.entries(colors)) {
    add(`.text-${name}`, `color: ${value};`);
    add(`.bg-${name}`, `background-color: ${value};`);
    add(`.border-${name}`, `border-color: ${value};`);
    add(`.outline-${name}`, `outline-color: ${value};`);
  }

  // ─── SPACING ──────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(spacing)) {
    // padding
    add(`.p-${key}`, `padding: ${value};`);
    add(`.px-${key}`, `padding-left: ${value}; padding-right: ${value};`);
    add(`.py-${key}`, `padding-top: ${value}; padding-bottom: ${value};`);
    add(`.pt-${key}`, `padding-top: ${value};`);
    add(`.pb-${key}`, `padding-bottom: ${value};`);
    add(`.pl-${key}`, `padding-left: ${value};`);
    add(`.pr-${key}`, `padding-right: ${value};`);
    // margin
    add(`.m-${key}`, `margin: ${value};`);
    add(`.mx-${key}`, `margin-left: ${value}; margin-right: ${value};`);
    add(`.my-${key}`, `margin-top: ${value}; margin-bottom: ${value};`);
    add(`.mt-${key}`, `margin-top: ${value};`);
    add(`.mb-${key}`, `margin-bottom: ${value};`);
    add(`.ml-${key}`, `margin-left: ${value};`);
    add(`.mr-${key}`, `margin-right: ${value};`);
    // gap
    add(`.gap-${key}`, `gap: ${value};`);
    add(`.gap-x-${key}`, `column-gap: ${value};`);
    add(`.gap-y-${key}`, `row-gap: ${value};`);
    // width / height
    add(`.w-${key}`, `width: ${value};`);
    add(`.h-${key}`, `height: ${value};`);
    add(`.min-w-${key}`, `min-width: ${value};`);
    add(`.min-h-${key}`, `min-height: ${value};`);
  }

  // ─── FONT SIZE ────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(fontSizes)) {
    add(`.text-${key}`, `font-size: ${value};`);
  }

  // ─── FONT WEIGHT ──────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(fontWeights)) {
    add(`.font-${key}`, `font-weight: ${value};`);
  }

  // ─── BORDER RADIUS ────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(radii)) {
    add(`.rounded-${key}`, `border-radius: ${value};`);
  }

  // ─── SHADOWS ──────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(shadows)) {
    add(`.shadow-${key}`, `box-shadow: ${value};`);
  }

  // ─── OPACITY ──────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(opacity)) {
    add(`.opacity-${key}`, `opacity: ${value};`);
  }

  // ─── Z-INDEX ──────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(zIndex)) {
    add(`.z-${key}`, `z-index: ${value};`);
  }

  // ─── STATIC UTILITIES ─────────────────────────────────────────────────────

  // display
  add(".block", "display: block;");
  add(".inline", "display: inline;");
  add(".inline-block", "display: inline-block;");
  add(".flex", "display: flex;");
  add(".inline-flex", "display: inline-flex;");
  add(".grid", "display: grid;");
  add(".hidden", "display: none;");

  // flexbox
  add(".flex-row", "flex-direction: row;");
  add(".flex-col", "flex-direction: column;");
  add(".flex-wrap", "flex-wrap: wrap;");
  add(".flex-nowrap", "flex-wrap: nowrap;");
  add(".flex-1", "flex: 1 1 0%;");
  add(".flex-auto", "flex: 1 1 auto;");
  add(".flex-none", "flex: none;");
  add(".items-start", "align-items: flex-start;");
  add(".items-center", "align-items: center;");
  add(".items-end", "align-items: flex-end;");
  add(".items-stretch", "align-items: stretch;");
  add(".justify-start", "justify-content: flex-start;");
  add(".justify-center", "justify-content: center;");
  add(".justify-end", "justify-content: flex-end;");
  add(".justify-between", "justify-content: space-between;");
  add(".justify-around", "justify-content: space-around;");
  add(".self-start", "align-self: flex-start;");
  add(".self-center", "align-self: center;");
  add(".self-end", "align-self: flex-end;");

  // sizing
  add(".w-full", "width: 100%;");
  add(".w-screen", "width: 100vw;");
  add(".w-auto", "width: auto;");
  add(".h-full", "height: 100%;");
  add(".h-screen", "height: 100vh;");
  add(".h-auto", "height: auto;");
  add(".min-h-screen", "min-height: 100vh;");
  add(".max-w-sm", "max-width: 384px;");
  add(".max-w-md", "max-width: 512px;");
  add(".max-w-lg", "max-width: 672px;");
  add(".max-w-xl", "max-width: 800px;");
  add(".max-w-full", "max-width: 100%;");

  // position
  add(".relative", "position: relative;");
  add(".absolute", "position: absolute;");
  add(".fixed", "position: fixed;");
  add(".sticky", "position: sticky;");
  add(".static", "position: static;");
  add(".inset-0", "top: 0; right: 0; bottom: 0; left: 0;");
  add(".top-0", "top: 0;");
  add(".bottom-0", "bottom: 0;");
  add(".left-0", "left: 0;");
  add(".right-0", "right: 0;");

  // text
  add(".text-left", "text-align: left;");
  add(".text-center", "text-align: center;");
  add(".text-right", "text-align: right;");
  add(".text-justify", "text-align: justify;");
  add(".uppercase", "text-transform: uppercase;");
  add(".lowercase", "text-transform: lowercase;");
  add(".capitalize", "text-transform: capitalize;");
  add(".italic", "font-style: italic;");
  add(".not-italic", "font-style: normal;");
  add(".underline", "text-decoration: underline;");
  add(".line-through", "text-decoration: line-through;");
  add(".no-underline", "text-decoration: none;");
  add(
    ".truncate",
    "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
  );
  add(".leading-none", "line-height: 1;");
  add(".leading-tight", "line-height: 1.25;");
  add(".leading-normal", "line-height: 1.5;");
  add(".leading-loose", "line-height: 2;");
  add(".tracking-tight", "letter-spacing: -0.05em;");
  add(".tracking-normal", "letter-spacing: 0;");
  add(".tracking-wide", "letter-spacing: 0.1em;");

  // border
  add(".border", "border-width: 1px; border-style: solid;");
  add(".border-0", "border-width: 0;");
  add(".border-2", "border-width: 2px; border-style: solid;");
  add(".border-4", "border-width: 4px; border-style: solid;");
  add(".border-t", "border-top-width: 1px; border-top-style: solid;");
  add(".border-b", "border-bottom-width: 1px; border-bottom-style: solid;");
  add(".border-l", "border-left-width: 1px; border-left-style: solid;");
  add(".border-r", "border-right-width: 1px; border-right-style: solid;");
  add(".border-solid", "border-style: solid;");
  add(".border-dashed", "border-style: dashed;");
  add(".border-dotted", "border-style: dotted;");

  // overflow
  add(".overflow-hidden", "overflow: hidden;");
  add(".overflow-auto", "overflow: auto;");
  add(".overflow-scroll", "overflow: scroll;");
  add(".overflow-visible", "overflow: visible;");
  add(".overflow-x-auto", "overflow-x: auto;");
  add(".overflow-y-auto", "overflow-y: auto;");

  // cursor
  add(".cursor-pointer", "cursor: pointer;");
  add(".cursor-default", "cursor: default;");
  add(".cursor-not-allowed", "cursor: not-allowed;");

  // misc
  add(".select-none", "user-select: none;");
  add(".select-text", "user-select: text;");
  add(".pointer-events-none", "pointer-events: none;");
  add(".pointer-events-auto", "pointer-events: auto;");
  add(".visible", "visibility: visible;");
  add(".invisible", "visibility: hidden;");
  add(
    ".sr-only",
    "position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;",
  );
  add(".list-none", "list-style: none;");
  add(".appearance-none", "appearance: none;");
  add(".box-border", "box-sizing: border-box;");
  add(".box-content", "box-sizing: content-box;");

  // transition
  add(".transition", "transition: all 150ms ease;");
  add(".transition-fast", "transition: all 75ms ease;");
  add(".transition-slow", "transition: all 300ms ease;");
  add(".transition-none", "transition: none;");

  // ─── INJECT INTO <head> ───────────────────────────────────────────────────

  const style = document.createElement("style");
  style.setAttribute("data-mywind", "");
  style.textContent = rules.join("\n");
  document.head.appendChild(style);

  console.log(`[mywind] ${rules.length} utility classes injected ✓`);
})();
