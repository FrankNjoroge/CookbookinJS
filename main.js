const favMealsContainer = document.querySelector(".fav-meals");
const mealsContainer = document.querySelector(".meals");
const mealsInfoContainer = document.querySelector(".meal-info-container");
const searchBtn = document.querySelector("#search");
const searchInput = document.querySelector("#search-input");

window.addEventListener("DOMContentLoaded", () => {
  getRandomMeal();
  fetchFavoriteMeals();
});

async function getRandomMeal() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");

  const data = await res.json();
  const randomMeal = data.meals[0];
  console.log(randomMeal);
  addMeal(randomMeal, true);
}

//add meal to DOM
function addMeal(mealData, random = false) {
  const div = document.createElement("div");
  div.classList.add("meal");

  div.innerHTML = `  <div class="meal-header">
               ${random ? `<span class="random"> Random recipe </span> ` : ""}
            
             <img src=${mealData.strMealThumb} alt={${mealData.strMeal}} />
          </div>
              <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                  <button class="fav-btn"><i class="fas fa-heart"></i>
                    </button>
              </div>`;

  const favBtn = div.querySelector(".meal-body .fav-btn");
  favBtn.addEventListener("click", (e) => {
    if (favBtn.classList.contains("active")) {
      removeMealFromLocalStorage(mealData.idMeal);
    } else {
      addMealToLocalStorage(mealData.idMeal);
    }
    e.currentTarget.classList.toggle("active");

    fetchFavoriteMeals();
  });
  div.addEventListener("click", (e) => {
    if (e.target.closest(".fav-btn")) {
      return;
    }
    addMealInfo(mealData);
    mealsInfoContainer.classList.remove("not-show");
  });
  mealsContainer.appendChild(div);
}

//fetch a meal by id
async function getMealById(id) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );
  const data = await res.json();

  const meal = data.meals[0];

  return meal;
}

//fetch meal by search
async function getMealsBySearch(term) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );
  const data = await res.json();
  const meals = data.meals;
  return meals;
}

function getMealsFromLocalStorage() {
  const mealIDs = JSON.parse(localStorage.getItem("mealIDs"));
  return mealIDs === null ? [] : mealIDs;
}

function addMealToLocalStorage(mealID) {
  const mealIDs = getMealsFromLocalStorage();

  localStorage.setItem("mealIDs", JSON.stringify([...mealIDs, mealID]));
}

function removeMealFromLocalStorage(mealID) {
  const mealIDs = getMealsFromLocalStorage();
  localStorage.setItem(
    "mealIDs",
    JSON.stringify(mealIDs.filter((id) => id !== mealID))
  );
}

async function fetchFavoriteMeals() {
  favMealsContainer.innerHTML = "";
  const mealIDs = getMealsFromLocalStorage();

  for (const mealID of mealIDs) {
    const meal = await getMealById(mealID);
    addMealToFav(meal);
  }
}

function addMealToFav(meal) {
  const li = document.createElement("li");
  li.innerHTML = `<img
                    src=${meal.strMealThumb}
                     alt=${meal.strMeal}>
                    </img>
                     <span>${meal.strMeal}</span>
                    <button class="clear"><i class="fa-solid fa-circle-xmark"></i></button>
                `;
  li.addEventListener("click", (e) => {
    if (e.target.closest(".clear")) return;
    addMealInfo(meal);
    mealsInfoContainer.classList.remove("not-show");
  });
  li.querySelector(".clear").addEventListener("click", () => {
    removeMealFromLocalStorage(meal.idMeal);
    fetchFavoriteMeals();
  });

  favMealsContainer.appendChild(li);
}

searchBtn.addEventListener("click", async () => {
  const searchTerm = searchInput.value.trim();
  const header = document.querySelector("header");
  const errorMessage = document.createElement("span");
  errorMessage.classList.add("error-message");

  //clean meals container
  mealsContainer.innerHTML = "";

  //remove existing error from DOM
  const existingMessage = header.querySelector(".error-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  if (searchTerm.length) {
    const meals = await getMealsBySearch(searchTerm);

    if (meals && meals.length) {
      meals.forEach((meal) => {
        addMeal(meal);
      });
      fetchFavoriteMeals();
    } else {
      errorMessage.textContent = "No Meals found for your search not found";
      header.appendChild(errorMessage);
    }
  } else {
    // Display an error message for empty input
    errorMessage.textContent = "Please enter a valid meal to search";
    header.appendChild(errorMessage);
  }
});

const mealInfo = document.querySelector(".meal-info");
const mealInfoTitle = document.querySelector(".meal-info .title");
const mealInfoIngredients = document.querySelector(".meal-info .ingredients");
const mealInfoDesc = document.querySelector(".meal-info .description");

function addMealInfo(meal) {
  mealsInfoContainer.innerHTML = ` <div class="meal-info">
        <button id="close-popup"><i class="fas fa-times"></i></button>
        <h2>${meal.strMeal}</h2>

        <img
          src=${meal.strMealThumb}
          alt=${meal.strMeal}
        />
        <ul class="ingredients">
         ${generateIngredientsList(meal)}
        </ul>
        <p class="meal-description">
        ${meal.strInstructions}
        </p>
      </div>`;
  document.querySelector("#close-popup").addEventListener("click", () => {
    mealsInfoContainer.classList.add("not-show");
  });
}

function generateIngredientsList(meal) {
  let ingredientsList = "";
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient) {
      ingredientsList += `<li>${ingredient} - ${measure}</li>`;
    } else {
      break;
    }
  }
  return ingredientsList;
}
