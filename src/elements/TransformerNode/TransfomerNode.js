import React, {Fragment} from "react"
import Node from "../Node/Node";
import {flatten, pluralize, properCase} from "../../helpers";
import _ from "lodash"

export default class TransfomerNode extends Node {
    static tooltip = (props) => (TransformerTooltip(props));
    constructor(props) {
        super(props);
    }
}

export const TransformerTooltip = (props) => {
    return (<div style={{width:"100%", height:"100%" , border:"1px solid #000", background: "snow", padding: "5px", margin: "5px"}}>
                <div className='graph-node-body'>
                    {props.inputs && props.inputs.length > 0 ?
                        <Fragment>
                            <span className='graph-node-title-text'>
                                Inputs
                            </span><br/>

                            {props.inputs.map(
                                input => <div>{(input.name)+": "+input.value}</div>)}

                        </Fragment>
                    : <Fragment/> }

                    { props.size ?
                        <Fragment>
                            <span className='graph-node-title-text'>
                                Gene Count
                            </span><br/>
                            <Fragment>
                                <span>{pluralize(props.size,"gene")}</span><br/>
                            </Fragment>
                        </Fragment>
                        : <Fragment/> }

                    { props.difference.difference.difference.length > 0 ?
                        <Fragment>
                            <span className='graph-node-title-text'>
                                {pluralize(props.difference.difference.difference.length, props.difference.difference.addedOrRemoved+" gene")}
                            </span>
                            {/* TODO: eliminate magic numbers in columns and take parameters */}
                            <ul style={{columns: 3, WebkitColumns: 3, MozColumns: 3, listStyleType: "none", padding: 0}}>
                                {_.take(flatten(props.difference.difference.difference.map(
                                    diff => diff.attributes
                                        .filter(attr => attr.name === "gene_symbol")
                                        .map(gene_symbol => gene_symbol.value)
                                    ))
                                    .map(gene_symbol => <li>{gene_symbol}</li>), 23)
                                    .concat(props.difference.difference.difference.length > 23 ? <li>...</li>: null)
                                }
                            </ul>

                        </Fragment>
                    :   <Fragment/> }

                </div>
            </div>)
};