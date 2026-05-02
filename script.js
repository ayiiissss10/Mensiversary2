/* ===========================
   KONFIGURASI
   =========================== */
const KODE_VAULT = "0303";
const KATA_TERSEMBUNYI = ["YOU", "LOOK", "BETTER", "WITH", "ME", "HERE"];

/* ===========================
   NAVIGASI LAYAR
   =========================== */
function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ===========================
   VAULT — INPUT KODE
   =========================== */
const digits = [0, 1, 2, 3].map(i => document.getElementById("d" + i));

digits.forEach((d, i) => {
  d.addEventListener("input", () => {
    d.value = d.value.replace(/\D/g, "").slice(-1);
    if (d.value && i < 3) digits[i + 1].focus();
  });
  d.addEventListener("keydown", e => {
    if (e.key === "Backspace" && !d.value && i > 0) digits[i - 1].focus();
    if (e.key === "Enter") checkCode();
  });
});

function checkCode() {
  const code = digits.map(d => d.value).join("");
  if (code === KODE_VAULT) {
    show("s-memory");
    initMemory();
  } else {
    const msg = document.getElementById("vaultMsg");
    msg.textContent = "Hmm, coba ingat lagi ya 💛";
    digits.forEach(d => { d.style.borderColor = "#cc7766"; d.value = ""; });
    digits[0].focus();
    setTimeout(() => {
      msg.textContent = "";
      digits.forEach(d => d.style.borderColor = "");
    }, 2000);
  }
}

function showClue() {
  document.getElementById("vaultMsg").textContent = "Clue: 🗓️";
}

/* ===========================
   MEMORY GAME
   =========================== */
const SIMBOL = ["🦐", "🫰", "🫶", "❤️", "🧸", "🤍", "🌹", "💌"];
let first = null, second = null, locked = false, matches = 0;

function initMemory() {
  const grid = document.getElementById("cardGrid");
  const dots = document.getElementById("matchDots");
  grid.innerHTML = ""; dots.innerHTML = "";
  first = null; second = null; locked = false; matches = 0;
  document.getElementById("memSub").textContent = "Matches: 0 / 8";

  for (let i = 0; i < 8; i++) {
    const d = document.createElement("div");
    d.className = "mdot"; d.id = "dot" + i;
    dots.appendChild(d);
  }

  [...SIMBOL, ...SIMBOL]
    .sort(() => Math.random() - 0.5)
    .forEach(sym => {
      const c = document.createElement("div");
      c.className = "card"; c.dataset.sym = sym;
      c.onclick = () => flipCard(c, sym);
      grid.appendChild(c);
    });
}

function flipCard(card, sym) {
  if (locked || card.classList.contains("flipped") || card.classList.contains("matched")) return;
  card.classList.add("flipped"); card.textContent = sym;

  if (!first) { first = card; return; }
  second = card; locked = true;

  if (first.dataset.sym === second.dataset.sym) {
    first.classList.add("matched"); second.classList.add("matched");
    document.getElementById("dot" + matches).classList.add("done");
    matches++;
    document.getElementById("memSub").textContent = "Matches: " + matches + " / 8";
    first = null; second = null; locked = false;
    if (matches === 8) setTimeout(() => show("s-popup"), 600);
  } else {
    const a = first, b = second;
    setTimeout(() => {
      a.classList.remove("flipped"); b.classList.remove("flipped");
      a.textContent = ""; b.textContent = "";
      first = null; second = null; locked = false;
    }, 900);
  }
}

/* ===========================
   HIDDEN WORDS
   =========================== */
let foundWords = new Set(), selecting = false, selectedCells = [];

function startWords() {
  show("s-words");
  foundWords = new Set();
  document.getElementById("foundCount").textContent = "0";
  buildGrid();
}

