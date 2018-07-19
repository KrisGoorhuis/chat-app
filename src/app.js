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
        this.selectChatWindow = this.selectChatWindow.bind(this);

        this.ws = new WebSocket( location.origin.replace(/^http/, 'ws') || 'ws://localhost:3000' );

        this.state = {
            messages: [],
            messagesLoaded: false,
            activeUsers: ["Checking..."],
            currentUser: "( Fetching... )",
            currentChatWindow: "public",
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
            //  TODO: We don't seem to be coming here after registering a new user. Most of the time we make it?
            let sendPing = () => {
                if (this.ws.readyState === this.ws.CLOSED) {
                    console.log("Websocket closed. Ending pings")
                    return;
                }
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
                    
                    //TODO: get this into a state thing
                    // console.log("response");
                    // console.log(response);
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
            }
            
            // No name yet
            if (!userName) {
                this.setState({
                    currentUser: "( Generating... )"
                })
                getAndSaveNewUserName()
        }
        sendPing();
            
    }

        
        this.ws.onmessage = (message) => {
            let parsedMessage = JSON.parse(message.data)

            // Update user list
            if (parsedMessage.type === "users") {
                this.setState({
                    activeUsers: Object.getOwnPropertyNames(parsedMessage.activeUsersObject)
                })
            }

            // Public message
            if (parsedMessage.type === "message" && parsedMessage.newMessage.conversationType === "public") {
                let newMessages = this.state.messages;
                newMessages.push(parsedMessage.newMessage);
                console.log(parsedMessage);
                this.setState({
                    messages: newMessages
                })
            }

            // Private message
            if (parsedMessage.type === "message" && parsedMessage.newMessage.conversationType === "private") {
                let currentUser = this.state.currentUser;
                let messageAuthor = parsedMessage.newMessage.author;
                let messageRecipient = parsedMessage.newMessage.recipient;
                let newConversations = this.state.privateConversationsObjects;
                let newPrivateArray = this.state.privateConversationsArray;

                // Determining which conversation to add a message to
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

                // Determining whether to alert the user to a new message
                // TODO: this doesn't seem to be triggering. Also there is a delay on private messages.
                if (this.state.currentChatWindow !== messageAuthor) {
                    let tabsWithAlert = this.state.conversationTabs;
                    this.openConversationTab(messageAuthor);
                    console.log("ran it anyway");
                    tabsWithAlert.map( (obj) => {
                        if (obj.name === messageAuthor) {
                            obj.alert = true;
                        }
                    })
                    this.setState({
                        conversationTabs: tabsWithAlert,
                        privateConversationsObjects: newConversations,
                        privateConversationsArray: newPrivateArray
                    });
                } 
                
                else {
                    this.setState({
                        privateConversationsObjects: newConversations,
                        privateConversationsArray: newPrivateArray
                    });
                }

            }
        }
    }

    openConversationTab(partnerName, flipTo) {
        // TODO: I tried to save some operations by watching what changed here
        // But variable updates defined lower in the code were occurring before the initial log just below this.
        // BUT - this odd behavior only occurred in normal execution - stepping through in the debugger saw things behaving as expected.
        // Something something different Javascript engines, the debugger version functioning as expected. 
        // Instead of digging into that - maybe later - I'm just going to let it do the unnecessary steps.

        // Basically: Chrome's Javascript engine !== Chrome's debugger's Javascript engine
        // https://github.com/facebook/react-native/issues/13195

        // debugger;
        // console.log("Initial tabs")
        // console.log(this.state.conversationTabs)


        let newSideList = this.state.privateConversationsArray;
        let newTopTabs = this.state.conversationTabs;
        // let updateState = false;
        let shouldAddTab = true;

        newTopTabs.map( (obj) => {
            if (obj.name === partnerName) {
                shouldAddTab = false;
            }
        });

        if (shouldAddTab) {
            newTopTabs.push({"name": partnerName, "alert": false})
        }
        if (newSideList.indexOf(partnerName) === -1) {
            newSideList.push(partnerName);
        }

        if (newSideList !== this.state.privateConversationsArray || newTopTabs !== this.state.conversationTabs) {
            updateState = true;
        }
        console.log(newTopTabs);
        // debugger;
        // if (updateState === true && flipTo === true) {
        //     console.log("firsy blah")
        //     this.setState({
        //         currentChatWindow: partnerName,
        //         privateConversationsArray: newSideList,
        //         conversationTabs: newTopTabs
        //     });
        // } else if (updateState === true) {
        //     console.log("second blah")
        //     this.setState({
        //         privateConversationsArray: newSideList,
        //         conversationTabs: newTopTabs
        //     });
        // }
        if (flipTo === true) {
            this.setState({
                currentChatWindow: partnerName,
                privateConversationsArray: newSideList,
                conversationTabs: newTopTabs
            });
        } else {
            this.setState({
                privateConversationsArray: newSideList,
                conversationTabs: newTopTabs
            });
        }
    }

    closeConversationTab(recipient) {
        let newTopTabs = this.state.conversationTabs;
        let nextWindow;
        let newSideList = this.state.privateConversationsArray;

        newTopTabs.splice(newTopTabs.indexOf(name), 1);

        if (newTopTabs[newTopTabs.length - 1]) {
            nextWindow = newTopTabs[newTopTabs.length - 1]
        } else {
            nextWindow = "public"
        }

        // No messages? Remove it from the side as well.
        if (!this.state.privateConversationsObjects[recipient]) {
            newSideList.splice(newSideList.indexOf(recipient), 1);
        }

        this.setState({
            conversationTabs: newTopTabs,
            currentChatWindow: nextWindow,
            privateConversationsArray: newSideList
        });
    }

    selectChatWindow(name) {
        let newConversationTabs = this.state.conversationTabs;

        newConversationTabs.map( (obj, index) => {
            if (obj.name === name) {
                newConversationTabs[index].alertState = false;
            }
        })
        // if (newConversationTabs[name].alertState === true) {
        //     newConversationTabs[name].alertState = false;
        // }

        this.setState({
            conversationTabs: newConversationTabs,
            currentChatWindow: name
        })
    }
   
    componentDidUpdate() {

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
                        currentChatWindow={this.state.currentChatWindow}
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
                        currentChatWindow={this.state.currentChatWindow}
                        selectChatWindow={this.selectChatWindow}
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