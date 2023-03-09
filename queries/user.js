const User = require("../model/users");

const createRoom = async ({ name, room, socketID }) => {
  const validRoom = await User.findOne({ room });

  if (!validRoom) {
    room = Math.floor(100000 + Math.random() * 900000);
  }

  const user = new User({ name, room, socketID });
  try {
    await user.save();

    return { docs: { name: user.name, room: user.room }, err: undefined };
  } catch (e) {
    return { err: e };
  }
};

const joinRoom = async ({ name, room, socketID }) => {
  const roomMembers = await getRoomMembers(room);

  if (!roomMembers.length) {
    return { err: "Invalid room number!" };
  }

  const nameTaken = roomMembers.find(
    (roomMember) => roomMember.name.toLowerCase() === name.toLowerCase()
  );
  if (nameTaken) {
    return { err: "Name already taken in this room!" };
  }

  const user = new User({ name, room, socketID });

  try {
    await user.save();
    return { err: undefined, docs: { name: user.name, room: user.room } };
  } catch (e) {
    return { err: e };
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
