import React from 'react';
import PropTypes from 'prop-types';


import {ChatLog} from './chat-log.js';
import {ChatInput} from './chat-input.js';

//const WebSocket = require('ws');
let HOST = location.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST || 'ws://localhost:3000');

ws.onopen = () => {
   // ws.send("testing websockets!");
}

// ws.on('open', function open() {
//   
// });

// ws.on('message', function incoming(data) {
//     console.log(data);
// });


export class ChatWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentChatWindow: "public"
        }

        this.switchChatWindows = this.switchChatWindows.bind(this);
        
    }

    
    switchChatWindows() {
        // Tabs at the top
    }

    render() {

        return (
            
            <div id="container-chat" className="">
                <ChatLog currentChatWindow={this.currentChatWindow} switchChatWindows={this.switchChatWindows} rename={this.rename} ws={ws} />
                <ChatInput currentUser={this.props.currentUser} currentChatWindow={this.state.currentChatWindow} rename={this.rename} ws={ws} />
            </div>
            
        )
    }
}