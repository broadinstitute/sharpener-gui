// local components
import React, {Fragment} from 'react';
import ProducerControls from './components/ProducerControls.js'
import {MyLoader} from './components/ListItem.js'
import {FEATURE_FLAG} from "./parameters/FeatureFlags";

// remote components
// libraries
import _ from "underscore"
// stylesheets
import './App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'font-awesome/css/font-awesome.min.css';
import TransformerControls, {TransformerCurrentQuery, TransformerQuerySender, TransformerList} from "./components/TransformerControls";
import GeneFeed from "./components/GeneFeed";
import GeneTable from './components/GeneFeed.js';
import Card from "react-bootstrap/Card";
import BootstrapTable from "react-bootstrap-table-next";

// TODO: refactor for importing across app
const FRONTEND_URL =  process.env.REACT_APP_FRONTEND_URL;
const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const divStyle = {
    margin:"2.25em"
};

const transformerMenuStyle = {
    marginTop: "18px",
    marginBottom: "20px",
};


class App extends React.Component {
    componentWillMount() {
        this.getTransformers()
    }

    constructor(props) {
        super(props);
        this.state = {
            // TODO: initialize the producer and transformer info lists from the sharpeners?
            // these should default to a false-y value to allow us to check for their full presence
            producers: null,
            expanders: null,
            transformers: null,

            // gene list creation state
            selectedProducer: null,

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
        this.handleTextChange = this.handleTextChange.bind(this);
    }

    getTransformers = () => {
        console.log("get transformers");
        fetch(SERVICE_URL.concat('/transformers'))
            .then(response => response.json())
            .then(response => { console.log(response); return response; })
            .then(data => {
                if (data === undefined || data.length === 0) {
                    throw "No data or undefined data";
                } else {
                    this.setState({transformers: data},
                        () => {
                        console.log("received", this.state.transformers);
                        const defaultProducer = {
                            name: "Gene Symbols",
                            function: "producer",
                            parameters: [{name: "gene symbol", type: "list"}], // TODO: can we always assume producers have a single parameter for input?
                            // TODO: Gene ID sources/types returned? Link up with Biolink Schema's context/JSON-LD?
                        };
                        this.setState({selectedProducer: defaultProducer});
                        const onlyProducers = this.state.transformers.filter((item) => { return item['function'] === 'producer' });
                        this.setState({producers: [defaultProducer].concat(onlyProducers)});

                        const onlyExpanders =  this.state.transformers.filter((item) => { return item['function'] === 'expander' });
                        this.setState({ expanders: [].concat(onlyExpanders) });
                    });

                }
                return data;
            })
            .catch(error => {
                console.log(error);
            });
    };

    // DONE - RC2
    queryTransformer = (transformerQuery) => {
        // remember: returning fetch, a Promise, doesn't return its result, but rather just the promise
        return fetch(SERVICE_URL.concat('/transform'), {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(transformerQuery)
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data === undefined || data === null || data.length === 0 ) {
                                throw "Data is undefined or not there"
                            } else {
                                // Should be the same thing that emits status of query being run/loading?
                                if (data.genes && data.genes.length > 0) {
                                    this.setState({gene_list_ids: this.state.gene_list_ids.concat(data.gene_list_id)},
                                        () => {
                                            console.log("new gene list ids", this.state.gene_list_ids, "with", data.gene_list_id);

                                    });

                                } else {
                                    console.log("no gene data received from", transformerQuery);
                                }
                            }
                        })
    };

    handleProducerSelect = (producerName) => {
        const selectedProducer = this.state.producers.filter(producer => { return producer.name === producerName})[0];
        this.setState({selectedProducer: selectedProducer}, () => {
            console.log("you changed your producer how exciting", selectedProducer); });
    };

