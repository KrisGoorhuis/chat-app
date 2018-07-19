import React from 'react';
import PropTypes from 'prop-types';

import {ActiveUsersList} from './active-users-list.js';
import {PrivateConversationsSideList} from './private-conversations-side-list.js';

export class SideBar extends React.Component {
    
    constructor(props) {
        super(props);
        
    }
    
    render() {

        return (
            <div id="container-sidebar" className="">
                <div id="this-user" onClick={ (e) => this.props.thingabob("it worked?")}>
                    Chatting as {this.props.currentUser}
                </div>
                <ActiveUsersList 
                    ws={this.props.ws}
                    activeUsers={this.props.activeUsers}
                    openConversationTab={this.props.openConversationTab}
                 />
                <PrivateConversationsSideList 
                    ws={this.props.ws} 
                    privateConversationsSideList={this.props.privateConversationsSideList}
                    privateConversationsObjects={this.props.privateConversationsObjects} 
                    openConversationTab={this.props.openConversationTab}
                />
            </div>
        )
    }
}