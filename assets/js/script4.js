const player = document.getElementById('player');
const music = document.getElementById('bg-music');
const closePopup = document.getElementById("close-popup");
const repairBox = document.getElementById("repair-box");
const hint = document.getElementById("hint");
const badgeDrawer = document.getElementById("badge-drawer"); 
const badgePopup = document.getElementById("badge-popup"); 
const closeBadgeBtn = document.getElementById("close-badge");
const gameContainer = document.getElementById("game-container");
const bed = document.getElementById("bed");
const bedPopup = document.getElementById("bed-popup");
const letterBox = bedPopup.querySelector(".letter-box");
const closeBedBtn = document.querySelector(".letter-close-btn");
const shelf = document.getElementById("social-shelf");
const socialPopup = document.getElementById("social-popup");
const closeSocialBtn = document.getElementById("close-social");
const exitPopup = document.getElementById("exit-popup");
const exitLeaveBtn = document.getElementById("exit-leave");
const exitStayBtn = document.getElementById("exit-stay");
const exitBox = exitPopup.querySelector(".exit-box");

let badgeCollected = localStorage.getItem("badgeCollected") === "false";


let x = 10;
let y = 500;
let speed = 8;
let keys = {};
let badgeOpen = false;
let badgeLocked = false;
let bedOpen = false;
let bedLocked = false;
let socialOpen = false;
let socialLocked = false;
let exitOpen = false;
let exitLocked = false;
let hasExited = false;

let preventMovement = true;

// ---------------- AUDIO ----------------
function playSound(id) {
  const sound = document.getElementById(id);
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// Play background music on page load
window.addEventListener("load", () => {
  const music = document.getElementById("bg-music");
  music.volume = 5;
  music.play().catch(() => {}); // prevent autoplay error
});

// ---------------- SPAWN ----------------
player.classList.add('spawn-in');
playSound("spawn-sound");

// Lock movement briefly
setTimeout(() => {
  preventMovement = false;
}, 1000);

// ---------------- INPUT ---------------- //
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function showHint(text, topPx, leftPx) {
  const hintBox = document.getElementById("hint-box");
  const hintEl = document.getElementById("hint");

  const OFFSET_Y = 40;
  const OFFSET_X = 14;

  hintBox.textContent = text;
  hintEl.style.display = "block";

  hintEl.style.top  = `${topPx + OFFSET_Y}px`;
  hintEl.style.left = `${leftPx + OFFSET_X}px`;
}

function hideHint() {
  const hintEl = document.getElementById("hint");
  if (hintEl) hintEl.style.display = "none";
}

// --- use bounding rects relative to the game container so right: / left: doesn't matter ---
function getLocalRect(el) {
  const elRect = el.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  return {
    left: elRect.x - containerRect.x,
    top:   elRect.top  - containerRect.top,
    width: elRect.width,
    height: elRect.height,
    centerX: elRect.left - containerRect.left + elRect.width / 2,
    centerY: elRect.top  - containerRect.top + elRect.height / 2
  };
}

// ---------------- INTRO POP OUT ---------------- //
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("entry-popup");
  const exploreBtn = document.getElementById("explore-btn");
  const leaveBtn = document.getElementById("leave-btn");
  const scene = document.getElementById("scene");

  showEntryPopup(); 

  // ---------------- EXPLORE ----------------
  exploreBtn?.addEventListener("click", () => {
    const box = document.querySelector(".entry-box");
    playSound("spawn-sound");
    if (!box || !popup) return;

    box.classList.add("pop-out");
    popup.classList.add("fade-out");

    setTimeout(() => {
      popup.classList.add("hidden");
      popup.classList.remove("fade-out");
      box.classList.remove("pop-out");
    }, 350);
  });

  // ---------------- LEAVE ----------------
  leaveBtn?.addEventListener("click", () => {
    const box = document.querySelector(".entry-box");
    playSound("transition");

    if (!box || !popup) {
      window.location.href = "index.html";
      return;
    }

    // disable button to prevent spam
    leaveBtn.disabled = true;

    box.classList.add("pop-out");
    popup.classList.add("fade-out");

    setTimeout(() => {
      popup.classList.add("hidden");
      popup.classList.remove("fade-out");
      box.classList.remove("pop-out");

      if (scene) {
        scene.classList.add("fade-out");

        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        window.location.href = "index.html";
      }
    }, 350);
  });
});


