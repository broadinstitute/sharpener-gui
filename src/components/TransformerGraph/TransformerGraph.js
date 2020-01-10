import React, {Fragment, useCallback, useEffect, useReducer, useRef, useState} from 'react';
import createEngine, {DiagramModel, DagreEngine} from '@projectstorm/react-diagrams'
import {DefaultLinkModel} from "@projectstorm/react-diagrams";
import {JSCustomNodeFactory} from './Node/JSCustomNodeWidget/JSCustomNodeFactory';
import {JSCustomNodeModel} from './Node/JSCustomNodeWidget/JSCustomNodeModel';
import {BodyWidget} from './GraphWidget';

import './TransformerGraph.css'

import _ from "lodash";
import SharpenerInfo from "../SharpenerInfo/SharpenerInfo";
import {InputType, DeleteItemsAction, ZoomCanvasAction} from "@projectstorm/react-canvas-core";
import Tooltip from "../Tooltip/Tooltip";

import messages from "../../message-properties";

export class GraphWrapper extends React.Component {
    constructor(props) {
        super(props);

        // create an instance of the engine
        this.engine = createEngine();

        // override default delete action
        const deleteAction = this.engine.getActionEventBus().getActionsForType(InputType.KEY_DOWN)[0];
        this.engine.getActionEventBus().deregisterAction(deleteAction);
        this.engine.getActionEventBus().registerAction(new DeleteItemsAction({keyCodes:[46]}));

        const scrollAction = this.engine.getActionEventBus().getActionsForType(InputType.MOUSE_WHEEL)[0];
        this.engine.getActionEventBus().deregisterAction(scrollAction);
        this.engine.getActionEventBus().registerAction(new ZoomCanvasAction()); // TODO: extend with mouse speed?

        // register the factory
        this.engine.getNodeFactories().registerFactory(new JSCustomNodeFactory());
        // create a diagram model
        let model = new DiagramModel();

        // install the model into the engine
        this.engine.setModel(model);

        model.getNodes().forEach(node => {
            node.registerListener({
                // TODO: tweak, maybe create a cache which can track previous results, if identical, stop propagation?
                eventDidFire: (event) => this.handleNodeEvent(event)
            })
        });

        model.registerListener({
            linksUpdated: event => {
                console.log("linksUpdated", event);
            }
        });

        this.layoutEngine = new DagreEngine({
            graph: {
                rankdir: 'TD',
                ranker: 'longest-path',
                marginx: 50,
                marginy: 50
            },
            includeLinks: true
        });

        this.loadFromTransactions = this.loadFromTransactions.bind(this);
    }

    componentDidMount() {
        this.loadFromTransactions(this.props);
        this.autoDistributeNodes(this.engine);
    }

    componentWillReceiveProps (nextProps) {
        this.loadFromTransactions(nextProps);
        this.autoDistributeNodes(this.engine);
    }

