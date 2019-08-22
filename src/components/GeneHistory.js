import React, {useEffect, useRef, useState, useLayoutEffect} from "react"
import ReactDOM from 'react-dom';
import {FEATURE_FLAG} from "../parameters/FeatureFlags";
import Card from "react-bootstrap/Card";
import drawGraph from "../elements/D3/Graph/graph";
import {SizeMe} from "react-sizeme";

// ugh why am i writing this way
const ledgerTo = (type) => {
    switch(type) {
        case "node":
        case "nodes":
            return (transactionLedger) => [];
        case "edge":
        case "edges":
        case "link":
        case "links":
            return (transactionLedger) => [];
        default:
            return [];

    }
}

export default class GeneHistory extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"col-sm-2"}>
                {this.props.geneListIDs.length > 0 && FEATURE_FLAG.histories.showHistories ?
                    <Card>
                        <Card.Header as={"h5"}>
                            History
                        </Card.Header>
                        <ul>
                            {
                                JSON.stringify(this.props.transactionHistory)

                                // .slice(0).reverse().map(geneListID =>
                                //  <li key={geneListID}> {geneListID} </li> )
                            }
                        </ul>
                        <SizeMe>
                            {({size}) =>
                                <GeneTransformerGraph
                                    nodes={ledgerTo("nodes")(this.props.transactionHistory)}
                                    links={ledgerTo("nodes")(this.props.transactionHistory)}
                                    width={size.width}
                                    height={size.height}
                                />}
                        </SizeMe>
                    </Card>
                    : <React.Fragment/>}
            </div>
        )
    }
}

class GraphTest extends React.Component {
    constructor(props) {
        super(props);
    }

    handleResize(e) {
        let elem = ReactDOM.findDOMNode(this);
        let width = elem.offsetWidth;

        this.setState({
            parentWidth: width
        });
    }

    componentDidMount() {
        if(this.props.width === '100%') {
            window.addEventListener('resize', this.handleResize);
        }
        this.handleResize();
    }

    componentWillUnmount() {
        if(this.props.width === '100%') {
            window.removeEventListener('resize', this.handleResize);
        }
    }

    render() {
        let { width, height, margin, xScale, yScale, xAxis, ...props } = this.props;

        // Determine the right graph width to use if it's set to be responsive
        if(width === '100%') {
            width = this.state.parentWidth || 400;
        }

        // Set scale ranges
        xScale && xScale.range([0, width - (margin.left + margin.right)]);
        yScale && yScale.range([height - (margin.top + margin.bottom), 0]);

        return (
            <div>

            </div>
        );
    }
}

// container component for dimensions
// https://stackoverflow.com/a/57272554
//https://github.com/codesuki/react-d3-components/issues/9
// const GeneTransformerHistory = props => {
//     return (
//         <div ref={targetRef}>
//             <GeneTransformerGraph nodes={props.nodes} links={props.links}
//                                   width={dimensions.width} height={dimensions.height}/>
//         </div>
//     );
// };

const GeneTransformerGraph = (props) => {
    useEffect(() => {
        drawGraph(props);
    }, [props.nodes, props.links]);
    return <div className={"viz"}/>;
};