const player = document.getElementById('player');
const oven = document.getElementById('oven');
const popup = document.getElementById('oven-popup');
const sink = document.getElementById('sink');
const sinkPopup = document.getElementById('sink-popup');
const cabinet = document.getElementById('cabinet');
const cabinetPopup = document.getElementById('cabinet-popup');
const fridge = document.getElementById('fridge');
const fridgePopup = document.getElementById('fridge-popup');
const hint = document.getElementById('hint'); 
const stickyNote = document.getElementById('sticky-note');
const stickyNotePopup = document.getElementById('sticky-note-popup');
const transitionSound = new Audio('assets/transition.mp3');
const lockedSound = new Audio('assets/locked.mp3');
const interactionSound = new Audio('assets/unlock.mp3');
interactionSound.volume = 0.9;

let noteReading = false;
let ovenOpen = false;
let sinkOpen = false;
let cabinetOpen = false;
let ovenDialogueShown = false;
let sinkDialogueShown = false;
let cabinetDialogueShown = false;
let fridgeOpen = false;
let fridgeDialogueShown = false;
let noteDialogueShown = false;
let sinkDone = false;
let ovenDone = false;
let cabinetDone = false;
let fridgeDone = false;
let hasExited = false;
let doorCooldown = false;

let x = 10;
let y = 500;
let speed = 8;
let keys = {};
let preventMovement = false;
let zPressed = false;

function showOven() {
  ovenPopup.style.display = 'block'; 
  ovenPopup.classList.remove('hide');
  ovenPopup.classList.add('show');
}

function hideOven() {
  ovenPopup.classList.remove('show');
  ovenPopup.classList.add('hide');

  // Wait for animation to finish, then hide it
  ovenPopup.addEventListener('animationend', function handler(e) {
    if (e.animationName === 'ovenPopOut') {
      ovenPopup.style.display = 'none';
      ovenPopup.removeEventListener('animationend', handler);
    }
  });
}

// 🔠 Typewriter outside loop
function typeWriter(text, targetElement, speed = 25, callback) {
  targetElement.innerHTML = '';
  let i = 0;

  function type() {
    if (i < text.length) {
      targetElement.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  }

  type();
}

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.currentTime = 0;
    sound.play();
  }
}

// Play background music on page load
window.addEventListener("load", () => {
  const music = document.getElementById("bg-music");
  music.volume = 5;
  music.play().catch(() => {}); // prevent autoplay error
});

  // 👇 Spawn-in animation
  player.classList.add('spawn-in');
  playSound("spawn-sound");

document.addEventListener("click", () => {
  player.classList.add('spawn-in');
  playSound("spawn-sound");

  // Prevent movement for 1 second after spawn
  preventMovement = true;
  setTimeout(() => {
    preventMovement = false;
  }, 1000);
}, { once: true }); // only runs once



// 🧱 Obstacles
const obstacles = [
  { x: 100, y: 250, width: 400, height: 90 },
  { x: 620, y: 240, width: 90, height: 90 },
  { x: 800, y: 240, width: 400, height: 120 },
  { x: 900, y: 240, width: 100, height: 120 },
  { x: 0, y: 0, width: 1280, height: 20 },
  { x: 0, y: 768, width: 1280, height: 20 },
  { x: 0, y: 0, width: -50, height: 788 },
];

function isColliding(x, y) {
  return obstacles.some(ob =>
    x + player.offsetWidth > ob.x &&
    x < ob.x + ob.width &&
    y + player.offsetHeight > ob.y &&
    y < ob.y + ob.height
  );
}

document.addEventListener('keydown', e => {
  keys[e.key] = true;
  if (e.key.toLowerCase() === 'z') zPressed = true;
});
document.addEventListener('keyup', e => {
  keys[e.key] = false;
  if (e.key.toLowerCase() === 'z') zPressed = false;
});

