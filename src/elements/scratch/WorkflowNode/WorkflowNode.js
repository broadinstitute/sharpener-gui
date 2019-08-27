import React from "react"
import BaseNode from "../MyDagreD3/BaseNode"
import "./WorkflowNode.css"

export default class WorkflowNode extends BaseNode {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='graph-node'>
                <div className='graph-node-title'>
                    <span className='graph-node-title-text'>{this.props.title}</span>
                </div>
                <div className='graph-node-body'>
                    <div className="text-center">50%</div>
                    {/*<Progress value={50} />*/}
                </div>
                <div className='graph-node-footer'>{this.props.footer}</div>
            </div>
        )
    }

}