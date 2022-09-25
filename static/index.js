const SERVER_ADDR_BASE = "http://127.0.0.1:5000/";

const docRecipeURL = document.querySelector("#recipe-url");
const docSubmitRecipeURL = document.querySelector("#submit-recipe-url");
const docReceipeNotif = document.querySelector("#recipe-url-error-notification");

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
            console.log(data);
        })
        .catch(error => console.log(error));
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