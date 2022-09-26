const SERVER_ADDR_BASE = "http://127.0.0.1:5000/";

const docRecipeURL = document.querySelector("#recipe-url");
const docSubmitRecipeURL = document.querySelector("#submit-recipe-url");
const docReceipeNotif = document.querySelector("#recipe-url-error-notification");
const docRecipesContainer = document.querySelector("#recipes-container");

docSubmitRecipeURL.addEventListener("click", e => {
    submitURL();
});

docRecipeURL.addEventListener("keydown", e => {
    if (e.code === "Enter")
        submitURL();    
});

const submitURL = _ => {
    docReceipeNotif.classList.add("is-hidden");
    let url = docRecipeURL.value;

    if (url.value === "")
        return;
    if (!isValidUrl(url)) {
        activateNotification(docReceipeNotif, "Invalid URL!");
        return;
    }

    fetch(`${SERVER_ADDR_BASE}/recipe-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({url})
    })
        .then(async response => {
            const data = await response.json();
            if (data.error) {
                activateNotification(docReceipeNotif, data.error);
                return;
            }
            const recipes = data.recipes;
            for (let recipe of recipes) {
                recipe_html = `
                    <div class="card mb-4">
                        <header class="card-header">
                        <h3 class="subtitle card-header-title">${ recipe.name }</h3>
                        </header>
                        <div class="card-content">
                            <div class="content">
                                <a href="${ recipe.url }" target="_blank">${ recipe.url }</a>
                                <p class="recipe-author mt-4"><strong>Author: </strong>${ recipe.author }</p>
                                <p class="recipe-description mb-2">${ recipe.description }</p>
                                <hr>
                                <h4 class="subtitle">Ingredients</h4>
                                <ul class="recipe-ingredients">
                                    ${listIngredients(recipe.ingredients)}
                                </ul>
                                <hr>
                                <h4 class="subtitle">Instructions</h4>
                                <ol class="recipe-instructions">
                                    ${listInstructions(recipe.instructions)}
                                </ol>
                            </div>
                        </div>
                    </div>
                `;
                let recipe_node = document.createElement('div');
                recipe_node.innerHTML = recipe_html;
                docRecipesContainer.appendChild(recipe_node);
            }
        })
        .catch(error => console.log(error));
}

const listIngredients = (ingredients) => {
    let html = "";
    for (let ingredient of ingredients) {
        html += `
            <li class="ingredient-container">
                <label class="checkbox">
                    <input type="checkbox">
                    <span>${ ingredient.amount }</span>
                    <span>${ ingredient.unit }</span>
                    <span>${ ingredient.name }</span>
                </label>
            </li>
        `;
    }
    return html;
}

const listInstructions = (instructions) => {
    let html = "";
    for (let instruction of instructions) {
        html += `
            <li class="instruction-container">
                <label class="checkbox p-4">
                    <input type="checkbox" class="instruction-text">
                    <span>${ instruction.order }.</span>
                    <span>${ instruction.instruction }</span>
                </label>
            </li>
        `;
    }
    return html;
}

const activateNotification = (notifEl, notifText) => {
    notifEl.querySelector("span").innerText = notifText;
    notifEl.classList.remove("is-hidden");
}

const isValidUrl = urlString=> {
    try { 
        return Boolean(new URL(urlString)); 
    }
    catch(e){ 
        return false; 
    }
}

document.addEventListener('DOMContentLoaded', () => {
    (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
      const $notification = $delete.parentNode;
  
      $delete.addEventListener('click', () => {
        // $notification.parentNode.removeChild($notification);
        $notification.classList.add("is-hidden");
      });
    });
  });