function showEntryPopup() {
  const popup = document.getElementById("entry-popup");
  if (!popup) return;

  popup.classList.remove("hidden");
  launchConfetti();
}

// ---------------- Confetti ---------------- //
function launchConfetti() {
  const container = document.getElementById("confetti-container");
  if (!container) return;

  // 🔧 Clear old confetti (IMPORTANT)
  container.innerHTML = "";

  const colors = ["#ffd1dc", "#d36f83ff", "#e4e669ff", "#d879b9ff"];

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.5 + "s";

    container.appendChild(piece);

    setTimeout(() => piece.remove(), 3000);
  }
}

// touchingBadgeDrawer //
function touchingBadgeDrawer() {
  const px = x;
  const py = y;
  const pw = player.offsetWidth;
  const ph = player.offsetHeight;

  const r = getLocalRect(badgeDrawer);

  return (
    px < r.left + r.width &&
    px + pw > r.left &&
    py < r.top + r.height &&
    py + ph > r.top
  );
}

// touchingBed //
function touchingBed() {
  const px = x;
  const py = y;
  const pw = player.offsetWidth;
  const ph = player.offsetHeight;

  const r = getLocalRect(bed);

  return (
    px < r.left + r.width &&
    px + pw > r.left &&
    py < r.top + r.height &&
    py + ph > r.top
  );
}

// --- Touching Shelf ---
function touchingShelf() {
  const px = x;
  const py = y;
  const pw = player.offsetWidth;
  const ph = player.offsetHeight;

  const r = getLocalRect(shelf);

  return (
    px < r.left + r.width &&
    px + pw > r.left &&
    py < r.top + r.height &&
    py + ph > r.top
  );
}

// --- Drawer (Badge) logic (Z) --- //
function handleBadgeDrawerInteraction() {
  if (!touchingBadgeDrawer()) {
    badgeDrawer.classList.remove("glow");
    hideClaimedHint();
    return;
  }

  badgeDrawer.classList.add("glow");

  const r = getLocalRect(badgeDrawer);

  if (badgeCollected) {
    showClaimedHint(r.top, r.left + r.width / 2 - 40);
    return;
  }

  if (!badgeOpen) {
    showHint("Press Z to open drawer", r.top, r.left + r.width / 2 - 60);
  }

  if (keys['z'] && !badgeLocked) {
    badgeLocked = true;

    playSound("badge-sound");

    badgePopup.classList.remove("hidden");
    void badgePopup.offsetWidth;
    badgePopup.classList.add("drawer-open");

    badgeCollected = true;
    localStorage.setItem("badgeCollected", "true");

    badgeOpen = true;
    preventMovement = true;

    setTimeout(() => badgeLocked = false, 300);
  }
}

// --- Close Badge Logic --- //
closeBadgeBtn.addEventListener("click", () => {
  badgeOpen = false;
  badgeLocked = false;
  preventMovement = false;
   playSound("spawn-sound");
  hideHint();

  const badgeBox = document.querySelector(".badge-box");
  badgeBox.classList.add("closing"); // ✨ animate badge itself

  badgePopup.classList.remove("drawer-open");
  badgePopup.classList.add("drawer-close");

  setTimeout(() => {
    badgePopup.classList.add("hidden");
    badgePopup.classList.remove("drawer-close");
    badgeBox.classList.remove("closing"); // cleanup
  }, 350);
});


