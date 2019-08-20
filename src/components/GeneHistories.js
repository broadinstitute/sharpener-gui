import React from "react"
import {FEATURE_FLAG} from "../parameters/FeatureFlags";
import Card from "react-bootstrap/Card";

export function History({transactionHistory}) {
    return <div className={"col-sm-2"}>
            {FEATURE_FLAG.histories.showHistories ?
                <Card>
                    <Card.Header as={"h5"}>
                        History
                    </Card.Header>
                    <ul>
                        {
                            Object.keys(transactionHistory || {})

                            // .slice(0).reverse().map(geneListID =>
                            //  <li key={geneListID}> {geneListID} </li> )
                        }
                    </ul>
                </Card>
                : <React.Fragment/>}
        </div>
}