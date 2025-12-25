const player = document.getElementById('player');
const repairPopup = document.getElementById("repair-popup");
const closePopup = document.getElementById("close-popup");
const repairBox = document.getElementById("repair-box");
const sewingBox = document.getElementById("sewing-box");
const sewingPopup = document.getElementById("sewing-popup");
const closeSewingBtn = document.getElementById("close-sewing-popup");
const hint = document.getElementById("hint");
const personalBox = document.getElementById("personal-box");
const personalPopup = document.getElementById("personal-popup");
const closePersonalBtn = document.getElementById("close-personal-popup");
const notePaper = document.getElementById("note-paper");
const lockedSound = new Audio('assets/locked.mp3');
const transitionSound = new Audio('assets/transition.mp3');
const drawer = new Audio('assets/drawer.mp3');

let x = 10, y = 500;
let speed = 8;
let keys = {};
let preventMovement = false;
let hasExited = false;
let doorCooldown = false;
let drawerOpen = false;
let drawerLocked = false; 
let sewingOpen = false;
let sewingLocked = false;
let personalOpen = false;
let personalLocked = false;
let noteRead = false;
let fragments = {
  circuit: false, // Internship
  gear: false,    // School
  battery: false  // Personal
};

function openInternProject(id) {
  playSound("ui-click"); 
  let file = "";

  if (id === "fixquest") file = "fixquest.html";
  else if (id === "notatrack") file = "notatrack.html";

  fetch(file)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById("project-content");
      container.innerHTML = html;

      // show popup
      document.getElementById("project-popup").classList.remove("hidden");
      preventMovement = true;

      // run scripts inside loaded HTML
      const temp = document.createElement("div");
      temp.innerHTML = html;
      const scripts = temp.querySelectorAll("script");

      scripts.forEach(oldScript => {
        const newScript = document.createElement("script");
        if (oldScript.src) newScript.src = oldScript.src;
        else newScript.innerHTML = oldScript.innerHTML;
        document.body.appendChild(newScript);
      });
    });
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


// --- convenient refs ---
const gameContainer = document.getElementById('game-container');

// --- robust show/hide hint that positions relative to game container ---
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

function showMessage(text, duration = 2500) {
  const box = document.getElementById("messageBox");
  box.textContent = text;
  box.classList.add("show");

  setTimeout(() => {
    box.classList.remove("show");
  }, duration);
}


// touchingNote //
function touchingNote() {
  const px = x;
  const py = y;
  const pw = player.offsetWidth;
  const ph = player.offsetHeight;

  const n = getLocalRect(notePaper);
  return (
    px < n.left + n.width &&
    px + pw > n.left &&
    py < n.top + n.height &&
    py + ph > n.top
  );
}


// touchingRepairBox //
function touchingRepairBox() {
  
  const px = x;
  const py = y;
  const pw = player.offsetWidth;
  const ph = player.offsetHeight;

  const r = getLocalRect(repairBox);
  return (
    px < r.left + r.width &&
    px + pw > r.left &&
    py < r.top + r.height &&
    py + ph > r.top
  );
}

// touchingSewingBox //
function touchingSewingBox() {
  const px = x;
  const py = y;
  const pw = player.offsetWidth;
  const ph = player.offsetHeight;

  const s = getLocalRect(sewingBox);
  return (
    px < s.left + s.width &&
    px + pw > s.left &&
    py < s.top + s.height &&
    py + ph > s.top
  );
}

// touchingPersonalBox //
function touchingPersonalBox() {
  const px = x;
  const py = y;
  const pw = player.offsetWidth;
  const ph = player.offsetHeight;

  const p = getLocalRect(personalBox);

  return (
    px < p.left + p.width &&
    px + pw > p.left &&
    py < p.top + p.height &&
    py + ph > p.top
  );
}

// --- Drawer (repair) logic (Z) ---
function handleDrawerInteraction() {
  // If player also touching sewing box → do not show drawer hint
  if (touchingSewingBox()) return;

  if (touchingRepairBox()) {
    repairBox.classList.add("glow");

    if (!drawerOpen) {
      const r = getLocalRect(repairBox);
      showHint("Press Z to open drawer", r.top, r.left + r.width/2 - 30);
    }

    if (keys['z'] && !drawerLocked) {
      drawerOpen = !drawerOpen;
      drawerLocked = true;
      hideHint();

  drawer.play();

      if (drawerOpen) {
        repairPopup.classList.remove("hidden");
        void repairPopup.offsetWidth;
        repairPopup.classList.add("drawer-open");
        repairPopup.classList.remove("drawer-close");
        preventMovement = true;
      } else {
        repairPopup.classList.add("drawer-close");
        repairPopup.classList.remove("drawer-open");
        setTimeout(() => {
          repairPopup.classList.add("hidden");
          repairPopup.classList.remove("drawer-close");
        }, 350);
        preventMovement = false;
      }

      setTimeout(()=> drawerLocked = false, 300);
    }

  } else {
    repairBox.classList.remove("glow");
  }
}

