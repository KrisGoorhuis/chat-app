import React from 'react';
import PropTypes from 'prop-types';

import {AllUsersList} from './active-users-list.js';
import {PrivateConversationsList} from './private-conversations-list.js';

export class SideBar extends React.Component {
    
    constructor(props) {
        super(props);

        this.fakeUsers = [];
        for (let i = 0; i < 100; i++) {
            this.fakeUsers.push("Kristopher Robin");
        }
        
    }
    
    render() {
        const fakeUsers = this.fakeUsers;

        return (
            <div id="container-sidebar" className="">
                <div id="this-user" onClick={ (e) => this.props.thingabob("it worked?")}>
                    Chatting as {this.props.currentUser}
                </div>
                <AllUsersList ws={this.props.ws} fakeUsers={fakeUsers} />
                <PrivateConversationsList ws={this.props.ws} fakeUsers={fakeUsers} />
            </div>
        )
    }
}