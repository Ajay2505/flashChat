const socket = io();

import { 
    setRoom, 
    message, 
    systemMessage, 
    setRoomMembers, 
    locationMessage,
    showContextMenu,
    genUpdates,
} from "./css/styles.js";

let myName = null;
let userName = null;

setRoom(false);

document.getElementById("leaveRoom").addEventListener("click", () => {
    setRoom(false);

    socket.emit("leaveRoom",
     ( err ) => {
        if (err) {
           return systemMessage({message: "Something went wrong!",
            time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'}) });
        }
    });

    myName = null;
});

document.getElementById("createRoom").addEventListener("submit", (evt) => {
    evt.preventDefault();

    myName = evt.target.name.value.trim();
    evt.target.name.value = "";

    socket.emit("createRoom", { name: myName },
     (err, docs) => {
        if (err) {
            return systemMessage({ message: err,
            time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'}) });
        }
        
        myName = docs.name;
        setRoom(true);

        setRoomMembers({ users:[], myName, owner: myName });
        document.getElementById("roomID").innerText = `Room number: ${docs.room}`;
    });

});

document.getElementById("joinRoom").addEventListener("submit", (evt) => {
    evt.preventDefault();
    const { name, room } = evt.target;
    
    socket.emit("joinRoom", { name: name.value.trim(), room: Number(room.value.trim()) }, 
    ( err, docs ) => {
        if(err) {
            return systemMessage({ message: err, 
            time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'})});
        }

        name.value = "";
        room.value = "";
        
        myName = docs.name;

        setRoom(true);
        document.getElementById("roomID").innerHTML = `Room number: ${docs.room}`;
    });

});

document.getElementById("sendMsg").addEventListener("submit", (evt) => {
    evt.preventDefault();
    if (evt.target.msg.value.length === 0) {
        return;
    }

    evt.target.button.setAttribute("disabled", true);

    socket.emit("sendMessage", { msg: evt.target.msg.value }, 
    (err) => {
        if (err) {
            return systemMessage({ message: err, 
            time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'}) });
        }
    });

    evt.target.button.removeAttribute("disabled");
    evt.target.msg.focus();
    evt.target.msg.value = "";
});

document.getElementById("location").addEventListener("click", (evt) => {
    if (!navigator.geolocation) {
        return systemMessage({ message: "Geolocation is not supported on your Device!",
        time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'}) });
    }

    evt.target.setAttribute("disabled", true);

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
        }, (err) => {
        evt.target.removeAttribute("disabled");
        if (err) {
            return systemMessage({ message: err, 
            time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'}) });
        }

        });
    });

});

socket.on("message", (info) => message(info));

socket.on("locationMessage", (info) => locationMessage(info));

socket.on("updates", (info) => genUpdates(info))

socket.on("roomMembers", ({ users, owner }) =>{ 
    setRoomMembers({ users, myName, owner });
    if (myName.toLowerCase() === owner.toLowerCase()) {
        setOwner();
    }
});

const setOwner = () => {
    const roomMate = document.getElementsByClassName("roomMate");
    for(let i = 0; i < roomMate.length; i++) {
       roomMate[i].addEventListener("click", (evt) => {
        userName = evt.target.innerText;
        showContextMenu(evt);
    });

    roomMate[i].style.cursor = "pointer";
    }
 }

 document.getElementById("kickOut").addEventListener("click", () => {
    socket.emit("kickOut", { userName }, (error) => {
       if (error) {
          return systemMessage({ message: error,
             time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'}) });
       }
    });
    return;
 });
  
 document.getElementById("makeLeader").addEventListener("click", () => {
    socket.emit("makeLeader", { userName }, (error) => {
       if (error) {
          return systemMessage({ message: error,
            time: new Date().toLocaleTimeString([] ,{hour: '2-digit', minute:'2-digit'}) });
       }
    });
    return;
 });
