'use strict';

const { json } = require('body-parser');
const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

let messages = { type: "messageArray", messages: [] } //[{ from: <username>, message: <message>}]
const users = {}
//{"seat1": 
//  username: null, -- will be string chosen by user
//  chatsWith: {
//      "user2": [messagesArray1],
//      "user3": [messagesArray2]
//  },
//{"seat2": 
//  username: null,
//  chatsWith: {
//      "user1": [messagesArray1],
//      "user3": [messagesArray2]
//  },
//}

const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

  //Offer available seats to client
  const seatArray = Object.keys(users)
  const userNumber = seatArray.length
  let userId = "seat" + userNumber
  ws.id = userId
  users[userId] = {}

  //let client choose username
  ws.send(JSON.stringify({ type: "chooseUsername" }))

  ws.on('message', function message(data) {

    const dataParsed = JSON.parse(data)
    console.log(dataParsed)
    if (dataParsed.type === "usernameChoice") {
      console.log(ws.id + " chose username:")
      console.log(dataParsed.username)
      users[ws.id].username = dataParsed.username
      console.log("users should be updated now:")
      console.log(users)
      
    } 
    
    if (dataParsed.type === "message") {
      console.log("Receiving message")
      console.log(dataParsed.data)
      messages["messages"].push(dataParsed.data)
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(messages));
      });
    }

  })

  ws.on('close', () => {
    console.log('Client disconnected');
    messages = { "type": "messageArray", "messages": [] };
  });
});





// setInterval(() => {
//   wss.clients.forEach((client) => {
//     client.send(new Date().toTimeString());
//   });
// }, 1000);

// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');

// const port = 3000;
// const server = http.createServer(express);
// const wss = new WebSocket.Server({ server })

// wss.on('connection', function connection(ws) {
//   ws.on('message', function incoming(data) {
//     wss.clients.forEach(function each(client) {
//       if (client !== ws && client.readyState === WebSocket.OPEN) {
//         client.send(data);
//       }
//     })
//   })
// })

// server.listen(port, function() {
//   console.log(`Server is listening on ${port}!`)
// })
