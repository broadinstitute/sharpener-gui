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

import messages from "../../message-properties";

export class GraphLayout extends React.Component {
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
                eventWillFire: event => console.log("event will fire", event),
                // TODO: tweak, maybe create a cache which can track previous results, if identical, stop propagation?
                eventDidFire:(event) => this.handleNodeEvent(event)
            })
        });

        model.registerListener({
            linksUpdated: event => {
                console.log("linksUpdated", event);
            }
        });

        this.layoutEngine = new DagreEngine({
            graph: {
                rankdir: 'LR',
                ranker: 'longest-path',
                marginx: 50,
                marginy: 50
            },
            includeLinks: true
        });
    }

    componentWillReceiveProps(nextProps, _) {
        let selectedGeneListsById = nextProps.selectedGeneLists;

        // The roster is used to prevent the redundant creation of nodes as we traverse through the
        // transactions (which double count the query id when a gene list serves as both an output and an input.
        // We check against the roster whether a node has already been created, then get it; else we skip trying to get a node
        // and create it if the gene_list_id is not null.
        let roster = {};

        // check if the node is previously on the graph
        const nodesIndexedByName = this.engine.getModel().getNodes().reduce((acc, node) => Object.assign(acc, { [node.name]: node }), {})

        console.group("Graph Updating");
        console.log(selectedGeneListsById);
        console.log(this.engine.getModel().getNodes());

        if (nextProps.transactions) {
            let newModel = new DiagramModel();

            nextProps.transactions.forEach(transaction => {
                const { gene_list_id, query, size } = transaction;
                if (!nextProps.deletedGeneLists.includes(gene_list_id)) {

                    let outputNode = {};
                    if (Object.keys(nodesIndexedByName).includes(gene_list_id)) {

                        // TODO: make this node a clone of the existing node
                            // in particular, preserve all UI specific state
                                // selectedness
                                // given position
                        outputNode = nodesIndexedByName[gene_list_id] // TODO: what happens when a node is added while exisitng?

                    } else {

                        outputNode = new JSCustomNodeModel({
                            name: gene_list_id,
                            title: nextProps.transformerName[gene_list_id],
                            controls: query.controls,
                            size: size,
                            selected: selectedGeneListsById.includes(gene_list_id),
                            function: nextProps.transformersNormalized.byName[query.name].function
                        });

                    }
                    roster[gene_list_id] = outputNode.options.id;

                    if (typeof query.gene_list_id !== "undefined") {
                        // if the query's gene_list_id is not null, then that means it is related to another gene_list_id from the session
                        // so our updated graph must include a link between the two, else we just add the node to the graph without a link
                        if (query.gene_list_id !== null && !nextProps.deletedGeneLists.includes(query.gene_list_id)) {
                            let inputNode = null;
                            // if the gene list id is already in the roster, then we can just get the node as it already exists
                            // in the graph and use its model in the graph-model updating (including adding a linkage)
                            if (typeof roster[query.gene_list_id] != "undefined") {
                                inputNode = newModel.getNode(roster[query.gene_list_id])
                            } else {
                                if (typeof query.gene_list_id !== "undefined") {

                                    inputNode = new JSCustomNodeModel({
                                        name: query.gene_list_id,
                                        title: nextProps.transformerName[query.gene_list_id],
                                        controls: query.controls,
                                        size: size,
                                        selected: selectedGeneListsById.includes(gene_list_id),
                                        function: nextProps.transformersNormalized.byName[query.name].function
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
                            query.gene_list_ids.filter(gene_list_id => !nextProps.deletedGeneLists.includes(gene_list_id)).forEach(gene_list_id => {
                                let inputNode = null;
                                if (typeof roster[gene_list_id] != "undefined") {
                                    inputNode = newModel.getNode(roster[gene_list_id])
                                } else {
                                    inputNode = new JSCustomNodeModel({
                                        name: gene_list_id,
                                        title: nextProps.transformerName[gene_list_id],
                                        controls: query.controls,
                                        size: size,
                                        selected: selectedGeneListsById.includes(gene_list_id),
                                        function: nextProps.transformersNormalized.byName[query.name].function
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
                    eventWillFire: event => console.log("event will fire", event),
                    eventDidFire: (event) => this.handleNodeEvent(event)
                })
            });

            // this.layoutEngine.redistribute(newModel);
            this.engine.setModel(newModel);

            console.log(this.engine.getModel().getNodes());
            console.groupEnd();

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
                    <button className={"graph-control"} onClick={ () => this.autoDistributeNodes(this.engine) }>Layout</button>
                </div>

                <BodyWidget className={"back-graph-container"} engine={this.engine}/>

            </Fragment>
        )
    }
};


