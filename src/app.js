import React from 'react';
import PropTypes from 'prop-types';

import {Header} from './components/header.js';
import {SideBar} from './components/sidebar/sidebar-main.js';
import {ChatWindow} from './components/chat-window/chat-window-main.js'


export class App extends React.Component {

    constructor(props) {
        super(props);

        // Get chat history
            // Pull private conversations if cookie thing exists (user sessions?)
            // Otherwise assign user name
                // If word combination existed previously, add an icrementing number until successful

        this.ws = new WebSocket( location.origin.replace(/^http/, 'ws') || 'ws://localhost:3000' );
        
        function keepWebSocketOpen() {
            setTimeout(keepWebSocketOpen, 5000);
        };
        keepWebSocketOpen();

        if (localStorage.getItem("userName")) {
            this.state = {
                currentUser: localStorage.getItem("userName")
            }
        } else {
            this.state = {
                currentUser: "( Generating... )"
            }
            
            this.ws.onopen = () => {
                console.log("sending request");
                let xhr = new XMLHttpRequest();
                xhr.onreadystatechange = () => {
                    if ( xhr.readyState == 4 && xhr.status == 200 )  {
                        let newUserName = xhr.responseText;

                        console.log("Assigning user name: " + newUserName)

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
                        })
                    }
                }
                xhr.open("GET", '/getAName');
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send();
            }      
        }
        
        this.rename = this.rename.bind(this);   
    }

    rename(newName) {
        this.setState({
            "currentUser": newName
        })
        console.log("renaming!");
    }
   

    render() {
        return (
            <div>
                <Header />
                <div id="container-main-content" className="container-fluid">
                    <div>{this.currentUser}</div>
                    <SideBar ws={this.ws} currentUser={this.state.currentUser} rename={this.rename} />
                    <ChatWindow ws={this.ws} currentUser={this.state.currentUser} rename={this.rename} />
                </div>
            </div>
        )
    }

}