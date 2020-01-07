import {connect} from "react-redux";
import { createSelector } from "reselect";
import GeneListTabsFunction from "../components/GeneListTabs/GeneListTabs";

const selectedGeneListIdMultipleSelector = state => state.geneLists.selectedMultipleGeneListsById;

const transactionSelector = state => state.app.transactionLedger;
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

const mapStateToProps = (state, ownProps) => ({
    selectedGeneListIds: selectedGeneListIdMultipleSelector(state),
    transformerName: nameSelector(state),
    normalizedGeneLists: state.geneLists.byId
});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(GeneListTabsFunction)
