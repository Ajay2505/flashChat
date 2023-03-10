const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   room: {
      type: String,
      required: true, 
   },
   socketID: {
      type: String,
      required: true,
   }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
