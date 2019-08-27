import React from 'react'
import PropTypes from 'prop-types'

class BaseEdge extends React.Component {
    constructor(props) {
        super(props);

        // container for edge data and styles
        // not rendered!

    }

    render() {
        return null;
    }

}

// https://stackoverflow.com/a/46497330

BaseEdge.propTypes = {
    type: PropTypes.string
};

BaseEdge.defaultProps = {
    type: "BaseEdge"
};

export default BaseEdge;