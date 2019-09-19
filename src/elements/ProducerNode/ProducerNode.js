import React, {Fragment} from "react"
import Node from "../Node/Node";
import {pluralize, properCase} from "../../helpers";

export default class ProducerNode extends Node {
    static tooltip = (props) => (ProducerTooltip(props));
    constructor(props) {
        super(props);
    }
}

export const ProducerTooltip = (props) => {
    return (<div style={{width:"100%", height:"100%" , border:"1px solid #000", background: "snow", padding: "5px"}}>
                <div className='graph-node-body'>

                    {props.transformerType==="producer" && props.inputs ?
                        <Fragment>
                            <span className='graph-node-title-text'>
                                Inputs
                            </span><br/>

                            {props.inputs.map(
                                input => <div>{(input.name)+": "+input.value}</div>
                            )}

                        </Fragment>
                    : <Fragment/> }

                    {props.transformerType==="creator" && props.inputs ?
                        <Fragment>
                            <span className='graph-node-title-text'>
                                Inputs
                            </span><br/>
                             {props.inputs.map(gene_symbol => <div>{gene_symbol}</div>)}
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
                </div>
            </div>)
};