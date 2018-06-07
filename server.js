
// This file handles posting of messages through websockets. 

const express = require('express');
const http = require('http');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server, clientTracking: true});

const router = require('./router.js')(app);
app.use(express.static(path.join(__dirname, '/dist')));

const mongoUriEnvironmentAddress = process.env.MONGOLAB_URI;
const mongoAddress = "mongodb://Kris:password@ds263138.mlab.com:63138/chat";

let activeUsersObject = {};
//let clients = [];
// let timeSinceLastCull = Date.now();


function saveChatMessage(message) {
	MongoClient.connect(mongoAddress, (error, client) => {
		if (error) {
			console.log(error);
		}
		let db = client.db("chat");
		//console.log(message);
		let messageObject = {
			"conversationType": message.conversationType,
			"author": message.author,
			"timestamp": message.timestamp,
			"message": message.message
		}
		if (message.conversationType === "private") {
			messageObject.recipient = message.recipient;
		}
		db.collection("messages").insert(messageObject, (result) => {
			
		});
		console.log("inserted:");
		console.log(messageObject);
	})
}

function sendActiveUserList() {
	//console.log("sending active users list (" + new Date() + ")");

	wss.clients.forEach(function each(client) {
		if ( client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({
				type: "users",
				activeUsersObject: activeUsersObject
			}));
		}
	});
}

function handleUserRegistry(userName, ws) {
	if (activeUsersObject.hasOwnProperty(userName) === false) {
		activeUsersObject[userName] = {
			"lastPing": Date.now(),
			"client": ws.toString
		}
	}
	if (activeUsersObject.hasOwnProperty(userName)) {
		activeUsersObject[userName].lastPing = Date.now()
	}
}

function cullInactiveUsers() {
	var timeout = setTimeout( () => {
		cullInactiveUsers(false);
	}, 5000)
	Object.keys(activeUsersObject).forEach( (key) => {
		let age = Date.now() - activeUsersObject[key].lastPing;
		if ( age >= 6000) {
			delete activeUsersObject[key];
		}
	} ) 
	sendActiveUserList();
	//timeSinceLastCull = Date.now();
}
cullInactiveUsers();

wss.on('connection', function connection(ws) {
	
	ws.on('message', function message(message) {
		message = JSON.parse(message);

		if (message.isPing) { 
			handleUserRegistry(message.userName, ws);

		} else if (message.isConnection) {
			sendActiveUserList();

		// Regular messages.
		} else {
			handleUserRegistry(message.author, ws);
			let messageObject = {};
			messageObject.type = "message";
			messageObject.newMessage = message;
			saveChatMessage(message);

			if (message.conversationType === "public") {
				wss.clients.forEach(function each(client) {
					if ( client.readyState === WebSocket.OPEN) {
						  client.send(JSON.stringify(messageObject));		
					}
				});
			}
			else if (message.conversationType === "private") {
				// wss.clients.forEach( (client) => {
				// 	// Client in wss's storage equals one of our stored users
				// 	// for (var userObject in activeUsersObject) {
				// 	// 	if (client === userObject.client) {
				// 	// 		//client.send(JSON.stringify(messageObject));
				// 	// 	}
				// 	// }
				// })

				// Totally insecure:
				wss.clients.forEach(function each(client) {
					if ( client.readyState === WebSocket.OPEN) {
						  client.send(JSON.stringify(messageObject));		
					}
				});
			}

		}
	})
	
	ws.on('close', function() {
		
	})
})


server.listen(process.env.PORT || 3000, () => {
	if (process.env.PORT) {
		console.log("Server running on " + process.env.PORT);	
	} else {
		console.log("Server running on port 3000");
	}
});