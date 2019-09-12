import React from "react"

export default class AggregatorControls extends React.Component {
    render() {
        return (
            <React.Fragment>
                {this.props.operations.map(operation =>
                    <AggregationSender
                        key={operation}
                        selectedGeneLists={this.props.selectedGeneLists}
                        aggregateGenes={this.props.aggregateGenes}
                        action={operation}/>)}
            </React.Fragment> )
    }
}

export class AggregationSender extends React.Component {
    render() {
        return (
            <React.Fragment>
                <div>
                    <button
                        type="button"
                        onClick={ () => this.props.selectedGeneLists > 0 ? this.props.aggregateGenes(this.props.action) : null }
                        // className="btn btn-outline-success my-2 my-sm-0"
                        style={{marginLeft: "auto", marginRight: "0%"}}>
                        {/* Capitalize the operation label */}
                        {this.props.action.replace(/^[a-z]/g, function(t) { return t.toUpperCase() })}
                    </button>{'\u00A0'}{'\u00A0'}
                </div>
            </React.Fragment>
        )
    }
}
