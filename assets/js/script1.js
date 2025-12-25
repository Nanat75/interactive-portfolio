const player = document.getElementById('player');
const dialogueBox = document.getElementById('dialogue-box');
const paper = document.getElementById('paper'); 
const hint = document.getElementById('interaction-hint');
const dialogueText = document.getElementById('dialogue-text');
const aboutUs = document.getElementById('about-us');
const closeAboutBtn = document.getElementById('close-about');
const photoFrame = document.getElementById('photo-frame');
const heroPopup = document.getElementById('hero-popup');
const factText = document.querySelector('.short-fact');
const diary = document.getElementById('diary');
const diaryPopup = document.getElementById('diary-popup');
const closeDiaryBtn = document.getElementById('close-diary');
const diaryDialogueText = document.getElementById('diary-dialogue-text');
const diaryDialogue = document.getElementById('diary-dialogue');
const openDiaryYes = document.getElementById('open-diary-yes');
const openDiaryNo = document.getElementById('open-diary-no');
const key = document.getElementById('key');
const lockedSound = document.getElementById("locked-sound");
const transitionSound = document.getElementById("transition-sound");

let hasKey = false;
let heroPopupShown = false;
let hasExited = false;
let doorCooldown = false;
let preventMovement = false;

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


// Play button sound for all buttons (already done in your code)
document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => playSound("button-sound"));
});

// Play TV sound when photo frame clicked (on popup open)
photoFrame.addEventListener("click", () => {
  showHeroPopup();
  playSound("button-sound"); 
});

// Diary interaction - play sound when diary opens (not closes)
openDiaryYes.addEventListener("click", () => {
  playSound("button-sound");
  playSound("key-sound");  // Adding diary open sound here for effect
  diaryPopup.classList.remove('hidden');
  setTimeout(() => {
    diaryPopup.classList.add('show');
  }, 10);
  diaryDialogue.classList.add('hidden');
});

// Fix Diary close sound to NOT play on close (or separate sound if needed)
closeDiaryBtn.addEventListener('click', () => {

  diaryPopup.classList.add('closing');
  setTimeout(() => {
    diaryPopup.classList.remove('show', 'closing');
    diaryPopup.classList.add('hidden');
  }, 300);
});

// Dialogue box sound effect - simple dialogue open sound
function openDialogueWithSound(text) {
  dialogueText.textContent = text;
  dialogueBox.classList.remove('hidden');
  playRandomDialogueSound();  // plays a random dialogue .wav
  dialogueShown = true;
}

function closeDialogue() {
  dialogueBox.classList.add('hidden');
  dialogueShown = false;
}

const dialogueSounds = [
  new Audio('assets/Retro_03/Retro_Multiple_v1_wav.wav'),
  new Audio('assets/Retro_03/Retro_Multiple_v2_wav.wav'),
  new Audio('assets/Retro_03/Retro_Multiple_v3_wav.wav'),
  new Audio('assets/Retro_03/Retro_Multiple_v4_wav.wav'),
  new Audio('assets/Retro_03/Retro_Multiple_v5_wav.wav'),
  new Audio('assets/Retro_03/Retro_Multiple_v6_wav.wav')
];

function playRandomDialogueSound() {
  const randomSound = dialogueSounds[Math.floor(Math.random() * dialogueSounds.length)];
  console.log("Playing:", randomSound.src); // ← Add this
  randomSound.currentTime = 0;
  randomSound.play().catch(err => console.error("Playback error:", err));
}

document.addEventListener("click", () => {
  dialogueSounds.forEach(sound => {
    sound.play().then(() => sound.pause()).catch(() => {});
  });
}, { once: true });



// Picking up key
key.addEventListener("click", () => {
  playSound("key-sound");
  hasKey = true;
  key.style.display = 'none';
  showMessage("You picked up the key!");
});


// Show the falling diary after TV popup closes
function closeHero() {
  heroPopup.classList.add('closing');
  setTimeout(() => {
    heroPopup.classList.remove('show');
    heroPopup.classList.remove('closing');

    // Show and animate the falling diary
    diary.classList.remove('hidden');
    diary.classList.add('falling');
  }, 300);
}

document.getElementById('hero-popup').addEventListener('click', () => {
  const diary = document.getElementById('diary');
  diary.classList.add('fall');
});

// Facts for hero popup
const facts = [
  "Loves pink pixels and Laravel.",
  "Once designed a logo in under 10 minutes!",
  "Dreams of building story-driven games.",
  "Wants to study in KAIST university in Korea!",
  "Uses VSCode with pastel themes!"
];

// Show Hero Popup
function showHeroPopup() {
  if (heroPopupShown) return;

  const randomFact = facts[Math.floor(Math.random() * facts.length)];
  factText.textContent = `"${randomFact}"`;

  heroPopup.classList.remove('hidden', 'closing');
  void heroPopup.offsetWidth; 
  heroPopup.classList.add('show');

  heroPopupShown = true;
}