document.addEventListener("DOMContentLoaded", () => {
  if (badgeCollected) {
    badgeDrawer.src = "assets/css/img/drawer_open.png";
    badgePopup.classList.add("hidden");
  }
});

// --- Bed (message) logic (Z) --- //
function handleBedInteraction() {
  if (!touchingBed()) {
    bed.classList.remove("glow");
    return;
  }

  bed.classList.add("glow");

  if (!bedOpen) {
    const r = getLocalRect(bed);
    showHint("[Z] Leave a message", r.top, r.left + r.width / 2 - 60);
  }

  if (keys['z'] && !bedLocked) {
    bedLocked = true;

    playSound("paper-sound");

    bedPopup.classList.remove("hidden");
    void bedPopup.offsetWidth;
    letterBox.classList.add("letter-open");

    bedOpen = true;
    preventMovement = true;

    setTimeout(() => bedLocked = false, 300);
  }
}

// --- Close Bed Logic --- //
closeBedBtn.addEventListener("click", () => {
  bedOpen = false;
  preventMovement = false;
  playSound("paper-sound");

  if (!letterBox) return;

  letterBox.classList.remove("opening"); // clean state
  letterBox.classList.add("closing");   
  bedPopup.classList.add("fading");

  setTimeout(() => {
    bedPopup.classList.add("hidden");
    bedPopup.classList.remove("fading");
    letterBox.classList.remove("closing");
  }, 350);
});

// --- Shelf (Social Media) Logic ---
function handleShelfInteraction() {
  if (!touchingShelf()) {
    shelf.classList.remove("glow");
    return;
  }

  shelf.classList.add("glow");

  if (!socialOpen) {
    const r = getLocalRect(shelf);
    showHint("Press Z to check shelf", r.top, r.left + r.width / 2 - 50);
  }

  if (keys['z'] && !socialLocked) {
    socialLocked = true;
    playSound("drawer-sound");

    socialOpen = !socialOpen;

    if (socialOpen) {
      socialPopup.classList.remove("hidden");
      void socialPopup.offsetWidth;
      socialPopup.classList.add("pop-in");
      socialPopup.classList.remove("pop-out");
      preventMovement = true;
    } else {
      closeSocial();
    }

    setTimeout(() => socialLocked = false, 300);
  }
}

// --- Close Social Media Logic --- //
function closeSocial() {
  socialOpen = false;
  preventMovement = false;
  playSound("drawer-sound");

  const socialBox = socialPopup.querySelector(".social-box");
  if (!socialBox) return;

  // ✨ animate the box itself
  socialBox.classList.add("closing");

  // optional: fade overlay slightly
  socialPopup.classList.add("fading");

  setTimeout(() => {
    socialPopup.classList.add("hidden");
    socialPopup.classList.remove("fading");
    socialBox.classList.remove("closing"); // cleanup
  }, 280);
}


closeSocialBtn.addEventListener("click", closeSocial);

// --- Door (Exit) logic (Z) --- //
function openExitPopup() {
  exitOpen = true;
  preventMovement = true;

  playSound("badge-sound");

  exitPopup.classList.remove("hidden");

  // restart animation
  exitBox.classList.remove("pop-out");
  void exitBox.offsetWidth;
  exitBox.classList.add("pop-in");
}

// --- Close Exit Logic --- //
function closeExitPopup() {
  exitOpen = false;

  exitBox.classList.remove("pop-in");
  exitBox.classList.add("pop-out");

  setTimeout(() => {
    exitPopup.classList.add("hidden");
    exitBox.classList.remove("pop-out");
    preventMovement = false;
  }, 320);
}


// --- Button Exit Logic --- //
exitLeaveBtn.addEventListener("click", () => {
  if (hasExited) return;
  hasExited = true;

  playSound("transition");

  const scene = document.getElementById("scene");

  // fade popup first
  exitPopup.classList.add("fade-out");

  setTimeout(() => {
    if (scene) {
      scene.classList.add("fade-out");
    }

    // go to next scene after full fade
    setTimeout(() => {
      window.location.href = "index.html"; // or next room
    }, 1000);

  }, 400);
});

