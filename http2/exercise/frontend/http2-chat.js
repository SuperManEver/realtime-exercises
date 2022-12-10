const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  let reader;

  /**
   * looks like just a decoder, transformer
   */
  const utfDecoder = new TextDecoder("utf-8");

  try {
    /**
     * create a stream to receive data from backend
     */
    const res = await fetch("/msgs");

    /**
     * use response body as a stream and a buffer of data
     */
    reader = res.body.getReader();
  } catch (e) {
    console.log("Connection error");
  }

  /**
   * if OK we change conenction status to OK
   */
  presence.innerText = "connected";

  let readerResponse;
  let done;

  do {
    try {
      /**
       * an atttemp to read data from stream
       */

      readerResponse = await reader.read();
    } catch (e) {
      console.log("reader fail: ", e);
      presence.innerText = "not connected";

      return;
    }

    /**
     * decode to string in UTF-8
     */
    const chunk = utfDecoder.decode(readerResponse.value, { stream: true });
    done = readerResponse.done;

    /**
     * it frame is not empty
     */
    if (chunk) {
      /**
       * attemp to parse it
       */
      try {
        const json = JSON.parse(chunk);

        allChat = json.msg;

        render();
      } catch (e) {
        console.log("parse error", e);
      }
    }
  } while (!done);
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