function closeHero() {
  heroPopup.classList.remove('show');
  heroPopup.classList.add('closing');

  setTimeout(() => {
    heroPopup.classList.remove('closing');
    heroPopup.classList.add('hidden');

    heroPopupShown = false;
  }, 300); 
}

// About Page
function goToAbout() {
  dialogueBox.classList.add('hidden');
  dialogueShown = false;
  aboutUs.classList.remove('hidden');
  setTimeout(() => {
    aboutUs.classList.add('show');
  }, 10);
}

closeAboutBtn.addEventListener('click', () => {
  aboutUs.classList.remove('show');
  setTimeout(() => {
    aboutUs.classList.add('hidden');
  }, 300);
});


// Close diary popup
closeDiaryBtn.addEventListener('click', () => {
  diaryPopup.classList.add('closing');
  setTimeout(() => {
    diaryPopup.classList.remove('show', 'closing');
    diaryPopup.classList.add('hidden');
  }, 300);
});

function showDiaryPrompt() {
  console.log("Z pressed! Showing prompt");
  playRandomDialogueSound();
  typeWriter("Do you want to see my diary?", diaryDialogueText, 25);
  diaryDialogue.classList.remove('hidden');

  openDiaryYes.style.display = 'inline-block';
  openDiaryNo.style.display = 'inline-block';
  dialogueShown = true;
}


function isNearDiary() {
  const diaryRect = diary.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();
  return (
    playerRect.left < diaryRect.right &&
    playerRect.right > diaryRect.left &&
    playerRect.top < diaryRect.bottom &&
    playerRect.bottom > diaryRect.top
  );
}

// Initial player position
let x = 10;
let y = 500;
let speed = 8;
let keys = {};
let dialogueShown = false;

// Furniture and wall obstacles
const obstacles = [
  { x: 100, y: 250, width: 400, height: 100 }, // sofa
  { x: 620, y: 240, width: 90, height: 90 },   // TV
  { x: 800, y: 240, width: 400, height: 120 }, // bookshelf
  { x: 900, y: 240, width: 100, height: 120 }, // plant
  { x: 0, y: 0, width: 1280, height: 20 },     // top wall
  { x: 0, y: 768, width: 1280, height: 20 },   // bottom wall
  { x: 0, y: 0, width: -50, height: 788 },     // left wall
];

// Collision checker
function isColliding(x, y) {
  return obstacles.some(ob =>
    x + player.offsetWidth > ob.x &&
    x < ob.x + ob.width &&
    y + player.offsetHeight > ob.y &&
    y < ob.y + ob.height
  );
}

// Keyboard controls
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if ((e.key === 'z' || e.key === 'Z') && !dialogueShown && isNearDiary()) {
    dialogueShown = true;
    hint.style.display = 'none';
    showDiaryPrompt();
  }
});

openDiaryNo.addEventListener('click', () => {
  diaryDialogue.classList.add('hidden');
  dialogueShown = false;
});

openDiaryYes.addEventListener('click', () => {
  diaryDialogue.classList.add('hidden');
  dialogueShown = false;
  goToDiary();
});

function goToDiary() {
  diaryPopup.classList.remove('hidden');
  void diaryPopup.offsetWidth; 
  diaryPopup.classList.add('show');
}

// Close dialogue
function closeDialogue() {
  dialogueBox.classList.add('hidden');
  dialogueShown = false;
    hint.style.display = 'block'; 
}

function closeDiaryDialogue() {
  // Hide the dialogue box
  dialogueBox.classList.add('hidden');
  dialogueShown = false;

  hint.style.display = 'block';

  diary.classList.remove('glow');
}

