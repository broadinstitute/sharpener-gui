import React, {useEffect, useRef, useState, useLayoutEffect, Fragment} from "react"
import ReactDOM from 'react-dom';
import {FEATURE_FLAG} from "../parameters/FeatureFlags";
import Card from "react-bootstrap/Card";
import {SizeMe} from "react-sizeme";

// graph imports
import Node1 from "../elements/node1/node1"
import DagreD3 from "../elements/dagreD3/dagreD3";
import {AGGREGATE_GENES, CREATE_GENE_LIST, PRODUCE_GENES, TRANSFORM_GENES} from "../actions";
import {properCase, tap} from "../helpers";

export default class GeneHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transactionLedgerHash: hashCode(JSON.stringify(props.transactionLedger)),
            network: { nodes: [] }
        };
    }

    componentDidMount() {
        this.setState({ network: {
                nodes: tap(convertGraphSchema(
                    ledgerTo("nodes")(this.props.transactionLedger),
                    ledgerTo("edges")(this.props.transactionLedger)
                ))
        }}, () => {
            console.log(this.state.network);
        })
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        console.log(
            "node/edge calcs",
            nextProps.transactionLedger,
            ledgerTo("nodes")(nextProps.transactionLedger),
            ledgerTo("edges")(nextProps.transactionLedger)
        );

        // detect need for network recalculation
        if ( hashCode(JSON.stringify(nextProps.transactionLedger)) !== prevState.transactionLedgerHash ) {
            return {
                    transactionLedgerHash: hashCode(JSON.stringify(nextProps.transactionLedger)),
                    network: {
                        nodes: tap(
                            convertGraphSchema(
                                ledgerTo("nodes")(nextProps.transactionLedger),
                                ledgerTo("edges")(nextProps.transactionLedger)
                            )
                        )
                    }
            }
        }
    }

    nodesOnClick = (id, el) => {
        console.log(id, el)
    };

    nodesOnEnter = (id, el) => {

    };

    nodesOnExit = (id, el) => {

    };

    render() {
        return (
            <div className={"col-sm-10"}>
                {this.props.geneListIDs.length > 0 && FEATURE_FLAG.histories.showHistories ?
                    <Card>
                        <Card.Header as={"h5"}>
                            History
                        </Card.Header>
                        <SizeMe>
                            {({size}) => (
                                <DagreD3
                                    enableZooming={true}
                                    centerGraph={true}
                                    svgStyle={{width: size.width, height:size.height}}
                                    ref={this.graph}
                                    nodesOnClick={this.nodesOnClick}
                                    nodesOnHover={this.nodesOnEnter}
                                    nodesOnExit={this.nodesOnExit}>

                                    {/* the above event handlers (nodesOnClick and nodesOnHover) are going to be for shared container state. nodes handle
                                    their own presentational events and actions (to allow for distinctions between nodes
                                    that aren't how they are handled by the application)*/}

                                    {this.state.network.nodes.map((el) => {
                                        // render node type properly
                                        if (el.elementType === "node1") {
                                            return <Node1 {...el}/>
                                        }
                                    })}

                                </DagreD3>
                            )
                            }
                        </SizeMe>
                    </Card>
                    : <React.Fragment/>}
            </div>
        )
    }

}

const flatten = function(arr, result = []) {
    for (let i = 0, length = arr.length; i < length; i++) {
        const value = arr[i];
        if (Array.isArray(value)) {
            flatten(value, result);
        } else {
            result.push(value);
        }
    }
    return result;
};

// TODO: this should be an idempotent transformer whenever the data is the same?
const ledgerTo = (type) => {
    const transformationClassName = {
        [CREATE_GENE_LIST]: "creator",
        [PRODUCE_GENES]: "producer",
        [TRANSFORM_GENES]: "expander",  // TODO contractor
        [AGGREGATE_GENES]: "union"  // TODO intersection
    };

    switch(type) {
        case "nodes":
            return (transactionLedger) => transactionLedger.reduce((node_list, transaction) => {
                const defaultNode = {
                    id: transaction.gene_list_id,
                    count: transaction.count,
                    type: transformationClassName[transaction.type]
                };

                switch(transaction.type) {
                    case CREATE_GENE_LIST:
                        return node_list.concat([
                            Object.assign({}, defaultNode)
                        ]);
                    case PRODUCE_GENES:
                        return node_list.concat([
                            Object.assign({}, defaultNode)
                        ]);
                    case TRANSFORM_GENES:
                        return node_list.concat([
                            Object.assign({}, defaultNode)
                        ]);
                    case AGGREGATE_GENES:
                        return node_list.concat([
                            Object.assign({}, defaultNode)
                            // ...transaction.query.gene_list_ids.map(
                            //     input_gene_list_id => ( { id: input_gene_list_id } )
                            // )
                        ]);
                }
            }, []);
        case "edges":
            return (transactionLedger) => transactionLedger.reduce((edge_list, transaction) => {
                switch(transaction.type) {
                    case CREATE_GENE_LIST:
                    case PRODUCE_GENES:
                        return edge_list;
                    case TRANSFORM_GENES:
                        return edge_list.concat([
                            {
                                source: transaction.query.gene_list_id,
                                target: transaction.gene_list_id,
                                label: properCase(transaction.query.name)
                            }
                        ]);
                    case AGGREGATE_GENES:
                        return edge_list.concat([
                            ...transaction.query.gene_list_ids.map(
                                input_gene_list_id => ({ source: input_gene_list_id, target: transaction.gene_list_id, label: properCase(transaction.query.operation) })
                            )
                        ]);
                }
            }, []);
        default:
            return [];

    }
};

const hashCode = (string) => {
    let hash = 0;
    if (string.length === 0) {
        return hash;
    }
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
};

const convertGraphSchema = (nodes, edges) => {
    //
    // IN: nodes, edges
    // OUT:
    //     {
    //         id: str,
    //         type: str,
    //         title: str,
    //         connection: [
    //             {
    //                 id: str,
    //                 label: str
    //             }
    //         ]
    //     }
    //
    console.log("nodes", nodes, "edges", edges);
    return nodes.map(node => (
        tap({
            id: node.id,
            elementType: "node1",  // TODO: hardcoded... for now
            transformerType: node.type,
            count: node.count,
            title: node.id,  // TODO: work on something better
            connection: edges.filter(edge => edge.source === node.id).map(edge => (
                {
                    id: edge.target,
                    label: edge.label
                }
            ))
        })
    ))
};