function gameLoop() {
  let nextX = x;
  let nextY = y;

  if (!preventMovement) {
    if (keys['ArrowUp'] || keys['w']) {
      nextY -= speed;
      player.src = 'assets/css/img/player_up.webp';
    } else if (keys['ArrowDown'] || keys['s']) {
      nextY += speed;
      player.src = 'assets/css/img/player_down.webp';
    } else if (keys['ArrowLeft'] || keys['a']) {
      nextX -= speed;
      player.src = 'assets/css/img/player_left.webp';
    } else if (keys['ArrowRight'] || keys['d']) {
      nextX += speed;
      player.src = 'assets/css/img/player_right.webp';
    }
  }

  if (!isColliding(nextX, nextY)) {
    x = nextX;
    y = nextY;
  }

  player.style.left = `${x}px`;
  player.style.top = `${y}px`;

  // 🔲 Define boxes
  const playerLeft = x;
  const playerTop = y;
  const playerRight = x + player.offsetWidth;
  const playerBottom = y + player.offsetHeight;

  const ovenLeft = oven.offsetLeft;
  const ovenTop = oven.offsetTop;
  const ovenRight = ovenLeft + oven.offsetWidth;
  const ovenBottom = ovenTop + oven.offsetHeight;

  // 🧼 Sink position box
  const sinkLeft = sink.offsetLeft;
  const sinkTop = sink.offsetTop;
  const sinkRight = sinkLeft + sink.offsetWidth;
  const sinkBottom = sinkTop + sink.offsetHeight;

  // 💾 Cabinet position box
  const cabinetLeft = cabinet.offsetLeft;
  const cabinetTop = cabinet.offsetTop;
  const cabinetRight = cabinetLeft + cabinet.offsetWidth;
  const cabinetBottom = cabinetTop + cabinet.offsetHeight;

  // 🧲 Fridge position box
const fridgeLeft = fridge.offsetLeft;
const fridgeTop = fridge.offsetTop;
const fridgeRight = fridgeLeft + fridge.offsetWidth;
const fridgeBottom = fridgeTop + fridge.offsetHeight;

  // 🟨 Sticky Note Interaction
const noteLeft = stickyNote.offsetLeft;
const noteTop = stickyNote.offsetTop;
const noteRight = noteLeft + stickyNote.offsetWidth;
const noteBottom = noteTop + stickyNote.offsetHeight;

const overlapsNote =
  playerLeft < noteRight &&
  playerRight > noteLeft &&
  playerTop < noteBottom &&
  playerBottom > noteTop;

const overlapsFridge =
  playerLeft < fridgeRight &&
  playerRight > fridgeLeft &&
  playerTop < fridgeBottom &&
  playerBottom > fridgeTop;


const overlapsCabinet =
  playerLeft < cabinetRight &&
  playerRight > cabinetLeft &&
  playerTop < cabinetBottom &&
  playerBottom > cabinetTop;

const overlapsSink =
  playerLeft < sinkRight &&
  playerRight > sinkLeft &&
  playerTop < sinkBottom &&
  playerBottom > sinkTop;


  const overlapsOven =
    playerLeft < ovenRight &&
    playerRight > ovenLeft &&
    playerTop < ovenBottom &&
    playerBottom > ovenTop;

// 🔥 Oven + Sink interaction

// Show hint helper
function showHint(text, top, left) {
  hint.textContent = text;
  hint.style.display = 'block';
  hint.style.top = `${top}px`;
  hint.style.left = `${left}px`;
}

// Hide hint helper
function hideHint() {
  hint.style.display = 'none';
}

// 🟠 Oven interaction
if (overlapsOven) {
  oven.classList.add('glow');

  if (!ovenOpen && !overlapsSink) {
    showHint('Press Z to open oven', oven.offsetTop - 40, oven.offsetLeft - 20);
  }

  if (zPressed && !ovenDialogueShown) {
    interactionSound.currentTime = 0;
    interactionSound.play();
    ovenOpen = !ovenOpen;
    preventMovement = ovenOpen;
    hideHint();
    ovenDialogueShown = true;

    if (ovenOpen) {
      popup.classList.remove('hide');
      popup.classList.add('show');
      popup.style.display = 'block';
    } else {
      popup.classList.remove('show');
      popup.classList.add('hide');
      setTimeout(() => {
        popup.style.display = 'none';
      }, 300);
    }

    // Reset so we can trigger again after brief pause
    setTimeout(() => {
      ovenDialogueShown = false;
      if (!ovenOpen) preventMovement = false;
    }, 300);
  }

} else {
  oven.classList.remove('glow');
  if (!overlapsSink) hideHint();
}

// 🔵 Sink interaction
if (overlapsSink) {
  sink.classList.add('glow');

  if (!sinkOpen && !overlapsOven) {
    showHint('Press Z to rinse tools', sink.offsetTop - 40, sink.offsetLeft - 20);
  }

  if (zPressed && !sinkDialogueShown) {
    interactionSound.currentTime = 0;
    interactionSound.play();
    sinkOpen = !sinkOpen;
    preventMovement = sinkOpen;
    hideHint();
    sinkDialogueShown = true;

    if (sinkOpen) {
      sinkPopup.classList.remove('hide');
      sinkPopup.classList.add('show');
      sinkPopup.style.display = 'block';
    } else {
      sinkPopup.classList.remove('show');
      sinkPopup.classList.add('hide');
      setTimeout(() => {
        sinkPopup.style.display = 'none';
      }, 300);
    }

    // Reset so we can trigger again after brief pause
    setTimeout(() => {
      sinkDialogueShown = false;
      if (!sinkOpen) preventMovement = false;
    }, 300);
  }

} else {
  sink.classList.remove('glow');
  if (!overlapsOven) hideHint();
}

// 🧊 Cabinet interaction
if (overlapsCabinet) {
  cabinet.classList.add('glow');

  if (!cabinetOpen && !overlapsOven && !overlapsSink) {
    showHint('Press Z to open cabinet', cabinet.offsetTop - 40, cabinet.offsetLeft - 20);
  }

  if (zPressed && !cabinetDialogueShown) {
    interactionSound.currentTime = 0;
    interactionSound.play();
    cabinetOpen = !cabinetOpen;
    preventMovement = cabinetOpen;
    hideHint();
    cabinetDialogueShown = true;

    if (cabinetOpen) {
      cabinetPopup.classList.remove('hide');
      cabinetPopup.classList.add('show');
      cabinetPopup.style.display = 'block';
    } else {
      cabinetPopup.classList.remove('show');
      cabinetPopup.classList.add('hide');
      setTimeout(() => {
        cabinetPopup.style.display = 'none';
      }, 300);
    }

    setTimeout(() => {
      cabinetDialogueShown = false;
      if (!cabinetOpen) preventMovement = false;
    }, 300);
  }

} else {
  cabinet.classList.remove('glow');
  if (!overlapsOven && !overlapsSink) hideHint();
}

// 🧲 Fridge interaction
if (overlapsFridge) {
  fridge.classList.add('glow');

  if (!fridgeOpen && !overlapsCabinet && !overlapsSink && !overlapsOven) {
    showHint('Press Z to refresh your tools', fridge.offsetTop - 40, fridge.offsetLeft - 20);
  }

  if (zPressed && !fridgeDialogueShown) {
    interactionSound.currentTime = 0;
    interactionSound.play();
    fridgeOpen = !fridgeOpen;
    preventMovement = fridgeOpen;
    hideHint();
    fridgeDialogueShown = true;

    if (fridgeOpen) {
      fridgePopup.classList.remove('hide');
      fridgePopup.classList.add('show');
      fridgePopup.style.display = 'block';
    } else {
      fridgePopup.classList.remove('show');
      fridgePopup.classList.add('hide');
      setTimeout(() => {
        fridgePopup.style.display = 'none';
      }, 300);
    }

    setTimeout(() => {
      fridgeDialogueShown = false;
      if (!fridgeOpen) preventMovement = false;
    }, 300);
  }
} else {
  fridge.classList.remove('glow');
  if (!overlapsSink && !overlapsOven && !overlapsCabinet) hideHint();
}

// 🟨 Sticky Note Interaction
if (overlapsNote) {
  stickyNote.classList.add('glow');

  if (!noteReading && !overlapsOven && !overlapsSink && !overlapsCabinet && !overlapsFridge) {
    showHint('Press Z to read the note', noteTop - 40, noteLeft - 20);
  }

  if (zPressed && !noteDialogueShown) {
    interactionSound.currentTime = 0;
    interactionSound.play();
    noteReading = !noteReading;
    preventMovement = noteReading;
    hideHint();
    noteDialogueShown = true;

    if (noteReading) {
      stickyNotePopup.classList.remove('hide');
      stickyNotePopup.classList.add('show');
      stickyNotePopup.style.display = 'block';
    } else {
      stickyNotePopup.classList.remove('show');
      stickyNotePopup.classList.add('hide');
      setTimeout(() => {
        stickyNotePopup.style.display = 'none';
      }, 300);
    }

    // Reset trigger delay
    setTimeout(() => {
      noteDialogueShown = false;
      if (!noteReading) preventMovement = false;
    }, 300);
  }

} else {
  stickyNote.classList.remove('glow');
  if (!overlapsOven && !overlapsSink && !overlapsCabinet && !overlapsFridge) hideHint();
}

document.querySelectorAll('.pastry').forEach(pastry => {
  const label = pastry.querySelector('.baked-label');
  const img = pastry.querySelector('img');
  const bakedImg = pastry.dataset.imgBaked;

  pastry.addEventListener('click', () => {
    if (pastry.dataset.baked === "true") return;

    // 🔥 Bake the dough
    pastry.dataset.baked = "true";
    pastry.classList.add('baked');

    const bakeSound = new Audio('assets/bake.mp3');
    bakeSound.volume = 0.4;
    bakeSound.play();

    if (img && bakedImg) img.src = bakedImg;

    if (label) {
      label.textContent = "✔ Baked!";
      label.style.opacity = 1;
      label.style.color = "#008800";
    }

    // ✅ Check if any pastry has been baked
    const anyBaked = [...document.querySelectorAll('.pastry')]
      .some(p => p.dataset.baked === "true");

    if (anyBaked) {
      ovenDone = true;
      console.log("Oven task complete!");

       if (allTasksCompleted()) {
    showMessage("🎉 All tasks done! Head to the door.");
  }
    }
  });
});


const washMessages = ["Squeaky clean!", "All rinsed!", "Good as new!", "✨ Cleaned!"];

document.querySelectorAll('.tool').forEach(tool => {
  const img = tool.querySelector('img');
  const label = tool.querySelector('.wash-label');
  const cleanImg = tool.dataset.cleanImg;
  const overlay = tool.querySelector('.bubble-overlay');
  const progressBar = tool.querySelector('.progress-bar-fill');
  const level = parseInt(tool.dataset.level);

  tool.addEventListener('click', () => {
    if (tool.dataset.washed === "true") return;

    // ✅ Mark as washed
    tool.dataset.washed = "true";
    tool.classList.add('washed');

    // 💧 Splash sound
    const splashSound = new Audio('assets/splash.mp3');
    splashSound.volume = 0.9;
    splashSound.play();

    // 🖼 Image swap
    if (img && cleanImg) img.src = cleanImg;

    // 💬 Update label
    if (label) {
      label.textContent = washMessages[Math.floor(Math.random() * washMessages.length)];
      label.style.opacity = 1;
      label.style.color = "#0088cc";
      label.classList.add('sparkle');
    }

    // ✨ Bubble animation
    if (overlay) {
      overlay.classList.add('bubble-pop');
      setTimeout(() => {
        overlay.classList.remove('bubble-pop');
      }, 600);
    }

    // 📊 Progress bar (skill level)
    if (progressBar) {
      progressBar.style.width = `${level}%`;
    }

    // 🧼 Cleaning animation
    if (img) {
      img.classList.add('cleaning');
      setTimeout(() => {
        img.classList.remove('cleaning');
      }, 600);
    }

    // ✅ Check if all tools are washed
    const allCleaned = [...document.querySelectorAll('.tool')]
      .every(t => t.dataset.washed === "true");

  if (allCleaned) {
  sinkDone = true;
  console.log("Sink task complete!");

  if (allTasksCompleted()) {
    showMessage("🎉 All tasks done! Head to the door.");
  }
}
  });
});


document.querySelectorAll('.tool').forEach((tool) => {
  const img = tool.querySelector('img');
  const progressBar = tool.querySelector('.progress-bar-fill');
  const label = tool.querySelector('.wash-label');
  const cleanImgSrc = tool.dataset.cleanImg;
  const level = parseInt(tool.dataset.level);

  img.addEventListener('click', () => {
    if (tool.dataset.washed === 'true') return;

    // Trigger bubble pop animation
    const bubble = tool.querySelector('.bubble-overlay');
    if (bubble) {
      bubble.style.animation = 'bubblePop 0.7s ease-out forwards';
      setTimeout(() => (bubble.style.animation = ''), 700);
    }

    // Fill progress bar to reflect skill level
    progressBar.style.width = `${level}%`;

    // Add washing animation to image
    img.classList.add('cleaning');

    // Fake wash delay
    setTimeout(() => {
      img.src = cleanImgSrc;
      label.classList.add('sparkle');
      tool.dataset.washed = 'true';
    }, 600);
  });
});


// Show the cabinet popup when clicked
cabinet.addEventListener('click', () => {
  cabinetPopup.classList.add('show');
  cabinetPopup.classList.remove('hide');
});

// Hide cabinet when pressing "Z"
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'z' && cabinetPopup.classList.contains('show')) {
    cabinetPopup.classList.remove('show');
    cabinetPopup.classList.add('hide');
    setTimeout(() => {
      cabinetPopup.style.display = 'none';
    }, 300); // matches the .hide animation duration
  }
});

