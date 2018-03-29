import React from 'react';
import PropTypes from 'prop-types';


export class PrivateConversationsList extends React.Component {
    
    constructor(props) {
        super(props);
        
    }

    render() {
        const privateConversationList = [];

        return (
            <div id="container-sidebar-private-conversations" className="">
               <h4>Private Conversations</h4>
               <div id="private-conversations-list">
                    {
                        privateConversationList.length === 0 &&
                        <div>No private conversations</div>
                    }
                    
                    { 
                        privateConversationList.length > 0 &&
                        privateConversationList.map( (user, index) => {
                            return <div className="user-name" key={user + " " + index}> {user} </div>
                        })
                    }
                </div>
            </div>
        )
    }
}