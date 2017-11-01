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
  createAt: {type: Date, default: Date.now },
  dateDelivery: {type: Date, default: Date.now },
  dateDelivered: {type: Date, default: Date.now },
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
  stateNumber: Number
});

module.exports = mongoose.model("todo", todoSchema);