// close buttons (use same close animation)
closePopup.addEventListener('click', () => {
  drawerOpen = false;
  drawerLocked = false;
  preventMovement = false;
  hideHint();
  drawer.play();
  repairPopup.classList.remove("drawer-open");
  repairPopup.classList.add("drawer-close");
  setTimeout(() => {
    repairPopup.classList.add("hidden");
    repairPopup.classList.remove("drawer-close");
  }, 350);
});


// -- Sewing logic —  -- //
function handleSewingInteraction() {
  if (touchingSewingBox()) {
    sewingBox.classList.add("glow");
    if (!sewingOpen) {
      const s = getLocalRect(sewingBox);
      showHint("Press z to view the sewing results", s.top, s.left + s.width/2 - 30);
    }

    if (keys['z'] && !sewingLocked) {
      sewingOpen = !sewingOpen;
      sewingLocked = true;
      hideHint();

      playSound("spawn-sound");

      if (sewingOpen) {
        sewingPopup.classList.remove("hidden");
        void sewingPopup.offsetWidth;
        sewingPopup.classList.add("pop-in");
        sewingPopup.classList.remove("pop-out");
        preventMovement = true;
      } else {
        sewingPopup.classList.add("pop-out");
        sewingPopup.classList.remove("pop-in");
        setTimeout(() => {
          sewingPopup.classList.add("hidden");
          sewingPopup.classList.remove("pop-out");
        }, 350);
        preventMovement = false;
      }

      setTimeout(()=> sewingLocked = false, 300);
    }
  } else {
    sewingBox.classList.remove("glow");
  }
}

closeSewingBtn.addEventListener('click', () => {
  sewingOpen = false;
  sewingLocked = false;
  preventMovement = false;
  hideHint();
  playSound("spawn-sound");
  sewingPopup.classList.remove("pop-in");
  sewingPopup.classList.add("pop-out");
  setTimeout(() => {
    sewingPopup.classList.add("hidden");
    sewingPopup.classList.remove("pop-out");
  }, 350);
});

// -- Shelf logic —  -- //
function handlePersonalInteraction() {
  if (touchingPersonalBox()) {

    personalBox.classList.add("glow");

    if (!personalOpen) {
      const p = getLocalRect(personalBox);
      showHint("Press z to view Shelf", p.top, p.left + p.width/2 - 30);
    }

    if (keys['z'] && !personalLocked) {
      personalOpen = !personalOpen;
      personalLocked = true;
      hideHint();
      drawer.play();

      if (personalOpen) {
    personalPopup.classList.remove("hidden");
    void personalPopup.offsetWidth;
    personalPopup.classList.add("show");
    preventMovement = true;
} else {
    personalPopup.classList.remove("show");
    setTimeout(() => personalPopup.classList.add("hidden"), 350);
    preventMovement = false;
}

      setTimeout(() => personalLocked = false, 300);
    }

  } else {
    personalBox.classList.remove("glow");
  }
}

closePersonalBtn.addEventListener('click', () => {
  personalOpen = false;
  personalLocked = false;
  preventMovement = false;
  hideHint();
  drawer.play();
  
  personalPopup.classList.remove("show");

  setTimeout(() => {
    personalPopup.classList.add("hidden");
  }, 350);
});

// -- Fragment logic —  -- //
function collectFragment(type) {
  if (fragments[type]) return; // prevent double collect

  playSound("fragment-pick");

  fragments[type] = true;

  let text = "";
  let elId = "";

  if (type === "circuit") {
    text = "You found a Fragment: Circuit Board";
    elId = "circuit-fragment";
  }

  if (type === "gear") {
    text = "You found a Fragment: Gear Piece ";
    elId = "gear-fragment";
  }

  if (type === "battery") {
    text = "You found a Fragment: Battery Cell";
    elId = "battery-fragment";
  }

  showSmallPopup(text);

  const el = document.getElementById(elId);
  if (el) el.classList.add("hidden");

  checkExitReady();
}

