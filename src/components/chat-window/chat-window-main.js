import React from 'react';
import PropTypes from 'prop-types';


import {ChatLog} from './chat-log.js';
import {ChatInput} from './chat-input.js';


export class ChatWindow extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            currentChatWindow: "public"
        }

        this.selectChatWindow = this.selectChatWindow.bind(this);
    }

    selectChatWindow(window) {
        this.setState({
            currentChatWindow: window
        })
    }

    render() {

        return (
            
            <div id="container-chat" className="">
                <ChatLog 
                    messagesLoaded={this.props.messagesLoaded} 
                    messages={this.props.messages} 
                    currentChatWindow={this.state.currentChatWindow} 
                    privateConversationsList={this.props.privateConversationsList}
                    openConversationTab={this.openConversationTab}
                    closeConversationTab={this.closeConversationTab}
                 />
                <ChatInput 
                    ws={this.props.ws} 
                    currentUser={this.props.currentUser} 
                    currentChatWindow={this.state.currentChatWindow} 
                />
            </div>
            
        )
    }
}