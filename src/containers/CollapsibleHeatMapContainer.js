import React, { Component } from 'react';
import {connect} from "react-redux";
import ReactCollapsibleHeatMap from "../components/CollapsibleHeatMap/ReactCollapsibleHeatMap"
import {createSelector} from "reselect";
import _ from "lodash";
import * as Space from "react-spaces";
import SharpenerInfo from "../components/SharpenerInfo/SharpenerInfo";

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
    state => state.geneLists.deletedGeneLists,
    nameSelector,
    (geneListIds, geneListsById, deletedGeneLists, geneListNames) =>
        _.flatten(geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId)).map(geneListId => geneListsById[geneListId])
            .map(geneList =>
                {
                    console.log(geneListIds, geneListsById, geneList)
                    return [
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
                }
            ))
            .concat(
                _.uniq(geneListIds.filter(geneListId => !deletedGeneLists.includes(geneListId)).map(geneListId => geneListsById[geneListId]).map(geneList => geneList.source))
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
    nodes: nodesSelector(state),
    links: linksSelector(state),
    names: nameSelector(state)
});

const mapDispatchToProps = dispatch => ({
});

const CollapsibleHeatMapLayout = ({nodes, links}) => {
    return (
        <div>

            <Space.LeftResizable
                size={"33%"}
                maxWidth={"33%"}
                className={"gutter"}
                id="controls">

                <div style={{
                    display: "flex",
                    justifyContent: "flex-left",
                    alignItems: "center"
                }}>
                    <h5>Gene Pivot Table</h5>
                    <SharpenerInfo description={"Shows which gene lists different genes are part of (including single genes in multiple gene sets."}/>
                </div>

                <div>
                    <button id={"sortGene"}>Sort Genes</button>
                    <button id={"sortProcedure"}>Sort Gene Lists</button>
                    <input name={"rowFilter"} style={{ width: "100%" }}></input>
                </div>

            </Space.LeftResizable>

            <Space.Fill
                className={"gutter"}
                trackSize>
                <Space.Info>
                    {info => <ReactCollapsibleHeatMap size={info} nodes={nodes} links={links}/>}
                </Space.Info>
            </Space.Fill>

        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(CollapsibleHeatMapLayout)
