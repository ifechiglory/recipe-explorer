const recipesContainer = document.getElementById("recipes-container");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const categorySelect = document.getElementById("category-select");
const recipeModal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("modal-content");
const closeModalButton = document.getElementById("close-modal");
const recipesHeading = document.getElementById("recipes-heading");

let recipes = [];

let displayedCount = 9;
const recipesPerLoad = 9;
const loadMoreButton = document.getElementById("load-more-btn");

// Fetch recipes when the page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchRecipes();
});

categorySelect.addEventListener("change", function () {
  fetchRecipes();
});

// Fetch the recipe collection

async function fetchRecipes() {
  loadingMessage.textContent = "Loading recipes...";
  errorMessage.textContent = "";
  recipesContainer.innerHTML = "";

  loadMoreButton.classList.add("hidden");

  displayedCount = 9;

    const selectedCategory = categorySelect.value;
    recipesHeading.textContent = `${selectedCategory} Recipes`;

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${selectedCategory}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recipes");
    }

    const data = await response.json();

    recipes = data.meals || [];

    displayRecipes(recipes.slice(0, displayedCount));

    loadMoreButton.classList.toggle("hidden", recipes.length <= displayedCount);
  } catch (error) {
    errorMessage.textContent = "Unable to load recipes. Please try again.";

    console.error(error);
  } finally {
    loadingMessage.textContent = "";
  }
}
  

// Display recipe cards
function displayRecipes(recipesToDisplay) {
  recipesContainer.innerHTML = "";

  if (recipesToDisplay.length === 0) {
    recipesContainer.textContent = "No recipes found.";
    return;
  }

  recipesToDisplay.forEach(function (recipe) {
    const recipeCard = document.createElement("article");

    recipeCard.className =
      "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl";

    // Recipe image
    const recipeImage = document.createElement("img");

    recipeImage.src = recipe.strMealThumb;
    recipeImage.alt = recipe.strMeal;
    recipeImage.className =
      "h-52 w-full object-cover transition duration-300 group-hover:scale-105";

    const imageWrapper = document.createElement("div");

    imageWrapper.className = "overflow-hidden";
    imageWrapper.appendChild(recipeImage);

    // Card content
    const cardContent = document.createElement("div");

    cardContent.className = "p-5";

    const recipeTitle = document.createElement("h3");

    recipeTitle.textContent = recipe.strMeal;
    recipeTitle.className =
      "mb-4 min-h-14 text-lg font-bold leading-7 text-slate-800";

    // View recipe button
    const viewButton = document.createElement("button");

    viewButton.textContent = "View Recipe";
    viewButton.type = "button";
    viewButton.className =
      "view-recipe-btn w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200";

    viewButton.dataset.id = recipe.idMeal;

    cardContent.append(recipeTitle, viewButton);
    recipeCard.append(imageWrapper, cardContent);

    recipesContainer.appendChild(recipeCard);
  });
}

// Handle clicks on recipe buttons
recipesContainer.addEventListener("click", function (event) {
  const clickedButton = event.target.closest(".view-recipe-btn");

  if (clickedButton) {
    const recipeId = clickedButton.dataset.id;
    fetchRecipeDetails(recipeId);
  }
});

// Open the modal
function openModal() {
  // Remove both ways the modal might be hidden
  recipeModal.hidden = false;
  recipeModal.classList.remove("hidden");
  recipeModal.classList.add("flex");

  document.body.classList.add("overflow-hidden");
}

// Fetch the full details of a selected recipe
async function fetchRecipeDetails(recipeId) {
  openModal();

  modalContent.innerHTML =
    '<p class="py-8 text-center text-slate-600">Loading recipe details...</p>';

  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch recipe details");
    }

    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      throw new Error("Recipe not found");
    }

    displayRecipeDetails(data.meals[0]);
  } catch (error) {
    modalContent.textContent = "Unable to load this recipe. Please try again.";

    console.error(error);
  }
}

// Display the selected recipe inside the modal
function displayRecipeDetails(recipe) {
  modalContent.innerHTML = "";

  // Recipe title
  const title = document.createElement("h2");

  title.id = "modal-title";
  title.textContent = recipe.strMeal;
  title.className = "pr-10 text-2xl font-bold text-slate-900 sm:text-3xl";

  // Recipe image
  const image = document.createElement("img");

  image.src = recipe.strMealThumb;
  image.alt = recipe.strMeal;
  image.className = "max-h-80 w-full rounded-2xl object-cover";

  // Recipe category
  const category = document.createElement("p");

  category.className = "text-sm text-slate-600";
  category.textContent = "Category: " + recipe.strCategory;

  // Cuisine
  const area = document.createElement("p");

  area.className = "text-sm text-slate-600";
  area.textContent = "Cuisine: " + recipe.strArea;

  // Ingredients heading
  const ingredientsHeading = document.createElement("h3");

  ingredientsHeading.textContent = "Ingredients";
  ingredientsHeading.className = "text-xl font-bold text-slate-900";

  const ingredientsList = document.createElement("ul");

  ingredientsList.className = "grid grid-cols-1 gap-2 sm:grid-cols-2";

  // Build the ingredient list
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      const listItem = document.createElement("li");

      listItem.className =
        "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-slate-700";

      listItem.textContent = `${
        measure ? measure.trim() : ""
      } ${ingredient.trim()}`.trim();

      ingredientsList.appendChild(listItem);
    }
  }

  // Instructions heading
  const instructionsHeading = document.createElement("h3");

  instructionsHeading.textContent = "Instructions";
  instructionsHeading.className = "text-xl font-bold text-slate-900";

  // Instructions
  const instructions = document.createElement("p");

  instructions.textContent = recipe.strInstructions;
  instructions.className =
    "whitespace-pre-line text-sm leading-7 text-slate-700";

  // Add all the content to the modal
  modalContent.append(
    title,
    image,
    category,
    area,
    ingredientsHeading,
    ingredientsList,
    instructionsHeading,
    instructions
  );
}

// Close the modal
function closeModal() {
  recipeModal.hidden = true;
  recipeModal.classList.add("hidden");
  recipeModal.classList.remove("flex");

  document.body.classList.remove("overflow-hidden");
}

// Close button
closeModalButton.addEventListener("click", closeModal);

// Close when the backdrop is clicked
recipeModal.addEventListener("click", function (event) {
  if (event.target === recipeModal) {
    closeModal();
  }
});

// Close with the Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && !recipeModal.classList.contains("hidden")) {
    closeModal();
  }
});

loadMoreButton.addEventListener("click", function () {
  displayedCount += recipesPerLoad;

  displayRecipes(recipes.slice(0, displayedCount));

  if (displayedCount >= recipes.length) {
    loadMoreButton.classList.add("hidden");
  }
});