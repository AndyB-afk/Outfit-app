const categoryLabels = {
  hoodies: "Hoodie / sweater",
  shirts: "Shirt",
  pants: "Pants",
  shoes: "Shoes",
};

const generateButton = document.querySelector("#generate-outfit");
const generatedOutfit = document.querySelector("#generated-outfit");
const clearBuiltOutfit = document.querySelector("#clear-built-outfit");

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

clearBuiltOutfit.addEventListener("click", () => {
  generatedOutfit.replaceChildren();
  const emptyState = document.createElement("p");
  emptyState.className = "empty-outfit";
  emptyState.textContent = "Generate an outfit to begin.";
  generatedOutfit.append(emptyState);
});

document.querySelectorAll(".recommendation-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("form")) {
      return;
    }

    document.querySelectorAll(".recommendation-card").forEach((entry) => {
      entry.classList.remove("selected-recommendation");
    });
    card.classList.add("selected-recommendation");

    generatedOutfit.replaceChildren();
    card.querySelectorAll(".recommendation-piece").forEach((piece) => {
      const preview = document.createElement("article");
      preview.className = "outfit-piece";

      const label = document.createElement("strong");
      label.textContent = piece.querySelector("span").textContent;
      preview.append(label);

      const sourceImage = piece.querySelector("img");
      if (sourceImage) {
        const image = document.createElement("div");
        image.className = "outfit-piece-image";
        const copy = document.createElement("img");
        copy.src = sourceImage.src;
        copy.alt = sourceImage.alt;
        image.append(copy);
        preview.append(image);
      }

      const name = piece.querySelector("strong:last-of-type");
      if (name) {
        const itemName = document.createElement("span");
        itemName.textContent = name.textContent;
        preview.append(itemName);
      }

      generatedOutfit.append(preview);
    });
  });
});

