const ENDPOINT = ""; // Add your deployed HTTPS endpoint here to receive email notifications.

const noBtn = document.getElementById("noBtn");
const acceptBtn = document.getElementById("acceptBtn");
const choiceArea = document.getElementById("choiceArea");
const tease = document.getElementById("tease");
const success = document.getElementById("success");
const toast = document.getElementById("toast");

const teaseMessages = [
  "😂 لا لا... هاد الزر سريع شوي!",
  "حاولي مرة تانية 😏☕",
  "أوف... قريبة! بس لا 😂",
  "ليش عم تهربي من القهوة؟ 🤍",
  "شكلي مضطر أخليها أصعب 😌",
  "آخر فرصة... أو يمكن لا 😂"
];

let noAttempts = 0;
let touchMode = false;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function getSafePosition() {
  const area = choiceArea.getBoundingClientRect();
  const button = noBtn.getBoundingClientRect();

  const maxX = Math.max(8, area.width - button.width - 8);
  const maxY = Math.max(8, area.height - button.height - 8);

  let x = Math.random() * maxX;
  let y = Math.random() * maxY;

  // Keep the escape button away from the accept button.
  const acceptRect = acceptBtn.getBoundingClientRect();
  const localAccept = {
    left: acceptRect.left - area.left,
    top: acceptRect.top - area.top,
    right: acceptRect.right - area.left,
    bottom: acceptRect.bottom - area.top
  };

  for (let i = 0; i < 20; i++) {
    const candidate = { left: x, top: y, right: x + button.width, bottom: y + button.height };
    const overlap = !(
      candidate.right + 18 < localAccept.left ||
      candidate.left - 18 > localAccept.right ||
      candidate.bottom + 18 < localAccept.top ||
      candidate.top - 18 > localAccept.bottom
    );

    if (!overlap) break;

    x = Math.random() * maxX;
    y = Math.random() * maxY;
  }

  return { x, y };
}

function moveNoButton() {
  const { x, y } = getSafePosition();
  noBtn.classList.add("running");
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
  noBtn.style.transform = "none";

  tease.textContent = teaseMessages[Math.min(noAttempts, teaseMessages.length - 1)];
  tease.classList.add("show");
  noAttempts += 1;
}

function resetNoButton() {
  noBtn.classList.remove("running");
  noBtn.style.left = "";
  noBtn.style.top = "";
  noBtn.style.transform = "";
  tease.classList.remove("show");
}

function pointerNearNoButton(event) {
  if (event.pointerType === "touch") {
    touchMode = true;
    return;
  }

  if (!noBtn.matches(":hover")) return;
  moveNoButton();
}

noBtn.addEventListener("pointerenter", pointerNearNoButton);

noBtn.addEventListener("touchstart", (event) => {
  event.preventDefault();
  touchMode = true;
  moveNoButton();
}, { passive: false });

noBtn.addEventListener("focus", () => {
  if (touchMode) moveNoButton();
});

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButton();
});

acceptBtn.addEventListener("click", async () => {
  acceptBtn.disabled = true;
  noBtn.disabled = true;

  success.classList.remove("hidden");

  const payload = {
    event: "coffee_date_accepted",
    acceptedAt: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  if (!ENDPOINT) {
    showToast("تم تسجيل القبول محليًا — اربط ENDPOINT ليصلك الإيميل 🤍");
    return;
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    });

    if (!response.ok) throw new Error("Notification request failed");
    showToast("وصلتك الرسالة... وتم إبلاغ صاحب القهوة ☕🤍");
  } catch (error) {
    console.error(error);
    showToast("تم القبول 🤍 لكن تعذر إرسال الإشعار الآن.");
  }
});

window.addEventListener("resize", () => {
  if (!noBtn.classList.contains("running")) return;
  const { x, y } = getSafePosition();
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
});