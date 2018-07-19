
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
// const http = require('http');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
// const WebSocket = require('ws');

const nameComponents = require('./nameComponents.js');

const mongoUriEnvironmentAddress = process.env.MONGOLAB_URI;
const mongoAddress = "mongodb://Kris:password@ds263138.mlab.com:63138/chat";




function generateUniqueName(existingNames) {
    let returnedName;

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
					return randomName;
				} 
			}
		}

		if (number >= 1) {
			for (let i = 0; i < 10; i++) {
				let randomName = getRandomName();
				let compositeName = randomName + number;
				if (existingNames.indexOf(compositeName) === -1) { // If the name doesn't exist, return current name. Try "i" times.
					return compositeName;
				} 
			}
        }
        
		number++;
		return returnCheckedNames(number); // Otherwise add a number to the end and do it again.
    }
    
	return returnCheckedNames();
}



module.exports = function(app) {

    app.get('/', (request, response) => {
        response.sendFile(path.resolve('dist/index.html'));
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
                // Find all unique user names, pass them to name generator as things it can't return.
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
    

            // All public stuff            console.log(request);
            db.collection("messages", (error, collection) => {
                collection.find({"conversationType": "public"}).toArray( (error, items) => {
                    let responseObject = {};
                    responseObject.type = "messages";                    
                    responseObject.messages = items;
                    response.send(responseObject);
                    console.log("Response we're sending")
                    console.log(responseObject);
                    console.log(responseObject.messages.length)
                });
            });
        });
    
    });

    // Returns an object containing all the conversations as items.
    
    app.post('/getPrivateConversationsHistory', jsonParser, (request, response) => {
        MongoClient.connect(mongoAddress, (error, client) => {
            console.log("Fetching history");
            if (error) {
                console.log(error);
            }
            let db = client.db("chat");
    
            db.collection("messages", (error, collection) => {
                let currentUser = request.body.userName;
                let returnObject = {};
                collection.find({
                    $and: [
                        {"conversationType": "private"},
                        {
                            $or: [
                                {"author": currentUser},
                                {"recipient": currentUser}
                            ]
                        }
                    ]
                }).toArray( (error, itemsArray) => {
                    // We're making this:
                    // {
                    //     recipientOne: [
                    //         {message object},
                    //         {message object},
                    //     ],                   
                    //     recipientTwo: [
                    //         ...
                    //     ]
                    // }
                    itemsArray.forEach(function(item) {
                        console.log("item");
                        console.log(item);

                        // Talking to ourself. 
                        if (item.author === item.recipient) {
                            if (!returnObject.hasOwnProperty(currentUser)) {    // Message array doesn't exist. Create it.
                                returnObject[currentUser] = [item];
                            } 
                            else {                                              // Message array exists. Add to it.
                                returnObject[currentUser].push(item);
                            }
                        } 
                        
                        // We are talking to someone else.
                        else if (item.author === currentUser) {
                            if (!returnObject.hasOwnProperty(item.recipient)) {
                                returnObject[item.recipient] = [item];
                            } else {
                                returnObject[item.recipient].push(item);
                            }
                        }

                        else if (item.recipient === currentUser) {
                            if (!returnObject.hasOwnProperty(item.author)) {
                                returnObject[item.author] = [item];
                            } else {
                                returnObject[item.author].push(item);
                            }
                        }
                    });
                    console.log("return object");
                    console.log(returnObject);
                    response.send(JSON.stringify(returnObject));
                });
            });           
        });
    })



}
