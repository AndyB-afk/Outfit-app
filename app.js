const hoodies = [
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
  const hoodie = getRandomItem(hoodies);
  const shirt = getRandomItem(shirts);
  const pantsItem = getRandomItem(pants);
  const shoesItem = getRandomItem(shoes);

  return `${hoodie} + ${shirt} + ${pantsItem} + ${shoesItem}`;
}

const generateButton = document.querySelector("#generate-outfit");
const outfitResult = document.querySelector("#outfit-result");

generateButton.addEventListener("click", () => {
  outfitResult.textContent = generateOutfit();
});

const wardrobeGroups = {
  hoodies,
  shirts,
  pants,
  shoes,
};

const recommendationForm = document.querySelector("#recommendation-form");
const recommendationResult = document.querySelector("#recommendation-result");
const recommendationList = document.querySelector("#recommendation-list");
const recommendationStorageKey = "outfit-app-recommendations";

function createItemChoices(containerId, categoryName, items) {
  const container = document.querySelector(`#${containerId}`);
  const uniqueItems = [...new Set(items)];

  uniqueItems.forEach((item) => {
    const label = document.createElement("label");
    label.className = "item-choice";

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = categoryName;
    radio.value = item;

    const image = document.createElement("div");
    image.className = "item-choice-image";
    image.textContent = "No image";

    const text = document.createElement("span");
    text.textContent = item;

    label.append(image, radio, text);
    container.append(label);
  });
}

createItemChoices("hoodie-options", "hoodie", wardrobeGroups.hoodies);
createItemChoices("shirt-options", "shirt", wardrobeGroups.shirts);
createItemChoices("pants-options", "pants", wardrobeGroups.pants);
createItemChoices("shoe-options", "shoes", wardrobeGroups.shoes);

function updateOutfitPreview(categoryName, itemName) {
  const preview = document.querySelector(
    `[data-preview-category="${categoryName}"]`,
  );

  if (!preview) {
    return;
  }

  preview.querySelector(".preview-name").textContent = itemName;
  preview.querySelector(".preview-image").textContent = "No image";
}

recommendationForm.addEventListener("change", (event) => {
  if (event.target.matches('input[type="radio"]')) {
    updateOutfitPreview(event.target.name, event.target.value);
  }
});

function loadRecommendations() {
  const savedRecommendations = localStorage.getItem(
    recommendationStorageKey,
  );

  if (!savedRecommendations) {
    return [];
  }

  try {
    return JSON.parse(savedRecommendations);
  } catch (error) {
    return [];
  }
}

function saveRecommendations(recommendations) {
  localStorage.setItem(
    recommendationStorageKey,
    JSON.stringify(recommendations),
  );
}

function renderRecommendations() {
  const recommendations = loadRecommendations();
  recommendationList.replaceChildren();

  recommendations
    .slice()
    .reverse()
    .forEach((recommendation) => {
      const card = document.createElement("article");
      card.className = "recommendation-card";

      const author = document.createElement("p");
      author.textContent = `Recommended by: ${recommendation.author}`;
      card.append(author);

      const outfit = document.createElement("p");
      outfit.textContent =
        `${recommendation.hoodie} + ` +
        `${recommendation.shirt} + ` +
        `${recommendation.pants} + ` +
        `${recommendation.shoes}`;
      card.append(outfit);

      recommendationList.append(card);
    });
}

recommendationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(recommendationForm);
  const categories = ["hoodie", "shirt", "pants", "shoes"];
  const missingCategory = categories.find(
    (category) => !formData.get(category),
  );

  if (missingCategory) {
    recommendationResult.textContent =
      `Please choose a ${missingCategory} before saving.`;
    return;
  }

  const recommendation = {
    author:
      formData.get("recommendationName").trim() || "Anonymous friend",
    hoodie: formData.get("hoodie"),
    shirt: formData.get("shirt"),
    pants: formData.get("pants"),
    shoes: formData.get("shoes"),
  };

  const recommendations = loadRecommendations();
  recommendations.push(recommendation);

  try {
    saveRecommendations(recommendations);
  } catch (error) {
    recommendationResult.textContent =
      "The recommendation could not be saved.";
    return;
  }

  recommendationResult.textContent =
    `${recommendation.author} recommended: ` +
    `${recommendation.hoodie} + ${recommendation.shirt} + ` +
    `${recommendation.pants} + ${recommendation.shoes}`;

  recommendationForm.reset();
  renderRecommendations();
});

renderRecommendations();

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