// Reset display after "show" animation
const observer = new MutationObserver(() => {
  if (cabinetPopup.classList.contains('show')) {
    cabinetPopup.style.display = 'block';
  }
});
observer.observe(cabinetPopup, { attributes: true });

// Optional: Add glow or wiggle effect when jar is clicked
document.querySelectorAll('.jar').forEach(jar => {
  jar.addEventListener('click', () => {
    // Prevent repeat sealing
    if (jar.dataset.sealed === 'true') return;

    // ✅ Mark as sealed
    jar.dataset.sealed = 'true';
    jar.classList.add('sealed-glow');

    // 🌟 Animation effect
    jar.classList.add('jar-active');
    setTimeout(() => {
      jar.classList.remove('jar-active');
    }, 600);

    // 🎨 Image swap
    const img = jar.querySelector('img');
    if (img && jar.dataset.cleanImg) {
      img.src = jar.dataset.cleanImg;
    }

    // 🏷️ Label update
    const label = jar.querySelector('.seal-label');
    if (label) {
      label.textContent = '✅ Sealed';
      label.style.color = '#008800';
    }

    // 🔊 Sealing sound
    const sealSound = new Audio('assets/seal.mp3');
    sealSound.volume = 0.9;
    sealSound.play();

    // ✅ Check if all jars are sealed
    const allSealed = [...document.querySelectorAll('.jar')]
      .every(j => j.dataset.sealed === 'true');

    if (allSealed) {
      cabinetDone = true;
      console.log("Cabinet task complete!");

          if (allTasksCompleted()) {
    showMessage("🎉 All tasks done! Head to the door.");
  }
    }
  });
});


