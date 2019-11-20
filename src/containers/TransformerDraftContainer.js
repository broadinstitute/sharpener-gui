import { useEffect } from 'react';
import {connect} from "react-redux";
import TransformerDraft from "../components/TransformerDraft/TransformerDraft";
import {fetchTransformers} from "../actions";

const mapStateToProps = (state, ownProps) => ({
    transformers: state.transformers.transformers.filter(transformer => transformer.name !== "Custom Gene List"),  // TODO: Hack
    selectedTransformers: state.transformers.selectedTransformersByName
});

const mapDispatchToProps = {
    fetchTransformers
};

export default connect(mapStateToProps, mapDispatchToProps)(TransformerDraft)
