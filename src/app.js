import React from 'react';
import PropTypes from 'prop-types';

import {Header} from './components/header.js';
import {SideBar} from './components/sidebar/sidebar-main.js';
import {ChatWindow} from './components/chat-window/chat-window-main.js';


export class App extends React.Component {

    constructor(props) {
        super(props);

        this.openConversationTab = this.openConversationTab.bind(this);
        this.closeConversationTab = this.closeConversationTab.bind(this);
        this.ws = new WebSocket( location.origin.replace(/^http/, 'ws') || 'ws://localhost:3000' );
        this.state = {
            messages: [],
            messagesLoaded: false,
            activeUsers: ["Checking..."],
            currentUser: "( Fetching... )",
            privateConversationsArray: [],
            privateConversationsObjects: {},
            conversationTabs: []
        }  

        fetch('/fetchChatHistory')
            .then( (response) => {
                return response.json();
            })
            .then( (response) => {
                this.setState({
                    messages: response.messages,
                    messagesLoaded: true
                });
            });

        this.ws.onopen = () => {
             // Keeps the socket open and keeps us on the active user list.
             let sendPing = () => {
                this.ws.send(JSON.stringify({
                    "isPing": true,
                    "userName": this.state.currentUser
                }));
                setTimeout( () => {
                    sendPing();
                }, 5000);
            };
            
            // Get all conversations that have
            // Returns an object containing the conversations as items.
            let getPrivateConversationsHistory = (userName) => {
                fetch('/getPrivateConversationsHistory',
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({"userName": userName})
                })
                .then( (response) => {
                    return response.json();
                })
                .then( (response) => {
                    let newArray = this.state.privateConversationsArray;
                    let newSideList = Object.keys(response);
                    console.log(Object.keys(response));
                    
                    //TODO: get this into a state thing
                    console.log("response");
                    console.log(response);
                    this.setState({
                        privateConversationsObjects: response,
                        privateConversationsArray: newSideList
                    })
                })
            }

            let getAndSaveNewUserName = () => {
                return new Promise( resolve => {
                    fetch('getAName')
                    .then( (response ) => {
                        return response.text();
                    })
                    .then ( (name) => {
                        this.ws.send(JSON.stringify(
                            {
                                "conversationId": "public",
                                "author": name,
                                "timestamp": new Date(),
                                "message": "( - claiming name server side - )",
                            }
                        ));
                        console.log("Setting name to " + name);
                        localStorage.setItem('userName', name);
    
                        this.setState({
                            currentUser: name
                        });
                        resolve;
                    });
                });
            };

            // Have name
            // Register us as active and get the user list back
            let userName = localStorage.getItem("userName");
            if (userName) {

                // Gets the user list back
                this.ws.send( JSON.stringify({
                    "isConnection": true,
                    "userName": userName
                }));
                this.setState({
                    currentUser: userName
                })
                getPrivateConversationsHistory(userName);
                sendPing();
            }
            
            // No name yet
            if (!userName) {
                this.setState({
                    currentUser: "( Generating... )"
                })
                getAndSaveNewUserName()
                .then( () => {
                    sendPing();
                }) 
            }
            
        }

        
        this.ws.onmessage = (message) => {
            let parsedMessage = JSON.parse(message.data)
            if (parsedMessage.type === "users") {

                this.setState({
                    activeUsers: Object.getOwnPropertyNames(parsedMessage.activeUsersObject)
                })
            }

            if (parsedMessage.type === "message" && parsedMessage.newMessage.conversationType === "public") {
                let newMessages = this.state.messages;
                newMessages.push(parsedMessage.newMessage);
                console.log(parsedMessage);
                this.setState({
                    messages: newMessages
                })
            }
            if (parsedMessage.type === "message" && parsedMessage.newMessage.conversationType === "private") {
                let currentUser = this.state.currentUser;
                let messageAuthor = parsedMessage.newMessage.author;
                let messageRecipient = parsedMessage.newMessage.recipient;
                let newConversations = this.state.privateConversationsObjects;
                let newPrivateArray = this.state.privateConversationsArray;


                if (currentUser === messageAuthor) {
                    if (!newConversations[messageRecipient]) {
                        newConversations[messageRecipient] = [];
                    }
                    newConversations[messageRecipient].push(parsedMessage.newMessage);
                    newPrivateArray.push(message.recipient);
                } 
                else if (currentUser === messageRecipient) { // Talking to ourselves.
                    if (!newConversations[messageAuthor]) {   // At this point, it would have been easier to not let you talk to yourself.
                        newConversations[messageAuthor] = [];
                    }
                    newConversations[messageAuthor].push(parsedMessage.newMessage);
                    newPrivateArray.push(messageAuthor);
                }


                this.setState({
                    privateConversationsObjects: newConversations,
                    privateConversationsArray: newPrivateArray
                });
            }
        }

    }

    openConversationTab(partnerName, isResumingConversation) {
        let newSideList = this.state.privateConversationsArray;
        let newTopTabs = this.state.conversationTabs;
        let updateState = false;

        if (newTopTabs.indexOf(partnerName) === -1) {
            newTopTabs.push(partnerName);
            updateState = true;
        } else {
            // TODO: Make the tab flash?
        }

        if (newSideList.indexOf(partnerName) === -1) {
            newSideList.push(partnerName);
            updateState = true;
        }

        if (updateState === true) {
            this.setState({
                privateConversationsArray: newSideList,
                conversationTabs: newTopTabs
            });
        }
    }

    closeConversationTab(recipient) {
        let newTopTabs = this.state.conversationTabs;
        newTopTabs.splice(newTopTabs.indexOf(name), 1);
        // TODO:
        // Check to see if the tab has any messages - remove the name from the sidebar if it doesn't. Otherwise it stays.
        // if (tabObject.messages.length === 0) {
        //     let newConversationsList = this.state.privateConversationsObjects;
        //     newConversationsList.splice(newconversationObjects.indexOf(name), 1);
        //     this.setState({
        //         privateConversationsObjects: newConversationsList
        //     })
        // }
        this.setState({
            conversationTabs: newTopTabs
        });
    }
   

    render() {
        return (
            <div>
                <Header />
                <div id="container-main-content" className="container-fluid">
                    <div>{this.currentUser}</div>
                    <SideBar 
                        ws={this.ws} 
                        currentUser={this.state.currentUser} 
                        activeUsers={this.state.activeUsers}
                        privateConversationsArray={this.state.privateConversationsArray}
                        privateConversationsObjects={this.state.privateConversationsObjects}
                        openConversationTab={this.openConversationTab}
                        closeConversationTab={this.closeConversationTab}
                    />
                    <ChatWindow 
                        ws={this.ws} 
                        currentUser={this.state.currentUser} 
                        messages={this.state.messages} 
                        messagesLoaded={this.state.messagesLoaded} 
                        privateConversationsArray={this.state.privateConversationsArray}
                        privateConversationsObjects={this.state.privateConversationsObjects}
                        conversationTabs={this.state.conversationTabs}
                        openConversationTab={this.openConversationTab}
                        closeConversationTab={this.closeConversationTab}
                    />
                </div>
            </div>
        )
    }

}