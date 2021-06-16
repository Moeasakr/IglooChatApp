"use strict";

// Import dotenv package for enviromental variables if the enviroment is not production
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Import dependencies
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
// const { check, validationResult } = require('express-validator');
const httpServer = require("http").createServer(app); // Create an Express web server
// const session = require("express-session");
// const iglooChatLib = require("./libs/igloochatlib");
const myLib = require("./libs/myLib");
const dbController = require("./controllers/dbController");
const session = require("express-session");
const MONGO_CONNECT_STRING = process.env.MONGO_CONNECT_STRING;
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoSessionStore = new MongoDBStore({
    uri: MONGO_CONNECT_STRING,
    collection: "sessions",
});

//const conferenceRouter = require('./routes/user'); // router for React app
const conferenceRouter = require("./routes/conferenceRouter"); //router for normal HTML/CSS app

// Set EJS as templating engine
app.set("view engine", "ejs");
// // Place view files in the /views folder
app.set("views", "views");

// // Place public assets such as CSS, front end JS scripts, etc. in the /public folder
app.use(express.static("public"));

app.use(
    session({
        secret: "test",
        resave: false,
        saveUninitialized: true,
        store: mongoSessionStore,
        cookie: { secure: false, maxAge: 3600000 },
    })
);

// //Define routes here by referencing the router module file
app.use(conferenceRouter);

//Spin up the server to run on either the enviromental variable port number or 8888
// app.listen(process.env.PORT || 8888);

/*
SOCKET IO TEXT CHAT CODE STARTS HERE
*/

// const roomUserTracker = { "Lobby": [] };

const io = require("socket.io")(httpServer, {
    cors: {
        origin: ["*"],
    },
});

// Client emits a "connection" event on connection with server which is caught by this listener and fires the callback
// io.on("connection", (socket) => {

//     socket.on("init-user", (userInitDetails) => {
//         const { roomName, screenName } = userInitDetails; // Destructure param. object
//         socket.join(roomName); //Add user to the requested room

//         // Add new user's data to the object containing a record of all users in the rooms
//         const userDataObj = iglooChatLib.cloneObject(userInitDetails);
//         userDataObj.userSocketId = socket.id;
//         iglooChatLib.addUserToRoomRecord(roomUserTracker, userDataObj);

//         // Get an updated list of all users in the room that the user just joined
//         const allUsersInRoom = iglooChatLib.getAllUsersInRoom(roomUserTracker, roomName); // array

//         const serverReplyObj = userInitDetails;
//         serverReplyObj.timestamp = iglooChatLib.getTimeStamp(); // Add connection timestamp to object
//         serverReplyObj.allUsersInRoom = allUsersInRoom; // Array with screen names of all users
//         io.sockets.in(roomName).emit("new-user-joined", serverReplyObj); // Emit to all clients in the room notifying everyone of the new user joining

//     })

//     socket.on("send-new-message", (newMessageDetails) => {
//         const { roomName, screenName, newMessageText } = newMessageDetails; // Destructure param. object
//         const serverReplyObj = newMessageDetails;
//         serverReplyObj.timestamp = iglooChatLib.getTimeStamp();
//         io.sockets.in(roomName).emit("broadcast-new-message", serverReplyObj); // Emit to all clients in the room
//     })

//     socket.on("user-leave-room", (userDataObj) => {
//         const { roomName, screenName } = userDataObj; // Destructure param. object
//         const leavingUserId = socket.id;
//         iglooChatLib.removeUserFromRoomRecord(roomUserTracker, roomName, leavingUserId);
//         //console.log(roomUserTracker);

//         socket.leave(roomName); // Take user out of the room as requested

//         const serverReplyObj = userDataObj;
//         // Get an updated list of all users in the room that the user just left
//         const allUsersInRoom = iglooChatLib.getAllUsersInRoom(roomUserTracker, roomName); // array
//         serverReplyObj.timestamp = iglooChatLib.getTimeStamp();
//         serverReplyObj.allUsersInRoom = allUsersInRoom;

//         io.sockets.in(roomName).emit("user-left-update", serverReplyObj); // Emit to all clients in the room updating them with the new list of users still in the room
//     })

//     socket.on("disconnect", () => {
//         //console.log(roomUserTracker);

// /*         const disconnectedUserId = socket.id;
//         const userConnectedRoomsArr = Array.from(socket.rooms);
//         iglooChatLib.removeUserFromRoomRecord(roomUserTracker, disconnectedUserId, userConnectedRoomsArr); */

//         //console.log(roomUserTracker);

//         //const { roomName, screenName } = disconnectingUserDetails; // Destructure param. object
//     })

// });

const userList = [];

io.on("connection", (socket) => {
    socket.on("send-chat-message", (message, username, roomId) => {
        socket.broadcast.to(roomId).emit("chat-message", message, username);
    });
    socket.on("join-room", (roomId, userId, username, callback) => {
        socket.join(roomId);
        //Heh
        if (userList[roomId] == null) {
            userList[roomId] = [{ id: userId, name: username }];
        } else {
            userList[roomId].push({ id: userId, name: username });
        }
        callback({
            list: userList[roomId],
        });
        socket.broadcast
            .to(roomId)
            .emit("user-connected", userId, username, userList[roomId]);

        socket.on("disconnect", () => {
            userList[roomId] = myLib.removeByAttr(
                userList[roomId],
                "id",
                userId
            );
            socket.broadcast
                .to(roomId)
                .emit("user-disconnected", userId, username, userList[roomId]);
        });
    });
});

/*
SOCKET IO TEXT CHAT CODE ENDS HERE
*/

dbController.mongoConnect(MONGO_CONNECT_STRING, () => {
    const port = process.env.PORT || 3001;
    httpServer.listen(port, () =>
        console.log(`Server running on port ${port}`)
    ); // Do not use app.listen() here, it will not work because it will create a new web server
});

module.exports = app;
