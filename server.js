
// This file handles posting of messages through websockets. 

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const WebSocket = require('ws');


const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const wss = new WebSocket.Server({server});

const router = require('./router.js')(app);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/dist')));

const mongoUriEnvironmentAddress = process.env.MONGOLAB_URI;
const mongoAddress = "mongodb://Kris:password@ds263138.mlab.com:63138/chat";

let activeUsersObject = {};
// let timeSinceLastCull = Date.now();


function saveChatMessage(message) {
	MongoClient.connect(mongoAddress, (error, client) => {
		if (error) {
			console.log(error);
		}
		let db = client.db("chat");
		
		message = message;
		db.collection("messages").insert(
			{
				"conversationId": message.conversationId,
				"author": message.author,
				"timestamp": message.timestamp,
				"message": message.message
			}
		
		);
	})
}

function sendActiveUserList() {
	console.log("sending active users list");

	wss.clients.forEach(function each(client) {
		if ( client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({
				type: "users",
				activeUsersObject: activeUsersObject
			}));
		}
	});
}

function keepUserActive(userName) {

	if (activeUsersObject.hasOwnProperty(userName) === false) {
		activeUsersObject[userName] = {"lastPing": Date.now()}
	}
	if (activeUsersObject.hasOwnProperty(userName)) {
		activeUsersObject[userName].lastPing = Date.now()
	}
}

function cullInactiveUsers(disconnectOccurred) {

	// if (disconnectOccurred) {

	// 	clearTimeout(timeout);
	// 	Object.keys(activeUsersObject).forEach( (key) => {
	// 		let age = Date.now() - activeUsersObject[key].lastPing;
		
	// 		if (age > timeSinceLastCull) {
	// 			delete activeUsersObject[key]
	// 		}
	// 	} ) 
	// 	console.log("Deleting a logout!");
		
	// 	sendActiveUserList();
	// 	timeSinceLastCull = Date.now();
	// }
	

	var timeout = setTimeout( (timeSinceLastCull) => {
		cullInactiveUsers(false);
	}, 5000)

	if (disconnectOccurred === false) {

		Object.keys(activeUsersObject).forEach( (key) => {
			let age = Date.now() - activeUsersObject[key].lastPing;
		
			if ( age >= 6000) {
				delete activeUsersObject[key];
			}
		} ) 
		
		sendActiveUserList();
		//timeSinceLastCull = Date.now();
	}
	
	console.log(activeUsersObject);
	
}

cullInactiveUsers();

wss.on('connection', function connection(ws, request) {

	ws.on('message', function message(message) {
		message = JSON.parse(message);

		

		if (message.isPing) { 
			keepUserActive(message.userName);
			console.log("got a ping from " + message.userName);

		} else if (message.isConnection) {
			// Do
			sendActiveUserList();

		} else {
			keepUserActive(message.author);
			let messageObject = {};
			messageObject.type = "message";
			messageObject.newMessage = message;
			
			wss.clients.forEach(function each(client) {
				if ( client.readyState === WebSocket.OPEN) {
					  client.send(JSON.stringify(messageObject));		
				}
			});

			saveChatMessage(message);
		}
	})
	ws.on('close', function() {
		// let disconnectOccurred = true;
		// cullInactiveUsers(disconnectOccurred);
	})
})


server.listen(process.env.PORT || 3000, () => {
	if (process.env.PORT) {
		console.log("Server running on " + process.env.PORT);	
	} else {
		console.log("Server running on port 3000");
	}
});