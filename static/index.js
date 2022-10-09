const SERVER_ADDR_BASE = "http://127.0.0.1:5000/";

const docRecipeURL = document.querySelector("#recipe-url");
const docSubmitRecipeURL = document.querySelector("#submit-recipe-url");
const docReceipeNotif = document.querySelector("#recipe-url-error-notification");
const docRecipesContainer = document.querySelector("#recipes-container");
const docClearRecipesBtn = document.querySelector("#clear-recipes-btn");
const docShoppingListCntr = document.querySelector("#shopping-list-container");

const shoppingList = [];

docSubmitRecipeURL.addEventListener("click", e => {
    submitURL();
});

docRecipeURL.addEventListener("keydown", e => {
    if (e.code === "Enter")
        submitURL();    
});

docClearRecipesBtn.addEventListener("click", e => {
    fetch(`${SERVER_ADDR_BASE}/clear-recipes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(async response => {
            const data = await response.json();
            console.log(data);
            if (data.error) {
                activateNotification(docReceipeNotif, data.error);
                return;
            }
            if (!docReceipeNotif.classList.contains("is-hidden")) {
                docReceipeNotif.classList.add("is-hidden");
            }
            docRecipesContainer.innerHTML = '';
        })
        .catch(async error => {
            const err = await error.json();
            console.log(err);
        });
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
            console.log(data);
            if (data.error) {
                activateNotification(docReceipeNotif, data.error);
                return;
            }
            loadRecipes(data.recipes);
        })
        .catch(error => console.log(error));
}

const loadRecipes = (recipes) => {
    if (recipes.length === 0)
        return;
    docRecipesContainer.innerHTML = '';
    let recipesH4 = document.createElement('h4')
    recipesH4.innerText = 'Recipes';
    recipesH4.classList.add("subtitle");
    docRecipesContainer.appendChild(recipesH4);
    for (let recipe of recipes) {
        recipe_html = `
            <div class="card mb-4">
                <header class="card-header">
                <h3 class="subtitle card-header-title">${ recipe.name }</h3>
                </header>
                <div class="card">
                    <footer class="card-footer">
                        <button class="button card-footer-item is-warning recipe-state-button" data-link="${ recipe.url }">Edit</button>
                        <button class="button card-footer-item is-white recipe-state-button" data-link="${ recipe.url }">Shop</button>
                        <button class="button card-footer-item is-white recipe-state-button" data-link="${ recipe.url }">Cook</button>
                    </footer>
                </div>
                <div class="card-content">
                    <div class="content">
                        <p><strong>URL</strong></p>
                        <a href="${ recipe.url }" target="_blank">${ recipe.url }</a>
                        <p class="recipe-author mt-4">${recipe.author ? "<strong>Author: </strong>${ recipe.author}" : ""}</p>
                        <p><strong>Description</strong></p>
                        <p class="recipe-description mb-2">${ recipe.description }</p>
                        <hr>
                        <div class="container columns is-flex flex-direction-row">
                            <!-- INGREDIENTS -->
                            <div class="container column is-one-third ingredients-container">
                                <h4 class="subtitle">Ingredients</h4>
                                <h4 class="subtitle shopping-list-title is-hidden">Select Ingredients to Add to Shopping List:</h4>
                                <ul class="recipe-ingredients">
                                    ${listIngredients(recipe.ingredients)}
                                </ul>
                            </div>
                            <!-- INSTRUCTIONS -->
                            <div class="container column is-two-thirds">
                                <h4 class="subtitle">Instructions</h4>
                                <ol class="recipe-instructions">
                                    ${listInstructions(recipe.instructions)}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        let recipe_node = document.createElement('div');
        recipe_node.innerHTML = recipe_html;
        recipe_node.setAttribute("data-state", "edit");
        docRecipesContainer.appendChild(recipe_node);
        const btns = document.querySelectorAll(`[data-link="${recipe.url}"]`)
        const checkboxes = recipe_node.querySelectorAll('input[type="checkbox"]');
        for (let btn of btns) {
            btn.addEventListener("click", e => {
                if (btn.classList.contains("is-warning"))
                    return;

                for (let b of btns) {
                    if (b.classList.contains("is-warning")) {
                        b.classList.remove("is-warning");
                        b.classList.add("is-white");
                        recipe_node.setAttribute("data-state", btn.innerText.toLowerCase());
                        let shoppingListTitle = recipe_node.querySelector(".shopping-list-title")
                        if (btn.innerText.toLowerCase() === "shop") {
                            shoppingListTitle.classList.remove("is-hidden");
                            docShoppingListCntr.classList.remove("is-hidden");
                            let shopH3 = document.createElement("h3");
                            shopH3.innerText = "Shopping List";
                            shopH3.classList.add("subtitle");
                            docShoppingListCntr.appendChild(shopH3);
                            let shopUL = document.createElement("ul");
                            shopUL.id = "shopping-list-ul";
                            docShoppingListCntr.appendChild(shopUL);
                            for (let c of checkboxes) {
                                if (c.parentElement.querySelectorAll(".ingredient-field").length) {
                                    c.classList.remove("is-cooking");
                                    c.checked = shoppingList.indexOf(c.parentElement.querySelector(".name-field").innerText) > -1;
                                }
                            }
                            loadShoppingList();
                        } else {
                            shoppingListTitle.classList.add("is-hidden");
                            docShoppingListCntr.classList.add("is-hidden");
                            docShoppingListCntr.innerHTML = "";
                            for (let c of checkboxes) {
                                c.checked = false;
                                if (btn.innerText.toLowerCase() === "cook") {
                                    c.classList.add("is-cooking");
                                }
                            }
                        }
                    }
                }

                btn.classList.add("is-warning");
            });
        }
        for (let cb of checkboxes) {
            cb.addEventListener("click", e => {
                let state = recipe_node.getAttribute("data-state");
                if (state === "edit") {
                    e.preventDefault();
                }
                if (state === "cook") {
                    if (cb.checked) {
                        if (!cb.parentElement.parentElement.classList.contains("completed")) {
                            cb.parentElement.parentElement.classList.add("completed");
                        }
                    } else {
                        if (cb.parentElement.parentElement.classList.contains("completed")) {
                            cb.parentElement.parentElement.classList.remove("completed");
                        }
                    }
                }
                if (state === "shop") {
                    if (cb.checked) {
                        // add to Shopping List
                        if (shoppingList.indexOf(cb.parentElement.querySelector(".name-field").innerText) < 0) {
                            shoppingList.push(cb.parentElement.querySelector(".name-field").innerText);
                            loadShoppingList();
                        }
                    } else {
                        // remove from Shopping List
                        let idx = shoppingList.indexOf(cb.parentElement.querySelector(".name-field").innerText);
                        if (idx > -1) {
                            shoppingList.splice(idx, 1);
                            loadShoppingList();
                        }
                    }
                } 
            });
        }
    }
}

const loadShoppingList = () => {
    let docULShoppingList = document.querySelector("#shopping-list-ul");
    docULShoppingList.innerHTML = "";
    for (item of shoppingList) {
        let li = document.createElement("li");
        li.innerText = item;
        docULShoppingList.appendChild(li);
    }
}

const listIngredients = (ingredients) => {
    let html = "";
    for (let ingredient of ingredients) {
        html += `
            <li class="ingredient-container">
                <label class="checkbox">
                    <input type="checkbox">
                    <span class="ingredient-field amount-field">${ ingredient.amount }</span>
                    <span class="ingredient-field unit-field">${ ingredient.unit }</span>
                    <span class="ingredient-field name-field">${ ingredient.name }</span>
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
                    <input type="checkbox">
                    <span class="instruction-field">${ instruction.order }.</span>
                    <span class="instruction-field">${ instruction.instruction }</span>
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
    
    fetch(`${SERVER_ADDR_BASE}/get-recipes`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(async response => {
            const data = await response.json();
            console.log(data);
            if (data.error) {
                activateNotification(docReceipeNotif, data.error);
                return;
            }
            loadRecipes(data.recipes);
        })
        .catch(error => console.log(error));
  });