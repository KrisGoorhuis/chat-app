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
                        this.props.activeUsers.map( (item) => {
                            return <div key={item}>{item}</div>
                        } )
                    }
                </div>
            </div>
        )
    }
} 