function allFragmentsCollected() {
  return (
    fragments.circuit &&
    fragments.gear &&
    fragments.battery
  );
}

// -- Fragment pop out logic —  -- //
function showSmallPopup(text) {
  const popup = document.createElement("div");
  popup.className = "small-popup";
  popup.innerText = text;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("visible");
  }, 10);

  setTimeout(() => {
    popup.classList.remove("visible");
    setTimeout(() => popup.remove(), 300);
  }, 2000);
}

document.getElementById("personal-box").addEventListener("click", () => {
    document.getElementById("personal-popup").classList.add("show");
    document.getElementById("personal-popup").classList.remove("hidden");
});

document.getElementById("close-personal-popup").addEventListener("click", () => {
    document.getElementById("personal-popup").classList.remove("show");
    setTimeout(() => {
        document.getElementById("personal-popup").classList.add("hidden");
    }, 400);
});


function  openSchoolProject(project) {
  const popup = document.getElementById("project-popup-sew");
  const content = document.getElementById("project-content-sew");
  playSound("ui-click"); 
  
  let html = "";

  if (project === "sweets") {
    html = `
      <h1 class="proj-title"> Sweets & Treats 
</h1>
      <!-- PANEL 1 -->
        <div class="proj-panel">
  <div class="proj-section">
    <h2>- What is Sweets & Treats?</h2>
    <p>
      Sweets & Treats is my very first school web development project, 
      a dessert themed e-commerce website where users can explore  
      different sweets and learn more about each products.
      <br><br>
      The project was originally inspired by a YouTube tutorial, but I  
      customized the design, layout, and user interface to fits my personal style.  
      <br><br>
      It was built using only HTML, CSS, and JavaScript, making it an  
      important milestone in my journey of learning front-end web  
      development.
    </p>
  </div>

  <div class="proj-section">
    <h2>- Key Features</h2>
    <ul>
      <li>✔ Dessert-themed landing page</li>
      <li>✔ Product listing grid</li>
      <li>✔ Simple shopping cart UI</li>
      <li>✔ Pastel visuals and smooth transitions</li>
    </ul>
  </div>
  </div>

<!-- PANEL 2 -->
  <div class="proj-panel">
    <h2>🖼 Screenshots</h2>
         <p>Here is a quick preview of Sweets & Treats interface:</p>
      <img src="assets/css/img project/Sweets & Treats/S&T_landing.webp" class="proj-img">
      <img src="assets/css/img project/Sweets & Treats/S&T_menu.webp" class="proj-img">
      <img src="assets/css/img project/Sweets & Treats/S&T_about.webp" class="proj-img">
      <img src="assets/css/img project/Sweets & Treats/S&T_contact.webp" class="proj-img">
  </div>

<!-- PANEL 3 -->
<div class="proj-panel">

  <h2 class="panel-title-center">🛠 Tools Used</h2>

  <div class="proj-tags tags-centered">
    <span>HTML</span>
    <span>CSS</span>
    <span>JavaScript</span>
    <span>VS Code</span>
  </div>

  <div class="proj-section tutorial-box">
    <h2 class="panel-title-center">Tutorial Credit</h2>

    <p class="tutorial-text">
      This project was created with guidance from the following tutorial:
    </p>

    <p class="tutorial-link">
      <a href="https://www.youtube.com/watch?v=cLOT0APQzDs&t=2166s" 
         target="_blank">
        https://www.youtube.com/watch?v=cLOT0APQzDs&t=2166s
      </a>
    </p>
  </div>

</div>

    `;
  }

    if (project === "debian") {
    html = `
      <h1 class="proj-title"> Debian Guide </h1>

      <!-- PANEL 1 -->
     <div class="proj-panel">
  <div class="proj-section">
    <h2>- What is Debian Guide?</h2>
    <p>
      A comprehensive school project explaining Debian Linux, covering system
      installation, basic terminal commands, configuration steps,
      package management, and essential Linux concepts.
    </p>
    <p>
      This project also includes visual diagrams, command explanations,
      troubleshooting notes, and a simplified mini-book version compiled
      into a PDF.
    </p>
  </div>

       <div class="proj-section">
    <h2>- Key Features</h2>
    <ul>
      <li>✔ Full digital web version</li>
      <li>✔ Printable mini-book PDF</li>
      <li>✔ Step-by-step installation walkthrough</li>
      <li>✔ Beginner-friendly command reference</li>
    </ul>
  </div>
</div>

        <!-- PANEL 2 -->
       <div class="proj-panel">
        <h2>🖼 Screenshots</h2>
        <p>Here is a quick preview of Debian Guide interface:</p>
      <img src="assets/css/img project/Debian Guide/DB_landing.webp" class="proj-img">
      <img src="assets/css/img project/Debian Guide/DB_about.webp" class="proj-img">
      <img src="assets/css/img project/Debian Guide/DB_tutorial.webp" class="proj-img">
      <img src="assets/css/img project/Debian Guide/DB_tutor.webp" class="proj-img">
      </div>

      <!-- PANEL 3 -->
     <div class="proj-panel">
  <h2 class="panel-title-center">🛠 Tools Used</h2>
  <div class="proj-tags tags-centered">
    <span>HTML</span>
    <span>CSS</span>
    <span>VS Code</span>
  </div>

  <div class="proj-section tutorial-box">
    <h2 class="panel-title-center">- Download Documentation</h2>
    <p class="tutorial-text">
      You can download the full Debian Guide mini-book here:
    </p>

    <a href="assets/pdf/Debian_Guide.pdf" 
       download 
       class="download-btn">
      ⬇ Download Debian Guide (PDF)
    </a>

  </div>
</div>
    `;
  }

  if (project === "skz") {
    html = `
     
      <h1 class="proj-title"> StayTuned </h1>

      <!-- PANEL 1 -->
      <div class="proj-panel">
      <div class="proj-section">
        <h2>- What is StayTuned?</h2>
          <p>
      StayTuned is my first full project built using Laravel. a simple yet  
      clean article-based website dedicated to Stray Kids.  
      It features categorized posts, a structured layout, and
      a Blade-powered interface that follows Laravel’s MVC architecture.
    </p>
    <p>
      This project helped me understand how modern web frameworks work,
      from routing and templating to controller logic and file organization.
    </p>
  </div>

   <div class="proj-section">
    <h2>📌 Key Features</h2>
    <ul>
      <li>✔ Home & About pages</li>
      <li>✔ Blog overview page with multiple article previews</li>
      <li>✔ Individual article pages</li>
      <li>✔ Organized MVC folder structure</li>
      <li>✔ Reusable Blade components</li>
    </ul>
  </div>

</div>

        <!-- PANEL 2 -->
       <div class="proj-panel">
        <h2>🖼 Screenshots</h2>
         <p>Here is a quick preview of StayTuned interface:</p>
      <img src="assets/css/img project/StayTuned/ST_about.webp" class="proj-img">
      <img src="assets/css/img project/StayTuned/ST_blog.webp" class="proj-img">
      <img src="assets/css/img project/StayTuned/ST_articles.webp" class="proj-img">
      <img src="assets/css/img project/StayTuned/ST_article.webp" class="proj-img">
      </div>

      <!-- PANEL 3 -->
      <div class="proj-panel">
  <h2 class="panel-title-center">🛠 Tools Used</h2>
  <div class="proj-tags tags-centered">
    <span>Laravel</span>
    <span>PHP</span>
    <span>HTML</span>
    <span>CSS</span>
    <span>VS Code</span>
  </div>

  <div class="proj-section">
    <h2 class="panel-title-center">- What I Learned</h2>

    <ul>
      <li> Understanding and creating Laravel routes  ✔ </li>
      <li> Building pages using Blade templates ✔ </li>
      <li> Passing data from Controllers to views ✔ </li>
      <li> Organizing files using MVC structure ✔ </li>
      <li> Using Laravel’s built-in helper functions ✔ </li>
      <li> Structuring layouts with template inheritance ✔ </li>
    </ul>
  </div>
</div>

    `;
  }

content.innerHTML = html;

popup.classList.remove("hidden");

requestAnimationFrame(() => {
  popup.classList.add("show");
});

}

