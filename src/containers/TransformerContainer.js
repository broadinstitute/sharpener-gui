import { useEffect } from 'react';
import {connect} from "react-redux";
import {} from "../actions";
import Transformer from "../components/TransformerDraft/Transformer";
import {fetchGeneListTransformation, fetchGeneListAggregation} from "../actions";

const mapStateToProps = (state, ownProps) => ({
    geneListsByID: state.app.geneListsByID
});

const mapDispatchToProps = {
    fetchGeneListTransformation,
    fetchGeneListAggregation
};

export default connect(mapStateToProps, mapDispatchToProps)(Transformer)
