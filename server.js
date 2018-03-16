const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const WebSocket = require('ws');
const nameComponents = require('./nameComponents.js');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const wss = new WebSocket.Server({server});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/dist')));

const mongoUriEnvironmentAddress = process.env.MONGOLAB_URI;
const mongoAddress = "mongodb://Kris:password@ds263138.mlab.com:63138/chat";

app.get('/', (request, response) => {
	response.sendFile('dist/index.html')
});

wss.on('connection', function connection(ws, request) {
	if (wss.clients.size = 1) {
		ws.send("HonestMoose"); 
	}
	if (wss.clients.size > 1 ) {
		ws.send("UnsuspectingCass"); 
	}
	console.log(wss.clients.size);
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
})

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

// app.post('/postGeneralChatMessage', (request, response) => {	
// 	MongoClient.connect(mongoAddress, (error, client) => {
// 		if (error) {
// 			console.log(error);
// 		}
// 		let db = client.db("chat");


// 		db.collection("messages").insert(
// 			{
// 				"conversationId": request.body.conversationId,
// 				"author": request.body.author,
// 				"timestamp": request.body.timestamp,
// 				"message": request.body.message
// 			}
		
// 		);
// 		response.send();
// 		console.log(request.body);
// 	})
// });

app.get('/fetchChatHistory', (request, response) => {
	MongoClient.connect(mongoAddress, (error, client) => {
		console.log("fetch history");
		if (error) {
			console.log(error);
		}

		let db = client.db("chat");

		db.collection("messages", (error, collection) => {
			collection.find({"conversationId": "public"}).toArray( (error, items) => {
				response.send(items);
			});
		});
	});

});

server.listen(process.env.PORT || 3000, () => {
	if (process.env.PORT) {
		console.log("Server running on " + process.env.PORT);	
	} else {
		console.log("Server running on port 3000");
	}
});