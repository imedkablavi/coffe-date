const ENDPOINT = "";

const noBtn = document.getElementById("noBtn");
const acceptBtn = document.getElementById("acceptBtn");
const choiceArea = document.getElementById("choiceArea");
const tease = document.getElementById("tease");
const success = document.getElementById("success");
const toast = document.getElementById("toast");

const teaseMessages = [
  "😂 لا، هاد الزر عم يهرب منك.",
  "قريبة... بس مو كفاية 😏",
  "واضح إن كلمة «لا» مستحية اليوم 🙈",
  "عم جرّب ساعدك... بس الزر مش متعاون 😂",
  "خلص، شكله ما بده ينكبس.",
  "يمكن «أكيد أقبل» أسهل شوي؟ ☕"
];

let attempts = 0;
let toastTimer;
let lastEscapeAt = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function randomPosition() {
  const areaRect = choiceArea.getBoundingClientRect();
  const buttonRect = noBtn.getBoundingClientRect();
  const acceptRect = acceptBtn.getBoundingClientRect();

  const maxX = Math.max(6, areaRect.width - buttonRect.width - 6);
  const messageSafeSpace = Math.min(46, areaRect.height * 0.28);
  const maxY = Math.max(6, areaRect.height - buttonRect.height - messageSafeSpace - 6);

  const accept = {
    left: acceptRect.left - areaRect.left,
    top: acceptRect.top - areaRect.top,
    right: acceptRect.right - areaRect.left,
    bottom: acceptRect.bottom - areaRect.top
  };

  // Keep the escaping button well away from the accept button.
  const padding = 20;

  for (let i = 0; i < 80; i += 1) {
    const x = 6 + Math.random() * Math.max(0, maxX - 6);
    const y = 6 + Math.random() * Math.max(0, maxY - 6);

    const candidate = {
      left: x,
      top: y,
      right: x + buttonRect.width,
      bottom: y + buttonRect.height
    };

    const overlapsAccept = !(
      candidate.right < accept.left - padding ||
      candidate.left > accept.right + padding ||
      candidate.bottom < accept.top - padding ||
      candidate.top > accept.bottom + padding
    );

    if (!overlapsAccept) {
      return { x, y };
    }
  }

  // Deterministic fallback: put it in the lower-left safe zone.
  return {
    x: 6,
    y: Math.max(6, maxY)
  };
}

function escapeNoButton() {
  const now = performance.now();
  if (now - lastEscapeAt < 120) return;
  lastEscapeAt = now;

  const { x, y } = randomPosition();

  noBtn.classList.add("running");
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = "none";

  tease.textContent = teaseMessages[Math.min(attempts, teaseMessages.length - 1)];
  tease.classList.add("show");
  attempts += 1;
}

noBtn.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") {
    escapeNoButton();
  }
});

noBtn.addEventListener("pointerdown", (event) => {
  if (event.pointerType === "touch" || event.pointerType === "pen") {
    event.preventDefault();
    escapeNoButton();
  }
});

noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  escapeNoButton();
}, { passive: false });

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  // Mobile browsers may still synthesize a click after a touch.
  // The button must never become clickable.
  if (performance.now() - lastEscapeAt > 180) {
    escapeNoButton();
  }
});

noBtn.addEventListener("focus", () => {
  escapeNoButton();
});

acceptBtn.addEventListener("click", async () => {
  acceptBtn.disabled = true;
  noBtn.disabled = true;
  success.classList.remove("hidden");

  if (!ENDPOINT) return;

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "coffee_date_accepted",
        acceptedAt: new Date().toISOString()
      }),
      keepalive: true
    });

    if (!response.ok) throw new Error("Request failed");
  } catch (error) {
    console.error(error);
    showToast("صار في مشكلة صغيرة، بس الجواب وصل 🤍");
  }
});

window.addEventListener("resize", () => {
  if (!noBtn.classList.contains("running")) return;
  const { x, y } = randomPosition();
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
});