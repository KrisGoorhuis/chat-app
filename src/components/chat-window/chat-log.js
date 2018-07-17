
import React from 'react';
import PropTypes from 'prop-types';


// Child of chat-window-main.js
export class ChatLog extends React.Component {
    constructor(props) {
        super(props);
        
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


    render() {
        const {
            messagesLoaded,
            messages,
            conversationTabs,
            privateConversationsArray,
            privateConversationsObjects,
            selectChatWindow,
            currentChatWindow,
            currentUser
        } = this.props;

        return (
            <div id="container-chat">
                {/* Tabs at the top */}
                <div id="conversation-tabs-container">
                    <div 
                        onClick={ () => { selectChatWindow("public") } } 
                        className={currentChatWindow === "public" ? "active name conversationTab" : "inactive name conversationTab"}
                    >
                        <p>Public</p>
                    </div>
            
                    {
                        conversationTabs &&
                        conversationTabs.map( ( partnerObject, index) => {
                            return <div key={partnerObject.name} className="conversationTab" id={"tab-" + partnerObject.name}>
                                <div 
                                    onClick={ () => { selectChatWindow(partnerObject.name) } } 
                                    className={partnerObject.name === currentChatWindow ? "active name" : "inactive name"} 
                                > 
                                    <p>{partnerObject.name} {partnerObject.alert === true ? "!" : ""}</p>
                                </div>
                                <div className="closeButton" onClick={ () => this.props.closeConversationTab(partnerObject.name) }> X </div>
                            </div>
                        })
                    }
                </div>
                <div id="container-chat-log">
                    {/* Body of text for the selected tab */}
                    <div id="chat-log" ref="chatLog">
                        {
                            !messagesLoaded &&
                            <div>Fetching messages...{messages}</div>
                        }

                        {/* Public Messages */}
                        {
                            (messagesLoaded && currentChatWindow === "public") &&
                            messages.map( (obj, index) => {
                                return <div 
                                    onDoubleClick={ () => {this.props.openConversationTab(obj.author, true)} }
                                    key={obj.timestamp}
                                >
                                    {this.pareTimestamp(obj.timestamp)} - <span className="name">{obj.author}</span>: {obj.message}
                                </div>
                            })
                        }    

                        {/* Private Messages */}
                        {
                            (messagesLoaded && currentChatWindow !== "public" && privateConversationsObjects[currentChatWindow]) &&
                            privateConversationsObjects[currentChatWindow].map( (obj, index) => {
                                if (currentChatWindow === obj.recipient || obj.author) {
                                    // obj.map( (message, index) => {
                                        return <div key={index}>
                                            {this.pareTimestamp(obj.timestamp)} - <span className="name">{currentChatWindow === currentUser ? "You" : obj.author}</span>: {obj.message}
                                        </div>
                                    // })
                                }
                            })
                        }   
                    </div>  
                
                </div> 
            </div>      
        )
    }
}



