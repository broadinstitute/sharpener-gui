const initialState = {
    nodes: {
        byId: {},
        Ids: []
    },
    forms: {
        byId: {},
        Ids: []
    },
    transformers: {
        byId: {},
        Ids: []
    },
    geneLists: {
        byId: {},
        Ids: []
    }
};

const NodeShape = {
    // this persists throughout the Node's lifecycle
    node_id: null,
    // TODO: redux forms
    // this persists throughout the Node's lifecycle
    // "is dirty" is captured through a reference to forms
    form_id: null,
    content: {
        name: null, // this is technically persistent
        gene_list_id: null, // this is not persistent, it can change
    },
};

function prime(state=initialState, action) {
    switch (action.type) {
        case 'FETCH_TRANSFORMERS_SUCCESS':
            return {
                ...state,
                transformers: { byId: action.payload.transformers }
            };
        case 'ADD_TRANSFORMER':
            return {
                ...state,
                transformers: { Ids: state.transformers.Ids.concat([action.payload.name]) }
            };
        case 'REMOVE_TRANSFORMER':
            const index = action.payload.index;
            return {
                ...state,
                transformers: { Ids: [...state.transformers.Ids.slice(0, index), ...state.transformers.Ids.slice(index + 1)] }
            };
        default:
            return state;
    }
}

export default prime;
