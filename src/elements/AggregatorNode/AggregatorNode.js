import React, {Fragment} from "react"
import Node from "../Node/Node";
import {flatten, pluralize, properCase} from "../../helpers";

export default class AggregatorNode extends Node {
    static tooltip = (props) => (AggregatorTooltip(props));
    constructor(props) {
        super(props);
    }
}

export const AggregatorTooltip = (props) => {
    return (<div style={{width:"100%", height:"100%" , border:"1px solid #000", background: "snow", padding: "5px"}}>
                <div className='graph-node-body'>
                    {props.inputs ?
                        <React.Fragment>
                            <span className='graph-node-title-text'>
                                Inputs
                            </span><br/>
                            <Fragment>
                                <span>{("operation")+": "+(props.inputs["operation"])}</span><br/>
                            </Fragment>
                        </React.Fragment>
                    : <React.Fragment/> }

                    {props.size ?
                        <React.Fragment>
                            <span className='graph-node-title-text'>
                                Gene Count
                            </span><br/>
                            <Fragment>
                                <span>{pluralize(props.size,"gene")}</span><br/>
                            </Fragment>
                        </React.Fragment>
                        : <React.Fragment/> }

                    {/*<span className='graph-node-title-text'>*/}
                    {/*            Difference*/}
                    {/*</span><br/>*/}
                    {/*{ props.difference.difference.length > 0 ?*/}
                    {/*    <React.Fragment>*/}
                    {/*        <span className='graph-node-title-text'>*/}
                    {/*            {pluralize(props.difference.difference.length, props.difference.difference.addedOrRemoved+" gene")}*/}
                    {/*        </span><br/>*/}
                    {/*        {flatten(props.difference.difference.map(*/}
                    {/*            diff => diff.attributes*/}
                    {/*                .filter(attr => attr.name === "gene_symbol")*/}
                    {/*                .map(gene_symbol => gene_symbol.value)*/}
                    {/*        )).map(gene_symbol =>*/}
                    {/*            <React.Fragment>*/}
                    {/*                <span>{gene_symbol}</span><br/>*/}
                    {/*            </React.Fragment>)}*/}
                    {/*    </React.Fragment>*/}
                    {/*:   <div>No difference</div> }*/}
                </div>
            </div>)
};