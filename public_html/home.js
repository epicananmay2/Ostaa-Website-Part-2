/* 
 Name: Aniruth
 Class: CSC 
 Description: home.js shows the different case requests of home.html for the Ostaa Website (part 2).
 Date: 04/01/2023
*/
const viewListingsBtn = document.getElementById("viewListings");
const viewPurchasesBtn = document.getElementById("viewPurchases");
const createListingBtn = document.getElementById("createListing");
const searchForm = document.getElementById("searchForm");
const contentEl = document.getElementById("content");
const usernameEl = document.getElementById("username");

let username;
const GET_MYSELF = "/get/myself";
const GET_LISTINGS = "/get/listings";
const GET_PURCHASES = "/get/purchases";
const SEARCH_LISTINGS = "/search/items";
const BUY_ITEM = "/buy/item";

function renderItems(items, isSearch, isListings) {
  contentEl.innerHTML = "";
  items?.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item";
    // const image = document.createElement('img');
    const image = document.createElement("img");
    const title = document.createElement("h3");
    const price = document.createElement("p");
    const description = document.createElement("p");
    const status = document.createElement("p");
    const buyBtn = document.createElement("button");
    image.src = `/images/${item.image}`;
    buyBtn.textContent = "Buy";
    buyBtn.addEventListener("click", () => buyItem(item._id));

    title.textContent = item.title;
    description.textContent = item.description;
    price.textContent = item.price;
    status.textContent =
      isSearch && item.status === "SOLD"
        ? "Item has been purchased"
        : item.status;
    // image.src=`/images/${item.img}`
    image.textContent = item.image;

    itemDiv.append(title, image, description, price);
    if (item.status.toLowerCase() === "sale" && !isListings) {
      itemDiv.append(buyBtn);
    } else {
      itemDiv.append(status);
    }

    contentEl.append(itemDiv);
  });
}

function buyItem(itemId) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", BUY_ITEM);
  xhr.onload = () => {
    console.log(JSON.parse(xhr.response));
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify({ username, itemId }));
}

function viewListings() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${GET_LISTINGS}/${username}`);
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    if (res) {
      renderItems(res, false, true);
    }
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}

function viewPurchases() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${GET_PURCHASES}/${username}`);
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    if (res) {
      renderItems(res);
    }
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}

function searchListings(e) {
  e.preventDefault();
  const keyword = e.target.search.value;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `${SEARCH_LISTINGS}/${keyword}`);
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    if (res) {
      renderItems(res, true);
    }
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}

function createListing() {
  if (username) location.pathname = "/post.html";
}

function getUser() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/get/myself");
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    console.log(res);
    if (res.ok) {
      username = res.data;
      usernameEl.textContent = username + "!";
    } else {
      // const href = window.location.href;
      // const lastIndex = href.lastIndexOf("/");
      // const baseUrl = href.substring(0, lastIndex);
      // location.replace(baseUrl);
      location.replace("/");
    }
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}

viewListingsBtn.addEventListener("click", viewListings);
viewPurchasesBtn.addEventListener("click", viewPurchases);
createListingBtn.addEventListener("click", createListing);
searchForm.addEventListener("submit", searchListings);

getUser();
