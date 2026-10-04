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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function randomPosition() {
  const areaRect = choiceArea.getBoundingClientRect();
  const buttonRect = noBtn.getBoundingClientRect();

  const maxX = Math.max(6, areaRect.width - buttonRect.width - 6);
  const maxY = Math.max(6, areaRect.height - buttonRect.height - 6);

  const acceptRect = acceptBtn.getBoundingClientRect();
  const accept = {
    left: acceptRect.left - areaRect.left,
    top: acceptRect.top - areaRect.top,
    right: acceptRect.right - areaRect.left,
    bottom: acceptRect.bottom - areaRect.top
  };

  for (let i = 0; i < 30; i += 1) {
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    const candidate = {
      left: x,
      top: y,
      right: x + buttonRect.width,
      bottom: y + buttonRect.height
    };

    const safe = (
      candidate.right < accept.left - 15 ||
      candidate.left > accept.right + 15 ||
      candidate.bottom < accept.top - 15 ||
      candidate.top > accept.bottom + 15
    );

    if (safe) return { x, y };
  }

  return {
    x: Math.max(6, maxX * 0.66),
    y: Math.max(6, maxY * 0.55)
  };
}

function escapeNoButton() {
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
  if (event.pointerType !== "touch") {
    escapeNoButton();
  }
});

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  escapeNoButton();
});

noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  escapeNoButton();
}, { passive: false });

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