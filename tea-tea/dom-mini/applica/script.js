// DOM Elements
const phoneContainer = document.getElementById("phone-container");
const phoneOuter = document.getElementById("phone-outer");
const cameraModule = document.getElementById("camera-module");
const cameraToggle = document.getElementById("camera-toggle");
const bodyToggle = document.getElementById("body-toggle");
const cameraLabel = document.getElementById("camera-label");
const bodyLabel = document.getElementById("body-label");
const dragBtn = document.getElementById("drag-btn");
const paletteModal = document.getElementById("palette-modal");
const generateBtn = document.getElementById("generate-btn");
const colorCards = document.querySelectorAll(".color-card");
const appIcons = document.querySelectorAll(".app-icon");

// ==================== Toggle Functions ====================

// Camera Style Toggle (Circle <-> Pill)
cameraToggle.addEventListener("change", () => {
  if (cameraToggle.checked) {
    cameraModule.classList.remove("circle-style");
    cameraModule.classList.add("pill-style");
    cameraLabel.textContent = "Pill";
  } else {
    cameraModule.classList.remove("pill-style");
    cameraModule.classList.add("circle-style");
    cameraLabel.textContent = "Circle";
  }
});

// Body Style Toggle (Rounded <-> Angular)
bodyToggle.addEventListener("change", () => {
  if (bodyToggle.checked) {
    phoneOuter.classList.remove("rounded");
    phoneOuter.classList.add("angular");
    bodyLabel.textContent = "Angular";
  } else {
    phoneOuter.classList.remove("angular");
    phoneOuter.classList.add("rounded");
    bodyLabel.textContent = "Rounded";
  }
});

// ==================== Drag Functionality ====================

let isDragging = false;
let startX, startY;
let phoneX = 0,
  phoneY = 0;

// Center the phone initially
function centerPhone() {
  const rect = phoneContainer.getBoundingClientRect();
  phoneX = (window.innerWidth - rect.width) / 2;
  phoneY = (window.innerHeight - rect.height) / 2;
  updatePhonePosition();
}

function updatePhonePosition() {
  phoneContainer.style.left = phoneX + "px";
  phoneContainer.style.top = phoneY + "px";
}

// Initialize position
window.addEventListener("load", centerPhone);
window.addEventListener("resize", centerPhone);

// Drag button - mouse events
phoneContainer.addEventListener("mousedown", (e) => {
  startDrag(e.clientX, e.clientY);
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    drag(e.clientX, e.clientY);
  }
});

document.addEventListener("mouseup", () => {
  stopDrag();
});

// Drag button - touch events
dragBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startDrag(touch.clientX, touch.clientY);
});

document.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    drag(touch.clientX, touch.clientY);
  }
});

document.addEventListener("touchend", () => {
  stopDrag();
});

function startDrag(clientX, clientY) {
  isDragging = true;
  startX = clientX - phoneX;
  startY = clientY - phoneY;
  phoneContainer.classList.add("draggable", "dragging");
  dragBtn.classList.add("dragging");
}

function drag(clientX, clientY) {
  if (!isDragging) return;

  phoneX = clientX - startX;
  phoneY = clientY - startY;

  // Keep phone within viewport bounds
  const rect = phoneContainer.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;

  phoneX = Math.max(0, Math.min(phoneX, maxX));
  phoneY = Math.max(0, Math.min(phoneY, maxY));

  updatePhonePosition();
}

function stopDrag() {
  isDragging = false;
  phoneContainer.classList.remove("draggable", "dragging");
  dragBtn.classList.remove("dragging");
}

// ==================== Color Palette Generator ====================

// Initial color palette
const initialColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181"];

// Set initial colors
function setInitialColors() {
  colorCards.forEach((card, index) => {
    const color = initialColors[index];
    const preview = card.querySelector(".color-preview");
    const code = card.querySelector(".color-code");
    preview.style.backgroundColor = color;
    code.textContent = color;
  });
}

setInitialColors();

// Generate random hex color
function generateRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Generate harmonious palette
function generatePalette() {
  const baseHue = Math.random() * 360;
  const colors = [];

  // Generate 5 colors with varying saturation and lightness
  for (let i = 0; i < 5; i++) {
    const hue = (baseHue + i * 30 + Math.random() * 20) % 360;
    const saturation = 60 + Math.random() * 30;
    const lightness = 45 + Math.random() * 25;
    colors.push(hslToHex(hue, saturation, lightness));
  }

  return colors;
}

// Convert HSL to Hex
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

// Generate new palette button
generateBtn.addEventListener("click", () => {
  const newColors = generatePalette();

  colorCards.forEach((card, index) => {
    const preview = card.querySelector(".color-preview");
    const code = card.querySelector(".color-code");

    // Add animation
    card.style.transform = "scale(0.95)";
    setTimeout(() => {
      preview.style.backgroundColor = newColors[index];
      code.textContent = newColors[index];
      card.style.transform = "translateX(0)";
    }, 100);
  });
});

// Copy color to clipboard
colorCards.forEach((card) => {
  card.addEventListener("click", async () => {
    const code = card.querySelector(".color-code");
    const colorValue = code.textContent;

    try {
      await navigator.clipboard.writeText(colorValue);
      card.classList.add("copied");

      setTimeout(() => {
        card.classList.remove("copied");
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  });
});

// ==================== App Modal Functions ====================

// Open palette app when clicked
appIcons.forEach((icon) => {
  icon.addEventListener("click", () => {
    const appName = icon.getAttribute("data-app");

    if (appName === "color-palette") {
      paletteModal.classList.add("active");
    }
  });
});

// Close modal
const closeBtn = paletteModal.querySelector(".close-btn");
closeBtn.addEventListener("click", () => {
  paletteModal.classList.remove("active");
});

// Close modal when clicking outside
paletteModal.addEventListener("click", (e) => {
  if (e.target === paletteModal) {
    paletteModal.classList.remove("active");
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && paletteModal.classList.contains("active")) {
    paletteModal.classList.remove("active");
  }
});

// ==================== Navigation Bar Functions ====================

const backBtn = document.querySelector(".nav-btn.back");
const homeBtn = document.querySelector(".nav-btn.home");
const recentBtn = document.querySelector(".nav-btn.recent");

backBtn.addEventListener("click", () => {
  // Close any open modal
  if (paletteModal.classList.contains("active")) {
    paletteModal.classList.remove("active");
  }
});

homeBtn.addEventListener("click", () => {
  // Return to home - close all modals
  paletteModal.classList.remove("active");
});

recentBtn.addEventListener("click", () => {
  // Could show recent apps - for now just a visual feedback
  recentBtn.style.transform = "scale(1.2)";
  setTimeout(() => {
    recentBtn.style.transform = "scale(1)";
  }, 200);
});

// ==================== Update Clock ====================

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const timeElement = document.querySelector(".time");
  if (timeElement) {
    timeElement.textContent = `${hours}:${minutes}`;
  }
}

// Update time immediately and every minute
updateTime();
setInterval(updateTime, 60000);
