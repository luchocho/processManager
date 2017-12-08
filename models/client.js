var mongoose = require("mongoose");

var clientSchema = new mongoose.Schema({
  name: String,
  clientTypeId : Number,
  clientType: String,
  clientTypeNumber: Number
});

module.exports = mongoose.model("client", clientSchema);
