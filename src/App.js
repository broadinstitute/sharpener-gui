// App scaffolding
import React, {Fragment} from 'react';
import { connect } from 'react-redux';
import {
    getTransformers,
    getExpandersFromTransformers,
    getProducersFromTransformers,
    clearAllSelectedGeneLists,
    clearSingleSelectedGeneList,
    clearSelections,
    undoLastClear,
    createGeneList,
    displayNewGeneList,
    produceGenes,
    aggregateGenes,
    transformGenes,
    selectProducer,
    toggleExpanderSelection,
    toggleGeneListSelection,
    differentiateGeneLists,
    computeGeneListName
} from "./actions"
import {store} from "./store";
import {tap} from './helpers'

// local components
import Spinner from "./elements/Spinner/Spinner";
import ProducerControls from './components/ProducerControls/ProducerControls.js'
import TransformerControls from "./components/TransformerControls/TransformerControls";
import GeneFeed from "./components/GeneFeed/GeneFeed";
import TransformerHistory from "./components/TransformerHistory/TransformerHistory";

// app configurations
import {FEATURE_FLAG} from "./parameters/FeatureFlags";
import {FRONTEND_URL, SERVICE_URL} from "./parameters/EndpointURLs"

// stylesheets
import './style/App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'font-awesome/css/font-awesome.min.css';
import {InlineSpinner} from "./elements/InlineSpinner/InlineSpinner";

const divStyle = {
    margin:"2.25em"
};

const transformerMenuStyle = {
    marginTop: "18px",
    marginBottom: "20px",
};

const transformerControlsStyle = {
    overflowY: "scroll",
};



class App extends React.Component {
    componentDidMount() {
        this.props.getTransformers(tap);
    }

    render() {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-3" style={{transformerMenuStyle}}>
                        <h1>Gene Sharpener</h1>
                        <span style={{paddingLeft:"15px", display: "inline-block", margin:"10px 0 10px 0"}}>
                                    {this.props.loading ?
                                        <Fragment>
                                            <InlineSpinner/><span>Loading {this.props.loadingQueryNames.join(", ")}</span>
                                        </Fragment>
                                        : "No Transformers Running" }
                        </span>
                        {/* Producer Components */}
                        {this.props.producers ?
                            <ProducerControls
                                selectedProducer={this.props.selectedProducer}
                                producers={this.props.producers}
                                queryPromise={this.props.produceGenes}
                                handleGeneListCreation={this.props.createGeneList}
                                handleProducerSelect={this.props.selectProducer}/>
                            : <Spinner/>}
                        {this.props.expanders && this.props.expanders.length > 0 ?
                            <TransformerControls
                                style={transformerControlsStyle}
                                expanders={ this.props.expanders }
                                filters={ this.props.filters }
                                selectedGeneLists={ this.props.selectedGeneListsByID }
                                selectedExpanders={ this.props.selectedExpanders }
                                handleExpanderSelection={ this.props.toggleExpanderSelection }
                                handleGeneListSelection={ this.props.toggleGeneListSelection }
                                clearSelections={ this.props.clearSelections}
                                queryPromise={ this.props.transformGenes }
                                aggregateGenes={ this.props.aggregateGenes }
                            /> : <Spinner/> }
                    </div>
                    {/* Gene Lists */}
                    <div className="col-sm-9">
                        <div className={"row"}>
                            <TransformerHistory
                                    geneListIDs={ this.props.gene_list_ids }
                                    computeGeneListName={ this.props.computeGeneListName }
                                    clearGeneList={ this.props.clearSingleGeneList }
                                    handleGeneListSelection={ this.props.toggleGeneListSelection }
                                    differenceGenes={ this.props.differentiateGeneLists }
                                    transactionLedger={this.props.transactionLedger}/>
                            </div><br/>
                        {/* Tables of Genes */}
                        { this.props.selectedGeneListsByID.length > 0 ?
                            <div className={"row"}>
                                <h4 style={{paddingLeft: "15px"}}>Selected Gene Lists</h4>
                                <div style={{marginLeft: "auto", marginRight: "15px"}}>
                                    {/* Clear Gene Tables */}
                                    { this.props.selectedGeneListsByID.length > 0 ?
                                        <button onClick={ this.props.clearAllGeneLists }>Clear Gene Lists</button>
                                        : <button disabled>Clear Gene Lists</button>}
                                    { this.props.recently_cleared_gene_lists.length > 0 ?
                                        <React.Fragment>
                                            {'\u00A0'}{'\u00A0'}
                                            <button onClick={ this.props.undoLastClear }>Undo</button>
                                        </React.Fragment> :
                                        <React.Fragment>
                                            {'\u00A0'}{'\u00A0'}
                                            <button disabled>Undo</button>
                                        </React.Fragment>
                                    }
                                </div>
                            </div>
                        : <Fragment/>}
                        {this.props.gene_list_ids ?
                            <div className={"row"}>
                                <GeneFeed
                                    geneListIDs={ this.props.selectedGeneListsByID }
                                    computeGeneListName={ this.props.computeGeneListName }
                                    handleGeneListSelection={ this.props.toggleGeneListSelection }
                                    clearGeneList={ this.props.clearSingleGeneList }
                                />
                            </div>
                            : <Spinner/> }
                    </div>

                </div>

            </div>
        )
    }
}

const mapStateToProps = state => {
    return state.app;
};

const mapDispatchToProps = {
    getTransformers,
    getExpandersFromTransformers,
    getProducersFromTransformers,
    clearAllGeneLists: clearAllSelectedGeneLists,
    clearSingleGeneList: clearSingleSelectedGeneList,
    clearSelections,
    undoLastClear,
    createGeneList,
    displayNewGeneList,
    produceGenes,
    aggregateGenes,
    transformGenes,
    selectProducer,
    toggleExpanderSelection,
    toggleGeneListSelection,
    differentiateGeneLists,
    computeGeneListName
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);