"use strict";

function getTimeStamp() {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    // const seconds = currentDate.getSeconds().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    return formattedTime;
}

function addUserToRoomRecord(recordObj, userDataObj) {
    const { roomName, screenName, userSocketId } = userDataObj; // Destructure param. object

    //If only predetermined rooms are allowed for users to join, the logic to check that the room is allowed should be inserted here

    // Should consider checking if user has already been added to the room before adding them again, but this will increase processing overhead
    recordObj[roomName].push(userDataObj);
}

function getAllUsersInRoom(recordObj, queriedRoomName) {

    const usersArr = [];

    //Check that the searched room name exists and return array of the names of clients in the room, otherwise return an empty array
    if (recordObj.hasOwnProperty(queriedRoomName)) {


        recordObj[queriedRoomName].forEach(client => {
            usersArr.push(client.screenName);
        });

        usersArr.sort(); // Sort users alphabetically
        return usersArr;
    } else {
        return usersArr;
    }
}


/* // Function to remove a user from all the rooms that are on record
function removeUserFromRoomRecord(recordObj, disconnectedUserId, userConnectedRoomsArr) {
    
    //console.log(recordObj)
    //console.log(typeof disconnectedUserId)
    //console.log(userConnectedRoomsArr)

    userConnectedRoomsArr.forEach((roomName) => {
        
        if (recordObj.hasOwnProperty(roomName)) {
            const roomRecord = recordObj[roomName]; //Array of objects of users in a room
            //console.log(roomRecord);
            for (let i = 0; i < roomRecord.length; i++) {

                if (roomRecord[i].userSocketId == disconnectedUserId) {
                    roomRecord.splice(i, 1);
                    //recordObj[roomName][i].splice(i, 1);
                }
            }

            recordObj[roomName] = roomRecord;
        }
    })
} */

// Function to remove a user from all the rooms that are on record
function removeUserFromRoomRecord(recordObj, roomName, leavingUserId) {
    //console.log(recordObj)
    //console.log(roomName)
    //console.log(leavingUserId)

    const roomRecordArr = recordObj[roomName];
    //console.log(roomRecordArr);
    
    for (let i = 0; i < roomRecordArr.length; i++) {

        if (roomRecordArr[i].userSocketId == leavingUserId) {
            roomRecordArr.splice(i, 1);
        }


    }
    
    recordObj[roomName] = roomRecordArr;
}


// TODO: Function to remove a user from all rooms that are on record
/* function removeUserFromRoomRecord(recordObj, leavingUserId) {


    const roomRecordArr = recordObj[roomName];
    //console.log(roomRecordArr);
    
    for (let i = 0; i < roomRecordArr.length; i++) {

        if (roomRecordArr[i].userSocketId == leavingUserId) {
            roomRecordArr.splice(i, 1);
        }


    }
    
    recordObj[roomName] = roomRecordArr;
} */


// CloneObject() function obtained from https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function cloneObject(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0; i < obj.length; i++) {
            copy[i] = cloneObject(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = cloneObject(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}



exports.getTimeStamp = getTimeStamp;
exports.addUserToRoomRecord = addUserToRoomRecord;
exports.getAllUsersInRoom = getAllUsersInRoom;
exports.removeUserFromRoomRecord = removeUserFromRoomRecord;
exports.cloneObject = cloneObject;