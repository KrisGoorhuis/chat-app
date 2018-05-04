import React from 'react';
import PropTypes from 'prop-types';

import {ActiveUsersList} from './active-users-list.js';
import {PrivateConversationsList} from './private-conversations-list.js';

export class SideBar extends React.Component {
    
    constructor(props) {
        super(props);

        this.ws = this.props.ws;
        
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
                    openConversationTab={this.openConversationTab}
                 />
                <PrivateConversationsList 
                    ws={this.props.ws} 
                    privateConversationsList={this.props.privateConversationsList} 
                    openConversationTab={this.openConversationTab}
                />
            </div>
        )
    }
}