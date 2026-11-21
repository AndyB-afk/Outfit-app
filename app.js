  GNU nano 9.2                                                     app.js                                                                
=const hodies = [
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
