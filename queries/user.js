const User = require("../model/users");

const createRoom = async ({ name, room, socketID }) => {
  const existingRoom = await User.findOne({ room });

  if (!existingRoom) {
    const user = new User({ name, room, socketID });
    try {
      await user.save();

      return { docs: { name: user.name, room: user.room }, err: undefined };
    } catch (e) {
      return { err: "Something went wrong. Please try again later!" };
    }
  }

  return { err: "Room name already taken! Please try again." };
};

const joinRoom = async ({ name, room, socketID }) => {
  const roomMembers = await getRoomMembers(room);

  if (!roomMembers.length) {
    return { err: "Invalid room!" };
  }

  const nameTaken = roomMembers.find(
    (roomMember) => roomMember.name.toLowerCase() === name.toLowerCase()
  );
  if (nameTaken) {
    return { err: "User name already taken in this room! Try again." };
  }

  const user = new User({ name, room, socketID });

  try {
    await user.save();
    return { err: undefined, docs: { name: user.name, room: user.room } };
  } catch (e) {
    return { err: "Something went wrong. Please try again later!" };
  }
};

const getUser = async (query) => {
  try {
    const user = await User.findOne(query);
    return user;
  } catch (error) {
    return { err: error };
  }
};

const getRoomMembers = async (room) => {
  try {
    const users = await User.find({ room });
    return users;
  } catch (e) {
    return e;
  }
};

const genMessage = (message, name) => {
  return {
    name,
    message,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const removeFromRoom = async (user) => {
  try {
    await user.remove();
  } catch (error) {
    return { err: error };
  }
};

module.exports = {
  createRoom,
  joinRoom,
  getRoomMembers,
  genMessage,
  getUser,
  removeFromRoom,
};
