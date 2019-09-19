import React, {Fragment} from "react"
import Card from "react-bootstrap/Card";
import {Collapse} from "react-collapse";
import {formatAbbreviations, pluralize, properCase, tap} from "../../helpers";
import BootstrapTable from "react-bootstrap-table-next";
import _ from "underscore";
import ToolkitProvider, {CSVExport} from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Select, {components} from "react-select";
import is from "is_js"

import EmojiIcon from '@atlaskit/icon/glyph/emoji';
import Tooltip from '@atlaskit/tooltip';

import "./GeneTable.css"
import "./Tooltip.css"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

const { ExportCSVButton } = CSVExport;

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

const DefaultHiddenColumns = ["synonyms","entrez","hgnc","mim","ensembl","mygene_info"];

export default class GeneTable extends React.Component {
    constructor(props) {
        super(props);
        this.keyField = 'gene_id';
        this.geneListID = props.geneListID;
        this.state = {
            geneList: null,
            geneTableColumns: [{dataName: ""}],
            geneTableData: [],
            isOpened: true
        };

        this.handleOnClickTableHeader = this.handleOnClickTableHeader.bind(this);
    }

    handleOnClickTableHeader = (e) => {
        // https://github.com/facebook/react/issues/5625
        const target = e.target;
        if (target.id !== "table-header-".concat(this.props.geneListID)) {  // equivalent to Card.Header id, see render
            return; // child was clicked, ignore onClick
        }
        this.setState({isOpened: !this.state.isOpened}, console.log("open?", this.state.isOpened))
    };

    render() {
        return (
            <Card>
                {/* Table Segment */}
                {this.state.geneTableData.length > 0 && this.state.geneTableColumns.length > 0 ?
                    <Collapse isOpened={this.state.isOpened}>
                        {/*TODO: BootstrapTable has an embedded margin style that is preventing the Collapse animation from being as smooth as it should be*/}
                        {/*TODO: Eliminate Bootstrap |- Eliminate Bootstrap Table*/}
                        <ToolkitProvider
                            keyField={this.keyField}
                            name={this.geneListID}
                            data={this.state.geneTableData}
                            columns={this.state.geneTableColumns}
                            columnToggle
                            exportCSV>

                            {/* The way they're coding this is that the presence or absence of a prop
                            in ToolkitProvider, induces some additional props, which are injected
                            into the child components to be used for expected behavior*/}

                            {props =>
                                <Fragment>

                                    <GeneTableColumnFilter
                                        {...props.columnToggleProps}
                                    />

                                    <div>
                                        <span className={"btn"}>{pluralize(this.state.geneTableData.length, "gene")}</span>
                                        {/*TODO: Refactor -> https://stackoverflow.com/a/53558566 */}
                                        <ExportCSVButton style={{border: "none", textDecoration: "underline", float: "right"}} {...props.csvProps}>Export</ExportCSVButton>
                                    </div>

                                    <BootstrapTable
                                        wrapperClasses={"table-responsive"}
                                        pagination={ paginationFactory() }
                                        {...props.baseProps} />

                                </Fragment>}
                        </ToolkitProvider>
                    </Collapse> : <React.Fragment/>}
            </Card>
        )
    }

    componentDidMount() {
        this.getGeneListAndSetupGeneTable(this.geneListID);
    }

    /* EVENT HANDLING */
    handleOnClick = () => {
        this.props.handleGeneListSelection(this.geneListID)
    };

    /* UTILITY METHODS */
    populateGeneTable = () => {
        // convert all gene attributes into columns. geneset could be heterogeneous so we need to check all of them
        let geneListAttributes =
            _.uniq(this.state.geneList.map((current_gene) => current_gene.attributes, [])
                .reduce((attributes_list, current_gene_attributes) => attributes_list.concat(current_gene_attributes), [])  // flatten list of depth one
                .map(attribute => attribute.name)).filter(name => name !== "myGene.info id");

        let geneListIdentifiersMap =
            this.state.geneList
                .map((current_gene) => current_gene.identifiers)
                .reduce((attributes_list, current_gene_attributes) => attributes_list.concat(current_gene_attributes), [])[0];
        let geneListIdentifiersRecord = [];
        for (let identity in geneListIdentifiersMap) {
            if (geneListIdentifiersMap.hasOwnProperty(identity)) {
                geneListIdentifiersRecord.push( { name: identity, value: geneListIdentifiersMap[identity] } );
            }
        }
        let geneListIdentifiers = geneListIdentifiersRecord.map(identifier => identifier.name);

        let geneTableColumns = this.makeTableColumns(geneListAttributes, geneListIdentifiers);
        let geneTableData = this.makeTableData(geneListAttributes, geneListIdentifiersRecord);

        // set all the state at once to guarantee synchrony
        this.setState({ geneTableColumns: geneTableColumns, geneTableData: geneTableData });
    };

