import React, {Fragment} from "react"
import Node from "../Node/Node";
import {flatten, pluralize, properCase} from "../../helpers";

export default class TransfomerNode extends Node {
    static tooltip = (props) => (TransformerTooltip(props));
    constructor(props) {
        super(props);
    }
}

export const TransformerTooltip = (props) => {
    console.log("transformer tooltip data", props);
    return (<div style={{width:"100%", height:"100%" , border:"1px solid #000", background: "snow", padding: "5px"}}>
                <div className='graph-node-body'>
                    {props.inputs ?
                        <React.Fragment>
                            <span className='graph-node-title-text'>
                                Inputs
                            </span><br/>
                            {props.inputs.map((input) =>
                                <Fragment>
                                    <span>{properCase(input.name)+": "+properCase(input.value)}</span><br/>
                                </Fragment>
                            )}
                        </React.Fragment>
                    : <React.Fragment/> }

                    { props.count ?
                        <React.Fragment>
                            <span className='graph-node-title-text'>
                                Gene Count
                            </span><br/>
                            <Fragment>
                                <span>{pluralize(props.count,"gene")}</span><br/>
                            </Fragment>
                        </React.Fragment>
                        : <React.Fragment/> }

                    { props.difference.difference.difference.length > 0 ?
                        <React.Fragment>
                            <span className='graph-node-title-text'>
                                {pluralize(props.difference.difference.difference.length, props.difference.difference.addedOrRemoved+" gene")}
                            </span><br/>
                            {flatten(props.difference.difference.difference.map(
                                diff => diff.attributes
                                    .filter(attr => attr.name === "gene_symbol")
                                    .map(gene_symbol => gene_symbol.value)
                            )).map(gene_symbol =>
                                <React.Fragment>
                                    <span>{gene_symbol}</span><br/>
                                </React.Fragment>)}
                        </React.Fragment>
                    :   <React.Fragment/> }

                </div>
            </div>)
};