document.querySelectorAll('.fridge-item').forEach(item => {
  const img = item.querySelector('img');
  const label = item.querySelector('.use-label');
  const overlay = item.querySelector('.cooldown-overlay');
  const bar = item.querySelector('.progress-bar-fill-fridge');

  item.addEventListener('click', () => {
    // Already cooling or done
    if (item.classList.contains('cooling') || item.dataset.cooled === 'true') return;

    item.classList.add('cooling');
    overlay.style.display = 'block';
    label.textContent = '🧊 Cooling...';

    // ❄️ Play fridge sound
    const freezeSound = new Audio('assets/fridge_freeze.mp3');
    freezeSound.volume = 0.8;
    freezeSound.play();

    // Simulate cooldown
    setTimeout(() => {
      overlay.style.display = 'none';
      item.classList.remove('cooling');
      item.dataset.cooled = 'true';

      label.textContent = '✅ Refreshed!';
      label.style.color = "#008800";

      const ding = new Audio('assets/ding.mp3');
      ding.play();

      // ✅ Check if all fridge items are cooled
      const allCooled = [...document.querySelectorAll('.fridge-item')]
        .every(i => i.dataset.cooled === 'true');

      if (allCooled) {
  fridgeDone = true;
  console.log("Fridge task complete!");

  if (allTasksCompleted()) {
    showMessage("🎉 All tasks done! Head to the door.");
  }
}
    }, 5000);
  });
});