    postGeneList = (geneList) => {
          return fetch(SERVICE_URL.concat("create_gene_list"),
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(geneList)
            })
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data === null || data.length === 0 ) {
                    throw "Data is undefined or not there"
                } else {
                    console.log(data);

                    // log the gene list
                    if (FEATURE_FLAG.notUniqueGeneList) {
                        this.setState({gene_list_ids: this.state.gene_list_ids.concat([data.gene_list_id])},
                            () => {
                                console.log(
                                    "gene list id for input ".concat(geneList),
                                    data.gene_list_id
                                );
                                console.log(
                                    "new gene ids given input",
                                    this.state.gene_list_ids
                                );

                                // TODO: need to emit query results to UI somehow
                                if (FEATURE_FLAG.histories.emitOperationToLedger) {
                                    let time = new Date().getTime();
                                    let stateCopy = {...this.state};
                                    console.log(stateCopy)
                                    // no such thing as a create list query
                                    // stateCopy.transactionLedger[time][data.gene_list_id] = {
                                    //     name: "create_gene_list",
                                    //     function: "create",
                                    //     controls: [
                                    //         {name: "gene_symbols", value: geneList}
                                    //     ]
                                    // };
                                    // this.setState(stateCopy, () => {
                                    //     console.log("transaction ledger", JSON.stringify(stateCopy.transactionLedger[time][data.gene_list_id])); })
                                }

                            });
                    } else {
                        this.setState({gene_list_ids: [data.gene_list_id]} ,
                            () => {
                                console.log(
                                    "gene list id for input ".concat(geneList),
                                    data.gene_list_id
                                );
                                console.log(
                                    "new gene ids given input ".concat(geneList),
                                    this.state.gene_list_ids
                                );
                            });
                    }

                }
            })
            .catch(error => {
                console.error(error)
            });
    };

    handleTextChange(e) {
        this.setState({searchText : e.target.value});
    }

    updateText = (newText) => {
        console.log("attempting to update text");
        let addedText = (newText) => {
            if (this.state.searchText === undefined || this.state.searchText === '') {
                return newText;
            } else {
                return this.state.searchText.concat(", ").concat(newText);
            }
        };
        this.setState({ searchText : addedText(newText) });
    };

    updateExpanderSelection = (selectedExpander) => {
        !(this.state.selectedExpanders.map(prevSelectedExpander => prevSelectedExpander.name).includes(selectedExpander.name)) ?
            this.setState(
                {selectedExpanders: this.state.selectedExpanders.concat([selectedExpander]) },
                () => console.log("added expander".concat(selectedExpander.name), this.state.selectedExpanders)) :
            // deselect -> remove from selectedExpanders list
            this.setState(
                {selectedExpanders: this.state.selectedExpanders.filter(el => el.name !== selectedExpander.name) },
                () => console.log("remove expander ".concat(selectedExpander.name), this.state.selectedExpanders));
    };

    updateGeneListSelection = (selectedGeneListID) => {
        !(this.state.selectedGeneListsByID.includes(selectedGeneListID)) ?
            this.setState(
                {selectedGeneListsByID: this.state.selectedGeneListsByID.concat([selectedGeneListID]) },
                () => console.log("added gene list ".concat(selectedGeneListID), this.state.selectedGeneListsByID)) :
            // deselect -> remove from selectedGeneListsByID list
            this.setState(
                {selectedGeneListsByID: this.state.selectedGeneListsByID.filter(el => el !== selectedGeneListID) },
                () => console.log("remove gene list ".concat(selectedGeneListID), this.state.selectedGeneListsByID));

        // TODO: this is a form of responsibility incohesion that I need to figure out.
        //  It's stemming from the way that Aggregation currently is placed.
        // TODO: need to decouple updating, posting, and addition to the feed
        if(!(this.state.gene_list_ids.includes(selectedGeneListID))) {
            this.setState({gene_list_ids: this.state.gene_list_ids.concat([selectedGeneListID])});

            // TODO: Should the Transformers also exhibit this behavior?
            if(FEATURE_FLAG.alwaysUpdateToLatestGeneList.aggregator) {
                this.setState({selectedGeneListsByID: [].concat([selectedGeneListID])});
            }

        }
    };

    clearSelections = () => {
        this.setState({selectedExpanders: []});
        this.setState({selectedGeneListsByID: []});
    };

    clearGeneListHandler = (e) => {
        console.log("clearing gene list", e.target.value);
        const geneListID = e.target.value;
        this.clearGeneList(geneListID);
    };

    clearGeneList = (clearedGeneListID) => {
        const tempGeneLists = this.state.gene_list_ids.slice(0);
        this.setState({gene_list_ids: tempGeneLists.filter(el => el !== clearedGeneListID)});
        this.setState({selectedGeneListsByID: this.state.selectedGeneListsByID.filter(el => el !== clearedGeneListID)});

        if (FEATURE_FLAG.undoGeneLists) {
            this.updateUndoStack([clearedGeneListID])
        }
    };

    clearGeneLists = () => {
        const tempGeneLists = this.state.gene_list_ids.slice(0);
        tempGeneLists.forEach(geneListID => {
            this.setState({selectedGeneListsByID: this.state.selectedGeneListsByID.filter(el => el !== geneListID)});
        });

        if (FEATURE_FLAG.undoGeneLists) {
            this.updateUndoStack(tempGeneLists);
        }

        this.setState({gene_list_ids:[]});
    };

    updateUndoStack = (batchOfGeneListIDs) => {
        let tempUndoGeneLists = this.state.recently_cleared_gene_lists;
        tempUndoGeneLists.push(batchOfGeneListIDs);
        this.setState({recently_cleared_gene_lists: tempUndoGeneLists}, () => {
            console.log("adding a gene list to the undo stack", this.state.recently_cleared_gene_lists);
        });
    };

    undoClearGeneLists = () => {
        const tempUndoneGeneLists = this.state.recently_cleared_gene_lists.slice(0);

        // if they were cleared, and another gene set was added, these should go before that gene set
        this.setState({ gene_list_ids: this.state.gene_list_ids.concat(tempUndoneGeneLists.pop()) });
        // no partial clearings/unclearings?
        // TODO: pop list off of list of list
        // Undo history is queue: first in last out
        this.setState({ recently_cleared_gene_lists: tempUndoneGeneLists });

    };

    render() {
        return (
            <div style={divStyle}>
                {/*<div className="container-fluid">*/}
                {/*    <h1>STAR Gene Transformer</h1><br/>*/}
                {/*</div>*/}
                <div className="container-fluid">
                    <div className="row">
                        {/* Gene Lists */}
                        <div className="col-sm-9">
                            <h3>Producers</h3>
                            {/* Producer Components */}
                            {this.state.producers ?
                                <ProducerControls searchText={this.state.searchText}
                                                  selectedProducer={this.state.selectedProducer}
                                                  producers={this.state.producers}
                                                  queryPromise={this.queryTransformer}
                                                  handleGeneListCreation={this.postGeneList}
                                                  handleProducerSelect={this.handleProducerSelect}
                                                  handleTextChange={this.handleTextChange}/>
                                : <MyLoader active={true}/>}
                            {/* Tables of Genes */}
                            <div className={"row"} style={{padding:"15px", paddingTop: "0%"}}>
                                <h4>Gene Lists</h4>
                                <div style={{marginLeft: "auto", marginRight: 0}}>
                                    { this.state.gene_list_ids.length > 0 ?
                                        <button onClick={ this.clearGeneLists }>Clear Gene Lists</button>
                                        : <button onClick={ this.clearGeneLists } disabled>Clear Gene Lists</button>}
                                    { this.state.recently_cleared_gene_lists.length > 0 ?
                                        <React.Fragment>
                                            {'\u00A0'}{'\u00A0'}<button onClick={ this.undoClearGeneLists }>Undo</button>
                                        </React.Fragment> :
                                        <React.Fragment>
                                            {'\u00A0'}{'\u00A0'}<button onClick={ this.undoClearGeneLists } disabled>Undo</button>
                                        </React.Fragment>
                                    }
                                </div>
                            </div>
                            {this.state.gene_list_ids ?
                                <React.Fragment>
                                    {/*<h6>Previous Gene Sets</h6>*/}
                                    <GeneFeed
                                        geneListIDs={ this.state.gene_list_ids }
                                        handleGeneListSelection={ this.updateGeneListSelection }
                                        handleGeneSelection={ this.updateText }
                                        clearGeneListHandler={ this.clearGeneListHandler }
                                    />
                                </React.Fragment>
                                : <MyLoader active={true}/> }
                        </div>

                        <div className="col-sm-3" style={{transformerMenuStyle}}>

                            <h3>Expanders</h3>
                            {this.state.expanders && this.state.expanders.length > 0 ?
                            <TransformerControls
                                expanders={ this.state.expanders }
                                selectedGeneLists={ this.state.selectedGeneListsByID }
                                selectedExpanders={ this.state.selectedExpanders }
                                handleExpanderSelection={ this.updateExpanderSelection }
                                handleGeneListSelection={ this.updateGeneListSelection }
                                queryPromise={ this.queryTransformer }/> : <MyLoader active={true}/> }
                            {/*{ this.state.selectedExpanders.length > 0 || this.state.selectedGeneListsByID.length > 0 ?*/}
                            <button className="btn my-2 my-sm-0"
                                    style={{padding:"0%", fontSize: "small", float: "right"}}
                                    onClick={this.clearSelections}>
                                Clear Selections
                            </button>
                            {/*: <React.Fragment></React.Fragment>}*/}
                        </div>

                    </div>

                </div>

            </div>
        );
    }

}

export default App;