function  openPersonalProject(project) {
  const popup = document.getElementById("shelf-popup");
  const content = document.getElementById("shelf-popup-content");

   playSound("ui-click"); 
  let html = "";

if (project === "healthify") {
  html = `
   <div class="verdict-title-wrap">
  <h1 class="proj-title-ver">Healthify</h1>
      <img src="assets/css/img project/Healthify/strawberry.webp" class="verdict-cobweb-img" alt="" />
      <img src="assets/css/img project/Healthify/health.webp" class="verdict-Carrot-img" alt="" />
</div>

<!-- PANEL 1 — INTRO -->
<div class="proj-panel verdict-panel">
  <div class="proj-section-ver">
    <h2>What is Healthify?</h2>

    <p>
      <b>Healthify</b> is a personal calorie and weight tracking web app I created because existing trackers were either too complex or didn’t fit my eating habits. I wanted a tool that was simple, clean, and easy to use.
    </p>

    <p>
      Healthify allows users to log daily meals, track calorie intake, and monitor weekly weight changes without feeling overwhelmed. Its straightforward dashboard helps maintain consistency and stay aware of personal health progress.
    </p>

    <p>
      By making it myself, I could design a system tailored to real-life eating patterns, making tracking habits easier and more practical for everyday use.
    </p>
  </div>
</div>


  <!-- PANEL 2 — FEATURES -->
  <div class="proj-panel verdict-panel">
    <div class="proj-section-ver">
      <h2>Key Features</h2>

      <ul>
        <li>Clean and minimal dashboard layout</li>
        <li>Daily meal & calorie logging</li>
        <li>Weekly weight tracking</li>
        <li>Automatic calorie deficit calculation</li>
        <li>Progress visualization with charts</li>
      </ul>
    </div>
  </div>

  
  <!-- PANEL 3 — GAME SYSTEMS -->
<div class="proj-panel verdict-panel">
  <div class="proj-section-ver">
    <h2>Benefits I Get</h2>
    <p>This project provides me with several important benefits that help me manage my health and daily habits more effectively. Some of the main advantages include:</p>

    <ul>
      <li><b>Losing Weight:</b> By tracking my meals and calorie intake consistently, I can monitor my progress and stay motivated toward achieving my weight loss goals.</li>
      <li><b>Keeping Watch on What I Ate:</b> The system allows me to log every meal, giving me a clear overview of my nutritional habits and helping me make healthier food choices.</li>
      <li><b>Reminder to Drink:</b> Staying hydrated is essential for overall health, and this project provides regular reminders to drink water throughout the day, preventing dehydration.</li>
      <li><b>Knowing My Weight:</b> By recording daily or weekly weight measurements, I can track trends over time and adjust my diet and exercise routines accordingly, ensuring steady progress.</li>
    </ul>

    <p>Overall, this project not only helps me manage my physical health but also encourages discipline, awareness, and consistency in my daily lifestyle.</p>
  </div>
</div>


        <!-- SCREENSHOTS PANEL -->
    <div class="proj-panel verdict-panel verdict-theme">
      <h2 class="panel-title-center-ver verdict-subtitle">🖼 Screenshots</h2>
      <div class="verdict-divider"></div>

      <div class="verdict-screens">
  
        <img src="assets/css/img project/Healthify/H_landing.webp" />
        <img src="assets/css/img project/Healthify/H_register.webp" />
        <img src="assets/css/img project/Healthify/H_main.webp" />
        <img src="assets/css/img project/Healthify/H_meals.webp" />
        <img src="assets/css/img project/Healthify/H_weight.webp" />
        <img src="assets/css/img project/Healthify/H_progress.webp" />
        <img src="assets/css/img project/Healthify/H_goals.webp" />

        
      </div>
    </div>

  <!-- PANEL 4 — TOOLS & LEARNING -->
  <div class="proj-panel verdict-panel">
    <h2 class="panel-title-center-ver">Tools & What I Learned</h2>

    <div class="proj-tags-ver tags-centered">
      <span>HTML</span>
      <span>Tailwind CSS</span>
      <span>JavaScript</span>
      <span>VS Code</span>
      <span>Xampp</span>
    </div>

   <div class="proj-section-ver">
  <ul>
    <li>Designed simple and user-focused UX flows for a smooth experience</li>
    <li>Handled and stored user input data securely and efficiently</li>
    <li>Implemented calorie tracking and personalized goal calculations</li>
    <li>Created basic data visualizations using charts to track progress</li>
    <li>Learned and applied Tailwind CSS to style the app with a clean, responsive design</li>
  </ul>
</div>

  </div>

  `;
}

if (project === "verdict") {
  html = `

    <div class="verdict-title-wrap">
  <h1 class="proj-title-ver">Last Verdict</h1>
      <img src="assets/css/img project/Last-Verdict/cobweb.webp" class="verdict-cobweb-img" alt="" />
    <img src="assets/css/img project/Last-Verdict/gold.webp" class="verdict-gold-img" alt="" />
</div>

<!-- PANEL 1 — INTRO -->
    <div class="proj-panel verdict-panel">
      <div class="proj-section-ver">
        <h2> What is Last Verdict?</h2>
   <p>
  <b>Last Verdict</b> is a gothic, morality-based judgement game set in a cathedral-like afterlife court. 
  You awaken as a lost soul offered one final chance to rewrite your fate by judging the wandering dead.
</p>

<p>
  Each soul wears a mask carved with their sin. They may plead, lie, or deceive, and your choices decide 
  whether they rise toward redemption or fall into condemnation. Your judgement also shapes your own final fate.
</p>

<p>
  This project is built with <b>Phaser.js</b> for gameplay and <b>Laravel</b> for backend systems like data saving 
  and branching outcomes. It is a personal project created to strengthen my full-stack and game development skills.
</p>

<p>
  <b>"The game is currently a work in progress (WIP)."</b>
</p>
      </div>
       </div>

 <!-- PANEL 2 — FEATURES -->
    <div class="proj-panel verdict-panel">
      <div class="proj-section-ver">
        <h2> Key Features</h2>
        <ul>
          <li> Gothic afterlife courtroom setting</li>
          <li> Evidence-based soul investigation system</li>
          <li> Mask reactions based on sin alignment</li>
          <li> Time-limited decision cycle</li>
          <li> Corruption & moral alignment meter</li>
          <li> Hidden murderer storyline</li>
          <li> Multiple endings shaped by your decisions</li>
        </ul>
      </div>
    </div>

<!-- PANEL 3 — GAME SYSTEMS -->
    <div class="proj-panel verdict-panel">
    <div class="proj-section-ver">
      <h2> Core Game Systems</h2>
      <p>Every judgement is shaped by several evidence tools and reactions:</p>

      <ul>
        <li><b>Book of Life:</b> A detailed yet sometimes <i>redacted</i> record of a soul’s actions.</li>
        <li><b>Witness Letters:</b> Biased, contradictory, or emotionally driven testimonies.</li>
        <li><b>Mask Reaction System:</b> Masks crack, glow, or distort when the soul lies.</li>
        <li><b>Interrogation:</b> Question the soul directly and observe emotional tells.</li>
        <li><b>Soul Ledger:</b> A cosmic balance sheet of their virtues and sins.</li>
        <li><b>Death Certificate:</b> A document that may hide or alter the truth.</li>
        <li><b>Timed Judgement:</b> Choose <b>Redeem</b> or <b>Condemn</b> before the mask “sets.”</li>
      </ul>

      <p>
        These systems work together to create a tense and atmospheric judgement flow,
        forcing players to weigh truth, doubt, and personal bias.
      </p>
    </div>
       </div>

  <!-- PANEL 4 — UI & VISUAL DESIGN -->
<div class="proj-panel verdict-panel">
  <h2 class="panel-title-center-ver">UI & Visual Design</h2>
  <div class="verdict-divider"></div>

  <div class="verdict-design-grid">

    <!-- CARD 1 — Mask System -->
<div class="design-card">
  <h3>Mask Characters</h3>
  <p>
    Each soul wears a carved mask representing their sin in life. 
    Scroll to view different characters and their mask designs.
  </p>

  <div class="mask-scroll">
    <div class="mask-item">
      <img src="assets/css/img project/Last-Verdict/lust.webp" alt="anger mask">
      <span>Lust</span>
    </div>

    <div class="mask-item">
      <img src="assets/css/img project/Last-Verdict/greed.webp" alt="greed mask">
      <span>Greed</span>
    </div>

    <div class="mask-item">
      <img src="assets/css/img project/Last-Verdict/envy.webp" alt="envy mask">
      <span>Envy</span>
    </div>

    <div class="mask-item">
      <img src="assets/css/img project/Last-Verdict/wrath.webp" alt="wrath mask">
      <span>Wrath</span>
    </div>

    <div class="mask-item">
      <img src="assets/css/img project/Last-Verdict/gluttony.webp" alt="pride mask">
      <span>Gluttony</span>
    </div>

    <div class="mask-item">
      <img src="assets/css/img project/Last-Verdict/pride.webp" alt="pride mask">
      <span>Pride</span>
    </div>

     <div class="mask-item">
      <img src="assets/css/img project/Last-Verdict/sloth.webp" alt="pride mask">
      <span>Sloth</span>
    </div>
  </div>
</div>

    <!-- CARD 2 — Book of Life -->
    <div class="design-card">
      <h3>Book of Life UI</h3>
      <p>
        A parchment-style record system with redacted lines, sealed pages, 
        and animated flips to reinforce the gothic archive aesthetic.
      </p>
    <img src="assets/css/img project/Last-Verdict/book.webp" alt="book ui">
    </div>

    <!-- CARD 3 — Soul Ledger -->
    <div class="design-card">
      <h3>Soul Ledger Interface</h3>
      <p>
        Shows a balance of virtues vs sins using a golden, scale-like UI. 
        Lights and sigils respond to player judgement choices.
      </p>
      <img src="assets/css/img project/Last-Verdict/ledger.webp" alt="ledger ui">
    </div>

    <!-- CARD 4 — Judgement Buttons -->
    <div class="design-card">
      <h3>Judgement Controls</h3>
      <p>
        Redeem / Condemn buttons styled as cathedral seals.  
        Buttons glow and pulse under time pressure.
      </p>
      <img src="assets/css/img project/Last-Verdict/redeem.webp" alt="controls ui">
       <img src="assets/css/img project/Last-Verdict/condemn.webp" alt="controls ui">
    </div>

    <!-- CARD 5 — Death Certificate -->
    <div class="design-card">
      <h3>Death Certificate</h3>
      <p>
        A gothic black-and-gold certificate presented when a judgement is finalized.  
        Includes cause of death, sin alignment, redacted life details, 
        and a wax-sealed verdict stamp.
      </p>
      <img src="assets/css/img project/Last-Verdict/death-cert.webp" alt="death certificate">
    </div>

    <!-- CARD 6 — Player Character Select -->
    <div class="design-card">
      <h3>Player Character Select</h3>
      <p>
        Choose between two playable characters (Male or Female).  
        Each has unique dialogue reactions and subtle moral tendencies 
        that affect investigation outcomes.
      </p>

      <div class="mask-scroll">
        <div class="mask-item">
          <img src="assets/css/img project/Last-Verdict/player-m.webp" alt="male player">
          <span>Male</span>
        </div>

        <div class="mask-item">
          <img src="assets/css/img project/Last-Verdict/player-f.webp" alt="female player">
          <span>Female</span>
        </div>
      </div>
    </div>

  </div>
</div>


        <!-- SCREENSHOTS PANEL -->
    <div class="proj-panel verdict-panel verdict-theme">
      <h2 class="panel-title-center-ver verdict-subtitle">🖼 Screenshots</h2>
      <div class="verdict-divider"></div>

      <div class="verdict-screens">
   
          <img src="assets/css/img project/Last-Verdict/LV_login.webp" />
        <img src="assets/css/img project/Last-Verdict/LV_player.webp" />
        <img src="assets/css/img project/Last-Verdict/LV_main.webp" />
        <img src="assets/css/img project/Last-Verdict/LV_book.webp" />
        <img src="assets/css/img project/Last-Verdict/LV_certificate.webp" />
        <img src="assets/css/img project/Last-Verdict/LV_ledger.webp" />
        <img src="assets/css/img project/Last-Verdict/LV_ending.webp" />
        
      </div>
    </div>

    <!-- PANEL 5 — TECH -->
    <div class="proj-panel verdict-panel">
      <h2 class="panel-title-center-ver">🛠 Tools Used</h2>
      <div class="proj-tags-ver tags-centered">
        <span>Phaser.js</span>
        <span>Laravel</span>
        <span>PHP</span>
        <span>HTML</span>
        <span>CSS</span>
        <span>VS Code</span>
         <span>Xampp</span>
      </div>

 <div class="proj-section-ver">
  <h3>What I Learned From This Project:</h3>
  <ul>
    <li><b>Branching Logic Design:</b> Creating multiple moral outcomes based on player choices and tracking hidden variables.</li>
    <li><b>Phaser.js Gameplay Systems:</b> Implementing character interaction, dialogue flow, UI animation, and mask-state mechanics.</li>
    <li><b>UX & Gothic UI Styling:</b> Designing a dark, cathedral-inspired interface consistent with the game’s tone and worldbuilding.</li>
    <li><b>Narrative Structuring:</b> Writing connected stories for souls, emotional pacing, and consequences that feel meaningful.</li>
  </ul>
</div>
    </div>
  `;
}


content.innerHTML = html;

popup.classList.remove("hidden");

requestAnimationFrame(() => {
  popup.classList.add("show");
});

}

  document.getElementById("shelf-popup-close").addEventListener("click", () => {
    playSound("ui-click"); 
  const popup = document.getElementById("shelf-popup");
  popup.classList.remove("show");

  setTimeout(() => {
    popup.classList.add("hidden");
    document.getElementById("shelf-popup-content").innerHTML = "";
  }, 300);
});

