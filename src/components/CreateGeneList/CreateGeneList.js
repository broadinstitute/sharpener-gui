import React from "react"
import CreatableSelect, {makeCreatableSelect} from 'react-select/creatable';

import MultiSelect from '@khanacademy/react-multi-select';
import ReactMultiSelectCheckboxes from 'react-multiselect-checkboxes';

import ReactFileReader from "react-file-reader";
import Papa from 'papaparse'

import _ from "lodash"

import messages from "../../message-properties";
import Tooltip from "../Tooltip/Tooltip";

const createOption = (string) => {
     return _.uniq(string.split(/[\r\n;, ]+/).filter(el => el !== '' && el !== ' ')).map(label => ({
        label: label.trim(),
        value: label.trim()
    }))
};

export default class CreateGeneList extends React.Component {
    state = {
        isLoading: false,
        options: [{value: "NGLY1", label: "NGLY1"}, {value: "BRCA1", label: "BRCA1"}],
        value: [],
        selected: [],
        addGeneValue: ''
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

    handleGeneChange = (event) => {
        this.setState({ addGeneValue: event.target.value });
    }

    handleGeneSubmit = (event) => {
        this.handleCreate(this.state.addGeneValue);
    }

    handleChange = (newValue, actionMeta) => {
        this.setState({ value: newValue });
    };

    handleCreate = (inputValue) => {
        const { options, value, addGeneValue } = this.state;

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
        const { selected } = this.state;
        console.log("selected options", selected);
        // const symbols = value.map(item => item.value);
        const symbols = selected.map(item => item);  // exclude label
        this.props.createGeneList(symbols); // redux dispatch
    };

    render() {
        const { options, value, selected, addGeneValue } = this.state;
        return (
            <>
                <MultiSelect
                    options={options}
                    selected={selected}
                    onSelectedChanged={selected =>
                        this.setState({selected})}
                />
                {/*TODO: overflow https://codesandbox.io/s/v638kx67w7*/}
                {/*<ReactMultiSelectCheckboxes*/}
                {/*<ReactMultiSelectCheckboxes*/}
                {/*    placeholder={ messages.select.create }*/}
                {/*    onChange={this.handleChange}*/}
                {/*    options={options}*/}
                {/*    value={value}*/}
                {/*    styles={{*/}
                {/*        placeholder: base => ({*/}
                {/*            ...base,*/}
                {/*            fontSize: 14*/}
                {/*        }),*/}
                {/*        option: base => ({*/}
                {/*            ...base,*/}
                {/*            height: '100%',*/}
                {/*            fontSize: 14*/}
                {/*        }),*/}
                {/*        valueContainer: base => ({*/}
                {/*            ...base,*/}
                {/*            textOverflow: "ellipsis",*/}
                {/*            // whiteSpace: "nowrap",*/}
                {/*            overflow: "hidden",*/}
                {/*            // display: "initial"*/}
                {/*        })*/}
                {/*    }}*/}

                {/*/>*/}

                <div style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "0.25em"
                }}>
                    <div style={{ display: "block" }}>
                    <input placeholder={"Add Gene Symbols"} type="text"
                           value={this.state.addGeneValue}
                           onChange={this.handleGeneChange} />
                    <button onClick={this.handleGeneSubmit}>
                        +
                    </button>
                    </div>
                    <ReactFileReader handleFiles={ this.handleFiles } fileTypes={['.csv', '.tsv', '.txt']}>
                        <button>
                            Upload Gene List
                        </button>
                    </ReactFileReader>
                </div>
                <button
                    // style={{marginLeft: "0.2em"}}
                    onClick={ this.handleSubmit }>
                    Submit Genes
                </button>
            </>
        );
    }
}
