/**
 *  ██████╗██╗  ██╗ █████╗ ██╗██╗    ██╗██╗███╗   ██╗██████╗
 * ██╔════╝██║  ██║██╔══██╗██║██║    ██║██║████╗  ██║██╔══██╗
 * ██║     ███████║███████║██║██║ █╗ ██║██║██╔██╗ ██║██║  ██║
 * ██║     ██╔══██║██╔══██║██║██║███╗██║██║██║╚██╗██║██║  ██║
 * ╚██████╗██║  ██║██║  ██║██║╚███╔███╔╝██║██║ ╚████║██████╔╝
 *  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝╚═════╝
 *
 *  chaiwind.js — a CSS utility framework by a ChaiCode student
 *
 *  Inspired by the ChaiCode family:
 *
 *  ☕  Hitesh sir    — chai colors  (bg-chai, bg-adrak, bg-masala...)
 *  🩷  Piyush sir   — pink palette (bg-piyush, bg-rose, bg-blush...)
 *  🍎  Akash sir    — Apple/Mac    (bg-midnight, bg-silver, bg-spacegray...)
 *  🔥  ChaiCode     — brand colors (bg-chaicode, text-brand...)
 *
 *  Usage:
 *    <script src="chaiwind.js"></script>
 *    <div class="bg-chai text-white p-4 rounded-md">Haanji!</div>
 */

