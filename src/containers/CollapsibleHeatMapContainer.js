import React, { Component, useState } from 'react';
import {connect} from "react-redux";
import ReactCollapsibleHeatMap from "../components/CollapsibleHeatMap/ReactCollapsibleHeatMap"
import {createSelector} from "reselect";
import SharpenerInfo from "../components/SharpenerInfo/SharpenerInfo";

import _ from "lodash";
import * as Space from "react-spaces";

import messages from "../message-properties";

import TextField from '@material-ui/core/TextField';
// import Autocomplete from '@material-ui/lab/Autocomplete';

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

const currentGeneListsSelector = createSelector(
    state => state.geneLists.Ids,
    state => state.geneLists.byId,
    state => state.geneLists.deletedGeneLists,
    (geneListIds, geneListsById, deletedGeneLists) => geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId)).map(geneListId => geneListsById[geneListId])
)

const currentGenesSelector = createSelector(
    currentGeneListsSelector,
    currentGeneLists => currentGeneLists.reduce((acc, geneList) => acc.concat(...geneList.genes), [])
)

const geneSymbolOfGene = gene => gene.attributes.filter(attribute => attribute.name === "gene_symbol")[0].value;
const geneLabelIndex = createSelector(
    currentGenesSelector,
    currentGenes => currentGenes.reduce(
        (acc, gene) => Object.assign(acc, {
            [gene.gene_id]: geneSymbolOfGene(gene)
        }), {})
)

const geneFrequency = createSelector(
    currentGenesSelector,
    currentGenes => _.countBy(currentGenes.map(gene => gene.gene_id))
)

const sourceFrequency = createSelector(
    currentGeneListsSelector,
    currentGeneLists => (
        _.countBy(currentGeneLists
            .map(geneList => geneList.source)
            .map(sourceIdentifier => sourceIdentifier.split(" ")[0])  // source name
        )
    )
)

const nodesSelector = createSelector(
    state => state.geneLists.Ids,
    state => state.geneLists.byId,
    state => state.geneLists.deletedGeneLists,
    geneLabelIndex,
    nameSelector,
    geneFrequency,
    sourceFrequency,
    (geneListIds, geneListsById, deletedGeneLists, geneLabel, geneListNames, geneFrequency, sourceFrequency) =>
        _.flatten(geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId)).map(geneListId => geneListsById[geneListId])
            .map(geneList =>
                {
                    return [
                        ...geneList.genes.map(gene => ({
                            id: gene.gene_id,
                            name: geneLabel[gene.gene_id], // TODO: should make a map at some point at reducer level to make lookups not take so long (like an index or normalization!)
                            type: "gene",
                            frequency: geneFrequency[gene.gene_id]
                        })),
                        ({
                            id: geneList.source + "|" + geneList.gene_list_id,
                            name: geneListNames[geneList.gene_list_id],
                            type: "parameter"  // TODO: or procedure?
                        })
                    ]
                }
            ))
            .concat(
                _.uniq(geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId)).map(geneListId => geneListsById[geneListId]).map(geneList => geneList.source))
                    .map(uniqueGeneListSourceIdentifier => ({
                        id: uniqueGeneListSourceIdentifier,
                        name: uniqueGeneListSourceIdentifier.split(" ")[0],
                        type: "procedure",
                        frequency: sourceFrequency[uniqueGeneListSourceIdentifier.split(" ")[0]]
                    }))
            )
)

const linksSelector = createSelector(
    state => state.geneLists.Ids,
    state => state.geneLists.byId,
    state => state.geneLists.deletedGeneLists,
    (geneListIds, geneListsById, deletedGeneLists) =>
        [].concat(
            _.flatten(geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId)).map(geneListId => geneListsById[geneListId])
                .map(geneList => [
                    ...geneList.genes.map(
                        gene => ({
                            source: gene.gene_id,
                            target: geneList.source + "|" + geneList.gene_list_id,
                            weight: 0
                        })
                    )
                ]))
            )
            .concat(
                _.flatten(geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId)).map(geneListId => geneListsById[geneListId])
                    .map(geneList => [
                        ...geneList.genes.map(
                            gene => ({
                                source: gene.gene_id,
                                target: geneList.source,
                                weight: 0
                            })
                        )
                    ]))
            )
)

const mapStateToProps = state => ({
    geneListIds: state => state.geneLists.Ids,
    selectedGeneListIds: state => state.geneLists.selectedMultipleGeneListsById,
    genes: currentGenesSelector(state),
    geneLabels: geneLabelIndex(state),
    nodes: nodesSelector(state),
    links: linksSelector(state),
    names: nameSelector(state)
});

const mapDispatchToProps = dispatch => ({
});


const CollapsibleHeatMapLayout = ({nodes, links, genes, geneLabels}) => {
    const [value, setValue] = useState('');
    return (
        <div>

            <Space.LeftResizable
                size={"35%"}
                maxWidth={"35%"}
                className={"gutter"}>

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
                        <input
                            name={"rowFilter"}
                            style={{width: "100%"}}
                        />
                    </div>

                </div>

            </Space.LeftResizable>

            <Space.Fill
                trackSize>
                <Space.Info>
                    {info => <ReactCollapsibleHeatMap size={info} nodes={nodes} links={links}/>}
                </Space.Info>
            </Space.Fill>

        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(CollapsibleHeatMapLayout)
