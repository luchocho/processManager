const fs = require('fs');

function setClientType(clientTypeNumber){
    switch(clientTypeNumber){
       case "1":
                 clientType = "Platino";
                 break;
       case "2":
                 clientType = "Oro";
                 break;
       case "3":
                 clientType = "Plata";
                 break;
       case "4":
                 clientType = "Bronce";
                 break;
       case "5":
                 clientType = "Estrategico/Clave";
                 break;
       case "6":
                 clientType = "A exito";
                 break;
    }
    return clientType;
}

function setPriorityNumber(priorityNumber){
    switch(priorityNumber){
      case "1":
                priority = "Alta";
                break;
      case "2":
                priority = "Media";
                break;
      case "3":
                priority = "Baja";
                break;
    }
    return priority;
}

function fetchClientsData(){
    try {
         clientsString = fs.readFileSync('./clients.json');
         clientsObj = JSON.parse(clientsString);
    } catch (e) {
         clientsObj = [];
    }
    return clientsObj;
}

module.exports = {
    setClientType,
    setPriorityNumber,
    fetchClientsData
}


//var fetchClients = () => {
//    try {
//        var clientsString = JSON.readFileSync('./clients.json');
//        return JSON.parse(clientsString);
//    } catch (e) {
//        return [];
//    }
//}
//
//var saveClients = (clients) => {
//    fs.writeFileSync('./clients.json', JSON.stringify(clients));
//}
//
//var addClient = (name, clientType, clientTypeNumber) => {
//    var clients = fetchClients();
//    var client = {
//        name,
//        clientType,
//        clientTypeNumber
//    };
//    var duplicateClients = clients.filter((client) => client.name === name)
//
//    if(duplicateClients.length === 0){
//        clients.push(client);
//        saveClients(clients);
//        return client;
//    }
//}
//
//var getClient = (name) => {
//    var clients = fetchClients();
//    filteredClients = clients.filter((client) => client.name === name);
//    return filteredClients[0];
//}