import React from 'react';
import PropTypes from 'prop-types';

// Child of sidebar-main.js
export class ActiveUsersList extends React.Component {
    
    constructor(props) {
        super(props);

    }


    render() {

        return (
            <div id="container-sidebar-all-users-list" className="">
                <h4>Active Users</h4>
                <div id="all-users-list">
                    { 
                        this.props.activeUsers.map( (name) => {
                            return <div onDoubleClick={ () => {this.props.openConversationTab(name)} } className="name" key={name}>{
                            name === "( Generating... )" ? " " : name}</div>
                        } )
                    }
                </div>
            </div>
        )
    }
} 