;(function () {

  // ─────────────────────────────────────────────────────────────────────────
  //  TOKENS
  // ─────────────────────────────────────────────────────────────────────────

  const colors = {

    // ── ChaiCode brand ───────────────────────────────────────────────────
    // The orange fire of chaicode.com
    'chaicode':       '#f97316',   // main brand orange
    'chaicode-dark':  '#1a1a2e',   // deep dark background (used on site)
    'brand':          '#f97316',   // alias
    'brand-dark':     '#ea6c0a',   // slightly deeper orange

    // ── ☕ Hitesh sir — Chai palette ──────────────────────────────────────
    // Warm, earthy, masala-coded — just like his teaching vibe
    'chai':           '#c8843a',   // classic cutting chai brown
    'adrak':          '#d4a056',   // ginger / adrak gold
    'masala':         '#8b4513',   // deep masala brown
    'elaichi':        '#c3a35d',   // cardamom / elaichi tan
    'dudh':           '#f5f0e8',   // milk chai — creamy off-white
    'tapri':          '#6b3a2a',   // tapri dark — deep roasted
    'kulhad':         '#b5651d',   // clay kulhad orange-brown

    // ── 🩷 Piyush sir — Pink palette ────────────────────────────────────
    // From hot pink to soft blush — all shades of piyush
    'piyush':         '#ec4899',   // signature hot pink
    'piyush-light':   '#f9a8d4',   // soft blush pink
    'piyush-dark':    '#be185d',   // deep magenta
    'rose':           '#fb7185',   // rose red-pink
    'blush':          '#fce7f3',   // barely-there blush
    'fuschia':        '#d946ef',   // electric fuschia
    'lipstick':       '#c2185b',   // bold lipstick red-pink

    // ── 🍎 Akash sir — Apple / Mac palette ──────────────────────────────
    // Clean, minimal, premium — just like macOS
    'midnight':       '#1d1d1f',   // Apple midnight black
    'spacegray':      '#86868b',   // Mac Space Gray
    'silver':         '#e8e8ed',   // Mac Silver
    'starlight':      '#f5f1eb',   // MacBook Starlight
    'macos-blue':     '#0071e3',   // Apple blue (buttons, links)
    'macos-green':    '#34c759',   // Apple green (battery full)
    'macos-red':      '#ff3b30',   // Apple red (close button)
    'aluminum':       '#d1d1d6',   // aluminum body grey

    // ── General utility ──────────────────────────────────────────────────
    'white':          '#ffffff',
    'black':          '#000000',
    'transparent':    'transparent',

    // neutrals
    'gray-50':        '#f9fafb',
    'gray-100':       '#f3f4f6',
    'gray-200':       '#e5e7eb',
    'gray-300':       '#d1d5db',
    'gray-400':       '#9ca3af',
    'gray-500':       '#6b7280',
    'gray-600':       '#4b5563',
    'gray-700':       '#374151',
    'gray-800':       '#1f2937',
    'gray-900':       '#111827',

    // accents
    'blue':           '#3b82f6',
    'green':          '#22c55e',
    'yellow':         '#eab308',
    'red':            '#ef4444',
    'purple':         '#a855f7',
    'orange':         '#f97316',
    'teal':           '#14b8a6',
    'indigo':         '#6366f1',
  }

  const spacing = {
    '0':   '0px',
    '1':   '4px',
    '2':   '8px',
    '3':   '12px',
    '4':   '16px',
    '5':   '20px',
    '6':   '24px',
    '7':   '28px',
    '8':   '32px',
    '9':   '36px',
    '10':  '40px',
    '12':  '48px',
    '14':  '56px',
    '16':  '64px',
    '20':  '80px',
    '24':  '96px',
    '32':  '128px',
  }

  const fontSizes = {
    'xs':   '11px',
    'sm':   '13px',
    'base': '16px',
    'lg':   '18px',
    'xl':   '20px',
    '2xl':  '24px',
    '3xl':  '30px',
    '4xl':  '36px',
    '5xl':  '48px',
    '6xl':  '64px',
  }

  const fontWeights = {
    'thin':    '100',
    'light':   '300',
    'normal':  '400',
    'medium':  '500',
    'semibold':'600',
    'bold':    '700',
    'black':   '900',
  }

  const lineHeights = {
    'none':   '1',
    'tight':  '1.25',
    'snug':   '1.375',
    'normal': '1.5',
    'relaxed':'1.625',
    'loose':  '2',
  }

  const radii = {
    'none': '0px',
    'sm':   '4px',
    'md':   '8px',
    'lg':   '12px',
    'xl':   '16px',
    '2xl':  '24px',
    'full': '9999px',
  }

  const shadows = {
    'sm':   '0 1px 3px rgba(0,0,0,0.10)',
    'md':   '0 4px 12px rgba(0,0,0,0.12)',
    'lg':   '0 8px 24px rgba(0,0,0,0.15)',
    'xl':   '0 16px 48px rgba(0,0,0,0.20)',
    // Chai-themed shadows
    'chai': '0 4px 20px rgba(200,132,58,0.35)',    // warm chai glow
    'piyush':'0 4px 20px rgba(236,72,153,0.30)',   // piyush pink glow
    'mac':  '0 8px 32px rgba(29,29,31,0.25)',      // mac-style shadow
    'none': 'none',
  }

  const opacity = {
    '0':   '0',
    '10':  '0.1',
    '20':  '0.2',
    '25':  '0.25',
    '30':  '0.3',
    '40':  '0.4',
    '50':  '0.5',
    '60':  '0.6',
    '70':  '0.7',
    '75':  '0.75',
    '80':  '0.8',
    '90':  '0.9',
    '100': '1',
  }

  const zIndex = {
    '0': '0', '10': '10', '20': '20',
    '30': '30', '40': '40', '50': '50', 'auto': 'auto',
  }

  const screens = {
    'sm':  '640px',
    'md':  '768px',
    'lg':  '1024px',
    'xl':  '1280px',
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RULE BUILDER
  // ─────────────────────────────────────────────────────────────────────────

  const rules = []

  function add(selector, declarations) {
    rules.push(`${selector} { ${declarations} }`)
  }

  function addResponsive(selector, declarations) {
    // base class
    add(selector, declarations)
    // responsive variants: sm:, md:, lg:, xl:
    for (const [prefix, minWidth] of Object.entries(screens)) {
      rules.push(
        `@media (min-width: ${minWidth}) { ${prefix}\\:${selector.slice(1)} { ${declarations} } }`
      )
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  COLORS
  // ─────────────────────────────────────────────────────────────────────────

  for (const [name, value] of Object.entries(colors)) {
    add(`.text-${name}`,    `color: ${value};`)
    add(`.bg-${name}`,      `background-color: ${value};`)
    add(`.border-${name}`,  `border-color: ${value};`)
    add(`.fill-${name}`,    `fill: ${value};`)
    add(`.stroke-${name}`,  `stroke: ${value};`)
    // hover variants
    add(`.hover\\:text-${name}:hover`,   `color: ${value};`)
    add(`.hover\\:bg-${name}:hover`,     `background-color: ${value};`)
    add(`.hover\\:border-${name}:hover`, `border-color: ${value};`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  SPACING  (padding, margin, gap, width, height)
  // ─────────────────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(spacing)) {
    // padding
    add(`.p-${key}`,   `padding: ${value};`)
    add(`.px-${key}`,  `padding-left: ${value}; padding-right: ${value};`)
    add(`.py-${key}`,  `padding-top: ${value}; padding-bottom: ${value};`)
    add(`.pt-${key}`,  `padding-top: ${value};`)
    add(`.pb-${key}`,  `padding-bottom: ${value};`)
    add(`.pl-${key}`,  `padding-left: ${value};`)
    add(`.pr-${key}`,  `padding-right: ${value};`)
    // margin
    add(`.m-${key}`,   `margin: ${value};`)
    add(`.mx-${key}`,  `margin-left: ${value}; margin-right: ${value};`)
    add(`.my-${key}`,  `margin-top: ${value}; margin-bottom: ${value};`)
    add(`.mt-${key}`,  `margin-top: ${value};`)
    add(`.mb-${key}`,  `margin-bottom: ${value};`)
    add(`.ml-${key}`,  `margin-left: ${value};`)
    add(`.mr-${key}`,  `margin-right: ${value};`)
    // gap
    add(`.gap-${key}`,   `gap: ${value};`)
    add(`.gap-x-${key}`, `column-gap: ${value};`)
    add(`.gap-y-${key}`, `row-gap: ${value};`)
    // sizing
    add(`.w-${key}`,     `width: ${value};`)
    add(`.h-${key}`,     `height: ${value};`)
    add(`.min-w-${key}`, `min-width: ${value};`)
    add(`.min-h-${key}`, `min-height: ${value};`)
    add(`.max-w-${key}`, `max-width: ${value};`)
    add(`.max-h-${key}`, `max-height: ${value};`)
    // top / right / bottom / left
    add(`.top-${key}`,    `top: ${value};`)
    add(`.bottom-${key}`, `bottom: ${value};`)
    add(`.left-${key}`,   `left: ${value};`)
    add(`.right-${key}`,  `right: ${value};`)
  }

  // negative margin
  for (const [key, value] of Object.entries(spacing)) {
    if (key === '0') continue
    const neg = value.replace('px', '')
    add(`.-m-${key}`,  `margin: -${value};`)
    add(`.-mt-${key}`, `margin-top: -${value};`)
    add(`.-mb-${key}`, `margin-bottom: -${value};`)
    add(`.-ml-${key}`, `margin-left: -${value};`)
    add(`.-mr-${key}`, `margin-right: -${value};`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  TYPOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(fontSizes)) {
    add(`.text-${key}`, `font-size: ${value};`)
  }

  for (const [key, value] of Object.entries(fontWeights)) {
    add(`.font-${key}`, `font-weight: ${value};`)
  }

  for (const [key, value] of Object.entries(lineHeights)) {
    add(`.leading-${key}`, `line-height: ${value};`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  BORDER RADIUS
  // ─────────────────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(radii)) {
    add(`.rounded-${key}`, `border-radius: ${value};`)
    add(`.rounded-t-${key}`, `border-top-left-radius: ${value}; border-top-right-radius: ${value};`)
    add(`.rounded-b-${key}`, `border-bottom-left-radius: ${value}; border-bottom-right-radius: ${value};`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  SHADOWS
  // ─────────────────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(shadows)) {
    add(`.shadow-${key}`, `box-shadow: ${value};`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  OPACITY  &  Z-INDEX
  // ─────────────────────────────────────────────────────────────────────────

  for (const [key, value] of Object.entries(opacity)) {
    add(`.opacity-${key}`, `opacity: ${value};`)
  }

  for (const [key, value] of Object.entries(zIndex)) {
    add(`.z-${key}`, `z-index: ${value};`)
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  STATIC UTILITIES
  // ─────────────────────────────────────────────────────────────────────────

  // display
  add('.block',        'display: block;')
  add('.inline',       'display: inline;')
  add('.inline-block', 'display: inline-block;')
  add('.flex',         'display: flex;')
  add('.inline-flex',  'display: inline-flex;')
  add('.grid',         'display: grid;')
  add('.hidden',       'display: none;')
  add('.contents',     'display: contents;')

  // flexbox
  add('.flex-row',      'flex-direction: row;')
  add('.flex-row-reverse', 'flex-direction: row-reverse;')
  add('.flex-col',      'flex-direction: column;')
  add('.flex-col-reverse', 'flex-direction: column-reverse;')
  add('.flex-wrap',     'flex-wrap: wrap;')
  add('.flex-nowrap',   'flex-wrap: nowrap;')
  add('.flex-1',        'flex: 1 1 0%;')
  add('.flex-auto',     'flex: 1 1 auto;')
  add('.flex-none',     'flex: none;')
  add('.flex-shrink-0', 'flex-shrink: 0;')
  add('.flex-grow',     'flex-grow: 1;')
  add('.items-start',   'align-items: flex-start;')
  add('.items-center',  'align-items: center;')
  add('.items-end',     'align-items: flex-end;')
  add('.items-stretch', 'align-items: stretch;')
  add('.items-baseline','align-items: baseline;')
  add('.justify-start',    'justify-content: flex-start;')
  add('.justify-center',   'justify-content: center;')
  add('.justify-end',      'justify-content: flex-end;')
  add('.justify-between',  'justify-content: space-between;')
  add('.justify-around',   'justify-content: space-around;')
  add('.justify-evenly',   'justify-content: space-evenly;')
  add('.self-start',    'align-self: flex-start;')
  add('.self-center',   'align-self: center;')
  add('.self-end',      'align-self: flex-end;')
  add('.self-stretch',  'align-self: stretch;')

  // grid
  add('.grid-cols-1',  'grid-template-columns: repeat(1, 1fr);')
  add('.grid-cols-2',  'grid-template-columns: repeat(2, 1fr);')
  add('.grid-cols-3',  'grid-template-columns: repeat(3, 1fr);')
  add('.grid-cols-4',  'grid-template-columns: repeat(4, 1fr);')
  add('.grid-cols-5',  'grid-template-columns: repeat(5, 1fr);')
  add('.grid-cols-6',  'grid-template-columns: repeat(6, 1fr);')
  add('.col-span-1',   'grid-column: span 1;')
  add('.col-span-2',   'grid-column: span 2;')
  add('.col-span-3',   'grid-column: span 3;')
  add('.col-span-4',   'grid-column: span 4;')
  add('.col-span-full','grid-column: 1 / -1;')
  add('.grid-rows-1',  'grid-template-rows: repeat(1, 1fr);')
  add('.grid-rows-2',  'grid-template-rows: repeat(2, 1fr);')
  add('.grid-rows-3',  'grid-template-rows: repeat(3, 1fr);')

  // sizing
  add('.w-full',       'width: 100%;')
  add('.w-screen',     'width: 100vw;')
  add('.w-auto',       'width: auto;')
  add('.w-1\\/2',      'width: 50%;')
  add('.w-1\\/3',      'width: 33.333%;')
  add('.w-2\\/3',      'width: 66.666%;')
  add('.w-1\\/4',      'width: 25%;')
  add('.w-3\\/4',      'width: 75%;')
  add('.h-full',       'height: 100%;')
  add('.h-screen',     'height: 100vh;')
  add('.h-auto',       'height: auto;')
  add('.min-h-screen', 'min-height: 100vh;')
  add('.min-h-full',   'min-height: 100%;')
  add('.max-w-sm',     'max-width: 384px;')
  add('.max-w-md',     'max-width: 448px;')
  add('.max-w-lg',     'max-width: 512px;')
  add('.max-w-xl',     'max-width: 576px;')
  add('.max-w-2xl',    'max-width: 672px;')
  add('.max-w-3xl',    'max-width: 768px;')
  add('.max-w-4xl',    'max-width: 896px;')
  add('.max-w-5xl',    'max-width: 1024px;')
  add('.max-w-full',   'max-width: 100%;')
  add('.max-w-screen-sm', 'max-width: 640px;')
  add('.max-w-screen-md', 'max-width: 768px;')
  add('.max-w-screen-lg', 'max-width: 1024px;')
  add('.max-w-screen-xl', 'max-width: 1280px;')

  // position
  add('.relative', 'position: relative;')
  add('.absolute', 'position: absolute;')
  add('.fixed',    'position: fixed;')
  add('.sticky',   'position: sticky;')
  add('.static',   'position: static;')
  add('.inset-0',  'top: 0; right: 0; bottom: 0; left: 0;')
  add('.inset-x-0','left: 0; right: 0;')
  add('.inset-y-0','top: 0; bottom: 0;')
  add('.top-0',    'top: 0;')
  add('.bottom-0', 'bottom: 0;')
  add('.left-0',   'left: 0;')
  add('.right-0',  'right: 0;')

  // text alignment
  add('.text-left',    'text-align: left;')
  add('.text-center',  'text-align: center;')
  add('.text-right',   'text-align: right;')
  add('.text-justify', 'text-align: justify;')

  // text transform & decoration
  add('.uppercase',     'text-transform: uppercase;')
  add('.lowercase',     'text-transform: lowercase;')
  add('.capitalize',    'text-transform: capitalize;')
  add('.normal-case',   'text-transform: none;')
  add('.italic',        'font-style: italic;')
  add('.not-italic',    'font-style: normal;')
  add('.underline',     'text-decoration: underline;')
  add('.line-through',  'text-decoration: line-through;')
  add('.no-underline',  'text-decoration: none;')
  add('.truncate',      'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;')
  add('.whitespace-nowrap',  'white-space: nowrap;')
  add('.whitespace-pre',     'white-space: pre;')
  add('.whitespace-normal',  'white-space: normal;')
  add('.break-words',   'overflow-wrap: break-word;')
  add('.break-all',     'word-break: break-all;')

  // letter spacing
  add('.tracking-tighter', 'letter-spacing: -0.075em;')
  add('.tracking-tight',   'letter-spacing: -0.05em;')
  add('.tracking-normal',  'letter-spacing: 0;')
  add('.tracking-wide',    'letter-spacing: 0.05em;')
  add('.tracking-wider',   'letter-spacing: 0.1em;')
  add('.tracking-widest',  'letter-spacing: 0.2em;')

  // border
  add('.border',        'border-width: 1px; border-style: solid;')
  add('.border-0',      'border-width: 0;')
  add('.border-2',      'border-width: 2px; border-style: solid;')
  add('.border-4',      'border-width: 4px; border-style: solid;')
  add('.border-8',      'border-width: 8px; border-style: solid;')
  add('.border-t',      'border-top-width: 1px; border-top-style: solid;')
  add('.border-b',      'border-bottom-width: 1px; border-bottom-style: solid;')
  add('.border-l',      'border-left-width: 1px; border-left-style: solid;')
  add('.border-r',      'border-right-width: 1px; border-right-style: solid;')
  add('.border-solid',  'border-style: solid;')
  add('.border-dashed', 'border-style: dashed;')
  add('.border-dotted', 'border-style: dotted;')
  add('.border-none',   'border-style: none;')
  add('.outline-none',  'outline: none;')
  add('.ring',          'box-shadow: 0 0 0 3px rgba(249,115,22,0.5);') // chai orange ring!
  add('.ring-piyush',   'box-shadow: 0 0 0 3px rgba(236,72,153,0.5);')
  add('.ring-mac',      'box-shadow: 0 0 0 3px rgba(0,113,227,0.5);')

  // overflow
  add('.overflow-hidden',   'overflow: hidden;')
  add('.overflow-auto',     'overflow: auto;')
  add('.overflow-scroll',   'overflow: scroll;')
  add('.overflow-visible',  'overflow: visible;')
  add('.overflow-x-auto',   'overflow-x: auto;')
  add('.overflow-y-auto',   'overflow-y: auto;')
  add('.overflow-x-hidden', 'overflow-x: hidden;')
  add('.overflow-y-hidden', 'overflow-y: hidden;')

  // cursor
  add('.cursor-pointer',     'cursor: pointer;')
  add('.cursor-default',     'cursor: default;')
  add('.cursor-not-allowed', 'cursor: not-allowed;')
  add('.cursor-wait',        'cursor: wait;')
  add('.cursor-text',        'cursor: text;')
  add('.cursor-move',        'cursor: move;')
  add('.cursor-grab',        'cursor: grab;')

  // misc
  add('.select-none',           'user-select: none;')
  add('.select-text',           'user-select: text;')
  add('.select-all',            'user-select: all;')
  add('.pointer-events-none',   'pointer-events: none;')
  add('.pointer-events-auto',   'pointer-events: auto;')
  add('.visible',               'visibility: visible;')
  add('.invisible',             'visibility: hidden;')
  add('.sr-only',               'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;')
  add('.list-none',             'list-style: none;')
  add('.list-disc',             'list-style-type: disc;')
  add('.list-decimal',          'list-style-type: decimal;')
  add('.appearance-none',       'appearance: none; -webkit-appearance: none;')
  add('.box-border',            'box-sizing: border-box;')
  add('.box-content',           'box-sizing: content-box;')
  add('.object-cover',          'object-fit: cover;')
  add('.object-contain',        'object-fit: contain;')
  add('.object-center',         'object-position: center;')
  add('.resize-none',           'resize: none;')

  // transitions
  add('.transition',         'transition: all 150ms ease;')
  add('.transition-colors',  'transition: color 150ms ease, background-color 150ms ease, border-color 150ms ease;')
  add('.transition-opacity', 'transition: opacity 150ms ease;')
  add('.transition-transform','transition: transform 150ms ease;')
  add('.transition-fast',    'transition: all 75ms ease;')
  add('.transition-slow',    'transition: all 300ms ease;')
  add('.transition-none',    'transition: none;')
  add('.duration-75',        'transition-duration: 75ms;')
  add('.duration-150',       'transition-duration: 150ms;')
  add('.duration-300',       'transition-duration: 300ms;')
  add('.duration-500',       'transition-duration: 500ms;')
  add('.ease-in',            'transition-timing-function: cubic-bezier(0.4, 0, 1, 1);')
  add('.ease-out',           'transition-timing-function: cubic-bezier(0, 0, 0.2, 1);')
  add('.ease-in-out',        'transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);')

  // transform
  add('.scale-90',     'transform: scale(0.9);')
  add('.scale-95',     'transform: scale(0.95);')
  add('.scale-100',    'transform: scale(1);')
  add('.scale-105',    'transform: scale(1.05);')
  add('.scale-110',    'transform: scale(1.1);')
  add('.rotate-45',    'transform: rotate(45deg);')
  add('.rotate-90',    'transform: rotate(90deg);')
  add('.rotate-180',   'transform: rotate(180deg);')
  add('.-rotate-45',   'transform: rotate(-45deg);')
  add('.translate-x-0','transform: translateX(0);')
  add('.translate-y-0','transform: translateY(0);')
  add('.-translate-y-1','transform: translateY(-4px);')
  add('.-translate-y-2','transform: translateY(-8px);')
  add('.hover\\:scale-105:hover', 'transform: scale(1.05);')
  add('.hover\\:scale-110:hover', 'transform: scale(1.10);')
  add('.hover\\:-translate-y-1:hover', 'transform: translateY(-4px);')
  add('.hover\\:-translate-y-2:hover', 'transform: translateY(-8px);')

  // ─────────────────────────────────────────────────────────────────────────
  //  🎁 CHAICODE SPECIAL COMPONENTS
  //  Ready-made combos named after the team — use as single classes
  // ─────────────────────────────────────────────────────────────────────────

  // .btn-chai — Hitesh sir's warm chai button
  add('.btn-chai',
    `display: inline-flex; align-items: center; justify-content: center;
     padding: 10px 20px; background-color: #c8843a; color: #fff;
     font-weight: 600; border-radius: 8px; border: none; cursor: pointer;
     transition: all 150ms ease; box-shadow: 0 4px 14px rgba(200,132,58,0.35);`)
  add('.btn-chai:hover', 'background-color: #b5651d; transform: translateY(-1px);')

  // .btn-piyush — Piyush sir's pink button
  add('.btn-piyush',
    `display: inline-flex; align-items: center; justify-content: center;
     padding: 10px 20px; background-color: #ec4899; color: #fff;
     font-weight: 600; border-radius: 8px; border: none; cursor: pointer;
     transition: all 150ms ease; box-shadow: 0 4px 14px rgba(236,72,153,0.30);`)
  add('.btn-piyush:hover', 'background-color: #be185d; transform: translateY(-1px);')

  // .btn-mac — Akash sir's Apple-style button
  add('.btn-mac',
    `display: inline-flex; align-items: center; justify-content: center;
     padding: 10px 20px; background-color: #0071e3; color: #fff;
     font-weight: 500; border-radius: 980px; border: none; cursor: pointer;
     transition: all 150ms ease; font-size: 15px; letter-spacing: -0.01em;`)
  add('.btn-mac:hover', 'background-color: #0077ed; transform: translateY(-1px);')

  // .card-chai — warm card with chai vibes
  add('.card-chai',
    `background-color: #fff8f0; border: 1px solid #e8c99a;
     border-radius: 12px; padding: 24px;
     box-shadow: 0 4px 20px rgba(200,132,58,0.15);`)

  // .card-piyush — pink-tinted card
  add('.card-piyush',
    `background-color: #fdf2f8; border: 1px solid #f9a8d4;
     border-radius: 12px; padding: 24px;
     box-shadow: 0 4px 20px rgba(236,72,153,0.12);`)

  // .card-mac — clean Apple-style card
  add('.card-mac',
    `background-color: #ffffff; border: 1px solid #e8e8ed;
     border-radius: 18px; padding: 24px;
     box-shadow: 0 4px 24px rgba(0,0,0,0.08);`)

  // .badge-chai / .badge-piyush
  add('.badge-chai',
    `display: inline-block; background-color: #fef3e2; color: #92400e;
     font-size: 12px; font-weight: 600; padding: 2px 10px;
     border-radius: 9999px; border: 1px solid #fcd34d;`)
  add('.badge-piyush',
    `display: inline-block; background-color: #fdf2f8; color: #9d174d;
     font-size: 12px; font-weight: 600; padding: 2px 10px;
     border-radius: 9999px; border: 1px solid #f9a8d4;`)
  add('.badge-mac',
    `display: inline-block; background-color: #f5f5f7; color: #1d1d1f;
     font-size: 12px; font-weight: 500; padding: 2px 10px;
     border-radius: 9999px; border: 1px solid #d1d1d6;`)

  // .hero-chaicode — dark hero section with brand orange
  add('.hero-chaicode',
    `background-color: #1a1a2e; color: #ffffff;
     padding: 80px 24px; text-align: center;
     border-bottom: 3px solid #f97316;`)

  // ─────────────────────────────────────────────────────────────────────────
  //  INJECT INTO <head>
  // ─────────────────────────────────────────────────────────────────────────

  const style = document.createElement('style')
  style.setAttribute('id', 'chaiwind')
  style.textContent = rules.join('\n')
  document.head.appendChild(style)

  console.log(
    `%c☕ chaiwind loaded — ${rules.length} classes injected`,
    'color: #c8843a; font-weight: bold; font-size: 13px;'
  )
  console.log(
    '%c  Hitesh sir 🍵  Piyush sir 🩷  Akash sir 🍎  ChaiCode 🔥',
    'color: #6b7280; font-size: 11px;'
  )

})()