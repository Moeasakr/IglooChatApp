"use strict";

let socket;

const messagesDiv = document.querySelector(".text_chat_message_div");
const newMessageField = document.querySelector(".text_chat_input_field");
const newMessageSubmitBtn = document.querySelector(".text_chat_submit_btn");
const chatLeaveBtn = document.querySelector(".text_chat_leave_btn");
const allUsersListDiv = document.querySelector(".text_chat_users_list_div");

//Prompt user for room and name info
const roomName = prompt("Which room do you want to join? (Default Room: Lobby)", "Lobby");
const screenName = prompt("Enter your screen name");

if (roomName === "Lobby" && screenName) {
    socket = io("http://localhost:3001"); // Make a connection with the server by calling io() function, imported from the Socket.io client-side library
    socket.emit("init-user", {roomName: roomName, screenName: screenName});
    //console.log(roomName, screenName)

} else {
    // Do not connect to Sockek.io server if the user doesn't provide room and username info
    window.alert("Insufficient information provided. Cannot connect to server.");
    window.stop();
}

// Listener for server confirmation that a new user has joined the room
socket.on("new-user-joined", (serverConfirmationObj) => {
    const { roomName, screenName, timestamp, allUsersInRoom } = serverConfirmationObj; // Destructure param. object

    // Create new element containing the join confirmation message
    const joinConfirmMessage = document.createElement("p");
    joinConfirmMessage.setAttribute("class", "text_chat_message_p join_message")
    joinConfirmMessage.innerText = `${screenName} has joined the ${roomName} room (${timestamp})`;
    messagesDiv.appendChild(joinConfirmMessage);

    // Create list of all users in the room and display it
    const newAllUsersList = document.createElement("ul");
    newAllUsersList.setAttribute("class", "text_chat_users_list");

    allUsersInRoom.forEach(userName => {
        const userListItem = document.createElement("li");
        userListItem.setAttribute("class", "user_list_item");
        userListItem.innerText = userName;
        newAllUsersList.appendChild(userListItem);
    });

    const oldAllUsersList = document.querySelector(".text_chat_users_list");
    oldAllUsersList.replaceWith(newAllUsersList);

    // Update the chat div's heading with the connected room name
    const oldChatDivHeading = document.querySelector(".text_chat_div_heading");
    const newChatDivHeading = document.createElement("h4");
    newChatDivHeading.setAttribute("class", "text_chat_div_heading");
    newChatDivHeading.innerText = `# ${roomName}`;
    oldChatDivHeading.replaceWith(newChatDivHeading);

})


// Send a new text msg to server if user submits the text chat form
newMessageSubmitBtn.onclick = (event) => {
    event.preventDefault();
    const newMessageText = newMessageField.value;

    if (newMessageText !== "") {
        socket.volatile.emit("send-new-message", {roomName: roomName, screenName: screenName, newMessageText: newMessageText});
    }

    // Clear input field and focus on it
    newMessageField.value = "";
    newMessageField.focus();

}

// Listener for incomming broadcasted messages from server
socket.on("broadcast-new-message", (newMessageDetails) => {
    const { roomName, screenName, newMessageText, timestamp } = newMessageDetails; // Destructure param. object
   
    const newMessageWrapper = document.createElement("div");
    newMessageWrapper.setAttribute("class", "text_message_wrapper");

    const newMessageHeader = document.createElement("div");
    newMessageHeader.setAttribute("class", "text_message_header");
    
    const newMessageUser = document.createElement("span");
    newMessageUser.setAttribute("class", "text_message_user");

    const newMessageTime = document.createElement("span");
    newMessageTime.setAttribute("class", "text_message_time");

    const newMessage = document.createElement("p");
    newMessage.setAttribute("class", "text_message");
    
    newMessageUser.innerText = `${screenName}`;
    newMessageTime.innerText = `${timestamp}`;
    newMessage.innerText = `${newMessageText}`;

    newMessageHeader.appendChild(newMessageUser);
    newMessageHeader.appendChild(newMessageTime);

    newMessageWrapper.appendChild(newMessageHeader);
    newMessageWrapper.appendChild(newMessage);

    messagesDiv.appendChild(newMessageWrapper);

    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Keep scroll bar at bottom of the div

})


// Disconnect from chat room
chatLeaveBtn.onclick = (event) => {
    event.preventDefault();

    socket.emit("user-leave-room", { roomName: roomName, screenName: screenName });
    
    //socket.disconnect();
    // Display disconnection message
    const disconnectConfirmMessage = document.createElement("p");
    disconnectConfirmMessage.setAttribute("class", "disconnect_message")
    disconnectConfirmMessage.innerText = `You have left the ${roomName} room`;
    messagesDiv.appendChild(disconnectConfirmMessage);

    //Clear all users from the "users in room list"
    const allUsersList = document.querySelector(".text_chat_users_list");
    allUsersList.innerHTML = "";
}


socket.on("user-left-update", (updatedRoomData) => {

    const { roomName, screenName, timestamp, allUsersInRoom } = updatedRoomData; // Destructure param. object

    // Display confirmation message that another user has left
    const disconnectConfirmMessage = document.createElement("p");
    disconnectConfirmMessage.setAttribute("class", "text_chat_message_p user_left_message")
    disconnectConfirmMessage.innerText = `${screenName} has left the ${roomName} room (${timestamp})`;
    messagesDiv.appendChild(disconnectConfirmMessage);

    // Create an updated list of all users in the room and display it
    const newAllUsersList = document.createElement("ul");
    newAllUsersList.setAttribute("class", "text_chat_users_list");

    allUsersInRoom.forEach(userName => {
        const userListItem = document.createElement("li");
        userListItem.setAttribute("class", "user_list_item");
        userListItem.innerText = userName;
        newAllUsersList.appendChild(userListItem);
    });

    const oldAllUsersList = document.querySelector(".text_chat_users_list");
    oldAllUsersList.replaceWith(newAllUsersList);

})