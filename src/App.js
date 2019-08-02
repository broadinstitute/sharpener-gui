// local components
import React from 'react';
import SearchBar from './components/SearchBar.js'
import GeneTable from './components/GeneFeed.js';
import {MyLoader} from './components/ListItem.js'


// remote components
import update from 'react-addons-update';
import BootstrapTable from 'react-bootstrap-table-next';

// libraries
import _ from "underscore"

// stylesheets
import './App.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import 'font-awesome/css/font-awesome.min.css';
import TransformerMenu from "./components/TransformerMenu";

const FRONTEND_URL =  process.env.REACT_APP_FRONTEND_URL;
const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const divStyle = {
    marginTop: "30px"
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
            geneListIDs: ["rHotao9c3m"],
            // TODO: meant to emulate a cache for re-rendering
            geneListCache: {
                "rHotao9c3m": {
                    "gene_list_id": "rHotao9c3m",
                    "genes": [
                        {
                            "gene_id": "HGNC:17646",
                            "attributes": [
                                {
                                    "name": "myGene.info id",
                                    "value": "55768",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "gene_symbol",
                                    "value": "NGLY1",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "entrez_gene_id",
                                    "value": "55768",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "HGNC",
                                    "value": "HGNC:17646",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "MIM",
                                    "value": "MIM:610661",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "synonyms",
                                    "value": "CDDG;CDG1V;PNG1;PNGase",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "ensembl_gene_id",
                                    "value": "ENSG00000151092",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "gene_name",
                                    "value": "N-glycanase 1",
                                    "source": "myGene.info"
                                },
                                {
                                    "name": "source",
                                    "value": "user input",
                                    "source": "user input"
                                }
                            ]
                        }
                    ]
                }

            },

            // TODO: ARCHIVE
            sbgn: '',
            imgSrc : null,
            searchText : '',
            curieList: [
                {id: '1', name: 'No Search'}
            ],
            list: [
                {id: 'MONDO:0010863', text: 'No Search',
                    items: [
                        {id: 'MONDO:0012919',text: 'tiny 3'},
                        {id: 'MONDO:0012921',text: 'tiny 2'}
                    ]},
                {id: 'MONDO:0011168',text: 'No Search2'}

            ],

            biomodelList: [
                {pathway_id: 1, name: 'No Search'}
            ],
            curieIsClickEnabled: false,
            geneisClickEnabled: false,
            bioisClickEnabled: false,

            curieIsLoading:false,
            bioisLoading:false,
            descriptionIsLoading:false,

            curieSelected: '',
            description: {}
        };

        this.handleGeneListCreation = this.handleGeneListCreation.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleCurieClick = this.handleCurieClick.bind(this);
        this.handleGeneClick = this.handleGeneClick.bind(this);
        this.handleBiomodelClick = this.handleBiomodelClick.bind(this);
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
                        name: "Genes",
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

    updateProducers = () => {
        const defaultProducer = {
            name: "Genes",
            function: "producer",
            parameters: [], // TODO: can we always assume producers have a single parameter for input?
            genes: [],
            // TODO: Gene ID sources/types returned? Link up with Biolink Schema's context/JSON-LD?
        };
        this.setState({producers: [defaultProducer]});
        this.setState({selectedProducer: defaultProducer});

        fetch(SERVICE_URL.concat('/transformers'))
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data.length === 0) {
                    this.setState({producers: [defaultProducer]})
                } else {
                    const onlyProducers = data.filter((item) => { return item['function'] === 'producer' });
                    this.setState({producers: [defaultProducer].concat(onlyProducers)});
                }
            })
            .catch(error => {
                console.error(error)
            });
    };

    updateExpander = () => {
        fetch(SERVICE_URL.concat('/transformers'))
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data.length === 0) {
                    const newExpanders = this.state.expanders;
                    this.setState({expanders: newExpanders, curieIsClickEnabled: false});
                } else {
                    const onlyExpanders = data.filter(function (item) { return item['function'] === 'expander' });
                    const newExpanders = this.state.expanders.concat(onlyExpanders);
                    this.setState({producers: newExpanders, curieIsClickEnabled: true, curieIsLoading: false});
                }
            })
            .catch(error => {
                const expander = this.state.expanders;
                this.setState({expanders: expander, curieIsClickEnabled: false});
            });
    };

    handleProducerChange = (event) => {
        const selectedProducer = this.state.producers.filter(producer => { return producer.name === event.target.value})[0];
        this.setState({selectedProducer: selectedProducer});
    };

    handleGeneListCreation = () => {
        let geneList = this.state.searchText.split(',');
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
                    let tempGeneListCache = this.state.geneListCache;
                    tempGeneListCache[data.gene_list_id] = data;
                    this.setState({geneListIDs: this.state.geneListIDs.concat([data.gene_list_id]), geneListCache: tempGeneListCache})
                }
            })
            .catch(error => {
                console.error(error)
            });
    };

    handleTextChange(e) {
        this.setState({searchText : e.target.value});
    }

    handleCurieClick(curieItem) {

        this.setState({
            curieIsClickEnabled: true,
            descriptionIsLoading:true,
            curieList: update(this.state.curieList,
                {
                    0: {isLoading: {$set: true}},
                    1: {isLoading: {$set: true}},
                    2: {isLoading: {$set: true}}
                })
        });

        /* TODO: Previous Strategy was to start distributing the computations across modules immediately. This cascaded
         *  out many changes throughout the application. (Not necessarily bad) */
        //Load mod0
        // fetch(SERVICE_URL.concat('/api/workflow/mod0/').concat(curieItem))
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log("FINISH: mod0");
        //         if (data === undefined || data.length === 0) {
        //             data = [{hit_id: 1, hit_symbol: 'No Result'}];
        //         }
        //         this.setState({
        //             curieList: update(this.state.curieList, {0 : {items: {$set: data},
        //                     isLoading:{$set: false}}}),
        //
        //         })})
        //     .catch(error=> {
        //         const data = [{hit_id: 1, hit_symbol: 'No Result'}];
        //         this.setState({
        //             curieList: update(this.state.curieList, {0 : {items: {$set: data},
        //                     isLoading:{$set: false}}}),
        //         })});
        //Load mod1e
        // fetch(SERVICE_URL.concat('/api/workflow/mod1e/').concat(curieItem))
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log("FINISH: mod1e");
        //         if (data === undefined || data.length === 0) {
        //             data = [{hit_id: 1, hit_symbol: 'No Result'}];
        //         }
        //         this.setState({
        //             geneList: update(this.state.geneList, {1 : {items: {$set: data},
        //                     isLoading:{$set:false}}}),
        //         })
        //     })
        //     .catch(error=> {
        //         const data = [{hit_id: 1, hit_symbol: 'No Result'}];
        //         this.setState({
        //             geneList: update(this.state.geneList, {1 : {items: {$set: data},
        //                     isLoading:{$set:false}}}),
        //         })});
        // //Load mod1b1
        // fetch(SERVICE_URL.concat('/api/workflow/mod1b1/').concat(curieItem))
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log("FINISH: mod1b1");
        //         if (data === undefined || data.length === 0) {
        //             data = [{hit_id: 1, hit_symbol: 'No Result'}];
        //         }
        //         this.setState({
        //             geneList: update(this.state.geneList, {2 : {items: {$set: data},
        //                     isLoading:{$set:false}}}),
        //         })
        //     }).catch(error=> {
        //     const data = [{hit_id: 1, hit_symbol: 'No Result'}];
        //     this.setState({
        //         geneList: update(this.state.geneList, {2 : {items: {$set: data},
        //                 isLoading:{$set:false}}}),
        //     })});
        //
        // fetch(SERVICE_URL.concat('/api/get-ncats-data/').concat(curieItem))
        //     .then(response => response.json())
        //     .then(data => {
        //         if (data !== undefined || data.length !== 0) {
        //             this.setState({description:data});
        //         }
        //         this.setState({descriptionIsLoading:false})
        //     })
        //     .catch(error => {
        //         this.setState({description:{concept:{category:'Not Found'}}});
        //     });

    }

    handleGeneClick(geneItem) {
        this.setState({bioisLoading:true, descriptionIsLoading:true});

        fetch(SERVICE_URL.concat('/api/gene-to-pathway/').concat(geneItem).concat('?size=5'))
            .then(response => response.json())
            .then(data => {
                if (data === undefined || data.length === 0) {
                    const newData = [
                        {pathway_id: 1, name: 'No Result'}
                    ];
                    this.setState({ biomodelList: newData, bioisClickEnabled: false });
                }
                else {
                    this.setState({ biomodelList: data, bioisClickEnabled: true, bioisLoading:false });
                }
            });

        //Load gene description
        fetch(SERVICE_URL.concat('/api/get-ncats-data/').concat(geneItem))
            .then(response => response.json())
            .then(data => {
                if (data !== undefined || data.length !== 0) {
                    this.setState({description:data});
                }
                this.setState({descriptionIsLoading:false})
            })
            .catch(error => {
                this.setState({description:{concept:{category:'Not Found'}}});
            });

    }

    handleBiomodelClick(index) {
        console.log(index);
        this.setState({imgSrc : SERVICE_URL.concat('/api/pathway-to-png/') + index});
        fetch(SERVICE_URL.concat('/api/pathway-to-sbgn/') + index)
            .then(response => {
                return response.text().then((text)=>{
                    // console.log(text);
                    this.setState({sbgn: text});
                });
            });
        fetch(SERVICE_URL.concat('/api/pathway-to-sbgn/') + index)
            .then(response => {
                return response.text().then((text)=>{
                    console.log(text);
                    this.setState({sbgn: text});
                });
            });
    }

    render() {
        console.log("Workbench Environmental Variables:");
        console.log("\tFRONTEND_URL:\t" + FRONTEND_URL);
        console.log("\tSERVICE_URL:\t" + SERVICE_URL);

        return (
            <div style={divStyle}>
                <div className="container-fluid">

                    {/* Producer Components */}
                    {this.state.producers ?
                        <SearchBar producers={this.state.producers}
                                   handleCreation={this.handleGeneListCreation}
                                   handleProducerSelect={this.handleProducerChange}
                                   handleTextChange={this.handleTextChange}/> :
                        <MyLoader active={true}/>}

                    <div className="row">

                        {/* Expander Components */}
                        <div className="col-sm-2">
                            {this.state.expanders ?
                                <TransformerMenu expanders={this.state.expanders}/>
                                : <MyLoader active={true}/>}
                        </div>

                        {/* Gene Lists */}
                        <div className="col-sm-10">
                        {/* Reduce state.geneList to a network call/calculation */}
                        { this.state.geneListIDs.length > 0 ?
                            this.state.geneListIDs
                                // reverse historical order (most recent)
                                .slice(0).reverse()
                                .map(geneListID => {
                                    return (
                                        <GeneTable
                                            // TODO: replace with a fetch request to aggregator?
                                            // TODO: replace with get-gene-list call when implemented.
                                            geneListID={ geneListID }
                                        />
                                    )
                            })
                            :
                            <MyLoader active={true}/> }
                        </div>

                        {/* Real Time Visualization */}
                        <div className="col-sm-1">

                        </div>

                    </div>
                </div>

            </div>
        );
    }

}

export default App;
