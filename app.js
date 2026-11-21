const hodies = [
  "Gray Santa-Cruz",
  "Black Disney",
  "Royal-Blue Eagles",
  "Blue-Black Quater-Zip",
];

const shirts = [
  "White T-shirt",
  "Black T-shirt",
  "Gray Berkely shirt",
];

const pants = [
  "Blue Baggy jeans",
  "Black Baggy jeans",
  "Blue Mexican jeans",
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

  return `${shirt} + ${pantsItem} + ${shoesItem}`;
}

const generateButton = document.querySelector("#generate-outfit");
const outfitResult = document.querySelector("#outfit-result");

generateButton.addEventListener("click", () => {
  outfitResult.textContent = generateOutfit();
});
