const hodies = [
  "Gray Santa-Cruz",
  "Black Disney",
  "Royal-Blue Eagles",
  "Blue-Black Q-Zip",
  "Navy Air-Force",
  "Black Zip-Up",
  "Small Black Sweater",
];

const shirts = [
  "White T-shirt",
  "White T-shirt",
  "White T-shirt",
  "White T-shirt",
  "Black T-shirt",
  "Black T-shirt",
  "Black T-shirt",
  "Black T-shirt",
  "Gray Berkely shirt",
  "Black Q-Button",
  "Gray Q-Button",
  "Navy Q-Button",

];

const pants = [
  "Light-Blue Baggy jeans",
  "Black Baggy jeans",
  "Blue jeans",
];

const shoes = [
  "White Nike shoes",
  "White-Blue Adidas shoes",
];

function getRandomItem(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function generateOutfit() {
  const hodie = getRandomItem(hodies);
  const shirt = getRandomItem(shirts);
  const pantsItem = getRandomItem(pants);
  const shoesItem = getRandomItem(shoes);

  return `${hodie} + ${shirt} + ${pantsItem} + ${shoesItem}`;
}

const generateButton = document.querySelector("#generate-outfit");
const outfitResult = document.querySelector("#outfit-result");

generateButton.addEventListener("click", () => {
  outfitResult.textContent = generateOutfit();
});

const inspirationForm = document.querySelector("#inspiration-form");
const inspirationBoard = document.querySelector("#inspiration-board");
const inspirationStorageKey = "outfit-app-inspirations";

function loadInspirations() {
  const savedInspirations = localStorage.getItem(inspirationStorageKey);

  if (!savedInspirations) {
    return [];
  }

  try {
    return JSON.parse(savedInspirations);
  } catch (error) {
    return [];
  }
}

function saveInspirations(inspirations) {
  localStorage.setItem(inspirationStorageKey, JSON.stringify(inspirations));
}

function createCard(inspiration) {
  const card = document.createElement("article");
  card.className = "inspiration-card";

  if (inspiration.imageData) {
    const image = document.createElement("img");
    image.src = inspiration.imageData;
    image.alt = inspiration.name;
    card.append(image);
  }

  const content = document.createElement("div");
  content.className = "inspiration-card-content";

  const title = document.createElement("h3");
  title.textContent = inspiration.name;
  content.append(title);

  const style = document.createElement("p");
  style.textContent = `Style: ${inspiration.style}`;
  content.append(style);

  if (inspiration.colors) {
    const colors = document.createElement("p");
    colors.textContent = `Colors: ${inspiration.colors}`;
    content.append(colors);
  }

  if (inspiration.source) {
    const source = document.createElement("a");
    source.href = inspiration.source;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "View original";
    content.append(source);
  }

  card.append(content);
  return card;
}

function renderInspirations() {
  const inspirations = loadInspirations();
  inspirationBoard.replaceChildren();

  inspirations
    .slice()
    .reverse()
    .forEach((inspiration) => {
      inspirationBoard.append(createCard(inspiration));
    });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

inspirationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(inspirationForm);
  const imageFile = formData.get("image");
  let imageData = "";

  if (imageFile && imageFile.size > 0) {
    imageData = await readImageFile(imageFile);
  }

  const inspirations = loadInspirations();
  inspirations.push({
    name: formData.get("name").trim(),
    style: formData.get("style"),
    colors: formData.get("colors").trim(),
    source: formData.get("source").trim(),
    imageData,
  });

  try {
    saveInspirations(inspirations);
  } catch (error) {
    outfitResult.textContent =
      "The inspiration could not be saved because browser storage is full.";
    return;
  }

  inspirationForm.reset();
  renderInspirations();
});

renderInspirations();