    loadFromTransactions({selectedGeneLists, deletedGeneLists, transactions, transformerName, transformersNormalized}) {
        console.group("Graph Updating");
        console.log("props", {selectedGeneLists, deletedGeneLists, transactions, transformerName, transformersNormalized});
        if (typeof selectedGeneLists !== "undefined") {
            let selectedGeneListsById = selectedGeneLists;
            // The roster is used to prevent the redundant creation of nodes as we traverse through the
            // transactions (which double count the query id when a gene list serves as both an output and an input.
            // We check against the roster whether a node has already been created, then get it; else we skip trying to get a node
            // and create it if the gene_list_id is not null.
            let roster = {};
            const currentNodesIndexedByGeneListId  = this.engine.getModel().getNodes().reduce((acc, node) => Object.assign(acc, { [node.name]: node }), {})
            console.log("previous nodes", this.engine.getModel().getNodes());

            if (transactions) {
                let newModel = new DiagramModel();

                transactions.forEach(transaction => {
                    const { gene_list_id, query, size } = transaction;
                    if (!deletedGeneLists.includes(gene_list_id)) {
			let outputNode = {};
			
			// check if the node is previously on the graph
			if (Object.keys(currentNodesIndexedByGeneListId).includes(gene_list_id)) {

                            // TODO: make this node a clone of the existing node
                            // in particular, preserve all UI specific state
                            // selectedness
                            // given position
                            outputNode = currentNodesIndexedByGeneListId[gene_list_id] // TODO: what happens when a node is added while exisitng?
			    console.log("previous output node position", outputNode.position);
                        } else {

                            outputNode = new JSCustomNodeModel({
                                name: gene_list_id,
                                title: transformerName[gene_list_id],
                                controls: query.controls,
                                size: size,
                                selected: selectedGeneListsById.includes(gene_list_id),
                                function: transformersNormalized.byName[query.name].function
                            });

                        }
                        roster[gene_list_id] = outputNode.options.id;

                        if (typeof query.gene_list_id !== "undefined") {
                            // if the query's gene_list_id is not null, then that means it is related to another gene_list_id from the session
                            // so our updated graph must include a link between the two, else we just add the node to the graph without a link
                            if (query.gene_list_id !== null && !deletedGeneLists.includes(query.gene_list_id)) {
                                let inputNode = null;
                                // if the gene list id is already in the roster, then we can just get the node as it already exists
                                // in the graph and use its model in the graph-model updating (including adding a linkage)
                                if (typeof roster[query.gene_list_id] != "undefined") {
                                    inputNode = newModel.getNode(roster[query.gene_list_id])
				    console.log("previous node position", inputNode.position)
                                } else {
                                    if (typeof query.gene_list_id !== "undefined") {

                                        inputNode = new JSCustomNodeModel({
                                            name: query.gene_list_id,
                                            title: transformerName[query.gene_list_id],
                                            controls: query.controls,
                                            size: size,
                                            selected: selectedGeneListsById.includes(gene_list_id),
                                            function: transformersNormalized.byName[query.name].function
                                        });
                                        roster[query.gene_list_id] = inputNode.options.id;

                                    }

                                }

                                const newLink = new DefaultLinkModel();
                                // TODO: Link deltas: size, diff elements
                                newLink.setSourcePort(inputNode.getPort("out"));
                                newLink.setTargetPort(outputNode.getPort("in"));
                                newModel.addAll(inputNode, outputNode, newLink);

                            }
                            newModel.addNode(outputNode);

                        } else if (typeof query.gene_list_ids !== "undefined") {
                            if (query.gene_list_ids !== null && query.gene_list_ids.length > 0) {
                                query.gene_list_ids.filter(gene_list_id => !deletedGeneLists.includes(gene_list_id)).forEach(gene_list_id => {
                                    let inputNode = null;
                                    if (typeof roster[gene_list_id] != "undefined") {
                                        inputNode = newModel.getNode(roster[gene_list_id])
					console.log("previous node position", inputNode.position)
                                    } else {
                                        inputNode = new JSCustomNodeModel({
                                            name: gene_list_id,
                                            title: transformerName[gene_list_id],
                                            controls: query.controls,
                                            size: size,
                                            selected: selectedGeneListsById.includes(gene_list_id),
                                            function: transformersNormalized.byName[query.name].function
                                        });
                                        roster[gene_list_id] = inputNode.options.id;
                                    }
                                    const newLink = new DefaultLinkModel();
                                    // TODO: Link deltas: size, diff elements
                                    newLink.setSourcePort(inputNode.getPort("out"));
                                    newLink.setTargetPort(outputNode.getPort("in"));
                                    newModel.addAll(inputNode, outputNode, newLink);
                                })
                            }

                        } else {
                            newModel.addNode(outputNode);
                        }

                    }
                });

                newModel.getNodes().forEach(node => {
                    node.registerListener({
                        eventDidFire: (event) => this.handleNodeEvent(event)
                    })
                });

                this.engine.setModel(newModel);

                console.log("new nodes", this.engine.getModel().getNodes());
                console.groupEnd();

            }
        }
    }

    // ---------------- //
    // HELPER FUNCTIONS //
    // ---------------- //

    // callback for handling the events thrown by nodes (mainly selection and deletion)
    handleNodeEvent (event) {
        if (event.function === 'selectionChanged') {
            if (event.isSelected) {
                this.props.selectGeneList(event.entity.name);
             } else if (!event.isSelected) {
                this.props.unselectGeneList(event.entity.name);
            }
        }
        // we know it's a node
        if (event.function === "entityRemoved") {
            this.props.unselectGeneList(event.entity.name);
            this.props.removeGeneList(event.entity.name);
        }
	return event;
    }

    autoDistributeNodes (engine) {
        // copy
        let model = engine.getModel();

        // operation: layout the nodes
        this.layoutEngine.redistribute(model);

        // deserialize
        engine.setModel(model);
        this.forceUpdate();
    }

    render() {
        return (
            <Fragment>

                <div style={{
                        display: "flex",
                        flexShrink: "0",
                        justifyContent: "space-between"
                     }}>
                    <span>
                        <h5 className={"info-header"}>{messages.header.graph}</h5>
                        <SharpenerInfo description={messages.tooltip.graph}/>
                </span>
		<div style={{
		    marginLeft: "0.2em"
		}}>
		<button className={"graph-control"} onClick = {
		    () => this.props.selectedGeneLists.map(selectedGeneList => this.props.removeGeneList(selectedGeneList))
		} disabled={!(this.props.selectedGeneLists.length > 0)}>
		<Tooltip placement="bottom" trigger="hover" tooltip={
			<div>
			{/*   */}
			Removes selected gene lists from the graph. {/*You can undo this action.*/}
			<br/>
			<br/>
		    {
			!(this.props.selectedGeneLists.length > 0) ? <p>Select a gene list before deleting it.</p>
			    : this.props.selectedGeneLists.length > 0 ? `Will remove ${this.props.selectedGeneLists.length} gene list${ this.props.selectedGeneLists.length > 1 ? 's' : ''}:`
			    : null
		    }
		    {
			this.props.selectedGeneLists.length > 0 ? <p>
			    <ul>
			    {this.props.selectedGeneLists.map(selectedGeneList => <li>{this.props.transformerName[selectedGeneList]}</li>)}
			</ul>
			    </p>
			    : null
		    }

			<em>You can also press the 'Delete' key on your keyboard to delete selected gene lists.</em>
		    </div>
		}>
		<span>
		Remove	 
	    </span>
		</Tooltip>
	        </button>&nbsp;
                <button className={"graph-control"} onClick={ () => this.autoDistributeNodes(this.engine) }>Layout</button>
		</div>
                </div>

                {/* in a fragment to get parent size instead of having to pass through */}
                <BodyWidget className={"back-graph-container"} engine={this.engine}/>

            </Fragment>
        )
    }
};