    getGeneListAndSetupGeneTable = (geneListID) => {
        fetch(SERVICE_URL.concat('/gene_list/').concat(geneListID))
            .then(response => response.json())
            .then(data => {
                // guarantee to have the gene list before running
                this.setState({geneList: data.genes},
                    () => {
                        this.populateGeneTable();
                    })
            });
    };

    listAbbrevation = (cell) => {
        if (is.string(cell)) {
            return cell;
        } else if (is.integer(cell)) {
            return cell;
        } else if (is.decimal(cell)) {
            return parseFloat(cell) < 1 ? parseFloat(cell).toFixed(4) : parseFloat("1").toFixed(1);
        } else if (is.array(cell)) {
            if (cell.length > 1) {
                const cellList = cell.split(', ');
                return <div>{_.take(cellList, 4)}...</div>
            } else if (cell.length > 0) {
                return cell[0];
            } else {
                return cell;
            }
        }
    };

    tooltipFormatter = (column, colIndex) => {
        return (
            <Fragment>
                <span className={"has-tooltip"}>
                    <span className={"tooltiptext"}>{column.dataField}</span>
                    { formatAbbreviations((column.text)) }
                </span>
            </Fragment>
        );
    };

    makeTableData = (geneListAttributes, geneListIdentifiers) => {
        return this.state.geneList
                // TODO: functional programming in javascript -> better way to compose lists etc
                .map(gene => gene.attributes.concat([{name: "gene_id", value: gene["gene_id"]}, ...geneListIdentifiers]))
                .map(combinedList => tap(combinedList))
                .map((geneAttributesList) => {
                    let geneAttributesObject = {};
                    for (let i = 0; i < geneAttributesList.length; i++) {
                        geneAttributesObject[geneAttributesList[i].name] = geneAttributesList[i].value
                    }
                    return geneAttributesObject;
                });
    }

    makeTableColumns = (attributeList, identifierList) => {
        return (
            attributeList.concat(identifierList)
                .map(gla => {
                    return {
                        dataField: gla,
                        text: properCase(tap(gla, "gla")),
                        csvText: gla,
                        // TODO: for now we're enabling all input to be placed in the search field
                        // THIS IS TO ENABLE INTERACTION WITH PRODUCERS; BUT SHOULD BE FLAGGED FOR CHANGE
                        formatter: this.listAbbrevation,
                        headerFormatter: this.tooltipFormatter,
                        events: {
                            onClick: (e, column, columnIndex, row, rowIndex) => {
                                // TODO:
                                // this.props.handleGeneSelection(row[column.dataField]);
                            }
                        },
                        hidden: DefaultHiddenColumns.includes(gla)
                    }
                })
        )
    };

}

const GeneTableColumnFilter = ({columns, onColumnToggle, toggles}) => {
    // https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/basic-column-toggle.html
    // https://react-select.com/home
    const geneTableColumnOptions = columns.map(gtc => {return {value: gtc.dataField, label: formatAbbreviations(properCase(gtc.text))}});
    return (
        <React.Fragment>
            <Select
                components={{ MultiValueRemove }}
                placeholder={ "Hide Columns..." }
                defaultValue={ DefaultHiddenColumns.map(column => ({value: column, label: properCase(column)})) }
                isMulti
                name="columns"
                options={ tap(geneTableColumnOptions, "geneTableColumnOptions") }
                className="basic-multi-select"
                classNamePrefix="select"
                isClearable={false}
                onChange={ (args, action) => {
                    if (action.action === "create-option") {

                    }
                    if (action.action === "select-option") {
                        onColumnToggle(action.option.value);

                    } else if (action.action === "remove-value" || action.action === "pop-value" ) {
                        onColumnToggle(action.removedValue.value);
                    }
                    else if (action.action === "clear") {
                        Object.keys(toggles).forEach((toggleKey) => {
                            toggles[toggleKey] = true;
                        });
                        console.log(toggles);
                    }
                } }
            />
        </React.Fragment>
    )
};

export const colourOptions = [
    { value: 'ocean', label: 'Ocean', color: '#00B8D9', isFixed: true },
    { value: 'blue', label: 'Blue', color: '#0052CC', isDisabled: true },
    { value: 'purple', label: 'Purple', color: '#5243AA' },
    { value: 'red', label: 'Red', color: '#FF5630', isFixed: true },
    { value: 'orange', label: 'Orange', color: '#FF8B00' },
    { value: 'yellow', label: 'Yellow', color: '#FFC400' },
    { value: 'green', label: 'Green', color: '#36B37E' },
    { value: 'forest', label: 'Forest', color: '#00875A' },
    { value: 'slate', label: 'Slate', color: '#253858' },
    { value: 'silver', label: 'Silver', color: '#666666' },
];


const MultiValueRemove = props => {
    return (
        <components.MultiValueRemove {...props}>
            +
        </components.MultiValueRemove>
    );
};
