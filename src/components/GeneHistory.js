import React, {useEffect} from "react"
import {FEATURE_FLAG} from "../parameters/FeatureFlags";
import Card from "react-bootstrap/Card";
import drawGraph from "../elements/D3/Graph/graph";
import {SizeMe} from "react-sizeme";

// todo: refactor to using 'actions'
// equivalent to what's gathered by transformer_saga.js in ../src/sagas/
const CREATE_GENE_LIST = 'CREATE_GENE_LIST';
const PRODUCE_GENES = 'PRODUCE_GENES';
const TRANSFORM_GENES = 'TRANSFORM_GENES';
const AGGREGATE_GENES = 'AGGREGATE_GENES';

export default class GeneHistory extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"col-sm-10"}>
                {this.props.geneListIDs.length > 0 && FEATURE_FLAG.histories.showHistories ?
                    <Card>
                        <Card.Header as={"h5"}>
                            History
                        </Card.Header>
                        <SizeMe>
                            {({size}) =>
                                <GeneTransformerGraph
                                    nodes={ledgerTo("nodes")(this.props.transactionHistory)}
                                    links={ledgerTo("links")(this.props.transactionHistory)}
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


// ugh why am i writing this way
const ledgerTo = (type) => {
    switch(type) {
        case "node":
        case "nodes":
            return (transactionLedger) => transactionLedger.map(
                transaction => {
                    const node_defaults =  {  id: transaction.gene_list_id, reflexive: false };
                    switch(transaction.type) {
                        // TODO: labels?
                        case CREATE_GENE_LIST:
                            // output gene list id
                            return [Object.assign(node_defaults, { id: transaction.gene_list_id })];
                        case PRODUCE_GENES:
                            // output gene list id
                            return [Object.assign(node_defaults, { id: transaction.gene_list_id })];
                        case TRANSFORM_GENES:
                            // output gene list id
                            return [Object.assign(node_defaults, { id: transaction.gene_list_id })];
                        case AGGREGATE_GENES:
                            // output gene list id
                            return transaction.query.gene_list_ids.map(input_gene_list_id =>
                                Object.assign(node_defaults, { id: input_gene_list_id })
                            );
                    }
                });
        case "edge":
        case "edges":
        case "link":
        case "links":
            return () => [];
            // (transactionLedger) => transactionLedger.map(
            //     transaction => {
            //         const edge_defaults =  {  left: false, right: true };
            //         switch(transaction.type) {
            //             case CREATE_GENE_LIST:
            //                 // TODO: labels?
            //                 return;
            //             case PRODUCE_GENES:
            //                 // TODO: labels?
            //                 return;
            //             case TRANSFORM_GENES:
            //                 return [Object.assign(edge_defaults,{ source: transaction.gene_list_id, target: transaction.query.gene_list_id })];
            //             case AGGREGATE_GENES:
            //                 // gene_list_ids as input
            //                 return transaction.query.gene_list_ids.map(
            //                     input_gene_list_id => Object.assign(edge_defaults,{ source: transaction.gene_list_id, target: input_gene_list_id})
            //                 );
            //         }
            //     });
        default:
            return [];

    }
};

const GeneTransformerGraph = (props) => {
    useEffect(() => {
        console.log("rendering graph with data", props.nodes, props.links);
        drawGraph(props);
    }, [props.nodes, props.links]);
    return <div className={"viz"}/>;
};