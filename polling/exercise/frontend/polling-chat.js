const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;
const POLL_URL = "http://localhost:3000/poll";

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const res = await fetch(POLL_URL, {
    method: "POST", // or 'PUT'
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user,
      text,
    }),
  });

  const data = await res.json();

  if (data.status && data.status === 200) {
    getNewMsgs();
  }
}

async function getNewMsgs() {
  // poll the server
  // write code here

  const res = await fetch("http://localhost:3000/poll");

  const data = await res.json();

  if (data.msg) {
    allChat = data.msg;

    render();
  }
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
function template(user, msg) {
  return `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
}

// make the first request
getNewMsgs();
