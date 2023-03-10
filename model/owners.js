const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });


const ownerSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
   },
   room: {
      type: String,
      required: true,
      unique: true, 
   },
   socketID: {
      type: String,
      required: true,
      unique: true, 
   }
});

const Owner = mongoose.model("Owner", ownerSchema);

module.exports = Owner;