// Typewriter effect
function typeWriter(text, element, speed = 30) {
  let i = 0;
  element.textContent = '';
  function typing() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

// Main Game Loop
function gameLoop() {
  let moved = false;
  let nextX = x;
  let nextY = y;

  // Movement and sprite direction
if (!preventMovement) {
  if (keys['ArrowUp'] || keys['w']) {
    nextY -= speed;
    player.src = 'assets/css/img/player_up.webp';
    moved = true;
  }
  if (keys['ArrowDown'] || keys['s']) {
    nextY += speed;
    player.src = 'assets/css/img/player_down.webp';
    moved = true;
  }
  if (keys['ArrowLeft'] || keys['a']) {
    nextX -= speed;
    player.src = 'assets/css/img/player_left.webp';
    moved = true;
  }
  if (keys['ArrowRight'] || keys['d']) {
    nextX += speed;
    player.src = 'assets/css/img/player_right.webp';
    moved = true;
  }
}

  // Apply movement if no collision
  if (!isColliding(nextX, nextY)) {
    x = nextX;
    y = nextY;
  }

  player.style.left = `${x}px`;
  player.style.top = `${y}px`;

  // Player bounding box
  const playerLeft = x;
  const playerTop = y;
  const playerRight = x + player.offsetWidth;
  const playerBottom = y + player.offsetHeight;

  // paper bounding box
  const paperLeft = paper.offsetLeft;
  const paperTop = paper.offsetTop;
  const paperRight = paperLeft + paper.offsetWidth;
  const paperBottom = paperTop + paper.offsetHeight;

  // Frame bounding box
  const frameLeft = photoFrame.offsetLeft;
  const frameTop = photoFrame.offsetTop;
  const frameRight = frameLeft + photoFrame.offsetWidth;
  const frameBottom = frameTop + photoFrame.offsetHeight;

  // Diary bounding box
  const diaryLeft = diary.offsetLeft;
  const diaryTop = diary.offsetTop;
  const diaryRight = diaryLeft + diary.offsetWidth;
  const diaryBottom = diaryTop + diary.offsetHeight;

  // Interactions
  const overlapsPaper =
    playerLeft < paperRight &&
    playerRight > paperLeft &&
    playerTop < paperBottom &&
    playerBottom > paperTop;

  const overlapsFrame =
    playerLeft < frameRight &&
    playerRight > frameLeft &&
    playerTop < frameBottom &&
    playerBottom > frameTop;

    
  const overlapsDiary =
    playerLeft < diaryRight &&
    playerRight > diaryLeft &&
    playerTop < diaryBottom &&
    playerBottom > diaryTop;

  // Paper interaction
if (overlapsPaper) {
  paper.classList.add('glow');
  if (!dialogueShown) {
    hint.textContent = 'Press Z to read the note';
    hint.style.display = 'block';
    hint.style.top = `${paper.offsetTop - 40}px`;
    hint.style.left = `${paper.offsetLeft - 20}px`;
  }

if ((keys['z'] || keys['Z']) && !dialogueShown) {
  openDialogueWithSound("Hm? A piece of paper...");
  typeWriter("Hm? A piece of paper...", dialogueText, 25);
  hint.style.display = 'none'; 
}

} else {
  paper.classList.remove('glow');
}

  // Frame interaction
if (overlapsFrame && !heroPopupShown) {
  hint.textContent = 'Press Z to turn on the tv';
  hint.style.display = 'block';
  hint.style.top = `${photoFrame.offsetTop - 40}px`;
  hint.style.left = `${photoFrame.offsetLeft - 20}px`;

  if (keys['z'] || keys['Z']) {
    showHeroPopup();
    hint.style.display = 'none';
    playSound("button-sound");
  }
}

// Diary interaction
if (overlapsDiary) {
  diary.classList.add('glow');
  if (!dialogueShown) {
    hint.textContent = 'Press Z to read the diary';
    hint.style.display = 'block';
    hint.style.top = `${diary.offsetTop - 40}px`;
    hint.style.left = `${diary.offsetLeft - 20}px`;
  }

if ((keys['z'] || keys['Z']) && !dialogueShown) {
  dialogueShown = true;
  hint.style.display = 'none';
  showDiaryPrompt(); // Call the correct function
}

} else {
  diary.classList.remove('glow');
  if (!dialogueShown) {
  }
}
  // Hide hint if not near anything
  if (!overlapsPaper && !overlapsFrame && !overlapsDiary) {
    hint.style.display = 'none';
  }

  key.addEventListener('click', () => {
  key.classList.add('collected');
  hasKey = true;
  console.log("You picked up the key!");
  typeWriter("You picked a key to the next room!", diaryDialogueText, 25);
});

function updateCharacterPosition() {
  const character = document.getElementById("player");
  character.style.left = `${x}px`;
}


// Function to show non-blocking message
function showMessage(message) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = message;
  messageBox.style.display = "block";
  setTimeout(() => {
    messageBox.style.display = "none";
  }, 3000); // Message lasts for 3 seconds
}

// Exit trigger logic
if (x > 1200 && !hasExited && !doorCooldown) {
  if (hasKey) {
    hasExited = true;
    showMessage("Leaving Living Room... transitioning to kitchen!");
     transitionSound.play();

    const scene = document.getElementById("scene");
    if (scene) {
      // Delay to allow message to display *before* transition starts
      setTimeout(() => {
        scene.classList.add("fade-out");

        setTimeout(() => {
          console.log("Transition to Kitchen completed.");
          window.location.href = "Skill.html";
        }, 1000); 
      }, 500); 
    }
  } else {
    doorCooldown = true;
    showMessage("The door is locked. You need to find the key first!");
    lockedSound.play();
    
    x = 100; 
    updateCharacterPosition();

    setTimeout(() => {
      doorCooldown = false;
    }, 1000);
  }

}
  requestAnimationFrame(gameLoop);
}

gameLoop();
