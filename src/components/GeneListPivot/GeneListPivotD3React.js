import React from 'react';
import * as GeneListPivotD3 from "./GeneListPivotD3"
import rd3 from 'react-d3-library';
const RD3Component = rd3.Component;

export default class GeneListPivotD3React extends React.Component {
    state = {d3: ''};
    componentDidMount = function() {
        this.setState({d3: GeneListPivotD3.node});
    }

    render = function() {
        return (
            <div>
                <RD3Component data={this.state.d3} />
            </div>
        )
    }
};