function buildGrid() {
  const gridData = Array(10).fill(null).map(() => Array(10).fill(""));
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  // Tempatkan kata ke dalam grid (horizontal / vertikal)
  KATA_TERSEMBUNYI.forEach(word => {
    let placed = false, tries = 0;
    while (!placed && tries < 500) {
      tries++;
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * 10);
      const c = Math.floor(Math.random() * 10);
      const dr = horiz ? 0 : 1, dc = horiz ? 1 : 0;
      if (r + dr * (word.length - 1) > 9 || c + dc * (word.length - 1) > 9) continue;
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        if (gridData[r + dr * i][c + dc * i] !== "" && gridData[r + dr * i][c + dc * i] !== word[i]) {
          ok = false; break;
        }
      }
      if (ok) {
        for (let i = 0; i < word.length; i++) gridData[r + dr * i][c + dc * i] = word[i];
        placed = true;
      }
    }
  });

  // Isi sisa dengan huruf acak
  for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++)
      if (!gridData[r][c]) gridData[r][c] = alpha[Math.floor(Math.random() * 26)];

  // Render grid
  const grid = document.getElementById("wordGrid");
  grid.innerHTML = "";
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      cell.className = "wcell";
      cell.textContent = gridData[r][c];
      cell.dataset.r = r; cell.dataset.c = c;

      cell.addEventListener("mousedown", e => { e.preventDefault(); startSel(cell); });
      cell.addEventListener("mouseover", () => { if (selecting) extSel(cell); });
      cell.addEventListener("touchstart", e => { e.preventDefault(); startSel(cell); }, { passive: false });
      cell.addEventListener("touchmove", e => {
        e.preventDefault();
        const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY);
        if (el && el.classList.contains("wcell")) extSel(el);
      }, { passive: false });

      grid.appendChild(cell);
    }
  }

  document.addEventListener("mouseup", endSel);
  document.addEventListener("touchend", endSel);
}

function startSel(cell) { selecting = true; selectedCells = []; addCell(cell); }
function extSel(cell) { if (!selecting || selectedCells.includes(cell)) return; addCell(cell); }
function addCell(cell) { cell.classList.add("sel"); selectedCells.push(cell); }

function endSel() {
  if (!selecting) return;
  selecting = false;
  const word = selectedCells.map(c => c.textContent).join("");
  const wordRev = word.split("").reverse().join("");
  const match = KATA_TERSEMBUNYI.find(w => (w === word || w === wordRev) && !foundWords.has(w));

  if (match) {
    selectedCells.forEach(c => { c.classList.remove("sel"); c.classList.add("found"); });
    foundWords.add(match);
    document.getElementById("foundCount").textContent = foundWords.size;
    spawnConfetti();
    if (foundWords.size === KATA_TERSEMBUNYI.length) setTimeout(() => burstHearts(), 400);
  } else {
    selectedCells.forEach(c => c.classList.remove("sel"));
  }
  selectedCells = [];
}

/* ===========================
   ANIMASI
   =========================== */
function spawnConfetti() {
  const colors = ["#c8a84b", "#ffffff", "#888", "#444"];
  for (let i = 0; i < 10; i++) {
    const d = document.createElement("div");
    d.className = "confetti-dot";
    d.style.left = Math.random() * 100 + "vw";
    d.style.top = "50%";
    d.style.background = colors[Math.floor(Math.random() * colors.length)];
    d.style.animationDelay = Math.random() * 0.4 + "s";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2200);
  }
}

function burstHearts() {
  const emojis = ["🤍", "✨", "🌹"];
  for (let i = 0; i < 14; i++) {
    const h = document.createElement("div");
    h.className = "heart-float";
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = Math.random() * 90 + "vw";
    h.style.top = Math.random() * 60 + 20 + "vh";
    h.style.animationDelay = Math.random() * 0.6 + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 2500);
  }
  setTimeout(() => show("s-letter"), 1200);
}

/* ===========================
   SURAT PENUTUP
   =========================== */
function openLetter() {
  document.getElementById("envIcon").style.display = "none";
  document.getElementById("openHint").style.display = "none";
  const card = document.getElementById("letterCard");
  card.style.display = "block";
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("show")));

  const emojis = ["🤍", "✨", "🌹"];
  for (let i = 0; i < 10; i++) {
    const h = document.createElement("div");
    h.className = "heart-float";
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = Math.random() * 90 + "vw";
    h.style.top = Math.random() * 50 + 20 + "vh";
    h.style.animationDelay = Math.random() * 0.8 + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 2500);
  }
}
