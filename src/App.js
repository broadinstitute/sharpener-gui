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
import TransformerList, {TransformerQuerySender, TransformerCurrentQuery} from "./components/TransformerMenu";

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
            selectedGeneListsByID: ["LQuc2bN6fE"],
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
    queryTransformer = () => {
        // TODO: add args

        // TODO: remember to stringify the parameter number?
        let transformerQuery = {
            name: "DepMap correlation expander",
            gene_list_id: "LQuc2bN6fE",
            controls: [
                { name: "correlation threshold", value: "0.5" },
                { name: "correlated values", value: "gene knockout" }
            ]
        };
        fetch(SERVICE_URL.concat('/transform'), {
                            method: "POST",
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(transformerQuery)
                        })
                        .then(response => response.json())
                        .then(data => { console.log(data) })
    }

    // TODO
    queryTransformers = () => {
        // TODO: GET THE QUERY VALUES! THE FORM VALUES ARE NOT IN THE SELECTED EXPANDER STATE

        // This takes the selected expanders and genelists, and returns an aggregate of all of the results
        // that come from applying each selected transformer to each selected gene list

        // Let's be heroes
        // https://stackoverflow.com/a/43053803
        const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));  // pair constructor
        const cartesian = (a, b, ...c) => (b ? cartesian(f(a, b), ...c) : a);   // tensor operator/recursively constructed onto mapping...
        // yeah this could be simpler -- it's only complicated because it's the general case

        // TODO: safer to pass these in as arguments for query transformer: how to do this from a child react component? event?
        // answer is probably "from the events"
        const transformerPreQueries =
            cartesian(this.state.selectedGeneListsByID, this.state.selectedExpanders)
                .map((result) => {
                    console.log("parameter-gene list pairs", result);
                    return result;
                });

        let transformerQueries = transformerPreQueries.map(geneListTransformerPair => {

            const gene_list_id = geneListTransformerPair[0];
            const selectedExpander = geneListTransformerPair[1];

            // transformer query object
            return {
                name: selectedExpander.name,
                gene_list_id: gene_list_id,
                controls: selectedExpander.controls
            };

        });

        transformerQueries.map((result) => {
            console.log("upcoming transformer queries", result);
        });

        // transformerQueries.map(transformerQuery => {
        //     return new Promise(
        //         // Abandon all hope: Async Hell Ahoy
        //         // TODO: https://stackoverflow.com/a/41516919
        //         fetch(SERVICE_URL.concat('/transform'), {
        //                 method: "POST",
        //                 headers: {
        //                     'Accept': 'application/json',
        //                     'Content-Type': 'application/json'
        //                 },
        //                 body: JSON.stringify(transformerQuery)
        //             })
        //             .then(response => response.json())
        //             .then(data => { console.log(data) })
        //     )
        // });
    };

    handleProducerChange = (event) => {
        const selectedProducer = this.state.producers.filter(producer => { return producer.name === event.target.value})[0];
        this.setState({selectedProducer: selectedProducer});
    };

    handleGeneListCreation = () => {
        if (this.state.searchText) {
            let geneList = this.state.searchText.split(',');

            // TODO: update with producer code user
            fetch(SERVICE_URL.concat("create_gene_list"),
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
        }
    };

    handleTextChange(e) {
        this.setState({searchText : e.target.value});
    }

    updateExpanderSelection = (chosenExpanderWithControls) => {
        console.log(chosenExpanderWithControls);
        !(this.state.selectedExpanders
            .map(selectedExpanderWithControls => selectedExpanderWithControls.name)
            .includes(chosenExpanderWithControls.name)) ?
            this.setState(
                {selectedExpanders: this.state.selectedExpanders.concat([chosenExpanderWithControls]) },
                () => console.log("added expander".concat(chosenExpanderWithControls.name), this.state.selectedExpanders)) :
            this.setState(
                {selectedExpanders: this.state.selectedExpanders.filter(el => el.name !== chosenExpanderWithControls.name) },
                () => console.log("remove expander ".concat(chosenExpanderWithControls.name), this.state.selectedExpanders));
    };

    updateGeneListSelection = (chosenGeneListID) => {
        !(this.state.selectedGeneListsByID.includes(chosenGeneListID)) ?
            this.setState(
                {selectedGeneListsByID: this.state.selectedGeneListsByID.concat([chosenGeneListID]) },
                () => console.log("added gene list ".concat(chosenGeneListID), this.state.selectedGeneListsByID)) :
            this.setState(
                {selectedGeneListsByID: this.state.selectedGeneListsByID.filter(el => el !== chosenGeneListID) },
                () => console.log("remove gene list ".concat(chosenGeneListID), this.state.selectedGeneListsByID));
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
                        <div className="col-sm-8">
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
                        <div className="col-sm-4">
                            <h3>Expanders</h3>
                            <TransformerQuerySender
                                selectedGeneLists={ this.state.selectedGeneListsByID }
                                selectedExpanders={ this.state.selectedExpanders }
                                onClickCallback = { this.queryTransformer }
                            />
                            <TransformerCurrentQuery
                                currentSelections = {{ selectedGeneLists: this.state.selectedGeneListsByID, selectedExpanders: this.state.selectedExpanders }}
                            />
                            {this.state.expanders ?
                                <TransformerList
                                    handleExpanderSelection={ this.updateExpanderSelection  }
                                    expanders={ this.state.expanders }/>
                                : <MyLoader active={true}/>}
                        </div>

                    </div>
                </div>

            </div>
        );
    }

}

export default App;
