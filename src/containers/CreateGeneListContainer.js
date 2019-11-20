import React, { Component } from 'react';
import {connect} from "react-redux";
import CreateGeneList from "../components/CreateGeneList/CreateGeneList";
import {createGeneList} from "../actions";

const mapStateToProps = (state, ownProps) => ({

});

const mapDispatchToProps = dispatch => ({
    createGeneList: geneSymbols => dispatch(createGeneList(geneSymbols))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateGeneList);
