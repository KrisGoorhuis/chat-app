import React from 'react';
import PropTypes from 'prop-types';


import {ChatLog} from './chat-log.js';
import {ChatInput} from './chat-input.js';


export class ChatWindow extends React.Component {
    constructor(props) {
        super(props);
        
        
  
    }

    

    render() {

        return (
            
            <div id="container-chat" className="">
                <ChatLog 
                    messagesLoaded={this.props.messagesLoaded} 
                    messages={this.props.messages} 
                    currentUser={this.props.currentUser}
                    currentChatWindow={this.props.currentChatWindow} 
                    newPublicMessageAlert={this.props.newPublicMessageAlert}
                    selectChatWindow={this.props.selectChatWindow}
                    privateConversationsObjects={this.props.privateConversationsObjects}
                    conversationTabs={this.props.conversationTabs}
                    openConversationTab={this.props.openConversationTab}
                    closeConversationTab={this.props.closeConversationTab}
                 />
                <ChatInput 
                    ws={this.props.ws} 
                    currentUser={this.props.currentUser} 
                    currentChatWindow={this.props.currentChatWindow} 
                 />
            </div>
            
        )
    }
}