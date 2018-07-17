
import React from 'react';
import PropTypes from 'prop-types';

// Child of chat-window-main.js
export class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        
        this.ws = this.props.ws; 
        console.log(this.ws);  
    }

    submitMessage(element) {
        element.preventDefault(); // Prevents page from refreshing on submit.
        let sendingPublicMessage = true;
        
        // Public messages
        if (this.props.currentChatWindow === "public") {
            this.ws.send(JSON.stringify(
                    {
                        "conversationType": "public",
                        "author": this.props.currentUser,
                        "timestamp": new Date(),
                        "message": this.chatInputElement.value,
                    }
                ));   
                
        // Private message
        } else { 
            console.log("Sending to recipient: " + this.props.currentChatWindow);
            let messageObject = {
                "conversationType": "private",
                "author": this.props.currentUser,
                "recipient": this.props.currentChatWindow,
                "timestamp": new Date(),
                "message": this.chatInputElement.value
            }
            console.log(messageObject);
            this.ws.send(JSON.stringify(messageObject));   
        }
        
        this.chatInputElement.value = "";
    }

    render() {

        return (
            <form onSubmit={ (element) => this.submitMessage(element) }>
                <input 
                    id="chat-input" 
                    autoComplete="off" 
                    placeholder={this.props.currentUser ? this.props.currentUser + " says..." : "..."} 
                    ref={ (element) => { this.chatInputElement = element } }
                >
                </input>
            </form>
        )
    }
}

