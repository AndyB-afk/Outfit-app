const categoryLabels = {
  hoodies: "Hoodie / sweater",
  shirts: "Shirt",
  pants: "Pants",
  shoes: "Shoes",
};

const selectedItems = {};
const recommendationForm = document.querySelector("#recommendation-form");
const recommendationStatus = document.querySelector("#recommendation-status");

function updatePreview(category, item) {
  const preview = document.querySelector(
    `.preview-item[data-category="${category}"]`,
  );
  preview.replaceChildren();

  const label = document.createElement("strong");
  label.textContent = categoryLabels[category];
  preview.append(label);

  const image = document.createElement("div");
  image.className = "preview-image";

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
  preview.append(image, name);
}

function createChoice(category, item) {
  const label = document.createElement("label");
  label.className = "item-choice";

  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = category;
  radio.value = item.id;

  const image = document.createElement("div");
  image.className = "item-choice-image";

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

  radio.addEventListener("change", () => {
    selectedItems[category] = item;
    updatePreview(category, item);
  });

  label.append(image, radio, name);
  return label;
}

async function loadCloset() {
  const response = await fetch("/api/clothes");

  if (!response.ok) {
    recommendationStatus.textContent = "Could not load clothing items.";
    return;
  }

  const clothes = await response.json();

  Object.keys(categoryLabels).forEach((category) => {
    const container = document.querySelector(`#${category}-options`);
    container.replaceChildren();

    clothes
      .filter((item) => item.category === category)
      .forEach((item) => {
        container.append(createChoice(category, item));
      });
  });

  Object.keys(categoryLabels).forEach((category) => {
    const preview = document.querySelector(
      `.preview-item[data-category="${category}"]`,
    );

    const label = document.createElement("strong");
    label.textContent = categoryLabels[category];
    const image = document.createElement("div");
    image.className = "preview-image";
    image.textContent = "Select an item";
    preview.replaceChildren(label, image);
  });
}

recommendationForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const missingCategory = Object.keys(categoryLabels).find(
    (category) => !selectedItems[category],
  );

  if (missingCategory) {
    recommendationStatus.textContent =
      `Please choose ${categoryLabels[missingCategory].toLowerCase()}.`;
    return;
  }

  const formData = new FormData(recommendationForm);
  const selectedItemsForServer = {};

  Object.entries(selectedItems).forEach(([category, item]) => {
    selectedItemsForServer[category] = item.id;
  });

  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      author: formData.get("author"),
      selected_items: selectedItemsForServer,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    recommendationStatus.textContent =
      result.error || "Could not send the recommendation.";
    return;
  }

  recommendationStatus.textContent =
    "Recommendation sent. It is waiting for owner review.";
  recommendationForm.reset();

  Object.keys(categoryLabels).forEach((category) => {
    delete selectedItems[category];
  });

  await loadCloset();
});

loadCloset();
