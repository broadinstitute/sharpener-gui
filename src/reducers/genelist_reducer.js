import { FETCH_TRANSFORMATION_SUCCESS, REMOVE_GENE_LIST, SELECT_MULTIPLE_GENE_LIST, SELECT_SINGLE_GENE_LIST, UNSELECT_MULTIPLE_GENE_LIST, UNSELECT_SINGLE_GENE_LIST } from "../actions";

const initialGeneListsState = {
    byId: {},
    Ids: [], // gene lists will now be managed directly rather than through a "selection" state
    selectedMultipleGeneListsById: [],  // but the selection state is for displaying details only
    selectedSingleGeneListsById: null,  // but the selection state is for displaying details only
    deletedGeneLists: []
};

const geneLists = (state=initialGeneListsState, action) => {
    switch (action.type) {
        case FETCH_TRANSFORMATION_SUCCESS:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload.geneList.gene_list_id]: action.payload.geneList
                },
                Ids: state.Ids.concat(action.payload.geneList.gene_list_id)
            };
        case REMOVE_GENE_LIST:
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload.removedGeneListId]: undefined
                },
                // Ids: state.Ids.filter(geneListId => geneListId !== action.payload.removedGeneListId),
                selectedMultipleGeneListsById: state.selectedMultipleGeneListsById.filter(geneListId => geneListId !== action.payload.removedGeneListId),
                selectedSingleGeneListsById: null,
                deletedGeneLists: state.deletedGeneLists.concat(action.payload.removedGeneListId)
            };
        case SELECT_MULTIPLE_GENE_LIST:
            return {
                ...state,
                selectedMultipleGeneListsById: !state.selectedMultipleGeneListsById.includes(action.payload.selectedGeneList) ?
                    state.selectedMultipleGeneListsById.concat(action.payload.selectedGeneList) : state.selectedMultipleGeneListsById
            };
        case UNSELECT_MULTIPLE_GENE_LIST:
            return {
                ...state,
                selectedMultipleGeneListsById: state.selectedMultipleGeneListsById.filter(geneListId => geneListId !== action.payload.selectedGeneList)
            };
        case SELECT_SINGLE_GENE_LIST:
            return {
                ...state,
                selectedSingleGeneListsById: action.payload.selectedGeneList
            };
        case UNSELECT_SINGLE_GENE_LIST:
            return {
                ...state,
                selectedSingleGeneListsById: null
            };
        default:
            return state;
    }
}

export default geneLists
