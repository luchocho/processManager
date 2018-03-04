var mongoose = require("mongoose");

var todo_stateSchema = new mongoose.Schema({
  stateNumber: Number,
  dateState: {type: Date, default: Date.now },
});

module.exports = mongoose.model("todo_state", todo_stateSchema);
