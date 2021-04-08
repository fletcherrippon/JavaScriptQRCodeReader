const messages = document.querySelector('#messages');
const submitBtn = document.querySelector('#submit-btn');
const messageBox = document.querySelector('#message-box');

const channel = new BroadcastChannel('message_channel')

submitBtn.addEventListener('click', () => {
  channel.postMessage({ message: messageBox.value })
})

channel.onmessage = (e) => {
  const chat = document.createElement('P')
  chat.innerText = e.data.message

  messages.appendChild(chat)
  console.log(e.data)
}