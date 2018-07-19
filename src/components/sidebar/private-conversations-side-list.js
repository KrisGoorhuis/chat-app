
import React from 'react';
import PropTypes from 'prop-types';

// Child of sidebar-main.js
export class PrivateConversationsSideList extends React.Component {
    
    constructor(props) {
        super(props);
        
    }

    render() {
        const conversations = this.props.privateConversationsSideList;

        return (
            <div id="container-sidebar-private-conversations" className="">
               <h4>Private Conversations</h4>
               <div id="private-conversations-list">
                    {
                        conversations.length === 0 &&
                        <div>Double click a name to open a one on one conversation.</div>
                    }
                    
                    { 
                        conversations.length > 0 &&
                        conversations.map( (user, index) => {
                            return <div onDoubleClick={ () => this.props.openConversationTab(user, false) } className="name" key={user + " " + index}> {user} </div>
                        })
                    }
                </div>
            </div>
        )
    }
}