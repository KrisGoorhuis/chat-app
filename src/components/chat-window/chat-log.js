
import React from 'react';
import PropTypes from 'prop-types';


// Child of chat-window-main.js
export class ChatLog extends React.Component {
    constructor(props) {
        super(props);

        this.ws = this.props.ws;
        
        // this.state = {
        //     messagesLoaded: this.props.messagesLoaded,
        //     messages: this.props.messages
        // }
    }

    // var offset = new Date().getTimezoneOffset();

    pareTimestamp(rawDate) {
        let tIndex = rawDate.indexOf("T");
        let paredDate = rawDate.slice(tIndex + 1, tIndex + 9)
        return paredDate;
    }

    addNewMessage(message) {

    }

    componentDidMount() {
        let chatLog = this.chatLog;
        chatLog.scrollTop = chatLog.scrollHeight;
    } 

    // If we set and destructure a state based on props in the constructor, we'll never encounter a situation where React rerenders our state when props change.
    // Props will update but state won't - We don't call setState anywhere.
    // So we're just gonna go with this.props in this render.
    render() {
        const {messagesLoaded, messages} = this.props;

        return (
            <div id="chat-log" ref={input => this.chatLog = input}>
                {
                    !messagesLoaded &&
                    <div>Fetching messages...{messages}</div>
                }
                {
                    messagesLoaded &&
                    messages.map( (obj, index) => {
                        return <div key={obj.timestamp}>{this.pareTimestamp(obj.timestamp)} - {obj.author}: {obj.message}</div>
                    })
                }
                

            </div>            
        )
    }
}



