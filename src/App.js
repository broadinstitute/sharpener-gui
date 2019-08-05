// local components
import React from 'react';
import SearchBar from './components/SearchBar.js'
import GeneTable from './components/GeneFeed.js';
import {MyLoader} from './components/ListItem.js'
// remote components
// libraries
import _ from "underscore"
// stylesheets
import './App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'font-awesome/css/font-awesome.min.css';
import TransformerControls from "./components/TransformerMenu";

const FRONTEND_URL =  process.env.REACT_APP_FRONTEND_URL;
const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const divStyle = {
    margin:"2.25em"
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
                        name: "Basic Gene Set Producer",
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
            name: transformerControls.expander.name,
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
                        .then(data => { console.log(data) })
    };

    handleProducerChange = (event) => {
        const selectedProducer = this.state.producers.filter(producer => { return producer.name === event.target.value})[0];
        this.setState({selectedProducer: selectedProducer});
    };

    handleGeneListCreation = () => {
        let queryProducer = this.queryTransformer;
        let createGeneList = this.postGeneList;

        if (this.state.searchText) {
            let geneList = this.state.searchText.split(',');

            // TODO: need to abstract out this producer name so it doesn't become a magic value
            if (this.state.selectedProducer && this.state.selectedProducer === "Basic Gene Producer") {

                let producerGenes = new Promise(queryProducer(geneList, this.state.selectedProducer));
                producerGenes.resolve()
                    .then(response => response.json())
                    .then(data => { console.log(data); })
                    .then(data => {
                        // get new gene list from data?
                        let newGeneList = data.genes // map out to gene Ids
                        return new Promise(createGeneList(newGeneList));
                    })

            } else {
                this.postGeneList(geneList);
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
                }
            })
            .catch(error => {
                console.error(error)
            });
    };

    handleTextChange(e) {
        this.setState({searchText : e.target.value});
    }

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
                                <SearchBar producers={this.state.producers}
                                           handleGeneListCreation={this.handleGeneListCreation}
                                           handleProducerSelect={this.handleProducerChange}
                                           handleTextChange={this.handleTextChange}/> :
                                <MyLoader active={true}/>}

                            {/* Tables of Genes */}
                            { this.state.gene_list_ids.length > 0 ?
                                this.state.gene_list_ids
                                    .map(gene_list_id => {
                                        return <GeneTable geneListID={ gene_list_id }
                                                          handleGeneListSelection={ this.updateGeneListSelection }/>
                                    })
                                : <MyLoader active={true}/> }
                        </div>

                        {/* Expander Components */}
                        <div className="col-sm-3">
                            <h3>Expanders</h3>
                            {this.state.expanders ?
                            <TransformerControls
                                expanders={this.state.expanders}
                                currentSelections ={{ selectedGeneLists: this.state.selectedGeneListsByID, selectedExpanders: this.state.selectedExpanders }}
                                handleExpanderSelection={ this.updateExpanderSelection }
                                queryPromise={ this.queryTransformer }
                            /> : <MyLoader active={true}/>}
                        </div>

                    </div>
                </div>

            </div>
        );
    }

}

export default App;
