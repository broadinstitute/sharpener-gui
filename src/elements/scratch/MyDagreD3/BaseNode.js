import React from 'react'
import PropTypes from 'prop-types'
import BaseEdge from "./BaseEdge";

class BaseNode extends React.Component {
    constructor(props) {
        super(props);

        // container for node parameters and styles
        // rendered, afaict

    }

    render() {
        return (
            <span>{this.props.title}</span>
        )
    }

}

// https://stackoverflow.com/a/46497330

BaseNode.propTypes = {
    type: PropTypes.string
};

BaseNode.defaultProps = {
    type: "BaseNode"
};

export default BaseNode;