// -- Drawer pop out close —  -- //
const projectPopup = document.getElementById("project-popup");
const closeProjectPopup = document.getElementById("close-project-popup");

closeProjectPopup.addEventListener("click", () => {
  playSound("ui-click"); 

  // Add closing animation
  projectPopup.classList.add("closing");

  // After animation ends → hide
  projectPopup.addEventListener("animationend", () => {
    projectPopup.classList.add("hidden");
    projectPopup.classList.remove("closing");

    // Clear content
    document.getElementById("project-content").innerHTML = "";

  }, { once: true });
});

// -- Sewing pop out close —  -- //
const closeSewBtn = document.getElementById("close-project-popup-sew");
const sewPopup = document.getElementById("project-popup-sew");
const sewContent = document.getElementById("project-content-sew");

closeSewBtn.addEventListener("click", () => {
  playSound("ui-click"); 

  sewPopup.offsetWidth; 

  sewPopup.classList.remove("show");
  sewPopup.classList.add("closing");

  sewContent.addEventListener("animationend", () => {

    sewPopup.classList.remove("show");
    sewPopup.classList.remove("closing");

    sewContent.innerHTML = "";  // clear content

  }, { once: true });
});



// Obstacles
const obstacles = [
  { x: 100, y: 250, width: 400, height: 100 },
  { x: 620, y: 240, width: 90, height: 90 },
  { x: 800, y: 240, width: 400, height: 120 },
  { x: 900, y: 240, width: 100, height: 120 },
  { x: 0, y: 0, width: 1280, height: 20 },
  { x: 0, y: 768, width: 1280, height: 20 },
  { x: 0, y: 0, width: -50, height: 788 },
];

