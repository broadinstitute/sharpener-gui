import React, { Component } from 'react';
import {connect} from "react-redux";
import {createGeneList} from "../actions";
import {GenePivotNivo} from "../components/GeneListPivot/GenePivotNivo";

const mapStateToProps = (state, ownProps) => ({
    geneListIds: state.geneLists.Ids,
    geneListsById: state.geneLists.byId
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(GenePivotNivo);
