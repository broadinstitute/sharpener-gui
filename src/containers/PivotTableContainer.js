import {connect} from "react-redux";
import {createSelector} from "reselect";
import GeneListPivot from "../components/GeneListPivot/GeneListPivot"
import {BloomFilter} from "bloomfilter";

const geneListIdsSelector = state => state.geneLists.Ids;
const selectedGeneListsSelector = state => state.geneLists.selectedMultipleGeneListsById;
const removedGeneListsSelector = state => state.geneLists.deletedGeneLists;
const normalizedGeneListSelector = state => state.geneLists.byId;
const transactionsNormalizedSelector = state => state.app.transactionsNormalized.byOutputId;

// TODO replace calls to geneListIdsSelector with a successful implementation of the scope selector
const geneListScopeSelector = createSelector(
    geneListIdsSelector,
    selectedGeneListsSelector,
    removedGeneListsSelector,
    (geneListIds, selectedGeneListIds, removedGeneListIds) =>
        geneListIds
            .filter(geneListId => !removedGeneListIds.includes(geneListId))
            .filter(geneListId => selectedGeneListIds.includes(geneListId))
);

const filteredTransactionsSelector = createSelector(
    geneListIdsSelector,
    transactionsNormalizedSelector,
    (scopedGeneListIds, transactionsByOutputId) =>
        scopedGeneListIds
        // what gene lists are in scope? none of those that are removed, and only those that are selected
            .reduce((filteredTransactions, geneListId) => {
                filteredTransactions.concat(transactionsByOutputId[geneListId]);  // here's an example of normalization paying off: no need for a membership check
                return filteredTransactions;
            }, [])
);

const geneListNamesSelector = createSelector(
    filteredTransactionsSelector,
    (transactions) => transactions.reduce((geneListIdsToName, transaction, index) => {
        return Object.assign(geneListIdsToName, { [transaction.gene_list_id]: (index + 1) + " - " + transaction.query.name }); // TODO: should become a helper method
    }, {})
);

const scopedGenesSelector = createSelector(
    geneListIdsSelector,
    normalizedGeneListSelector,
    (scopedGeneListIds, geneListsById) => scopedGeneListIds.reduce((acc, item) => {
        return acc.concat(...geneListsById[item].genes);
    }, [])
);

// moneyshot
// the data has to be defined on all locations of the matrix
const membershipMatrixFromBloomFilter = function(sets, elements) {
    if (sets && elements && sets.length > 0 && elements.length > 0) {
        // the element matrix for our target visualization has the following properties:
        // isa list of lists of numbers
        // the x-axis array is nested inside of the y-axis array
        // in our case, the x axis are gene lists
        // in our case, the y axis are genes
        // we will let membership = T -> 1, else 0
        // (we might transpose this based on layout concerns?)

        // APPROACH 1: can we accumulate an adjacency map before iterating over it? Then create the nested list?
        // bloom filter
            // if true, then maybe true
                // TODO: check again?
            // if false, then definitely false
        console.group("bloom filter-driven adjacency matrix");

        console.group("initial values");
        console.log("set names", sets);
        console.log("element names", elements);
        console.groupEnd();

        console.group("constructing the bloom filter from sets");
        // TODO: memoize, make like state?
        const filterMap = sets.reduce((filters, set) => {
            // filter calculations: https://stackoverflow.com/a/22467497/1991892
            // m = -n*ln(p) / (ln(2)^2)
            // k = m/n * ln(2)
            // TODO: optimize
            filters[set.key] = new BloomFilter(set.items);
            return filters;
        }, {});
        console.log("resulting collection of indexed filters", filterMap);
        console.groupEnd();

        console.group("constructing the adjacency matrix from set elements");
        const membershipValue = inFilter => inFilter ? 1 : 0;
        let adjMatrixY = new Array(elements.length).fill(0).map((_, yIndex) => {
                    const adjMatrixXRow =
                        new Array(sets.length).fill(0).map((_, xIndex) =>
                             {
                                 let membership = membershipValue(filterMap[sets[xIndex].key].test(elements[yIndex]));

                                 if (membership === 1) {
                                     membership = membershipValue(sets[xIndex].items.includes(elements[yIndex]));
                                 }

                                 console.log("membership of", elements[yIndex], "in set", sets[xIndex].key, ":", membership);
                                 return membership;
                             }
                        );
                    console.log(adjMatrixXRow);
                    return adjMatrixXRow
                }
            );
        console.log("constructing root of adjacency matrix from elements as y-Axis", adjMatrixY, "length", adjMatrixY.length, "is equal to", elements.length, "elements");
        console.groupEnd();

        return adjMatrixY
    } else {
        return null;
    }
};

const convertGeneListsForBloomFilter = state => geneListIds => {
    const normalizedGeneLists = normalizedGeneListSelector(state);
    console.log("normalized", normalizedGeneLists);
    return geneListIds.reduce((acc, geneListId) => {
        return acc.concat(
            {
                key: geneListId,
                items: convertGenesForBloomFilter(state)(normalizedGeneLists[geneListId].genes)
            }
        )
    }, []);
};

const convertGenesForBloomFilter = state => genes => {
    console.log('convert', genes);
    return genes.map(gene => gene.gene_id);
};

const computeGeneListMembershipMatrix = createSelector(
    state => state,
    geneListIdsSelector,
    scopedGenesSelector,
    (state, geneListIds, scopedGenes) =>{
        console.log("compute matrix");
       return membershipMatrixFromBloomFilter(
            convertGeneListsForBloomFilter(state)(geneListIds),
            convertGenesForBloomFilter(state)(scopedGenes)
        )
    }
);

const mapStateToProps = state => ({
    geneListNames: geneListNamesSelector(state),
    geneListIds: geneListIdsSelector(state),
    geneNames: convertGenesForBloomFilter(state)(scopedGenesSelector(state)),
    membershipMatrixAsRows: computeGeneListMembershipMatrix(state),
});

export default connect(mapStateToProps)(GeneListPivot)
