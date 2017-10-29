var mongoose = require("mongoose");

var clientSchema = new mongoose.Schema({
  name: String,
  clientType: String,
  clientTypeNumber: Number
});

module.exports = mongoose.model("client", clientSchema);
