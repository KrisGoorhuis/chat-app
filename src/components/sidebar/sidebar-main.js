import React from 'react';
import PropTypes from 'prop-types';

import {AllUsersList} from './active-users-list.js';
import {PrivateConversationsList} from './private-conversations-list.js';

export class SideBar extends React.Component {
    
    constructor(props) {
        super(props);

        this.ws = this.props.ws;

        this.props.ws.onmessage = (message) => {
            console.log("got a message! sidebar main");
            console.log(message.data);
            if (message.activeUsersUpdate.data) {
                console.log(message.activeUsersUpdate);
            }
        }
        
    }
    
    render() {

        return (
            <div id="container-sidebar" className="">
                <div id="this-user" onClick={ (e) => this.props.thingabob("it worked?")}>
                    Chatting as {this.props.currentUser}
                </div>
                <AllUsersList ws={this.props.ws} />
                <PrivateConversationsList ws={this.props.ws} />
            </div>
        )
    }
}