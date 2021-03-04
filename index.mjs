import { Assigner } from "./Assigner.mjs";
import { CATEGORIES } from "./categories.mjs";
import { PAGES } from "./pages.mjs";

const ONE_SECOND = 1000;

let playersCount = +localStorage.getItem("players") || 6;
let spiesCount = +localStorage.getItem("spies") || 1;
let durationInMinutes = +localStorage.getItem("duration") || 10;

let category;
const storedCategoryName = localStorage.getItem("category");
if (storedCategoryName) {
  category = Object.values(CATEGORIES).find(
    (c) => c.name === storedCategoryName
  );
}
if (!category) {
  category = CATEGORIES.sports;
}

function updatePlayersCountDom() {
  document.querySelector(
    "#players-button"
  ).children[1].innerText = playersCount;
}

function updateSpiesCountDom() {
  document.querySelector("#spies-button").children[1].innerText = spiesCount;
}

function updateDurationDom() {
  document.querySelector(
    "#duration-button"
  ).children[1].innerText = durationInMinutes;
}

function updateCategoryDom() {
  document.querySelector("#category-button").children[1].innerText =
    category.name;
}

function setPlayersCount(count) {
  if (count > spiesCount * 2) {
    playersCount = count;
    localStorage.setItem("players", count);
  } else {
    alert("Players must be more than twice the count of spies.");
  }
  updatePlayersCountDom();
}

function setSpiesCount(count) {
  if (count >= playersCount / 2) {
    alert("Spies must be less than half of players.");
  } else {
    spiesCount = count;
    localStorage.setItem("spies", count);
  }
  updateSpiesCountDom();
}

function setDurationInMinutes(duration) {
  durationInMinutes = duration;
  localStorage.setItem("duration", duration);
  updateDurationDom();
}

function setCategory(selectedCategory) {
  category = selectedCategory;
  localStorage.setItem("category", selectedCategory.name);
  updateCategoryDom();
}

function populateCountPikcerDom(page, callback) {
  for (let i = 0; i < 21; i++) {
    const button = document.createElement("button");
    button.innerText = i + 1;
    button.onclick = function () {
      callback(i + 1);
      showPage(PAGES.startPage);
    };
    document.querySelector("." + page).appendChild(button);
  }
}

function shuffleArray(members) {
  for (let i = 0; i < 100; i++) {
    members.sort(() => (Math.random() > 0.5 ? -1 : 1));
  }
}

function randomNumber(ceil) {
  return Math.floor(Math.random() * ceil);
}

function chooseRandomWord() {
  const localStorageKey = "chosen:" + category.name;

  let alreadyChosenWords = [];
  const storedAlreadyChosenWords = localStorage.getItem(localStorageKey);
  if (storedAlreadyChosenWords) {
    alreadyChosenWords = JSON.parse(storedAlreadyChosenWords);
  }

  let members = category.members
    .slice()
    .filter((member) => !alreadyChosenWords.includes(member));

  if (members.length === 0) {
    members = category.members.slice();
    alreadyChosenWords = [];
    localStorage.removeItem(localStorageKey);
  }

  shuffleArray(members);

  const result = members[randomNumber(members.length)];

  alreadyChosenWords.push(result);
  localStorage.setItem(localStorageKey, JSON.stringify(alreadyChosenWords));

  return result;
}

function populateAssignPlayersPage() {
  const word = chooseRandomWord();

  const spyIndexes = [];

  new Array(spiesCount).fill(1).forEach(() => {
    let index = randomNumber(playersCount);
    while (spyIndexes.includes(index)) {
      index = randomNumber(playersCount);
    }
    spyIndexes.push(index);
  });

  const assignersArray = [];
  const assignersSet = new Set();
  const assignersIterator = assignersSet[Symbol.iterator]();

  new Array(playersCount).fill(1).forEach((_, index) => {
    if (spyIndexes.includes(index)) {
      assignersArray.push(new Assigner(word, true, assignersIterator));
    } else {
      assignersArray.push(new Assigner(word, false, assignersIterator));
    }
  });

  shuffleArray(assignersArray);

  assignersArray.forEach((assigner) => assignersSet.add(assigner));
  assignersIterator.next().value.invoke();
}

