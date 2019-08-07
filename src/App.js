// local components
import React from 'react';
import ProducerControls from './components/ProducerControls.js'
import {MyLoader} from './components/ListItem.js'
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


const FRONTEND_URL =  process.env.REACT_APP_FRONTEND_URL;
const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const FEATURE_FLAG = {
    alwaysUpdateToLatestGeneList: {
        aggregator: true
    },
    notUniqueGeneList: true,
    undoGeneLists: true
};

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
            gene_list_ids: ["LQuc2bN6fE"],
            recently_cleared_gene_lists: [],

            // transformer query
            selectedGeneListsByID: [],
            selectedExpanders: []
        };

        this.handleGeneListCreation = this.handleGeneListCreation.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
    }

    getTransformers = () => {
        fetch(SERVICE_URL.concat('/transformers'))
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data.length === 0) {
                    throw "No data or undefined data";
                } else {
                    this.setState({transformers: data, curieIsClickEnabled: true, curieIsLoading: false});

                    const defaultProducer = {
                        name: "Gene Symbols",
                            function: "producer",
                            parameters: [], // TODO: can we always assume producers have a single parameter for input?
                            genes: [],
                        // TODO: Gene ID sources/types returned? Link up with Biolink Schema's context/JSON-LD?
                    };
                    this.setState({selectedProducer: defaultProducer});
                    const onlyProducers = this.state.transformers.filter((item) => { return item['function'] === 'producer' });
                    this.setState({producers: [defaultProducer].concat(onlyProducers)});

                    const onlyExpanders =  this.state.transformers.filter((item) => { return item['function'] === 'expander' });
                    this.setState({ expanders: [].concat(onlyExpanders) });
                }
            })
            .catch(error => {
                console.log(error);
            });
    };

    // TODO
    queryTransformer = (geneListId, transformerControls) => {
        let transformerQuery = {
            gene_list_id: geneListId,
            name: transformerControls.transformer.name,
            controls: Object.values(transformerControls.controls)
                .map(control => {
                    return { name: control.parameter.name, value: control.value }
                })
        };
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
                            this.setState({gene_list_ids: this.state.gene_list_ids.concat(data.gene_list_id)},
                                () => {
                                        console.log("new gene list ids", this.state.gene_list_ids, "with", data.gene_list_id);
                                });
                        })
    };

    handleProducerChange = (event) => {
        const selectedProducer = this.state.producers.filter(producer => { return producer.name === event.target.value})[0];
        this.setState({selectedProducer: selectedProducer});
    };

    handleGeneListCreation = () => {

        let queryProducer = this.queryTransformer;
        let promiseNewGeneList = this.postGeneList;

        if (this.state.searchText) {
            let geneList = this.state.searchText.split(', ');
            console.log(geneList);

            console.log("selected producer", this.state.selectedProducer);
            let producerControls = {
                transformer: this.state.selectedProducer,
                controls: [
                    // TODO: map the searchText to the controls for the gene producer <-- probably entails redesigning those controls
                    // Make the assumption that all producers have a mono-control schema
                    // implies that the producer control and the form input has 1-1 correspondence as each is unique
                    // thus the mapping is fully determined and we can map to the first control
                ]
            };

            // TODO: need to abstract out this producer name so it doesn't become a magic value
            if (this.state.selectedProducer.name !== "Gene Symbols") {
                let producerGenes = new Promise(queryProducer(geneList, this.state.selectedProducer));

                // helpful for understanding promise chaining: https://stackoverflow.com/a/36877743
                Promise.resolve(producerGenes)
                    .then(response => response.json())
                    .then(data => { console.log(data); })
                    .then(data => {
                        // get new gene list from data?
                        let newGeneList = data.genes.map(geneInfo => geneInfo.gene_id);  // map out to gene Ids, which are create_gene_list's bread and butter
                        return new Promise(promiseNewGeneList(newGeneList));
                    })

            } else {
                Promise.resolve(promiseNewGeneList(geneList));
            }
        }

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
                if (data === undefined || data.length === 0) {
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
                                    "new gene ids given input ".concat(geneList),
                                    this.state.gene_list_ids
                                );
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
                    </div>

                    <div className="row">
                        {/* Gene Lists */}
                        <div className="col-sm-9">
                            <h3>Producers</h3>
                            {/* Producer Components */}
                            {this.state.producers ?
                                <ProducerControls searchText={this.state.searchText}
                                                  producers={this.state.producers}
                                                  handleGeneListCreation={this.handleGeneListCreation}
                                                  handleProducerSelect={this.handleProducerChange}
                                                  handleTextChange={this.handleTextChange}/>
                                : <MyLoader active={true}/>}
                            {/* Tables of Genes */}
                            <div className={"row"} style={{padding:"15px", paddingTop: "0%"}}>
                                <h4>Gene Sets</h4>
                                <div style={{marginLeft: "auto", marginRight: 0}}>
                                    <button onClick={ this.clearGeneLists }>Clear Gene Sets</button>
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
                            <TransformerControls
                                expanders={ this.state.expanders }
                                selectedGeneLists={ this.state.selectedGeneListsByID }
                                selectedExpanders={ this.state.selectedExpanders }
                                handleExpanderSelection={ this.updateExpanderSelection }
                                handleGeneListSelection={ this.updateGeneListSelection }
                                queryPromise={ this.queryTransformer }/>
                            <button className="btn my-2 my-sm-0"
                                    style={{padding:"0%", fontSize: "small"}}
                                    onClick={this.clearSelections}>
                                Clear Selections
                            </button>
                        </div>

                    </div>

                </div>

            </div>
        );
    }

}

export default App;
