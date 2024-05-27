// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/* chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({
    text: "OFF",
  });
}); */
// Include Socket.IO client library
importScripts("vendors/socket.io.min.js");

let channel = null;

// const socket = io("http://localhost:3000", { transports: ["websocket"] }); // Change the URL if your server is hosted elsewhere
const socket = io(
  "https://node-socket-storypointer-bd1078ee47cf.herokuapp.com/",
  { transports: ["websocket"] }
);
console.log(socket);
// Event listener for connection success

function connect() {
  console.log("Attempting to connect to socket server");
  socket.on("connect", () => {
    console.log("Connected to socket server");

    // Example: Send a message to the server
    socket.emit("message", "Hello from client");
  });

  // Event listener for disconnection
  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  // Example: Event listener for receiving messages from the server
  socket.on("message", (data) => {
    console.log("Message received from server:", data);
  });

  socket.on("error", (error) => {
    console.log("Error", error);
  });
  socket.on("connect_error", function (error) {
    console.error("Socket.IO connection error:", error);
  });

  socket.on("connect_timeout", function (timeout) {
    console.error("Socket.IO connection timeout:", timeout);
  });
}
function sendMessageToContentScript(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message);
  });
  /* chrome.tabs.query({}, function (tabs) {
    // Loop through each tab
    tabs.forEach(function (tab) {
      // Send a message to the content script of each tab
      chrome.tabs.sendMessage(tab.id, message);
    });
  }); */
}

function broadCastToAllConnectedTabs(message) {
  chrome.tabs.query({}, function (tabs) {
    // Loop through each tab
    tabs.forEach(function (tab) {
      // Send a message to the content script of each tab
      chrome.tabs.sendMessage(tab.id, message);
    });
  });
}

let isScriptInjected = false;
console.log("Background script");

// When the user clicks on the extension action
chrome.action.onClicked.addListener((tab) => {
  console.log("Cliked on SW", isScriptInjected);

  if (!isScriptInjected) {
    chrome.scripting.executeScript({
      files: ["vendors/socket.io.min.js", "globals.js", "app.js"],
      target: { tabId: tab.id },
    });
    isScriptInjected = true;
    connect();
    // Create a context menu item
    chrome.contextMenus.create({
      id: "pointerContextMenu",
      title: "Storypoint this text",
      contexts: ["selection"],
    });
  }
  sendMessageToContentScript({
    message: "SHOW_PANEL",
  });
});

/* chrome.runtime.onInstalled.addListener(async function () {
  console.log("Installed");
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  chrome.scripting.executeScript({
    files: ["vendors/socket.io.min.js", "app.js"],
    target: { tabId: tab.id },
  });
  
  
}); */

// Add listener for context menu clicks
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "pointerContextMenu") {
    // Perform the action when context menu item is clicked
    console.log("Context menu action clicked", info.selectionText);
    // Send a message from background script to another script
    sendMessageToContentScript({
      message: "SELECT_QUESTION",
      question: info.selectionText,
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Message from content script: ", request, socket.connected);

  if (request.message === "JOIN_CHANNEL") {
    // socket.join(request.channel);
    channel = request.channel;
    socket.emit("JOIN_CHANNEL", {
      channel: request.channel,
      name: request.name,
    });
  }

  if (request.message === "QUESTION_CONFIRMED") {
    console.log("Question confirmed", request.question, request.channel);
    socket.emit("SELECTED_QUESTIONS", {
      channel: request.channel,
      question: request.question,
    });
  }

  if (request.message === "VOTED_FOR_QUESTION") {
    console.log("Question Voted by user", request.question, request.channel);
    socket.emit("VOTED_FOR_QUESTION", {
      channel: request.channel,
      question: request.question,
      user: request.user,
      value: request.value,
    });
  }

  // Send a response back to the content script
  // sendResponse({response: "Message received by the background script!"});
});

socket.on("PARTICIPANTS", (data) => {
  console.log("particpants", data);
  broadCastToAllConnectedTabs({
    message: "ADD_PARTICIPANTS",
    participants: data,
  });
});

socket.on("VOTE_FOR_QUESTION", (question) => {
  console.log("Questions", question);

  broadCastToAllConnectedTabs({
    message: "VOTE_QUESTION",
    question,
  });
});

socket.on("REVEAL_VOTES", ({ question, votes }) => {
  console.log("Questions", question, votes);
  broadCastToAllConnectedTabs({
    message: "REVEAL_VOTES",
    question,
    votes,
  });
});
