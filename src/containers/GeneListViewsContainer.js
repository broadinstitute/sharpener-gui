import React, { Component } from 'react';
import {connect} from "react-redux";
import GeneListViewsLayout from "../components/Navigation/GeneListViewsLayout";

const mapStateToProps = state => ({
    geneListIds: state => state.geneLists.Ids,
    selectedGeneListIds: state => state.geneLists.selectedMultipleGeneListsById
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(GeneListViewsLayout)
