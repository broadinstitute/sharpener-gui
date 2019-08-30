import React, {useEffect, useRef, useState, useLayoutEffect, Fragment} from "react"
import ReactDOM from 'react-dom';
import {FEATURE_FLAG} from "../../parameters/FeatureFlags";
import Card from "react-bootstrap/Card";
import {SizeMe} from "react-sizeme";

// graph imports
import Node, {NodeTooltip} from "../../elements/Node/Node"
import DagreD3 from "../../elements/dagreD3/dagreD3";
import {AGGREGATE_GENES, CREATE_GENE_LIST, PRODUCE_GENES, TRANSFORM_GENES} from "../../actions";
import {properCase, tap, hashCode} from "../../helpers";
import {Provider} from "react-redux";
import {store} from "../../store";
import App from "../../App";
import ProducerNode from "../../elements/ProducerNode/ProducerNode";
import TransfomerNode from "../../elements/TransformerNode/TransfomerNode";

const transactionClassName = {
    [CREATE_GENE_LIST]: "creator",
    [PRODUCE_GENES]: "producer",
    [TRANSFORM_GENES]: "expander",  // TODO contractor
    [AGGREGATE_GENES]: "union"  // TODO intersection
};

const transactionNodeComponent = {
    "creator": ProducerNode,
    "producer": ProducerNode,
    "expander": TransfomerNode,
    "union": Node,  // TODO
    "intersection": Node  // TODO
}

export default class TransformerHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transactionLedgerHash: hashCode(JSON.stringify(props.transactionLedger)),
            network: { nodes: [] },
        };

        convertGraphSchema.bind(this)

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

    nodesOnClick = (gene_list_id) => {
        this.props.handleGeneListSelection(gene_list_id);
        // else if (double === true) {
        //     console.log(gene_list_ids);
        //     gene_list_ids.map(gene_list_id => {
        //         // TODO: behavior:
        //             // if there is any one successor in the list of genes that has not been selected, select the remainder
        //             // else if all successors have already been selected, deselect all of them
        //         // this.props.handleGeneListSelection(gene_list_id);
        //         console.log("gene_list_id", gene_list_id);
        //     })
        // }
    };

    nodesOnEnter = (id, node, coords, rect) => {
        ReactDOM.render(
            transactionNodeComponent[node.elementType].tooltip({...node.data}),
            // node.data.tooltip({...node.data}),
            document.getElementById("test-class")
        );
        // +15px is the radius of the corners of the element, +5px for arrow
        document.getElementById("test-class").style.left = node.x + (rect.width / 2) + coords.groupX + 20 + "px";
        document.getElementById("test-class").style.top = node.y + coords.groupY+"px";
        document.getElementById("test-class").style.zIndex = 1;
        document.getElementById("test-class").children[0].style.zIndex = 1;
        document.getElementById("test-class").style.visibility = "visible";
    };

    nodesOnExit = () => {
        document.getElementById("test-class").style.left = 0+"px";
        document.getElementById("test-class").style.top = 0+"px";
        document.getElementById("test-class").style.zIndex = -2;
        document.getElementById("test-class").children[0].style.zIndex = -2;
        document.getElementById("test-class").style.visibility = "hidden";
    };

    render() {
        return (
            <div className={"col-sm-12"}>
                <div id={"test-class"} style={{position: "absolute", visibility: "hidden"}}>
                </div>
                {this.props.geneListIDs.length > 0 && FEATURE_FLAG.histories.showHistories ?
                    <Card>
                        <Card.Header as={"h5"}>
                            Transformations
                        </Card.Header>
                        <SizeMe>
                            {({size}) => (
                                <DagreD3
                                    enableZooming={true}
                                    centerGraph={true}
                                    svgStyle={{width: size.width, height:size.height}}
                                    ref={this.graph}
                                    nodesOnClick={this.nodesOnClick}
                                    nodesOnEnter={this.nodesOnEnter}
                                    nodesOnExit={this.nodesOnExit}>

                                    {/* the above event handlers (nodesOnClick and nodesOnHover) are going to be for shared container state. nodes handle
                                    their own presentational events and actions (to allow for distinctions between nodes
                                    that aren't how they are handled by the application)*/}

                                    {this.state.network.nodes.map((el) => {
                                        // render node type properly
                                        switch(el.elementType) {
                                            case("creator"):
                                            case("producer"):
                                                return (
                                                    <ProducerNode {...el}/>
                                                );
                                            case("expander"):
                                                return (<TransfomerNode {...el}/>);
                                            default:
                                                return (<Node {...el}/>);
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

// TODO: this should be an idempotent transformer whenever the data is the same?
const ledgerTo = (type) => {

    switch(type) {
        case "nodes":
            return (transactionLedger) => transactionLedger.reduce((node_list, transaction) => {
                const defaultNode = {
                    id: transaction.gene_list_id,
                    count: transaction.count,
                    inputs: transaction.query,
                    difference: transaction.difference,
                    type: transactionClassName[transaction.type]
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
    return nodes.map(node => {
        return {
            id: node.id,
            elementType: node.type,  // TODO: hardcoded... for now
            transformerType: node.type,
            transformerName: node.inputs.name ? node.inputs.name : "Gene Symbols",
            inputs: node.inputs.controls ? node.inputs.controls : node.inputs,
            difference: node.difference,
            count: node.count,
            title: node.id,  // TODO: work on something better
            connection: edges.filter(edge => edge.source === node.id).map(edge => (
                {
                    id: edge.target,
                    label: edge.label
                }
            ))
        }
    })
};