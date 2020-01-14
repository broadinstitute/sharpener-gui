const getInitialState = () => ({
    model: null
});

export const reducerFn = (state = getInitialState(), action) => {
    switch (action.type) {
        case 'update-model':
            return {
                model: action.model,
            };
        default:
            return state;
    }
};

export default reducerFn;
