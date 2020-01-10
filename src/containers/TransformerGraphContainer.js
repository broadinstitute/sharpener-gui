import React from 'react';
import {connect} from 'react-redux';

import {GraphWrapper} from "../components/TransformerGraph/TransformerGraph"

import {
    selectGeneListMultiple,
    unselectGeneListMultiple,
    getSelections,
    removeGeneList,
    undoRecentRemoveGeneList
} from "../actions";
import { createSelector } from "reselect";

import _ from "lodash";

const NodeTemplate = (gene_list_id, source, type="empty") => ({
    id: gene_list_id,
    title: source,
    type: type
});

const geneListIdsSelector = state => state.geneLists.Ids;
const geneListsByIdSelector = state => state.geneLists.byId;

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

const geneListDiffSelector = (leftGeneListId, rightGeneListId) => createSelector(
    geneListsByIdSelector,
    geneListsById => ({
        leftDiff: _.difference(geneListsById[leftGeneListId].genes, geneListsById[rightGeneListId].genes),
        rightDiff:_.difference(geneListsById[rightGeneListId].genes, geneListsById[leftGeneListId].genes),
    })
);

const mapStateToProps = (state, ownProps) => ({
    transactions: transactionSelector(state),
    transactionsByGeneListId: transactionsByOutputGeneListId(state),
    currentGeneLists: geneListIdsSelector(state),
    selectedGeneLists: state.geneLists.selectedMultipleGeneListsById,
    deletedGeneLists:  state.geneLists.deletedGeneLists,
    transformersNormalized: state.transformers.transformersNormalized,
    transformerName: nameSelector(state),
    geneListDiff: geneListIdsSelector(state)

});

const mapDispatchToProps = dispatch => ({
    selectGeneList: geneListId => dispatch(selectGeneListMultiple(geneListId)),
    unselectGeneList: geneListId => dispatch(unselectGeneListMultiple(geneListId)),
    removeGeneList: geneListId => dispatch(removeGeneList(geneListId)),
    undoRemoveGeneList: geneListId => dispatch(undoRecentRemoveGeneList()),
    // TODO we use this to inject the selections into the flow of control without having to re-render the component. USE SPARINGLY.
    getSelectedGeneListIds: () => dispatch(getSelections())
});

export default connect(mapStateToProps, mapDispatchToProps)(GraphWrapper);
