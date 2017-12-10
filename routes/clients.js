var express = require("express");
var router = express.Router();
var Client = require("../models/client");
var functions = require("./functions.js");



router.get("/", function(req, res){
    var clientsData = functions.fetchClientsData();
    console.log(clientsData);
    if(req.query.name) {
      clientsData.forEach(function(clientData){
          if(clientData.name == req.query.name){
              clientTypeId = clientData.clientTypeId;
          }
      });
      if(typeof clientTypeId !== 'undefined'){
          Client.find({clientTypeId: clientTypeId},{ clientTypeNumber: 1}, function(err, client){
              if(err){
                  console.log(err);
              } else {
                  client[0].clientTypeId = clientTypeId;
                  res.json(client);
              }
          });
      }
    } else {
        Client.find({},{clientTypeId : 1}, function(err, clients){
            if(err){
                console.log(err);
            } else {
                clientsData.forEach(function(clientObj){
                    clients.forEach(function(client){
                        if(clientObj.clientTypeId == client.clientTypeId){
                            client.name = clientObj.name;
                        }
                    })
                });
                console.log(clients);
                res.json(clients);
            }
        });
    }
});

router.put("/", function(req, res){
  var clientsArray = functions.fetchClientsData();
  var clientObj = {
    name : req.body.clientData.name,
    clientTypeId : clientsArray.length + 1
  };
  var duplicateClient = clientsArray.filter(function(client){
      if(client.name == req.body.clientData.name){
        return client;
      }
  });

  if(duplicateClient.length === 0) {
    clientsArray.push(clientObj);
    functions.saveClientJson(clientsArray);
    clientObj.clientTypeNumber = req.body.clientData.clientTypeNumber;
    Client.create(clientObj, function (err, client) {
      if (err) {
        console.log(err);
      } else {
        res.json(client);
      }
    })
  }

});

module.exports = router;
