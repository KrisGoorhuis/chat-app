import React from 'react';
import PropTypes from 'prop-types';


export class AllUsersList extends React.Component {
    
    constructor(props) {
        super(props);

        
    }


    render() {
        const fakeUsers = this.props.fakeUsers;


        return (
            <div id="container-sidebar-all-users-list" className="">
                <h4>Users Online</h4>
                <div id="all-users-list">
                    { 
                        fakeUsers.map( (user, index) => {
                            return <div className="user-name" key={user + " " + index}> {user} </div>
                        })
                    }
                </div>
            </div>
        )
    }
}