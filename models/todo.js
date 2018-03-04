var mongoose = require("mongoose");

var todoSchema = new mongoose.Schema({
  name: String,
  client: {
        id: { type: mongoose.Schema.Types.ObjectId,
              ref: "Client"},
        name: String,
        clientType: String,
        clientTypeNumber: Number
          },
  priority: String,
  priorityNumber: Number,
  createAt: {type: Date  },
  dateDelivery: {type: Date },
  dateClosed: {type: Date},
  office: String,
  comments: String,
  createUser: String,
  assignUser: {
           id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User"
           },
           username: String
  },
  closeOrigin: Number,
  processType: String,
  stateNumber: Number,
  state: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "todo_state"
        }
     ]
});

module.exports = mongoose.model("todo", todoSchema);
