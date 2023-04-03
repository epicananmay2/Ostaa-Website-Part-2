/* 
 Name: Aniruth
 Class: CSC 
 Description: post.js shows the different case requests of post.html for the Ostaa Website (part 2).
 Date: 04/01/2023
*/
const productForm = document.getElementById("productForm");
const ADD_ITEM = "/add/item/";

let username;

function getUser() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/get/myself");
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    console.log(res);
    if (res.ok) {
      username = res.data;
    } else {
      location.replace("/");
    }
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
}

function addItem(e) {
  e.preventDefault();
  if (!username) return;

  const data = new FormData();
  const title = e.target.title.value.toLowerCase();
  const description = e.target.description.value.toLowerCase();
  const image = e.target.image.files[0];
  console.log("image", image);
  const price = parseInt(e.target.price.value);
  const status = e.target.status.value.toUpperCase();
  const owner = username;

  data.append("title", title);
  data.append("description", description);
  data.append("image", image);
  data.append("price", price);
  data.append("status", status);
  data.append("owner", owner);

  const url = ADD_ITEM + owner;
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    if (res.ok) {
      productForm.reset();
      location.pathname = "/home.html";
    } else {
      alert(res.message);
    }
  };

  xhr.onerror = () => alert("Error: Request failed");
  // xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(data);
}

productForm.addEventListener("submit", addItem);

getUser();
