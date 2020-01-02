import React from "react"
import CreatableSelect from 'react-select/creatable';
import ReactFileReader from "react-file-reader";
import Papa from 'papaparse'

import _ from "lodash"
import Select from "react-select";

import messages from "../../message-properties";

const createOption = (string) => {
    return _.uniq(string.split(", ")).map(label => ({
        label: label,
        value: label
    }))
};

export default class CreateGeneList extends React.Component {
    state = {
        isLoading: false,
        options: [],
        value: []
    };

    constructor(props) {
        super(props);

    }

    handleFiles = files => {
        console.log(files[0]);

        let reader = new FileReader();
        reader.onload = function (loadEvent) {
            console.log(loadEvent.target.result);
        };
        reader.readAsText(files[0]);

        let completeFileParseCallback = (results)  => {
            console.group("papa file parser for create gene list");
            console.log("results", results);
            const geneSymbols = _.flatten(results.data).filter(symbol => symbol !== '');
            console.log("flatten data", geneSymbols);
            console.groupEnd();
            geneSymbols.forEach(geneSymbol => this.handleCreate(geneSymbol));
        };
        Papa.parse(files[0], {
            complete: completeFileParseCallback,
            delimiter: ','  // TODO: make dynamic based on file type?
        });
    };


    handleChange = (newValue, actionMeta) => {
        this.setState({ value: newValue });
    };

    handleCreate = (inputValue) => {
        const { options, value } = this.state;

        const newOption = createOption(inputValue)
            .filter(option => !options.map(option => option.value).includes(option.value));  // prevent duplicates

        this.setState({
            options: [...options].concat([
                ...newOption
            ]),
            value: [ ...value ].concat([
                ...newOption
            ])
        });
    };

    handleSubmit = () => {
        const { value } = this.state;
        const symbols = value.map(item => item.value);  // exclude label
        this.props.createGeneList(symbols); // redux dispatch
    };

    render() {
        const { options, value } = this.state;
        return (
            <>
                {/*TODO: overflow https://codesandbox.io/s/v638kx67w7*/}
                <CreatableSelect
                    isMulti
                    placeholder={ messages.select.create }
                    onChange={this.handleChange}
                    onCreateOption={this.handleCreate}
                    options={options}
                    value={value}

                    onFocus={() => console.log("focus")}
                    onBlur={() => console.log("blur")}

                    styles={{
                        placeholder: base => ({
                            ...base,
                            fontSize: 14
                        }),
                        option: base => ({
                            ...base,
                            height: '100%',
                            fontSize: 14
                        }),
                    }}

                />

                <div style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "0.25em"
                }}>
                    <ReactFileReader handleFiles={ this.handleFiles } fileTypes={['.csv', '.tsv', '.txt']}>
                        <button>
                            Upload Gene List
                        </button>
                    </ReactFileReader>
                    <button
                        // style={{marginLeft: "0.2em"}}
                        onClick={ this.handleSubmit }>
                        Submit Genes
                    </button>
                </div>
            </>
        );
    }
}
