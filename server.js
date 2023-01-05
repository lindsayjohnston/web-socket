'use strict';

const { json } = require('body-parser');
const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

let messages = [] //[{ from: <username>, message: <message>}]
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
  console.log("Let's see if there's a user id set...")
  console.log(ws.id)


  ws.on('message', function message(data) {
    const dataParsed = JSON.parse(data)
    messages.push(dataParsed)
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(messages));
    });
    const message = dataParsed.message
    console.log('received: %s', message)
  })
  ws.on('close', () => {
    console.log('Client disconnected');
    messages = [];
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
