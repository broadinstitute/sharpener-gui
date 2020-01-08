import React, {Component, useEffect, useState} from 'react';
import {connect} from "react-redux";
import ReactCollapsibleHeatMap from "../components/CollapsibleHeatMap/ReactCollapsibleHeatMap"
import {createSelector} from "reselect";

import SharpenerInfo from "../components/SharpenerInfo/SharpenerInfo";

import _ from "lodash";
import * as R from "rambda";

import * as Space from "react-spaces";

import messages from "../message-properties";
import Parallel from "paralleljs";
import {asyncJobToThreads, asyncThread, makeThreadAsyncWithJob, thread} from "../utils/asyncWorkerPromise";

const transactionSelector = state => state.app.transactionLedger;
const normalizedTransactions = state => state.app.transactionsNormalized;
const transactionsByOutputGeneListId = createSelector(
    normalizedTransactions,
    transactions => transactions.byOutputId
);
const transformerSelector = state => state.transformers.transformersNormalized.byName
const nameMap = (transactionLedger, transformersByName) => transactionLedger.reduce((geneListIdsToName, transaction, index) => {
    const label = transformersByName[transaction.query.name].label ? transformersByName[transaction.query.name].label : "Custom"
    return Object.assign(geneListIdsToName, { [transaction.gene_list_id]: ((index + 1) + " - ") + label}); // TODO make more general, here i'm just supposing it's a gene list
}, {});

const nameSelector = createSelector(
    transactionSelector,
    transformerSelector,
    nameMap
);

// const nodesSelector = createSelector(
//     state => state.geneLists.Ids,
//     state => state.geneLists.byId,
//     state => state.geneLists.deletedGeneLists,
//     nameSelector,
//     (geneListIds, geneListsById, deletedGeneLists, geneListNames) => computeNodes(geneListIds, geneListsById, deletedGeneLists, geneListNames)
// )

// const linksSelector = createSelector(
//     state => state.geneLists.Ids,
//     state => state.geneLists.byId,
//     state => state.geneLists.deletedGeneLists,
//     (geneListIds, geneListsById, deletedGeneLists) => computeLinks(geneListIds, geneListsById, deletedGeneLists)
// )

const mapStateToProps = state => ({
    geneListIds: state.geneLists.Ids,
    geneListsById: state.geneLists.byId,
    deletedGeneLists: state.geneLists.deletedGeneLists,
    selectedGeneListIds: state.geneLists.selectedMultipleGeneListsById,
    // nodes: nodesSelector(state),
    // links: linksSelector(state),
    geneListNames: nameSelector(state)
});

const mapDispatchToProps = dispatch => ({
});

