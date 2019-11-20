import React, { Component } from 'react';
import {connect} from "react-redux";
import ClusterGram from "../components/GeneListPivot/ClusterGram";
import {createSelector} from "reselect"
import _ from "lodash"

const rowsSelector = createSelector(
    state => state.geneLists.byId,
    state => state.geneLists.Ids,
    (geneListsById, geneListIds) => {
        return geneListIds.map((geneListId, index) => ({name: geneListId, clust: index, group: []}))  // TODO: what counts as clusts and groups?
    }
);

const colsSelector = createSelector(
    state => state.geneLists.byId,
    state => state.geneLists.Ids,
    (geneListsById, geneListIds) => {
        return _.uniqBy(_.flatten(geneListIds.map(geneListId => geneListsById[geneListId].genes)), "gene_id")
                    .map(gene => gene.gene_id)
                    .map(geneId => ({name: geneId, clust: 0, group: []}))
    }
);

const linksSelector = createSelector(
    state => state.geneLists.byId,
    rowsSelector,
    colsSelector,
    (geneListsById, allGeneListRows, allGeneCols) => {
        // // TODO get rambda working
        // const rowIndexOfValue = R.invertObj(allGeneListRows.map(row => row.name));
        // const colIndexOfValue = R.invertObj(allGeneCols.map(col => col.name));
        // console.log(rowIndexOfValue, colIndexOfValue);

        return _.flatten(allGeneListRows.map(row => row.name).map(geneListId => geneListsById[geneListId].genes.map(gene => {
            return ({source: allGeneListRows.map(row=>row.name).indexOf(geneListId), target: allGeneCols.map(col=>col.name).indexOf(gene.gene_id), value: 1})
        })));
    }
);

const mapStateToProps = (state, ownProps) => ({
    geneListIds: state => state.geneLists.Ids, // listed here to cause updating
    links: linksSelector(state),
    rows: rowsSelector(state),
    cols: colsSelector(state)
});

const mapDispatchToProps = dispatch => ({

});

export default connect(mapStateToProps, mapDispatchToProps)(ClusterGram);
