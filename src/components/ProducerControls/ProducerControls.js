import React, {Fragment} from 'react';
import {TransformerParameter} from "../TransformerControls/TransformerControls";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Card from "react-bootstrap/Card";
import Select from 'react-select';
import _ from "underscore"
import "./ProducerControls.css"


const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const searchBarStyle = {
    marginTop: "18px",
};

const inputStyle = {
    marginTop: "10px",
    marginBottom: "26px",
};

export class ProducerControls extends React.Component {

    constructor(props) {
        super(props);
        this.handleGeneListCreation = props.handleGeneListCreation;
        this.queryProducer = props.queryPromise;
        this.state = {
            selectedProducer: props.selectedProducer,
            // TODO: refactor to Redux
            parameterIndex: {}
        };

        this.handleProducerParameterChange = this.handleProducerParameterChange.bind(this);
    }

    componentDidMount() {
        let newParameterIndex = {};
        this.state.selectedProducer.parameters.forEach(parameter => {
            newParameterIndex[parameter.name] = {parameter: parameter, value:""}
        });
        this.setState({
            parameterIndex: newParameterIndex
        });
    }

    handleProducingGenes = () => {
        const currentParameterIndex = this.state.parameterIndex;
        let parameterIndexControls = Object.keys(currentParameterIndex)
            .map(parameterIndexControlKey => { return { name: parameterIndexControlKey, value: currentParameterIndex[parameterIndexControlKey].value}});

        // if all parameters from parameter index have non-blank values or other truthy values
        let parameterValues = parameterIndexControls.map(parameterIndexControl => parameterIndexControl.value );
        if (parameterValues.every((truthyValue) => (truthyValue !== '' || truthyValue !== null))) {  // yeah
            console.log("all values truthy");
            // then produce genes
            if (this.state.selectedProducer.name !== "Gene Symbols") {
                // we produce genes by calling a producer
                let producerQuery = {
                    name: this.state.selectedProducer.name,
                    controls: parameterIndexControls
                };
                Promise.resolve(this.queryProducer(producerQuery))
                    .then(response => response.json())
                    .then(data => {
                        if (data === undefined || data === null || data.length === 0 ) {
                            throw "Data is undefined or not there"
                        } else {
                            console.log("response", data);
                        }
                    });
            } else if (this.state.selectedProducer.name === "Gene Symbols") {
                let geneList = ProducerControls.parseGeneSymbolList(parameterIndexControls[0].value);
                this.handleGeneListCreation(geneList);
            }
        }
    };

    static parseGeneSymbolList(geneSymbolListString) {
        return _.uniq(geneSymbolListString.split(/[\r\n, ]+/).filter(el => el !== '' && el !== ' '));
    }

    handleProducerParameterChange = (e) => {
        let parameterIndexName = e.target.id;
        let stateCopy = { ...this.state };
        stateCopy.parameterIndex[parameterIndexName].value = e.target.value;
        this.setState(stateCopy);
    };

    handleKeyPress = event => {
        if (event.key === 'Enter') {
            event.preventDefault(); // this will result in an "event undefined" error, but will prevent page refresh

            // TODO: clear search text?
        }
    };

    static getDerivedStateFromProps(props, state) {
        if (props.selectedProducer !== state.selectedProducer) {
            let newParameterIndex = {};
            props.selectedProducer.parameters.forEach(parameter => {
                newParameterIndex[parameter.name] = {parameter: parameter, value:""}
            });
            return {
                selectedProducer: props.selectedProducer,
                parameterIndex: newParameterIndex
            };
        }
        return null;
    }

    handleProducerSelect = (args, action) => {
        console.log(args, action);
        this.props.handleProducerSelect(args.value);
    };



    render() {
        let options = this.props.producers.map(producer =>
            Object.assign({}, {label: producer.name, value: producer.name})
        );
        return (
            <div style={searchBarStyle}>
                <h3>Producers</h3>
                <Select id="producer"
                        className="basic-single"
                        isSearchable
                        defaultValue={options[0]}
                        options={options}
                        onChange={ this.handleProducerSelect }>

                    {this.props.producers.map((producer) =>
                        <option key={producer.name} value={producer.name}>
                            {producer.name}
                        </option>
                    )}

                </Select>
                <div style={inputStyle}>
                    <div className="form-inline" onKeyPress={this.handleKeyPress}>
                        {
                            this.state.selectedProducer.parameters
                                .map(parameter => {
                                    return (
                                        <TransformerParameter key={parameter.name}
                                                              id={parameter.name}
                                                              parameter={parameter}
                                                              action={this.handleProducerParameterChange}/> )
                                })
                        }
                        <button
                            style={{marginTop: "13px", marginLeft: "auto", marginRight:"0%"}}
                            type="button"
                            onClick={ this.handleProducingGenes }
                            className="btn btn-outline-success">
                            Produce Gene Set
                        </button>
                    </div>
                </div>
            </div>
    );
  }
}
export default ProducerControls;