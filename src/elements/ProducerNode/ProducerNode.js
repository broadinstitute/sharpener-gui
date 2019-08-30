import React, {Fragment} from "react"
import Node from "../Node/Node";

export default class ProducerNode extends Node {
    static tooltip = (props) => (ProducerTooltip(props));
    constructor(props) {
        super(props);
    }
}

export const ProducerTooltip = (props) => {
    return (<div style={{width:"100%", height:"100%" , border:"1px solid #000", background: "snow", padding: "5px"}}>
                <div className='graph-node-body'>
                    {props.inputs ?
                        <React.Fragment>
                            <span className='graph-node-title-text'>
                                Inputs
                            </span><br/>
                            {props.inputs.map(
                                gene_symbol =>
                                    <Fragment>
                                        <span>{gene_symbol}</span> 
                                    </Fragment>
                            )}
                        </React.Fragment>
                    : <React.Fragment/> }
                </div>
            </div>)
};