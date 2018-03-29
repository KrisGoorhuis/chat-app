
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
		console.log("saving");
	})
}

wss.on('connection', function connection(ws, request) {
	console.log("client connect at " + new Date());
	console.log("Number of clients: " + wss.clients.size);
	ws.on('message', function message(message) {
		
		message = JSON.parse(message);
		console.log("Message: ");
		console.log((message));
		
		wss.clients.forEach(function each(client) {
			if ( client.readyState === WebSocket.OPEN) {
			  	client.send(JSON.stringify(message));
				
			}
		});
		saveChatMessage(message);
	})
	ws.on('close', function() {
		console.log("client disconnect at " + new Date());
	})
})


server.listen(process.env.PORT || 3000, () => {
	if (process.env.PORT) {
		console.log("Server running on " + process.env.PORT);	
	} else {
		console.log("Server running on port 3000");
	}
});