
import React from 'react';
import PropTypes from 'prop-types';

export class ChatLog extends React.Component {
    constructor(props) {
        super(props);

        this.ws = this.props.ws;
        
        this.ws.onmessage = (message) => {
          
            let newMessages = this.state.messages;
            newMessages.push(JSON.parse(message.data))
            this.setState({
                messages: newMessages
            })
        }

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if ( xhr.readyState == 4 && xhr.status == 200 )  {
                this.setState({
                    messagesLoaded: true,
                    messages: JSON.parse(xhr.response)
                })
            }
        }
        xhr.open("GET", '/fetchChatHistory');
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send();

        this.state = {
            messages: [],
            messagesLoaded: false,
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

    componentDidMount() {
        let chatLog = this.chatLog;
        chatLog.scrollTop = chatLog.scrollHeight;
    } 

    render() {
        const {messagesLoaded, messages} = this.state;

        return (
            <div id="chat-log" ref={input => this.chatLog = input}>
                {
                    !messagesLoaded &&
                    <div>Fetching messages...</div>
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