function convertSecondsToTimer(durationCountdown) {
  const minutes = Math.floor(durationCountdown / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (durationCountdown % 60).toString().padStart(2, "0");
  return minutes + ":" + seconds;
}

function populateTimer() {
  const timerDom = document.querySelector("." + PAGES.timerCountdown)
    .children[0];

  let durationInSeconds = durationInMinutes * 60;
  timerDom.innerText = convertSecondsToTimer(durationInSeconds);

  setInterval(() => {
    durationInSeconds--;
    timerDom.innerText = convertSecondsToTimer(durationInSeconds);
  }, ONE_SECOND);
}

function populateCategoriesSelector() {
  const categoriesDom = document.querySelector("." + PAGES.setCategory);
  categoriesDom.innerHTML = "";

  Object.keys(CATEGORIES).forEach((key) => {
    const intendedCaetgory = CATEGORIES[key];

    const button = document.createElement("button");
    button.innerText = intendedCaetgory.name;
    button.onclick = () => {
      setCategory(intendedCaetgory);
      showPage(PAGES.startPage);
    };

    const p = document.createElement("p");

    const intendedCategoryMembers = intendedCaetgory.members;
    shuffleArray(intendedCategoryMembers);
    p.innerText = intendedCategoryMembers.slice(0, 40).join("، ") + "...";

    button.appendChild(p);

    categoriesDom.appendChild(button);
  });

  const contributeLink = document.createElement("a");
  contributeLink.target = "_blank";
  contributeLink.href =
    "https://github.com/Ardeshir81/spy/blob/main/categories.mjs";
  contributeLink.style.width = "100%";

  const contributeButton = document.createElement("button");
  contributeButton.innerText = "Contribute 🔗";
  contributeButton.style.width = "100%";

  contributeLink.appendChild(contributeButton);
  categoriesDom.appendChild(contributeLink);
}

function showPage(page) {
  document.querySelector("." + PAGES.startPage).style.display = "none";
  document.querySelector("." + PAGES.setPlayers).style.display = "none";
  document.querySelector("." + PAGES.setSpies).style.display = "none";
  document.querySelector("." + PAGES.setDuration).style.display = "none";
  document.querySelector("." + PAGES.setCategory).style.display = "none";
  document.querySelector("." + PAGES.assignPlayers).style.display = "none";
  document.querySelector("." + PAGES.timerCountdown).style.display = "none";

  if (page === PAGES.assignPlayers) {
    populateAssignPlayersPage();
  }

  if (page === PAGES.timerCountdown) {
    populateTimer();
  }

  if (page === PAGES.setCategory) {
    populateCategoriesSelector();
  }

  document.querySelector("." + page).style.display = "flex";
}

function populateFirstPage() {
  document.body.innerHTML = `
    <div class="start-page">
        <button id="players-button" onclick="showPage('set-players')">
            <div>Players</div>
            <div></div>
        </button>
        <button id="spies-button" onclick="showPage('set-spies')">
            <div>Spies</div>
            <div></div>
        </button>
        <button id="duration-button" onclick="showPage('set-duration')">
            <div>Duration</div>
            <div></div>
        </button>
        <button id="category-button" onclick="showPage('set-category')">
            <div>Category</div>
            <div></div>
        </button>
        <button id="start-button" onclick="showPage('assign-players')">
            <div>Start</div>
            <div>⎆</div>
        </button>
    </div>

    <div class="set-players"></div>
    <div class="set-spies"></div>
    <div class="set-duration"></div>
    <div class="set-category"></div>

    <div class="assign-players"></div>

    <div class="timer-countdown">
        <p></p>
        <button onclick="restart()">RE-START</button>
    </div>

    <script type="module" src="index.mjs"></script>
    `;
}

window.onload = function () {
  populateFirstPage();
  updatePlayersCountDom();
  updateSpiesCountDom();
  updateDurationDom();
  updateCategoryDom();

  showPage(PAGES.startPage);

  populateCountPikcerDom(PAGES.setPlayers, setPlayersCount);
  populateCountPikcerDom(PAGES.setSpies, setSpiesCount);
  populateCountPikcerDom(PAGES.setDuration, setDurationInMinutes);
};

window.showPage = showPage;

window.showTimer = function () {
  showPage(PAGES.timerCountdown);
};

window.restart = function () {
  window.onload();
};
