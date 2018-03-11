var mongoose = require("mongoose");

var todo_stateSchema = new mongoose.Schema({
  stateId: Number,
  dateState: {type: Date, default: Date.now },
});

module.exports = mongoose.model("todo_state", todo_stateSchema);
