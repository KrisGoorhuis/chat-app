import React from 'react';
import PropTypes from 'prop-types';

import {Header} from './components/header.js';
import {SideBar} from './components/sidebar/sidebar-main.js';
import {ChatWindow} from './components/chat-window/chat-window-main.js'


export class App extends React.Component {

    constructor(props) {
        super(props);

        this.ws = new WebSocket( location.origin.replace(/^http/, 'ws') || 'ws://localhost:3000' );

        if (localStorage.getItem("userName")) {
            this.state = {
                currentUser: localStorage.getItem("userName")
            }
        }


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
            
            if (localStorage.getItem("userName")) {
                this.ws.send( JSON.stringify({
                    "isConnection": true,
                    "userName": localStorage.getItem("userName")
                }));
                this.setState({
                    currentUser: localStorage.getItem("userName")
                })
                sendPing();
            }
            
            if (!localStorage.getItem("userName")) {
                this.setState({
                    currentUser: "( Generating... )"
                })
                
                // Get a new user name from the server and save it client side.
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if ( xhr.readyState == 4 && xhr.status == 200 )  {
                        let newUserName = xhr.responseText;
                        this.ws.send(JSON.stringify(
                            {
                                "conversationId": "public",
                                "author": newUserName,
                                "timestamp": new Date(),
                                "message": "( - joined the chat room - )",
                            }
                        ));
                        console.log("Setting name to " + newUserName);
                        localStorage.setItem('userName', newUserName);

                        this.setState({
                            currentUser: newUserName
                        });
                        sendPing();
                    }
                }
                xhr.open("GET", '/getAName');
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send();              
            }
        }
        
        this.ws.onmessage = (message) => {
            let parsedMessage = JSON.parse(message.data)
            console.log("Message received: ")
            console.log(parsedMessage);
            if (parsedMessage.type === "users") {

                this.setState({
                    activeUsers: Object.getOwnPropertyNames(parsedMessage.activeUsersObject)
                })
            }

            if (parsedMessage.type === "message") {
                let newMessages = this.state.messages;
                newMessages.push(parsedMessage.newMessage);
    
                this.setState({
                    messages: newMessages
                })
            }
        }


        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if ( xhr.readyState == 4 && xhr.status == 200 )  {
                this.setState({
                    messages: JSON.parse(xhr.response).messages,
                    messagesLoaded: true
                })
                console.log("received messages via xhr");
            }
        }
        xhr.open("GET", '/fetchChatHistory');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();


        this.state = {
            messages: [],
            messagesLoaded: false,
            activeUsers: ["Checking..."]
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
                        rename={this.rename} 
                    />
                    <ChatWindow 
                        ws={this.ws} 
                        currentUser={this.state.currentUser} 
                        messages={this.state.messages} 
                        messagesLoaded={this.state.messagesLoaded} 
                        rename={this.rename} 
                    />
                </div>
            </div>
        )
    }

}