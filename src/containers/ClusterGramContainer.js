import React, { Component } from 'react';
import {connect} from "react-redux";
import ClusterGram from "../components/GeneListPivot/ClusterGram";
import {createSelector} from "reselect"
import _ from "lodash"

const transactionSelector = state => state.app.transactionLedger;
const transformerSelector = state => state.transformers.transformersNormalized.byName
const geneListNameMap = (transactionLedger, transformersByName) => transactionLedger.reduce((geneListIdsToName, transaction, index) => {
    const label = transformersByName[transaction.query.name].label ? transformersByName[transaction.query.name].label : "Custom"
    return Object.assign(geneListIdsToName, { [transaction.gene_list_id]: ((index + 1) + " - ") + label}); // TODO make more general, here i'm just supposing it's a gene list
}, {});

const geneListNameSelector = createSelector(
    transactionSelector,
    transformerSelector,
    geneListNameMap
);

const geneSymbolNameSelector = createSelector(
    state => state.geneLists.byId,
    state => state.geneLists.Ids,
    (geneListsById, geneListIds) => {
        return geneListIds
            .reduce((acc, geneListId) => acc.concat(...geneListsById[geneListId].genes), [])
            .reduce((acc, gene) => {
                return Object.assign(acc, {
                    [gene.gene_id]: gene.attributes.filter(attribute => attribute.name === "gene_symbol")[0].value
                })
            }, {})
    }
);

const colsSelector = createSelector(
    state => state,
    state => state.geneLists.byId,
    state => state.geneLists.Ids,
    (state, geneListsById, geneListIds) => {
        return geneListIds.map((geneListId, index) => ({
            name: geneListNameSelector(state)[geneListId],
            geneListId: geneListId }))  // TODO: what counts as clusts and groups?
    }
);

const rowsSelector = createSelector(
    state => state,
    state => state.geneLists.byId,
    state => state.geneLists.Ids,
    (state, geneListsById, geneListIds) => {
        return _.uniqBy(_.flatten(geneListIds.map(geneListId => geneListsById[geneListId].genes)), "gene_id")
                    .map(gene => gene.gene_id)
                    .map(geneId => ({
                        name: geneSymbolNameSelector(state)[geneId],
                        geneId: geneId
                    }))
    }
);

const linksSelector = createSelector(
    state => state,
    state => state.geneLists.byId,
    rowsSelector,
    colsSelector,
    (state, geneListsById, allGeneRows, allGeneListCols) => {
        // // TODO get rambda working
        // const rowIndexOfValue = R.invertObj(allGeneListRows.map(row => row.name));
        // const colIndexOfValue = R.invertObj(allGeneCols.map(col => col.name));
        // console.log(rowIndexOfValue, colIndexOfValue);

        return _.flatten(allGeneListCols.map(row => row.geneListId).map(geneListId => geneListsById[geneListId].genes.map(gene => {
            return ({ target: allGeneListCols.map(row=>row.name).indexOf(geneListNameSelector(state)[geneListId]),
                      source: allGeneRows.map(col=>col.name).indexOf(geneSymbolNameSelector(state)[gene.gene_id]), value: 1 })

        })));
    }
);

const mapStateToProps = (state, ownProps) => ({
    geneListIds: state.geneLists.Ids, // listed here to cause updating
    links: linksSelector(state),
    row_nodes: rowsSelector(state),
    col_nodes: colsSelector(state)
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(ClusterGram);
