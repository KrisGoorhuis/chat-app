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

function generateUniqueName(existingNames) {

	function getRandomName() {
		let randomAdjective = nameComponents.adjective[ Math.floor(Math.random() * nameComponents.adjective.length) ]
		let randomNoun = nameComponents.noun[ Math.floor(Math.random() * nameComponents.noun.length) ]
		return randomAdjective + randomNoun;
	}

	function returnCheckedNames(lastNumber) {
		let number = 0;
		if (lastNumber) {
			number = lastNumber
		}
		
		if (number === 0) {
			for (let i = 0; i < 10; i++) {
				let randomName = getRandomName();
				if (existingNames.indexOf(randomName) === -1) { // If the name doesn't exist, return current name. Try "i" times.
					console.log(existingNames.indexOf(randomName));
					return randomName;
				} 
				if (existingNames.indexOf(randomName) !== -1) {
					console.log(randomName + " exists already");
				}
			}
		}

		if (number >= 1) {
			for (let i = 0; i < 10; i++) {
				let randomName = getRandomName();
				let compositeName = randomName + number;
				if (existingNames.indexOf(compositeName) === -1) { // If the name doesn't exist, return current name. Try "i" times.
					console.log(existingNames.indexOf(compositeName));
					return compositeName;
				} 
				if (existingNames.indexOf(randomName) !== -1) {
					console.log(randomName + " exists already");
				}
			}
		}

		// if (number >= 1) {
		// 	for (let i = 0; i < 10; i++) {
		// 		let randomName = getRandomName();
		// 		let compositeName = randomName + number;
		// 		if (existingNames.indexOf(compositeName) === -1) { 
		// 			console.log("Returning " + compositeName)
		// 			console.log(compositeName);
		// 			console.log(typeof compositeName);
		// 			return randomName;
		// 		} 
		// 		if (existingNames.indexOf(compositeName) !== -1) {
		// 			console.log(compositeName + " exists already");
		// 		}
		// 	}
		// }	
		number++;
		returnCheckedNames(number); // Otherwise add a number to the end and do it again.
	}
	let returner = returnCheckedNames();
	console.log("returner: " + returner);
	return returner;
}

app.get('/', (request, response) => {
	response.sendFile('dist/index.html')
});

app.get('/getAName', (request, response) => {
	MongoClient.connect(mongoAddress, (error, client) => {
		if (error) {
			console.log(error);
		}
		let db = client.db("chat");
		db.collection("messages", (error, collection) => {
			if (error) {
				console.log(error);
			}
			collection.distinct("author", (error, existingNames) => {
				if (error) {
					console.log(error);
				}
				console.log("Existing names: ")
				console.log(existingNames + "\n");
				let newName = generateUniqueName(existingNames);

				console.log("New name: ")
				console.log(newName + "\n");
				response.send(newName);
			});
		});
	})
})

app.get('/fetchChatHistory', (request, response) => {
	MongoClient.connect(mongoAddress, (error, client) => {
		console.log("Fetching history");
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



server.listen(process.env.PORT || 3000, () => {
	if (process.env.PORT) {
		console.log("Server running on " + process.env.PORT);	
	} else {
		console.log("Server running on port 3000");
	}
});