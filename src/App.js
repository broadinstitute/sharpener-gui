// App scaffolding
import React, {Fragment} from 'react';
import { connect } from 'react-redux';
import {
    getTransformers,
    getExpandersFromTransformers,
    getProducersFromTransformers,
    clearAllSelectedGeneLists,
    clearSingleSelectedGeneList,
    clearExpanderSelections,
    clearFilterSelections,
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
    computeGeneListName, toggleFilterSelection
} from "./actions"
import {tap} from './helpers'

// local components
import ProducerControls from './components/ProducerControls/ProducerControls.js'
import AggregatorControls from "./components/AggregatorControls/AggregatorControls";
import TransformerControls from "./components/TransformerControls/TransformerControls";
import TransformerHistory from "./components/TransformerHistory/TransformerHistory";
import GeneTabs from "./components/GeneFeed/GeneFeed";
import Spinner from "./elements/Spinner/Spinner";
import {InlineSpinner} from "./elements/InlineSpinner/InlineSpinner";

// app configurations
import {FEATURE_FLAG} from "./parameters/FeatureFlags";
import {FRONTEND_URL, SERVICE_URL} from "./parameters/EndpointURLs"

// stylesheets
import './style/App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'font-awesome/css/font-awesome.min.css';

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
                        {/* Welcome to the...*/}
                        <h1>Gene List Sharpener</h1>

                        {/* Async Status */}
                        <span style={{paddingLeft:"15px", display: "inline-block", margin:"10px 0 10px 0"}}>
                            {this.props.loading ?
                                <Fragment>
                                    <InlineSpinner/><span>Loading {this.props.loadingQueryNames.join(", ")}</span>
                                </Fragment>
                                : "No Transformers Running" }
                        </span>

                        {/* Producers */}
                        {this.props.producers ?
                            <ProducerControls
                                selectedProducer={this.props.selectedProducer}
                                producers={this.props.producers}
                                queryPromise={this.props.produceGenes}
                                handleGeneListCreation={this.props.createGeneList}
                                handleProducerSelect={this.props.selectProducer}/>
                            : <Spinner/>}

                        {/* Transformers: Expanders & Filters */}
                        <h4>Expanders</h4>
                        {this.props.expanders && this.props.expanders.length > 0 ?
                            <TransformerControls
                                style={transformerControlsStyle}
                                expanders={ this.props.expanders }
                                selectedGeneLists={ this.props.selectedGeneListsByID }
                                selectedExpanders={ this.props.selectedExpanders }
                                handleExpanderSelection={ this.props.toggleExpanderSelection }
                                handleGeneListSelection={ this.props.toggleGeneListSelection }
                                clearSelections={ this.props.clearExpanderSelections}
                                queryPromise={ this.props.transformGenes }
                            />
                        : <Spinner/> }

                        <h4>Filters</h4>
                        {this.props.filters && this.props.filters.length > 0 ?
                            <TransformerControls
                                style={transformerControlsStyle}
                                expanders={ this.props.filters }
                                selectedGeneLists={ this.props.selectedGeneListsByID }
                                selectedExpanders={ this.props.selectedFilters }
                                handleExpanderSelection={ this.props.toggleFilterSelection }
                                handleGeneListSelection={ this.props.toggleGeneListSelection }
                                clearSelections={ this.props.clearFilterSelections}
                                queryPromise={ this.props.transformGenes }
                            />
                        : <Spinner/> }

                        {/* Aggregators */}
                        <h4>Aggregators</h4>
                        <AggregatorControls
                            currentSelections={this.props.selectedGeneLists}
                            aggregateGenes={ this.props.aggregateGenes }
                            operations={ ["union", "intersection", "difference", "symmetric difference"] }
                        /><br/>

                    </div>


                    {/* Gene Lists */}
                    <div className="col-sm-9">
                        <div className={"row"}>

                            {/* Transformer Operations for Session (Visualized as a Graph) */}
                            <TransformerHistory
                                    geneListIDs={ this.props.gene_list_ids }
                                    computeGeneListName={ this.props.computeGeneListName }
                                    clearGeneList={ this.props.clearSingleGeneList }
                                    handleGeneListSelection={ this.props.toggleGeneListSelection }
                                    differenceGenes={ this.props.differentiateGeneLists }
                                    transactionLedger={this.props.transactionLedger}/>
                            </div>

                        {/* Gene List Controls */}
                        { this.props.selectedGeneListsByID.length > 0 ?
                            <div className={"row"}>
                                <h4 style={{paddingLeft: "15px"}}>Selected Gene Lists</h4>
                                <div style={{marginLeft: "auto", marginRight: "15px"}}>
                                    {/* Clear Gene Tables */}
                                    { this.props.selectedGeneListsByID.length > 0 ?
                                        <button onClick={ this.props.clearAllGeneLists }>Clear Gene Lists</button>
                                        : <button disabled>Clear All Selections</button>}
                                    { this.props.recently_cleared_gene_lists.length > 0 ?
                                        <React.Fragment>
                                            {'\u00A0'}{'\u00A0'}
                                            <button onClick={ this.props.undoLastClear }>Undo Last Clear</button>
                                        </React.Fragment> :
                                        <React.Fragment>
                                            {'\u00A0'}{'\u00A0'}
                                            <button disabled>Undo</button>
                                        </React.Fragment>
                                    }
                                </div>
                            </div>
                        : <Fragment/>}

                        {/* Tabbed Navigation */}
                        {this.props.gene_list_ids ?
                            <div className={"row"}>
                                <GeneTabs
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
    clearAllGeneLists: clearAllSelectedGeneLists,
    clearSingleGeneList: clearSingleSelectedGeneList,
    clearExpanderSelections,
    clearFilterSelections,
    undoLastClear,
    createGeneList,
    produceGenes,
    aggregateGenes,
    transformGenes,
    selectProducer,
    toggleFilterSelection,
    toggleExpanderSelection,
    toggleGeneListSelection,
    differentiateGeneLists,
    computeGeneListName
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(App);