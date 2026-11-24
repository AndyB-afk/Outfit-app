const categoryLabels = {
  hoodies: "Hoodie / sweater",
  shirts: "Shirt",
  pants: "Pants",
  shoes: "Shoes",
};

const generateButton = document.querySelector("#generate-outfit");
const generatedOutfit = document.querySelector("#generated-outfit");
const recommendationList = document.querySelector("#recommendation-list");

function createOutfitPiece(category, item) {
  const piece = document.createElement("article");
  piece.className = "outfit-piece";

  const label = document.createElement("strong");
  label.textContent = categoryLabels[category];
  piece.append(label);

  const image = document.createElement("div");
  image.className = "outfit-piece-image";

  if (item.image_filename) {
    const img = document.createElement("img");
    img.src = `/uploads/${item.image_filename}`;
    img.alt = item.name;
    image.append(img);
  } else {
    image.textContent = "No image";
  }

  const name = document.createElement("span");
  name.textContent = item.name;
  piece.append(image, name);
  return piece;
}

generateButton.addEventListener("click", async () => {
  const response = await fetch("/api/generate");
  const result = await response.json();

  if (!response.ok) {
    generatedOutfit.textContent =
      result.error || "Could not generate an outfit.";
    return;
  }

  generatedOutfit.replaceChildren();
  Object.entries(categoryLabels).forEach(([category, label]) => {
    generatedOutfit.append(
      createOutfitPiece(category, result[category]),
    );
  });
});

async function loadRecommendations() {
  const [recommendationResponse, clothesResponse] = await Promise.all([
    fetch("/api/recommendations"),
    fetch("/api/clothes"),
  ]);

  if (!recommendationResponse.ok || !clothesResponse.ok) {
    recommendationList.textContent =
      "Could not load friend recommendations.";
    return;
  }

  const recommendations = await recommendationResponse.json();
  const clothes = await clothesResponse.json();
  const clothesById = new Map(
    clothes.map((item) => [String(item.id), item]),
  );
  recommendationList.replaceChildren();

  if (recommendations.length === 0) {
    recommendationList.textContent = "No recommendations yet.";
    return;
  }

  recommendations.forEach((recommendation) => {
    const card = document.createElement("article");
    card.className = "recommendation-card";

    const author = document.createElement("strong");
    author.textContent =
      `${recommendation.author} — ${recommendation.status}`;
    card.append(author);

    const items = document.createElement("p");
    items.textContent = Object.entries(recommendation.selected_items)
      .map(([category, itemId]) => {
        const item = clothesById.get(String(itemId));
        return `${categoryLabels[category]}: ${item ? item.name : `item ${itemId}`}`;
      })
      .join(" · ");
    card.append(items);

    recommendationList.append(card);
  });
}

loadRecommendations();
