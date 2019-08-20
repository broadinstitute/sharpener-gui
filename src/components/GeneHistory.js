import React, {useEffect} from "react"
import {FEATURE_FLAG} from "../parameters/FeatureFlags";
import Card from "react-bootstrap/Card";
import drawGraph from "../elements/D3/Graph/graph";

export default function GeneHistory({geneListIDs, transactionHistory}) {
    console.log(transactionHistory);
    return (
        <div className={"col-sm-2"}>
            {geneListIDs.length > 0 && FEATURE_FLAG.histories.showHistories ?
                <Card>
                    <Card.Header as={"h5"}>
                        History
                    </Card.Header>
                    <ul>
                        {
                            JSON.stringify(transactionHistory)

                            // .slice(0).reverse().map(geneListID =>
                            //  <li key={geneListID}> {geneListID} </li> )
                        }
                    </ul>
                    <GeneTransformerGraph nodes={ledgerTo("nodes")(transactionHistory)} links={ledgerTo("links")(transactionHistory)}/>
                </Card>
                : <React.Fragment/>}
        </div>
    )
}

const GeneTransformerGraph = (props) => {
    useEffect(() => {
        drawGraph(props);
    }, [props.nodes, props.links]);
    return <div className={"viz"}/>;
};

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