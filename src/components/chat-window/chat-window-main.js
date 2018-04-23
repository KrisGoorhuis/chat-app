import React from 'react';
import PropTypes from 'prop-types';


import {ChatLog} from './chat-log.js';
import {ChatInput} from './chat-input.js';


export class ChatWindow extends React.Component {
    constructor(props) {
        super(props);

        this.ws = this.props.ws;

        this.state = {
            currentChatWindow: "public",
            userName: this.props.userName
        }
        
        this.switchChatWindows = this.switchChatWindows.bind(this);
    }

    
    switchChatWindows() {
        // Tabs at the top
    }


    render() {

        return (
            
            <div id="container-chat" className="">
                <ChatLog ws={this.ws} currentChatWindow={this.currentChatWindow} switchChatWindows={this.switchChatWindows} messagesLoaded={this.props.messagesLoaded} messages={this.props.messages} rename={this.props.rename} />
                <ChatInput ws={this.ws} currentUser={this.props.currentUser} currentChatWindow={this.state.currentChatWindow} rename={this.props.rename} />
            </div>
            
        )
    }
}