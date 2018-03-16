import React from 'react';
import PropTypes from 'prop-types';

import {Header} from './components/header.js';
import {SideBar} from './components/sidebar/sidebar-main.js';
import {ChatWindow} from './components/chat-window/chat-window-main.js'



export class App extends React.Component {

    constructor(props) {
        super(props);

        // Get chat history
            // Pull private conversations if cookie thing exists (user sessions?)
            // Otherwise assign user name
                // If word combination existed previously, add an icrementing number until successful
        this.currentUser = "UnsuspectingCass";
        
        this.state = {
           
        }
        this.rename.bind(this);
    }
        
    rename(newName) {
        this.currentUser = newName;
    }

    render() {
        return (
            <div>
                <Header />
                <div id="container-main-content" className="container-fluid">
                    <div>{this.datathing}</div>
                    <SideBar currentUser={this.currentUser} rename={this.rename} />
                    <ChatWindow currentUser={this.currentUser} rename={this.rename} />
                </div>
            </div>
        )
    }

}