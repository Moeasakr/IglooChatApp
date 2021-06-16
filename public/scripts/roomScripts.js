// General comments:
// In the comments, a user refers to the client which is connected to the room
// Peer handles the user ids and the video streams
// There has to be a peer server running in order for this to work
// peerjs --port 3031

//Referencing socket
const socket = io("/");
//Getting the video grid to append video feeds to later
const videoGrid = document.querySelector(".video_chat_div");

// TODO: Come back to this once private peerjs server is set up
// const myPeer = new Peer(undefined, {
//     host: "/",
//     port: "3031",
// });

const myPeer = new Peer(undefined);

//Creating a video element for the connected user's video
const myVideo = document.createElement("video");
// id given to the user's video
myVideo.id = "myVideo";
//Muting it for the user so that they don't hear themselves
myVideo.muted = true;
//
const peers = {};
var userStream;
const micButton = document.getElementById("muteButton");
const videoButton = document.getElementById("videoButton");
// Invite form for mailer
const inviteForm = document.forms.inviteForm;

// List of video streams other than the current user's
var videoList = document.querySelectorAll(".otherVideos");

//Starting volume for all video elements
var selectedVolume = 1;
var volumeSlider = document.getElementById("volumeControl");

//Chat Constants
const newMessageSubmitBtn = document.querySelector(".text_chat_submit_btn");
const messagesDiv = document.querySelector(".text_chat_message_div");
const newMessageField = document.querySelector(".text_chat_input_field");
// Users list
const allUsersList = document.querySelector(".text_chat_users_list");
// Checks if a username was selected, if a username was not selected prompt the user for one
// TODO: Switch prompt for modal later
if (username === "") {
    username = prompt("what is your name?");
}
appendMessage("You joined", 0);

socket.on("chat-message", (message, username) => {
    newMessage(username, message);
});
// Container for the usernames of the users currently in the room
const userArea = document.getElementById("userContainer");

// Getting the audio and video feeds of the user
navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        // Calling the function to add the stream to the video grid
        userStream = stream;
        //Starts with webcam and audio muted
        userStream.getTracks()[0].enabled = false;
        userStream.getTracks()[1].enabled = false;
        //Adds the stream to the grid
        addVideoStream(myVideo, userStream, true, username);
        //Handles the call
        myPeer.on("call", (call) => {
            call.answer(userStream);

            const video = document.createElement("video");

            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream, false);
            });
        });

        // Listens to the user-connected event from the server.js -- Fires every time a user joins the room
        socket.on("user-connected", (userId, username, alist) => {
            // The timeout is to stop the route from being called before the video element is created
            // without it the new user's video does not get added to the grid since it happens too quickly
            setTimeout(() => {
                connectToNewUser(userId, userStream, username);
            }, 1000);
            refreshUserDiv(alist);
            appendMessage(`${username} has joined`, 0);
        });
    });

// Handles user disconnects
socket.on("user-disconnected", (userId, username, uList) => {
    // Timeout to stop it from firing a blank
    // FIXME: Sometimes the stream doesn't disconnect, figure out why
    setTimeout(() => {
        if (peers[userId]) peers[userId].close();
        // console.log("entered");
    }, 1000);
    refreshUserDiv(uList);
    appendMessage(`${username} has left `, 1);
});

// Handles the generation of user ids
myPeer.on("open", (userId) => {
    socket.emit("join-room", ROOM_ID, userId, username, (callback) => {
        refreshUserDiv(callback.list);
    });
});

// Handles connected a new user's video to existing users
function connectToNewUser(userId, stream, uName) {
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");

    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, false, uName);
    });
    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}

// Adds the video stream to the grid
function addVideoStream(video, stream, user, uName) {
    getAllVideoFeeds();
    video.srcObject = stream;
    if (user === false) {
        video.classList.add("video", "otherVideos");
    } else {
        video.classList.add("video");
    }
    video.addEventListener("loadedmetadata", () => {
        video.play();
    });

    videoGrid.appendChild(video);

    /* --- Overlay for the videos, disregard for now
    let vidContainer = document.createElement("div");
    vidContainer.classList.add("videoContainer");
    let nameSpan = document.createElement("span");
    nameSpan.classList.add("nameOnVideo");
    nameSpan.textContent = uName;
    vidContainer.append(video);
    vidContainer.append(nameSpan);
    videoGrid.append(vidContainer);
    */
}

