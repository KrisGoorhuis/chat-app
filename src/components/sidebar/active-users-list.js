import React from 'react';
import PropTypes from 'prop-types';

// Child of sidebar-main.js
export class AllUsersList extends React.Component {
    
    constructor(props) {
        super(props);

        
    }


    render() {
        const fakeUsers = this.props.fakeUsers;


        return (
            <div id="container-sidebar-all-users-list" className="">
                <h4>Active Users</h4>
                <div id="all-users-list">
                    { 
                        
                    }
                </div>
            </div>
        )
    }
} 