import React, {Fragment} from 'react';
import { PortWidget, DefaultNodeWidget } from '@projectstorm/react-diagrams';
import ReactTooltip from 'react-tooltip'
import styled from '@emotion/styled';

import "./JSCustomNodeWidget.css"

const FunctionToColorMapping = {
    "producer": "#ca4f00",
    "filter": "#00ad9b",
    "expander": "#0099e2",
    "aggregator": "#9c00a8",
    "creator": "#79f500"
};

const Node = styled.div`
        background-color: ${p => p.background};
		border-radius: 5px;
		font-family: sans-serif;
		color: white;
		border: solid 2px black;
		overflow: visible;
		font-size: 11px;
		cursor: pointer;
		border: solid 2px ${p => (p.selected ? 'rgb(0,192,255)' : 'black')};  // selection
	`;

export class JSCustomNodeWidget extends DefaultNodeWidget {
    render() {
        return (
            <Fragment>

                <ReactTooltip id={'tooltip-'+this.props.node.name}
                              type='error' place={"bottom"}
                              effect={"float"}>
                    <span>
                        {this.props.node.function} inputs<br/>
                        <ul>
                            {this.props.node.getOptions().controls.map(
                               control => <li>
                                   <u>{control.name}</u><br/>
                                   <b>{control.value}</b>
                               </li>)}
                        </ul>
                    </span>
                </ReactTooltip>

                <Node data-tip data-for={'tooltip-'+this.props.node.name}
                      background={FunctionToColorMapping[this.props.node.function]}
                      selected={this.props.node.isSelected()}>

                    <div className={"title"}>
                        <div className={"title-name"}
                             style={{
                                 display: "flex",
                                 justifyContent: "space-evenly"
                             }}>
                            {this.props.node.getOptions().title}
                            <button
                                className={"remove-button"}
                                disabled={false} // TODO
                                onClick={(e) => {

                                }}
                            >
                                &#10799;
                            </button>
                        </div>
                    </div>
                    <div className={"ports-container"}>
                        <PortWidget engine={this.props.engine} port={this.props.node.getPort('in')}>
                            <div className={"port"}/>
                        </PortWidget>
                        <PortWidget engine={this.props.engine} port={this.props.node.getPort('out')}>
                            <div className={"port"}/>
                        </PortWidget>
                    </div>
                    <div className={"body"}>
                        {this.props.node.getOptions().size}
                    </div>

                </Node>

                {/*<div className="custom-node" data-tip data-for={'happyFace-'+this.props.node.name}>*/}
                {/*    <PortWidget engine={this.props.engine} port={this.props.node.getPort('in')}>*/}
                {/*        <div className="circle-port" />*/}
                {/*    </PortWidget>*/}
                {/*    <PortWidget engine={this.props.engine} port={this.props.node.getPort('out')}>*/}
                {/*        <div className="circle-port" />*/}
                {/*    </PortWidget>*/}
                {/*    <div className="custom-node-color" style={{ backgroundColor: this.props.node.color }} />*/}
                {/*</div>*/}

            </Fragment>
        );
    }
}
