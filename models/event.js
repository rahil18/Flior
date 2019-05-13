
var mongoose = require("mongoose");
 
var eventSchema = new mongoose.Schema({
   name: String,
   image: String,
   description: String,
   createdAt: { type: Date, default: Date.now },
   author: {  //Associate events with Username/author
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User" //Referenceing to the user model
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment" //Referenceing to the comment model
      }
   ]
});
 
module.exports = mongoose.model("event", eventSchema);