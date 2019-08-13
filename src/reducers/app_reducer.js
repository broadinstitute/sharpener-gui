const defaultState = {
    // these should default to a false-y value to allow us to check for their full presence
    producers: [
        {
            name: "Gene Symbols",
            function: "producer",
            parameters: [{name: "gene symbol", type: "list"}]
        }
    ],
    expanders: null,
    transformers: null,

    // gene list creation state
    selectedProducer: {
        name: "Gene Symbols",
        function: "producer",
        parameters: [{name: "gene symbol", type: "list"}]
    },

    // gene view state
    gene_list_ids: [],
    recently_cleared_gene_lists: [],

    // transformer query
    selectedGeneListsByID: [],
    selectedExpanders: [],

    // transaction history
    // list of dates -> geneListID -> query
    transactionLedger: []

};

export default function(state=defaultState, action) {
    switch(action.type) {

    }
}