// Spawn animation
player.classList.add('spawn-in');

// Key events
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Update player
function updateCharacterPosition() {
  player.style.left = `${x}px`;
  player.style.top = `${y}px`;
}

// Collision
function isColliding(nx, ny) {
  return obstacles.some(ob =>
    nx + player.offsetWidth > ob.x &&
    nx < ob.x + ob.width &&
    ny + player.offsetHeight > ob.y &&
    ny < ob.y + ob.height
  );
}

// Main loop
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
  
  // -- TouchNote logic —  -- //
if (touchingNote() && !noteRead) {
    showHint("Press Z to read note", y - 40, x);

    if (keys['z']) {
        noteRead = true;
        hideHint();
        playSound("fragment-pick");

        showMessage(
          "The note said that…\n'I need to find the 3 missing pieces somewhere in the workshop before I go to the next room.'"
        );

        // fade out / remove note
        notePaper.style.opacity = "0";
        setTimeout(() => notePaper.style.display = "none", 500);
    }
} else {
    sewingBox.classList.remove("glow");
}

function checkExitArea() {
  // RIGHT SIDE door area (adjust x if needed)
  if (x > 1200 && !hasExited && !doorCooldown) {

    if (allFragmentsCollected()) {
      hasExited = true;
      showMessage("All Part Collected! The door to the Bedroom Unlock →");
      transitionSound.play();
      const scene = document.getElementById("scene");
      if (scene) {
        setTimeout(() => {
          scene.classList.add("fade-out");

          setTimeout(() => {
            window.location.href = "contact.html";
          }, 1000);

        }, 500);
      }

    } else {
      doorCooldown = true;

      showMessage("The door is locked.\nI still need to find all 3 broken parts.");
      lockedSound.play();

      // push player back
      x = 100;
      updateCharacterPosition();

      setTimeout(() => doorCooldown = false, 1000);
    }
  }
}


  updateCharacterPosition();
 
  handleDrawerInteraction();
  handleSewingInteraction();
  handlePersonalInteraction();

  checkExitArea();

  if (!touchingRepairBox() && !touchingSewingBox() && !touchingPersonalBox() && !touchingNote()) {
    hideHint();
}

  requestAnimationFrame(gameLoop);
}

gameLoop();