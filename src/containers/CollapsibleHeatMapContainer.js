import React, { Component } from 'react';
import {connect} from "react-redux";
import ReactCollapsibleHeatMap from "../components/CollapsibleHeatMap/ReactCollapsibleHeatMap"
import {createSelector} from "reselect";
import _ from "lodash";
import * as Space from "react-spaces";

/*
* Target Shape of Data
*
*
*
*
* */

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

const nodesSelector = createSelector(
    state => state.geneLists.Ids,
    state => state.geneLists.byId,
    nameSelector,
    (geneListIds, geneListsById, geneListNames) =>
        _.flatten(geneListIds.map(geneListId => geneListsById[geneListId])
            .map(geneList =>
                [
                    ...geneList.genes.map(gene => ({
                        id: gene.gene_id,
                        name: gene.attributes.filter(attribute => attribute.name === "gene_symbol")[0].value, // TODO: should make a map at some point at reducer level to make lookups not take so long
                        type: "gene"
                    })),
                    ({
                        id: geneList.source + "|" + geneList.gene_list_id,
                        name: geneListNames[geneList.gene_list_id],
                        type: "parameter"  // TODO: or procedure?
                    })
                ]
            ))
            .concat(
                _.uniq(geneListIds.map(geneListId => geneListsById[geneListId]).map(geneList => geneList.source))
                    .map(uniqueGeneListSourceName => ({
                        id: uniqueGeneListSourceName,
                        name: uniqueGeneListSourceName.split(" ")[0],
                        type: "procedure"
                    }))
            )
)

const linksSelector = createSelector(
    state => state.geneLists.Ids,
    state => state.geneLists.byId,
    (geneListIds, geneListsById) =>
        [].concat(
            _.flatten(geneListIds.map(geneListId => geneListsById[geneListId])
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
                _.flatten(geneListIds.map(geneListId => geneListsById[geneListId])
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
    nodes: nodesSelector(state),
    links: linksSelector(state),
    names: nameSelector(state)
});

const mapDispatchToProps = dispatch => ({
});

const CollapsibleHeatMapLayout = ({nodes, links}) => {
    return (
        <div className={"container"}>
            <Space.Fill
                id="controls">
                <h5>Gene Pivot Table</h5>
                <div>
                    <button id={"sortGene"}></button>
                    <button id={"sortProcedure"}></button>
                    <input name={"rowFilter"} style={{ width: "100%" }}></input>
                </div>
            </Space.Fill>
            <Space.RightResizable
                size={ "75%" }
                maxWidth={ "75%" }
                trackSize>
                <Space.Info>
                    {info => <ReactCollapsibleHeatMap size={info} nodes={nodes} links={links}/>}
                </Space.Info>
            </Space.RightResizable>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(CollapsibleHeatMapLayout)
