
import React from 'react';
import PropTypes from 'prop-types';

// Child of chat-window-main.js
export class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        
        this.ws = this.props.ws;   
    }

    submitMessage(element) {
        element.preventDefault(); // Prevents page from refreshing on submit.
        let sendingPublicMessage = true;
        
        if (this.props.currentChatWindow === "public") {
            this.ws.send(JSON.stringify(
                    {
                        "conversationId": "public",
                        "author": this.props.currentUser,
                        "timestamp": new Date(),
                        "message": this.chatInputElement.value,
                    }
                ));        
        }

        // if (currentChatWindow === "private") {
        //      Send to the right user
        // }
        
        this.chatInputElement.value = "";

    }

    render() {

        return (
            <form onSubmit={ (element) => this.submitMessage(element) }>
                <input id="chat-input" autoComplete="off" placeholder={this.props.currentUser + " says..."} ref={ (element) => { this.chatInputElement = element } }></input>
            </form>
        )
    }
}