// Appends user connect and disconnect messages to the chat
function appendMessage(message, type = 2) {
    const messageElement = document.createElement("p");
    let timestamp = getTimeStamp();
    messageElement.classList.add("text_chat_message_p");
    if (type == 0) {
        messageElement.classList.add("join_message");
    } else if (type == 1) {
        messageElement.classList.add("user_left_message");
    }
    messageElement.innerHTML = message + ` ${timestamp}`;
    messagesDiv.append(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handles sending new chat messages
newMessageSubmitBtn.onclick = (e) => {
    e.preventDefault();
    const message = newMessageField.value;
    // Guard block for empty messages
    if (message == "") return;
    newMessage("You ", message);
    //Emits to the server so that other users get the message as well
    socket.emit("send-chat-message", message, username, ROOM_ID);
    newMessageField.value = "";
};

// Refreshes the user div
function refreshUserDiv(currentUsers) {
    // console.log(allUsersList);
    allUsersList.innerHTML = "";
    for (const [key, value] of Object.entries(currentUsers)) {
        // Creates the span for the new user
        let userListItem = document.createElement("li");

        // Adds the username and user id to the span
        userListItem.innerHTML = "<i class='fas fa-user'></i> " + value.name;
        userListItem.id = value.id;
        userListItem.classList.add("user_list_item");
        // Adds the span to the user container element
        allUsersList.append(userListItem);
    }
}

// Handles the messaging when a new message is sent
function newMessage(username, message) {
    let newMessageWrapper = document.createElement("div");
    newMessageWrapper.classList.add("text_message_wrapper");

    let newMessageHeader = document.createElement("div");
    newMessageHeader.classList.add("text_message_header");

    let newMessageUser = document.createElement("span");
    newMessageUser.classList.add("text_message_user");

    let newMessageTime = document.createElement("span");
    newMessageTime.classList.add("text_message_time");

    let newMessage = document.createElement("p");
    newMessage.classList.add("text_message");

    let timestamp = getTimeStamp();
    newMessageUser.textContent = username;
    newMessageTime.textContent = timestamp;
    newMessage.textContent = message;

    newMessageHeader.appendChild(newMessageUser);
    newMessageHeader.appendChild(newMessageTime);

    newMessageWrapper.appendChild(newMessageHeader);
    newMessageWrapper.appendChild(newMessage);

    messagesDiv.appendChild(newMessageWrapper);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Timestamps
function getTimeStamp() {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
}

// Adds all video feeds to the list
function getAllVideoFeeds() {
    videoList = document.querySelectorAll(".otherVideos");
    videoList.forEach((videoElement) => {
        videoElement.volume = selectedVolume;
    });
}

// Video volume
volumeSlider.addEventListener("input", () => {
    selectedVolume = volumeSlider.value / 100;
    videoList.forEach((videoElement) => {
        videoElement.volume = selectedVolume;
    });
});

// Mailer form
inviteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let email = document.getElementById("emailField");
    //Guard block to stop empty inputs, TODO: Proper validation
    if (email.value === "") return;
    // Use the mailer
    // TODO: Make a better subject for the email
    let link = window.location.href;

    // Subject of the email
    var html = `<h1>You've been invited to join an igloo conference</h1>
                    <p><a href="${link}">Link to join the conference call</a>
                    Or copy and paste this invite link in your browser ${link}</p>`;
    const emailParams = {
        email: email.value,
        html: html,
    };

    const request = new Request("/send", {
        method: "POST",
        body: JSON.stringify(emailParams),
        headers: new Headers({
            "Content-Type": "application/json",
        }),
    });

    fetch(request).then(() => (email.value = ""));
    // .then((res) => res.json())
    // .then((res) => console.log(res)); Commented out for now
});

//Video displaying
videoButton.addEventListener("click", () => {
    //Stops the user from trying to toggle the video before the stream starts
    if (userStream === undefined) return;
    //Grabs the video track
    videoStream = userStream.getTracks()[1];
    //Checks if it is enabled and toggles it
    if (videoStream.enabled) {
        //Disable the video stream
        videoStream.enabled = false;
        //Changes the icon
        videoButton.className = "fas fa-video-slash";
    } else {
        //Enable the video stream
        videoStream.enabled = true;
        //Changes the icon
        videoButton.className = "fas fa-video";
    }
});

//Audio transmitting
muteButton.addEventListener("click", () => {
    //Stops the user from trying to toggle the audio before the stream starts
    if (userStream === undefined) return;
    //Grabs the video track
    audioStream = userStream.getTracks()[0];
    //Checks if it is enabled and toggles it
    if (audioStream.enabled) {
        //Disabled the audio stream
        audioStream.enabled = false;
        //Changes the icon
        muteButton.className = "fas fa-microphone-slash";
    } else {
        //Enable the audio stream
        audioStream.enabled = true;
        //Changes the icon
        muteButton.className = "fas fa-microphone";
    }
});
