const Owner = require("../model/owners");
const { getRoomMembers } = require("../queries/user");

const getOwner = async (query) => {
   const owner  = await Owner.findOne(query);
   if (!owner) {
     return({ err: "Invalid room!" });
   }

   return ({ owner });
}

const setOwner = async ({ room, name, socketID }) => {
   const updateOwner = await Owner.findOne({ room });
   
   if (!updateOwner) {
      const owner = new Owner({ room, name, socketID });
      try {
         await owner.save();
         return({ error: undefined, info: owner });
      } catch (error) {
         return({ error });
      }
   }

   updateOwner.name = name;
   updateOwner.socketID = socketID;
   await updateOwner.save();
   
   return ({ info : { name, room, socketID } });
}

const removeOwner = async (query) => {
   const owner = await Owner.findOne(query);
   if (!owner) {
      return;
   }
   await owner.remove();
}

const sendRoomMembers = async ({ room, owner, io }) => {
   const users = await getRoomMembers(room);
   const result = users.map(({ name, room }) => ({ name, room }));

   if (!users.length) {
      await removeOwner({ room });
      return;
   }

   if (!owner) {
      const { info } = await setOwner(users[0]);
      if (!info) {
         return;
      }

      io.to(room).emit("roomMembers", 
      { users: result, owner: info.name });
      return;
   }

   io.to(room).emit("roomMembers", 
   { users: result, owner });
}

module.exports = {
   setOwner,
   getOwner,
   removeOwner,
   sendRoomMembers,
}