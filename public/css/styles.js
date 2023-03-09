const chk = document.getElementById("chk");
const left = document.getElementById("left");
const mainDiv = document.getElementById("mainDiv");
const roomMates = document.getElementById("roomMates");
const msgDivs = document.getElementsByClassName("msgDiv");

const contextMenu = document.getElementById("context-menu");
const scope = document.querySelector("body");

const customModal = document.getElementById("customModal");
const modalBody = document.querySelector("#modalBody h4");

document.getElementById("bars").addEventListener("click", () => {
  let room = document.getElementById("room").style;
  room.display = room.display === "block" ? "none" : "block";
});

const getMsgColor = () => {
  let color = chk.checked ? "#635985" : "#5CB8E4";
  return color;
};

const setMsgColor = () => {
  for (let i = 0; i < msgDivs.length; i++) {
    msgDivs[i].style.backgroundColor = getMsgColor();
  }
};

//Background color styling
chk.addEventListener("click", (evt) => {
  setMsgColor();

  if (evt.target.checked) {
    mainDiv.classList.remove("whiteBG");
    mainDiv.classList.add("blackBG");

    left.classList.remove("whiteBG");
    left.classList.add("blackBG");

    chk.classList.remove("fa-sun");
    chk.classList.add("fa-moon");

    document.querySelector("body").style.backgroundColor = "#000000";
    return;
  }
  mainDiv.classList.remove("blackBG");
  mainDiv.classList.add("whiteBG");

  left.classList.remove("blackBG");
  left.classList.add("whiteBG");

  chk.classList.remove("fa-moon");
  chk.classList.add("fa-sun");

  document.querySelector("body").style.backgroundColor = "#fff";
});

const setRoom = function (inRoom) {
  const roomForms = document.getElementById("roomForms").style;
  const rightHtml = `<p id="roomID"></p>
   <div class="content">
       <div id="messages" class="vstack w3-animate-top">
           <div class="msgDiv" style="background-color:${getMsgColor()};">
               <p class="msg">Welcome!</p>
           </div>
       </div>
   </div>`;
  if (!inRoom) {
    document.getElementById("right").innerHTML = rightHtml;
    document.getElementById("inRoom").style.display = "none";
    return (roomForms.display = "block");
  }

  roomForms.display = "none";
  document.getElementById("inRoom").style.display = "block";

  document.getElementById("roomID").classList.add("msgDiv");
  setMsgColor();
};

const genUpdates = (info) => {
  document.getElementById("messages").innerHTML += 
  `<div class="msgDiv" style="background-color:${getMsgColor()};">
      <p class="msg">
      <strong>${info.message}</strong> 
      <span> - ${info?.time}</span></p>
   </div>`;
};

const systemMessage = (info) => {
  customModal.classList.add("showCustomModal");
  modalBody.innerText = info.message;
};

const locationMessage = (info) => {
  document.getElementById(
    "messages"
  ).innerHTML += `<div  style="background-color:${getMsgColor()};" class="msgDiv"><p class="msg">
      <strong>${info.name}</strong> 
      <span style="color: white"> - ${info.time}</span></p>
      <a target="_blank" rel="noopener noreferrer" href="${
        info.message
      }">This is my location</a></div>`;
};

const message = (info) => {
  document.getElementById(
    "messages"
  ).innerHTML += `<div class="msgDiv" style="background-color:${getMsgColor()};">
   <p class="msg"><strong>${info.name}</strong>
   <span> - ${info.time}</span></p>
   <p class="msg">${info.message}</p></div>`;
};

const setRoomMembers = ({ users, myName, owner }) => {
  if (myName === owner) {
    document.getElementById("me").innerHTML = `<strong>Me: </strong> ${myName}
      <span><i class="fa-solid fa-star"></i></span>`;
    setRoomMates({ users, myName, owner });
  } else {
    document.getElementById("me").innerHTML = `<strong>Me: </strong> ${myName}`;
    setRoomMates({ users, myName, owner });
  }
};

const setRoomMates = ({ users, myName, owner }) => {
  if (users.length < 2) {
    return (roomMates.innerHTML = "");
  }

  roomMates.innerHTML = `<p  style="background-color:${getMsgColor()};"
    class='msgDiv'><strong>Friends: </strong></p>`;

  for (let idx = 0; idx < users.length; idx++) {
    if (users[idx].name.toLowerCase() === myName.toLowerCase()) {
      continue;
    }

    if (users[idx].name.toLowerCase() === owner.toLowerCase()) {
      roomMates.innerHTML += `<p style="background-color:${getMsgColor()};" 
         class="roomMate msgDiv">${users[idx].name} 
         <span><i class="fa-solid fa-star"></i></span></p>`;
      continue;
    }

    roomMates.innerHTML += `<p style="background-color:${getMsgColor()};" 
      class="roomMate msgDiv">${users[idx].name}</p>`;
  }
};

const showContextMenu = (evt) => {
  evt.preventDefault();

  const { clientX, clientY } = evt;

  const { setX, setY } = setPosition(clientX, clientY);

  contextMenu.classList.remove("visible");

  contextMenu.style.top = `${setY}px`;
  contextMenu.style.left = `${setX}px`;

  setTimeout(() => {
    contextMenu.classList.add("visible");
  });
};

const setPosition = (clientX, clicentY) => {
  // ? compute what is the mouse position relative to the container element (scope)
  let { left, top } = scope.getBoundingClientRect();

  left = left < 0 ? 0 : left;
  top = top < 0 ? 0 : top;

  const scopeX = clientX - left;
  const scopeY = clicentY - top;

  // ? check if the element will go out of bounds
  const outOfBoundsOnX = scopeX + contextMenu.clientWidth > scope.clientWidth;

  const outOfBoundsOnY = scopeY + contextMenu.clientHeight > scope.clientHeight;

  let setX = clientX;
  let setY = clicentY;

  // ? normalize on X
  if (outOfBoundsOnX) {
    setX = left + scope.clientWidth - contextMenu.clientWidth;
  }

  // ? normalize on Y
  if (outOfBoundsOnY) {
    setY = top + scope.clientHeight - contextMenu.clientHeight;
  }

  return { setX, setY };
};

scope.addEventListener("click", () => {
  customModal.classList.remove("showCustomModal");
  contextMenu.classList.remove("visible");
});

export {
  setRoom,
  message,
  systemMessage,
  setRoomMembers,
  locationMessage,
  showContextMenu,
  genUpdates,
};