const CollapsibleHeatMapLayout = ({geneListIds, geneListsById, selectedGeneLists, deletedGeneLists, geneListNames}) => {

    const [nodes, setNodes] = useState(null);
    const [links, setLinks] = useState(null);

    useEffect(() => {
        console.log("nodes changed", nodes);
    }, [nodes])

    useEffect(() => {
        console.log("links changed", links);
    }, [links])

    useEffect(() => {
        if (geneListIds && geneListIds.length > 0) {
            Promise.resolve(computeNodesParallel(geneListIds, geneListsById, deletedGeneLists, geneListNames))
                .then(result => setNodes(result));
        }
    }, [ geneListIds ])

    useEffect(() => {
        if (geneListIds && geneListIds.length > 0) {
            // TODO
            // Promise.resolve(computeLinksParallel(geneListIds, geneListsById, deletedGeneLists))
            //     .then(result => setLinks(result));
            setLinks(computeLinks(geneListIds, geneListsById, deletedGeneLists))
        }
    }, [ geneListIds ]);

    // const computeNodes = (geneListIds, geneListsById, deletedGeneLists, geneListNames) => {
    //     return _.flatten(
    //         geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId))
    //             .map(geneListId => geneListsById[geneListId])
    //
    //             .map(geneList =>
    //                 {
    //                     return [
    //                         ...geneList.genes.map(gene => ({
    //                             id: gene.gene_id,
    //                             name: gene.attributes.filter(attribute => attribute.name === "gene_symbol")[0].value, // TODO: should make a map at some point at reducer level to make lookups not take so long
    //                             type: "gene"
    //                         })),
    //                         ({
    //                             id: geneList.source + "|" + geneList.gene_list_id,
    //                             name: geneListNames[geneList.gene_list_id],
    //                             type: "parameter"  // TODO: or procedure?
    //                         })
    //                     ]
    //                 }
    //             )
    //     )
    //         .concat(
    //             _.uniq(
    //                 geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId))
    //                     .map(geneListId => geneListsById[geneListId])
    //                     .map(geneList => geneList.source)
    //             )
    //                 .map(uniqueGeneListSourceName => ({
    //                     id: uniqueGeneListSourceName,
    //                     name: uniqueGeneListSourceName.split(" ")[0],
    //                     type: "procedure"
    //                 }))
    //         )
    // }

    const computeNodesParallel = (geneListIds, geneListsById, deletedGeneLists, geneListNames) => {

        const currentGeneLists =
            geneListIds
                .filter(geneListId => !deletedGeneLists.includes(geneListId))
                .map(geneListId => geneListsById[geneListId]);

        const cont = call => result => { call(result); return result; }

        // TODO: NOTE: the webworker won't accept any higher order functions.
        //  the worker can be revised to be passed custom environment for this,
        //  but I eschewed other implementations online due to their incompleteness
        //  this is certainly good enough.
        const genesToNodes = function (genes) {
            return genes.map(
                function (gene)  {
                    return {
                        id: gene.gene_id,
                        name: gene.attributes.filter(function (attribute) {
                            return attribute.name === "gene_symbol";
                        })[0].value,
                        type: "gene"
                    }
                }
            );
        };

         const genesToNodesThreads = (async (genes) => {
            try {
                const res1 = await thread(
                    genesToNodes, genes
                );
                return res1;
            } catch (error) {
                console.log("Worker error!", error);
            }
         });

        const asyncJobToThreads = (async (job, ...data) => {
            try {
                const res1 = await thread(
                    job, ...data
                );
                return res1;
            } catch (error) {
                console.log("Worker error!", error);
            }
        });


        const workChunks = split_size => elementArray => _(elementArray).chunk(Math.round(elementArray.length / split_size))
        return Promise.all(
            ...currentGeneLists.map(geneList =>
                workChunks(8)(geneList.genes)
                    .map(subGenes => asyncJobToThreads(genesToNodes, subGenes))),
        ).then(result => _.flatten(result).concat(
            // TODO: parallelize
            _.uniq(currentGeneLists.map(geneList => geneList.source))
            .map(uniqueGeneListSourceName => ({
                id: uniqueGeneListSourceName,
                name: uniqueGeneListSourceName.split(" ")[0],
                type: "procedure"
            }))
        ))

    };

    const computeLinks = (geneListIds, geneListsById, deletedGeneLists) => {
        const currentGeneLists =
            geneListIds
                .filter(geneListId => !deletedGeneLists.includes(geneListId))
                .map(geneListId => geneListsById[geneListId]);
        const genes = [];
        const source = '';
        const gene_list_id = null;
        return (
                [].concat(
                    _.flatten(
                        currentGeneLists
                            .map(geneList => geneList.genes)
                            .map(genes => {
                                return (
                                    genes.map(
                                        gene => ({
                                            source: gene.gene_id,
                                            target: source + "|" + gene_list_id,
                                            weight: 1
                                        })
                                    )
                                )
                            })
                    )
                )
                .concat(
                    _.flatten(
                        currentGeneLists
                            .map(geneList => geneList.genes)
                            .map(genes =>

                                genes.map(
                                    gene => ({
                                        source: gene.gene_id,
                                        target: source,
                                        weight: 1
                                    })
                                )

                            )
                    )
                )
        )
    }

    const computeLinksParallel = (geneListIds, geneListsById, deletedGeneLists) => {
        const currentGeneLists =
            geneListIds
                .filter(geneListId => !deletedGeneLists.includes(geneListId))
                .map(geneListId => geneListsById[geneListId]);

        // TODO: NOTE: the webworker won't accept any higher order functions.
        //  the worker can be revised to be passed custom environment for this,
        //  but I eschewed other implementations online due to their incompleteness
        //  this is certainly good enough.
        const makeUnflatGenesToLinks = geneList => geneListToLinks(geneList);
        const geneListToLinks = function (geneList) {
            const genes = geneList.genes;
            const source = geneList.source;
            const gene_list_id = geneList.gene_list_id;
            return genesToLinksForGeneList(JSON.stringify(gene_list_id), JSON.stringify(source));
        };

        const genesToLinksForGeneList = (gene_list_id, source) => (genes) => (
            [].concat(
                genes.map(
                    gene => ({
                        source: gene.gene_id,
                        target: source + "|" + gene_list_id,
                        weight: 0
                    })
                )
            ).concat(
                genes.map(
                    gene => ({
                        source: gene.gene_id,
                        target: source,
                        weight: 0
                    }))
            )
        );

        const workChunks = split_size => elementArray => _(elementArray).chunk(Math.round(elementArray.length / split_size))
        return Promise.all(
            ...currentGeneLists.map(geneList =>
                workChunks(8)(geneList.genes)
                    .map(subGenes =>
                        asyncJobToThreads(geneListToLinks(geneList), subGenes)
                    )),
        ).then(result => _.flattenDepth(result, 2))

    };

    return (
        <div>

            <Space.LeftResizable
                size={"35%"}
                maxWidth={"35%"}
                className={"gutter"}>

                <div style={{
                    display: "flex",
                    justifyContent: "flex-left",
                    alignItems: "center"
                }}>
                    <h5 className={"info-header"}>{messages.header.pivot}</h5>
                    <SharpenerInfo description={messages.tooltip.pivot}/>
                </div>


                <div id="heatmap-controls">

                    <div className={"heatmap-control"}>
                        <h6>Sort Genes</h6>
                        <button id={"sortGene"}>Alphabetically</button><br/>
                        <button id={"sortGeneFrequency"}>Frequency</button><br/>

                    </div>

                    <div className={"heatmap-control"}>
                        <h6>Sort Gene Lists</h6>
                        <button id={"sortProcedure"}>Alphabetically</button><br/>
                        <button id={"sortProcedureFrequency"}>Frequency</button><br/>
                    </div>

                    <div className={"heatmap-control"}>
                        <h6>Filter for Genes</h6>
                        <input name={"rowFilter"} style={{ width: "100%" }}></input>
                    </div>

                </div>

            </Space.LeftResizable>

            <Space.Fill trackSize>
                <Space.Info>
                    { info => nodes && nodes.length > 0 && nodes && links.length > 0 ?
                        <ReactCollapsibleHeatMap size={info} nodes={nodes} links={links}/> : null }
                </Space.Info>
            </Space.Fill>

        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(CollapsibleHeatMapLayout)
