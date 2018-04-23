
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
        this.state = {
            preparingToAutoscroll: false
        }
    }

    // var offset = new Date().getTimezoneOffset();

    pareTimestamp(rawDate) {
        let tIndex = rawDate.indexOf("T");
        let paredDate = rawDate.slice(tIndex + 1, tIndex + 9)
        return paredDate;
    }

    addNewMessage(message) {

    }
    
    componentWillUpdate() {
        let {chatLog} = this.refs;
        
        // scrollHeight: total height with including stuff scrolled off screen
        // clientHeight: viewable element height as far as CSS is concerned
        // scrollTop: distance the element has been scrolled from the top. 0 means we're at the top. Max scrollTop is scrollHeight - clientHeight.
        // Maximum .scrollTop is basically .scrollBottom, but that doesn't exist in vanilla JS right now.
        this.isCurrentlyScrolledToBottom = chatLog.scrollHeight - chatLog.clientHeight <= chatLog.scrollTop;
    } 

    componentDidUpdate() {
        let {chatLog} = this.refs;

        if (this.isCurrentlyScrolledToBottom) {
            let scrollDistance = chatLog.scrollHeight - chatLog.clientHeight + 30; // TODO: Base this "+30" bit on chat message CSS height when that's determined.
            chatLog.scrollTop = scrollDistance; 
        }
    }

    // If we set and destructure a state based on props in the constructor, we'll never encounter a situation where React rerenders our state when props change. Unless we do a componendDidUpdate thing?
    // Props will update but state won't - We don't call setState anywhere.
    // So we're just gonna go with this.props in this render.
    render() {
        const {messagesLoaded, messages} = this.props;

        return (
            <div id="chat-log" ref="chatLog">
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



