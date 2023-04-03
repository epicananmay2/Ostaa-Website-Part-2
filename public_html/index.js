/* 
 Name: Aniruth
 Class: CSC 
 Description: index.js shows the different case requests of index.html for the Ostaa Website (part 2).
 Date: 04/01/2023
*/
const userForm = document.getElementById("userForm");
const loginForm = document.getElementById("loginForm");
const loginErrorEl = document.getElementById("loginError");

const ADD_USER = "/add/user";
const LOGIN = "/login";

function login(e) {
  e.preventDefault();
  loginErrorEl.textContent = "";
  const username = e.target.username.value.toLowerCase();
  const password = e.target.password.value;
  const data = { username, password };

  const xhr = new XMLHttpRequest();
  xhr.open("POST", LOGIN);
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    if (res.ok) {
      loginForm.reset();
      // location.replace(`${window.location.href}home.html`);
      location.replace("/home.html");
    } else {
      loginErrorEl.textContent = res.message;
    }
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
}

function addUser(e) {
  e.preventDefault();
  const username = e.target.username.value.toLowerCase();
  const password = e.target.password.value;
  const data = { username, password };

  const xhr = new XMLHttpRequest();
  xhr.open("POST", ADD_USER);
  xhr.onload = () => {
    const res = JSON.parse(xhr.response);
    if (res.ok) {
      userForm.reset();
      alert("User Created!");
    } else {
      alert(res.message);
    }
  };

  xhr.onerror = () => console.log("Request failed");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(data));
}

userForm.addEventListener("submit", addUser);
loginForm.addEventListener("submit", login);
