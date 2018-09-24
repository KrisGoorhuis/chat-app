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
            newPublicMessageAlert: false,
            privateConversationsSideList: [],
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


        // onopen does:
        // Get our message history - private and public
        // Check to see if the user has a name. Retrieve an unused one from the back if not.
        // Start pinging to keep the socket open
        this.ws.onopen = () => {
             // Keeps the socket open and keeps us on the active user list.            //  TODO: We don't seem to be coming here after registering a new user. Most of the time we make it?
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
                    let newArray = this.state.privateConversationsSideList;
                    let newSideList = Object.keys(response);
                    
                    //TODO: get this into a state thing
                    // console.log("response");
                    // console.log(response);
                    this.setState({
                        privateConversationsObjects: response,
                        privateConversationsSideList: newSideList
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

        // onmessage does:
        // Keep our user list and message scroll up to date - private and public.
        // See if we need to alert the user to something new.
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
                
                // Flag for alert
                if (this.state.currentChatWindow !== "public") {
                    newMessages.push(parsedMessage.newMessage);
        
                    this.setState({
                        messages: newMessages,
                        newPublicMessageAlert: true
                    })
                // Don't flag for alert
                } else {
                    let newMessages = this.state.messages;
                    newMessages.push(parsedMessage.newMessage);
                    this.setState({
                        messages: newMessages
                    })
                }
            } 
            


            // Private message
            if (parsedMessage.type === "message" && parsedMessage.newMessage.conversationType === "private") {
                let currentUser = this.state.currentUser;
                let messageAuthor = parsedMessage.newMessage.author;
                let messageRecipient = parsedMessage.newMessage.recipient;
                let newConversations = this.state.privateConversationsObjects;
                let newPrivateSideList = this.state.privateConversationsSideList;

                // Determining which conversation to add a message to
                if (currentUser === messageAuthor) {
                    if (!newConversations[messageRecipient]) {
                        newConversations[messageRecipient] = [];
                    }
                    newConversations[messageRecipient].push(parsedMessage.newMessage);
                    if (newPrivateSideList.indexOf(messageAuthor) === -1) {
                        newPrivateSideList.push(message.recipient);
                    }
                } 
                else if (currentUser === messageRecipient) { // Talking to ourselves.
                    if (!newConversations[messageAuthor]) {   // At this point, it would have been easier to not let you talk to yourself.
                        newConversations[messageAuthor] = [];
                    }
                    newConversations[messageAuthor].push(parsedMessage.newMessage);
                    if (newPrivateSideList.indexOf(messageAuthor) === -1) {
                        newPrivateSideList.push(message.recipient);
                    }
                }


                // Determining whether to alert the user to a new message
                if (this.state.currentChatWindow !== messageAuthor) {
                    let tabsWithAlert = this.state.conversationTabs;
                    this.openConversationTab(messageAuthor);
                    tabsWithAlert.map( (obj) => {
                        if (obj.name === messageAuthor && messageAuthor !== currentUser) {
                            obj.newMessageAlert = true;
                        }
                    })
                    console.log("setting private convo flag for " + messageAuthor)
                    this.setState({
                        conversationTabs: tabsWithAlert,
                        privateConversationsObjects: newConversations,
                        privateConversationsSideList: newPrivateSideList
                    });
                } else {
                    this.setState({
                        privateConversationsObjects: newConversations,
                        privateConversationsSideList: newPrivateSideList
                    });
                }

            }
        }
    }

    openConversationTab(partnerName, flipTo) {
        // TODO: I tried to save some operations by watching what changed here
        // But variable updates defined lower in the code were occurring before the initial commented out log just below this.
        // BUT - this odd behavior only occurred in normal execution in the browser -
        //  - stepping through in the debugger saw things behaving as expected.
        // Instead of digging into that - maybe later - I'm just going to let it do the unnecessary steps.

        // Basically: Chrome's Javascript engine !== Chrome's debugger's Javascript engine
        // https://github.com/facebook/react-native/issues/13195

        // debugger;
        // console.log("Initial tabs")
        // console.log(this.state.conversationTabs)


        let newSideList = this.state.privateConversationsSideList;
        let newTopTabs = this.state.conversationTabs;
        // let updateState = false;
        let shouldAddTab = true;

        newTopTabs.map( (obj) => {
            if (obj.name === partnerName) {
                shouldAddTab = false;
            }
        });

        if (shouldAddTab) {
            newTopTabs.push({"name": partnerName, "newMessageAlert": false})
        }
        if (newSideList.indexOf(partnerName) === -1) {
            newSideList.push(partnerName);
        }

        if (newSideList !== this.state.privateConversationsSideList || newTopTabs !== this.state.conversationTabs) {
            updateState = true;
        }
        // debugger;
        // if (updateState === true && flipTo === true) {
        //     console.log("firsy blah")
        //     this.setState({
        //         currentChatWindow: partnerName,
        //         privateConversationsSideList: newSideList,
        //         conversationTabs: newTopTabs
        //     });
        // } else if (updateState === true) {
        //     console.log("second blah")
        //     this.setState({
        //         privateConversationsSideList: newSideList,
        //         conversationTabs: newTopTabs
        //     });
        // }
        if (flipTo === true) {
            this.setState({
                currentChatWindow: partnerName,
                privateConversationsSideList: newSideList,
                conversationTabs: newTopTabs
            });
        } else {
            this.setState({
                privateConversationsSideList: newSideList,
                conversationTabs: newTopTabs
            });
        }
    }

    closeConversationTab(recipient) {
        let newTopTabs = this.state.conversationTabs;
        let nextWindow;
        let newSideList = this.state.privateConversationsSideList;
        let closedTabIndex;

        newTopTabs.map( (obj, index) => {
            if (obj.name === recipient) {
                closedTabIndex = index
            }
        })
        
        newTopTabs.splice(closedTabIndex, 1);
        console.log(newTopTabs.length)
        console.log(closedTabIndex)

        if (newTopTabs.length >= 1 && closedTabIndex !== 0) {
            console.log("Changing to ") 
            nextWindow = newTopTabs[closedTabIndex - 1].name
            console.log(nextWindow)
        } else {
            nextWindow = "public"
        }
        this.selectChatWindow(nextWindow);


        // No messages? Remove it from the side as well.
        if (!this.state.privateConversationsObjects[recipient]) {
            newSideList.splice(newSideList.indexOf(recipient), 1);
        }

        this.setState({
            conversationTabs: newTopTabs,
            privateConversationsSideList: newSideList
        });
    }

    selectChatWindow(name) {
        let newConversationTabs = this.state.conversationTabs;
        console.log(newConversationTabs)
        console.log(name)

        if (name === "public") {
            this.setState({
                newPublicMessageAlert: false,
                currentChatWindow: name
            })
        } else {
            newConversationTabs.map( (obj, index) => {
                console.log(obj)
                if (obj.name === name) {
                    newConversationTabs[index].newMessageAlert = false;
                }
            })
            this.setState({
                conversationTabs: newConversationTabs,
                currentChatWindow: name
            })
        }
        
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
                        privateConversationsSideList={this.state.privateConversationsSideList}
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
                        newPublicMessageAlert={this.state.newPublicMessageAlert}
                        selectChatWindow={this.selectChatWindow}
                        privateConversationsSideList={this.state.privateConversationsSideList}
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