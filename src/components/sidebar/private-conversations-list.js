import React from 'react';
import PropTypes from 'prop-types';

// Child of sidebar-main.js
export class PrivateConversationsList extends React.Component {
    
    constructor(props) {
        super(props);
        
    }

    render() {
        const conversations = this.props.privateConversationsList;

        return (
            <div id="container-sidebar-private-conversations" className="">
               <h4>Private Conversations</h4>
               <div id="private-conversations-list">
                    {
                        conversations.length === 0 &&
                        <div>Double click someone's name to begin a private conversation</div>
                    }
                    
                    { 
                        conversations.length > 0 &&
                        conversations.map( (user, index) => {
                            return <div className="name" key={user + " " + index}> {user} </div>
                        })
                    }
                </div>
            </div>
        )
    }
}