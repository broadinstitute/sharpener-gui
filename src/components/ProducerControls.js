import React, {Fragment} from 'react';
import {TransformerParameter} from "./TransformerControls";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Card from "react-bootstrap/Card";

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
                let geneList = parameterIndexControls[0].value.split(",");
                this.handleGeneListCreation(geneList);
            }
        }
    };

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

    render() {
        return (
            <div style={searchBarStyle}>
                <select id="producer" className="custom-select" onChange={this.props.handleProducerSelect }>
                    {this.props.producers.map((producer) =>
                        <option key={producer.name} value={producer.name}>
                            {producer.name}
                        </option>
                    )}
                </select>
                <div style={inputStyle}>
                    <div className="form-inline" onKeyPress={this.handleKeyPress}>
                        {
                            this.state.selectedProducer.parameters
                                .map(parameter => {
                                    return (
                                    <Fragment>
                                        <TransformerParameter key={parameter.name} id={parameter.name} parameter={parameter}
                                                                   action={this.handleProducerParameterChange}/>{'\u00A0'}{'\u00A0'}
                                    </Fragment> )
                                })
                        }
                        <button
                            style={{marginLeft: "auto", marginRight:"0%"}}
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