import React from "react"
import MultiSelect from "@khanacademy/react-multi-select"
import {useDispatch, useSelector} from "react-redux";
import {createSelector} from "reselect";
import _ from "lodash";

import {
    removeGeneList,
    selectGeneListMultiple,
    undoRecentRemoveGeneList,
    unselectGeneListMultiple
} from "../../actions";

export const SelectionManager = props => {
    const dispatch = useDispatch();

    const transactionSelector = state => state.app.transactionLedger;
    const transformerSelector = state => state.transformers.transformersNormalized.byName;
    const nameMap = (transactionLedger, transformersByName) => transactionLedger.reduce((geneListIdsToName, transaction, index) => {
        const label = transformersByName[transaction.query.name].label ? transformersByName[transaction.query.name].label : "Custom"
        return Object.assign(geneListIdsToName, { [transaction.gene_list_id]: ((index + 1) + " - ") + label}); // TODO make more general, here i'm just supposing it's a gene list
    }, {});

    const nameSelector = useSelector(createSelector(
        transactionSelector,
        transformerSelector,
        nameMap
    ));

    const geneListsById = useSelector(state => state.geneLists.byId);
    const geneListIds = useSelector(state => state.geneLists.Ids);
    const options = geneListIds.map(geneListId => ({value: geneListId, label: nameSelector[geneListId]}));
    const selected = useSelector(state => state.geneLists.selectedMultipleGeneListsById);
    const deleted = useSelector(state => state.geneLists.deletedGeneLists);

    return (
        <>
            <MultiSelect
                options={options}
                selected={selected}
                overrideStrings={{
                    selectSomeItems: "Select Gene List",
                    allItemsAreSelected: "All Gene Lists are Selected",
                    selectAll: "Select All",
                    search: "Filter",
                }}
                onSelectedChanged={ selection => {
                    // ENTERING IDs
                    const rightDifference = _.difference(selection, selected);
                    // EXITING IDs
                    const leftDifference = _.difference(selected, selection);
                    // REMAINING IDs
                    const overlap = _.intersection(selection, selected);
                    if (rightDifference.length > 0) {
                        rightDifference.forEach(selection => dispatch(selectGeneListMultiple(selection)));
                    }
                    if (leftDifference.length > 0) {
                        leftDifference.forEach(selection => dispatch(unselectGeneListMultiple(selection)));
                    }
                }}
            />
            <div style={{
                display: "flex",
                justifyContent: "right",
                marginTop: "0.25em"
            }}>
                <button
                    className={"graph-control"}
                    onClick={() => {
                        selected.forEach(selection => dispatch(removeGeneList(selection)))
                    }}
                    disabled={!(selected.length > 0)}>
                    Remove
                </button>
                <button
                    className={"graph-control"}
                    onClick={ () => dispatch(undoRecentRemoveGeneList()) }
                    disabled={!(deleted.length > 0)}>
                    Undo
                </button>
            </div>
        </>
    )
}