(function () {
  const colors = {
    // chaicode brand
    chaicode: "#f97316",
    "chaicode-dark": "#1a1a2e",

    // hitesh sir
    chai: "#c8843a",
    adrak: "#d4a056",
    masala: "#8b4513",
    kulhad: "#b5651d",

    // piyush sir
    piyush: "#ec4899",
    "piyush-light": "#f9a8d4",
    "piyush-dark": "#be185d",

    // akash sir - mac colors
    "akash-mac-midnight": "#1d1d1f",
    "akash-mac-spacegray": "#86868b",
    "akash-mac-silver": "#e8e8ed",
    "akash-mac-blue": "#0071e3",
    "akash-mac-graphite": "#a1a1a6",
    "akash-mac-gold": "#f5a623",
    "akash-mac-purple": "#a855f7",
    "akash-mac-green": "#34c759",

    // basics
    white: "#ffffff",
    black: "#000000",
    gray: "#6b7280",
    red: "#ef4444",
    green: "#22c55e",
    blue: "#3b82f6",
  };

  const spacing = {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    6: "24px",
    8: "32px",
    10: "40px",
    12: "48px",
  };

  const fontSizes = {
    sm: "14px",
    base: "16px",
    lg: "20px",
    xl: "24px",
    "2xl": "32px",
  };

  const radii = {
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  };

  // ─── build ----------

  const rules = [];

  function add(selector, declarations) {
    rules.push(`${selector} { ${declarations} }`);
  }

  // colors
  for (const [name, value] of Object.entries(colors)) {
    add(`.text-${name}`, `color: ${value};`);
    add(`.bg-${name}`, `background-color: ${value};`);
    add(`.border-${name}`, `border-color: ${value};`);
  }

  // spacing
  for (const [key, value] of Object.entries(spacing)) {
    add(`.p-${key}`, `padding: ${value};`);
    add(`.px-${key}`, `padding-left: ${value}; padding-right: ${value};`);
    add(`.py-${key}`, `padding-top: ${value}; padding-bottom: ${value};`);
    add(`.m-${key}`, `margin: ${value};`);
    add(`.mx-${key}`, `margin-left: ${value}; margin-right: ${value};`);
    add(`.my-${key}`, `margin-top: ${value}; margin-bottom: ${value};`);
    add(`.gap-${key}`, `gap: ${value};`);
  }

  // font sizes
  for (const [key, value] of Object.entries(fontSizes)) {
    add(`.text-${key}`, `font-size: ${value};`);
  }

  // border radius
  for (const [key, value] of Object.entries(radii)) {
    add(`.rounded-${key}`, `border-radius: ${value};`);
  }

  // static utilities
  add(".flex", "display: flex;");
  add(".flex-col", "flex-direction: column;");
  add(".flex-row", "flex-direction: row;");
  add(".items-center", "align-items: center;");
  add(".justify-center", "justify-content: center;");
  add(".justify-between", "justify-content: space-between;");
  add(".w-full", "width: 100%;");
  add(".h-full", "height: 100%;");
  add(".hidden", "display: none;");
  add(".block", "display: block;");
  add(".inline-block", "display: inline-block;");
  add(".text-center", "text-align: center;");
  add(".font-bold", "font-weight: 700;");
  add(".font-normal", "font-weight: 400;");
  add(".border", "border-width: 1px; border-style: solid;");
  add(".cursor-pointer", "cursor: pointer;");
  add(".transition", "transition: all 150ms ease;");
  add(".overflow-hidden", "overflow: hidden;");
  add(".relative", "position: relative;");
  add(".absolute", "position: absolute;");

  // ─── inject -----

  const style = document.createElement("style");
  style.setAttribute("id", "chaiwind");
  style.textContent = rules.join("\n");
  document.head.appendChild(style);

  console.log(
    `%c☕ chaiwind ready — ${rules.length} classes`,
    "color: #c8843a; font-weight: bold;",
  );
})();
