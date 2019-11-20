const initialTransformersState = {
    transformers: [{
        name: "Custom Gene List",
        function: "creator",
        parameters: [
            {name: "gene symbols", type: "array"}
        ]
    }],
    transformersNormalized: {
        byName: {
            "Custom Gene List": {
                name: "Custom Gene List",
                function: "creator",
                parameters: [
                    {name: "gene symbols", type: "array"}
                ]
            }
        },
    },
    transformerNames: [ "Custom Gene List" ],
    selectedTransformersByName: []
};

const transformers = (state=initialTransformersState, action) => {
    switch (action.type) {
        case 'FETCH_TRANSFORMERS_SUCCESS':
            return {
                ...state,
                transformers: state.transformers.concat(action.payload.transformers),  // using concat rather than just setting the value can allow for default configuration
                transformersNormalized: {
                    byName: Object.assign(state.transformersNormalized.byName,
                        action.payload.transformers.reduce((index, transformer) => { index[transformer.name] = transformer; return index; }, {}))
                },
                transformerNames: state.transformerNames.concat(action.payload.transformers.map(transformer => transformer.name))
            };
        case 'ADD_TRANSFORMER':
            return {
                ...state,
                selectedTransformersByName: state.selectedTransformersByName.concat([action.payload.name])
            };
        case 'REMOVE_TRANSFORMER':
            const index = action.payload.index;
            return {
                ...state,
                selectedTransformersByName: [...state.selectedTransformersByName.slice(0, index), ...state.selectedTransformersByName.slice(index + 1)]
            };
        // TODO: Selector?
        case 'GET_EXPANDERS':
            return state;
        // TODO: Selector?
        case 'GET_PRODUCERS':
            return state;
        // TODO: Selector?
        case 'GET_FILTERS':
            return state;
        // TODO: form
        case 'CLEAR_TRANSFORMER_PARAMETER':
            return state;
        // TODO: form
        case 'UPDATE_PARAMETER_ON_TRANSFORMER':
            return state;
        // TODO: saga
            // TODO: isFetching?
        case 'SEND_TRANSFORMER_QUERY':
            return state;
        // TODO: saga
            // TODO: isFetching?
        case 'SEND_TRANSFORMER_QUERY_ALL':
            return state;
        default:
            return state;
    }
};

export default transformers;