// Close fridge with Z key
document.addEventListener('keydown', (e) => {
  if (e.key === 'z' || e.key === 'Z') {
    const popup = document.getElementById('fridge-popup');
    popup.classList.remove('show');
  }
});


function allTasksCompleted() {
  return sinkDone && ovenDone && cabinetDone && fridgeDone;
}

function updateCharacterPosition() {
  const character = document.getElementById("player");
  character.style.left = `${x}px`;
}

function showMessage(message) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = message;
  messageBox.style.display = "block";

  clearTimeout(messageBox._hideTimeout); // Prevent message overlap
  messageBox._hideTimeout = setTimeout(() => {
    messageBox.style.display = "none";
  }, 3000);
}
  
// 🚪 Exit area logic near x > 1200
function checkExitArea() {
  if (x > 1200 && !hasExited && !doorCooldown) {
    if (allTasksCompleted()) {
      hasExited = true;
      showMessage("All tasks done! Entering Workshop...");
      transitionSound.play();

      const scene = document.getElementById("scene");
      if (scene) {
        setTimeout(() => {
          scene.classList.add("fade-out");
          setTimeout(() => {
            console.log("Transition to Workshop completed.");
            window.location.href = "projects.html";
          }, 1000);
        }, 500);
      }
    } else {
      doorCooldown = true;
      showMessage("🔒 The door is locked. You must complete all tasks first!");
      lockedSound.play();

      x = 100;
      updateCharacterPosition();

      setTimeout(() => {
        doorCooldown = false;
      }, 1000);
    }
  }
}

checkExitArea(); 

  requestAnimationFrame(gameLoop);
}


gameLoop();
