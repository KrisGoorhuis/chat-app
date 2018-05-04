import React from 'react';
import PropTypes from 'prop-types';


export class Header extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {

        return (
            <div className="bg-primary">
                <div id="container-header" className="container text-center">
                    <h1>Kris' Placeholder</h1>
                    <h6>Kris accepts no responsibility for the content posted on this page.</h6>
                </div>
            </div>
        )
    }
}