exitStayBtn.addEventListener("click", () => {
  playSound("spawn-sound");
  closeExitPopup();

  // gently push player back so popup doesn't re-trigger instantly
  x = 1100;
  updateCharacterPosition();
});


// --- Form (message) logic (Z) --- //
const form = document.querySelector(".letter-form");
const thanks = document.querySelector(".letter-thanks");
const letterSub = document.querySelector(".letter-sub");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const res = await fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" }
  });

  if (res.ok) {
    form.classList.add("hidden");
    letterSub.classList.add("hidden");   // ✨ hide subtitle
    thanks.classList.remove("hidden");

    playSound("sparkle-soft");
  }
});

// --- Claimed Hint --- //
function showClaimedHint(top, left) {
  let hint = document.getElementById("claimed-hint");

  if (!hint) {
    hint = document.createElement("div");
    hint.id = "claimed-hint";
    hint.className = "claimed-hint";
    hint.innerHTML = "Already claimed ✓";
    document.body.appendChild(hint);
  }

  hint.style.top = `${top + 40}px`;
  hint.style.left = `${left}px`;
  hint.classList.add("show");
}

function hideClaimedHint() {
  const hint = document.getElementById("claimed-hint");
  if (hint) hint.classList.remove("show");
}


// Obstacles
const obstacles = [
  { x: 100, y: 250, width: 400, height: 100 },
  { x: 620, y: 350, width: 140, height: 90 },
  { x: 800, y: 240, width: 400, height: 120 },
  { x: 900, y: 240, width: 100, height: 120 },
  { x: 0, y: 0, width: 1280, height: 20 },
  { x: 0, y: 768, width: 1280, height: 20 },
  { x: 0, y: 0, width: -50, height: 788 },
];


// ---------------- COLLISION ----------------
function isColliding(nx, ny) {
  return obstacles.some(ob =>
    nx + player.offsetWidth > ob.x &&
    nx < ob.x + ob.width &&
    ny + player.offsetHeight > ob.y &&
    ny < ob.y + ob.height
  );
}

// ---------------- UPDATE ----------------
function updateCharacterPosition() {
  player.style.left = `${x}px`;
  player.style.top = `${y}px`;
}

// ---------------- GAME LOOP ----------------
function gameLoop() {
  let nextX = x;
  let nextY = y;

  if (!preventMovement) {
    if (keys['ArrowUp'] || keys['w']) {
      nextY -= speed;
      player.src = 'assets/css/img/player_up.webp';
    }
    if (keys['ArrowDown'] || keys['s']) {
      nextY += speed;
      player.src = 'assets/css/img/player_down.webp';
    }
    if (keys['ArrowLeft'] || keys['a']) {
      nextX -= speed;
      player.src = 'assets/css/img/player_left.webp';
    }
    if (keys['ArrowRight'] || keys['d']) {
      nextX += speed;
      player.src = 'assets/css/img/player_right.webp';
    }
  }

  if (!isColliding(nextX, nextY)) {
    x = nextX;
    y = nextY;
  }

  function checkExitArea() {
  if (x > 1200 && !exitOpen && !exitLocked) {
    exitLocked = true;
    openExitPopup();
    setTimeout(() => exitLocked = false, 500);
  }
}


  updateCharacterPosition();

  handleBedInteraction();
  handleBadgeDrawerInteraction();
  handleShelfInteraction(); 

  checkExitArea();

  if (!touchingBed() && !touchingBadgeDrawer() && !touchingShelf() ) {
  hideHint();
}


   requestAnimationFrame(gameLoop); // ✅ FIXED
}

// ---------------- START ----------------
updateCharacterPosition();

gameLoop();
