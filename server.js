'use strict';

const { json } = require('body-parser');
const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

let messages = { type: "messageArray", messages: [] } //[{ from: <username>, message: <message>}]
let usernames = []
let chats = {}


const server = express()
  .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  // console.log(wss.clients)
  console.log(`${wss.clients.size} clients connected`)

  //Offer available seats to client
  //check if that client already has a seat
  // const seatArray = Object.keys(users)
  // const userNumber = seatArray.length
  // let userId = "seat" + userNumber
  // ws.id = userId
  // users[userId] = {}

  //let client choose username
  ws.send(JSON.stringify({ type: "chooseUsername" }))
  ws.send(JSON.stringify({ type: "chatsObject", chatsObject: chats }));

  ws.on('message', function message(data) {
    const dataParsed = JSON.parse(data)
    console.log(dataParsed)

    if (dataParsed.type === "usernameChoice") {                                     //Choose Username
      ws.username = dataParsed.username
      let usernameAlreadyAdded = false
      for (let i = 0; i < usernames.length; i++) {
        if (usernames[i] === dataParsed.username) {
          usernameAlreadyAdded = true
        }
      }

      if (!usernameAlreadyAdded) {
        usernames.push(dataParsed.username)
      }

      //confirm that the username was set
      ws.send(JSON.stringify({ type: "getUsername", username: ws.username }))

      //send the updated username list to all clients
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: "usernameList", usernames: usernames }))
      })
    } else if (dataParsed.type === "message") {
      //find out who the two people are
      const fromChatter = dataParsed.data.from
      const toChatter = dataParsed.data.to
      //see if they exist in the chats object or their reversed names exist
      const fromToChats = chats[`${fromChatter}+${toChatter}`]
      if (!fromToChats) {
        const toFromChats = chats[`${toChatter}+${fromChatter}`]
        if (!toFromChats) {
          //create at fromToChats
          chats[`${fromChatter}+${toChatter}`] = [{ from: dataParsed.data.from, message: dataParsed.data.message }]  //[{ from: <username>, message: <message>}]
        } else {
          //add to toFromChats
          chats[`${toChatter}+${fromChatter}`].push({ from: dataParsed.data.from, message: dataParsed.data.message })
        }
      } else {
        //add to fromToChats
        chats[`${fromChatter}+${toChatter}`].push({ from: dataParsed.data.from, message: dataParsed.data.message })
      }
      console.log("Receiving message")
      console.log(dataParsed.data)
      messages["messages"].push(dataParsed.data)
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: "chatsObject", chatsObject: chats }));
      });
    } else if (dataParsed.type === "clearServerData") {
      console.log("Need to clear server here")
      messages = { type: "messageArray", messages: [] } //[{ from: <username>, message: <message>}]
      usernames = []
      chats = {}
      //send updates to clients
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: "usernameList", usernames: usernames }))
      })
      wss.clients.forEach((client) => {
        client.send(JSON.stringify({ type: "chatsObject", chatsObject: chats }));
      });
    } else {
      console.log("I don't know what to do with this message from the client: ")
      console.log(dataParsed)
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
