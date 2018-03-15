
import React from 'react';
import PropTypes from 'prop-types';

export class ChatLog extends React.Component {
    constructor(props) {
        super(props);

        this.ws = this.props.ws;
        
        this.ws.onmessage = (message) => {
           console.log(JSON.parse(message.data));
           console.log(typeof(JSON.parse(message.data)));
           let newMessages = this.state.messages;
           newMessages.push(JSON.parse(message.data))
            this.setState({
               messages: newMessages
            })
        }

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if ( xhr.readyState == 4 && xhr.status == 200 )  {
                // console.log(JSON.parse(xhr.response));
                // console.log(typeof(JSON.parse(xhr.response)));
                // let arr = JSON.parse(xhr.response);
                // arr.push({"test": "Success?"});
                // console.log(arr);
                // console.log(typeof(arr));
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

    render() {
        const {messagesLoaded, messages} = this.state;

        return (
            <div id="chat-log">
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



