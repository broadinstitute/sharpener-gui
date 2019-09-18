import React, {Fragment} from "react"
import Card from "react-bootstrap/Card";
import {Collapse} from "react-collapse";
import {formatAbbreviations, pluralize, properCase, sigFig, tap} from "../../helpers";
import BootstrapTable from "react-bootstrap-table-next";
import _ from "underscore";
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import Select from "react-select";
const { ExportCSVButton } = CSVExport;
import {FEATURE_FLAG} from "../../parameters/FeatureFlags";

import "./GeneTable.css"
import "./Tooltip.css"

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

export class GeneReactTable extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {}

    static getDerivedStateFromProps(props, state) {
        if (props.geneListIDs !== state.geneListIDs) {
            return { geneListIDs: props.geneListIDs };
        }
        return null;
    }

    render() {
        return (
            <table>
                <thead></thead>
                <tbody></tbody>
            </table>
        );
    }
}

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
                                <React.Fragment>

                                    <div>
                                        <span className={"btn"}>{pluralize(this.state.geneTableData.length, "gene")}</span>
                                        {/*TODO: Refactor -> https://stackoverflow.com/a/53558566 */}
                                        <ExportCSVButton style={{border: "none", textDecoration: "underline", float: "right"}} {...props.csvProps}>Export</ExportCSVButton>
                                    </div>

                                    {/* TODO: is this placement awkward? is it too large? */}
                                    <GeneTableColumnFilter
                                        {...props.columnToggleProps}
                                    />
                                    <BootstrapTable
                                        wrapperClasses={"table-responsive"}
                                        pagination={ paginationFactory() }
                                        {...props.baseProps} />
                                </React.Fragment>}
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
        const geneListAttributes =
            _.uniq(this.state.geneList.map((current_gene) => current_gene.attributes, [])
                .reduce((attributes_list, current_gene_attributes) => attributes_list.concat(current_gene_attributes), [])  // flatten list of depth one
                .map(attribute => attribute.name));
        //.concat(["gene_id"]);  // interpret gene_id as a column  TODO: DEPRECATED -- it needs to be handled specially

        let geneTableColumns =
            this.makeTableColumns(geneListAttributes);

        let geneTableData =
            this.state.geneList
                .map(gene => gene.attributes.concat([{name: "gene_id", value: gene["gene_id"]}]))
                .map((geneAttributesList) => {
                    let geneAttributesObject = {};
                    for (let i = 0; i < geneAttributesList.length; i++) {
                        geneAttributesObject[geneAttributesList[i].name] = geneAttributesList[i].value
                    }
                    return geneAttributesObject;
                });

        // set all the state at once to guarantee synchrony
        this.setState({geneTableColumns: geneTableColumns, geneTableData: geneTableData});
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
        // TODO: make this test more robust
        if (cell) {
            let potentialList = cell.split(', ');
            if (potentialList.length > 1) {
                const cellList = potentialList;
                return <div>{_.take(cellList, 4)}...</div>
            } else {
                return (cell);
            }
        }
    };

    tooltipFormatter = (column, colIndex) => {
        return (
            <Fragment>
                <span className={"has-tooltip"}>
                    <span className={"tooltiptext"}>{column.dataField}</span>
                    { formatAbbreviations(properCase(column.text)) }
                </span>
            </Fragment>
        );
    };


    makeTableColumns = (attributeList) => {

        return (
            attributeList
                .map(gla => {
                    return {
                        dataField: gla,
                        text: properCase(gla),
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
                    }
                }).concat([
                {
                    dataField: "gene_id",
                    text: properCase("gene_id"),
                    headerFormatter: this.tooltipFormatter,
                    events: {
                        onClick: (e, column, columnIndex, row, rowIndex) => {
                            console.log("clicking gene_id ", row[column.dataField]);
                            // TODO
                            // this.props.handleGeneSelection(row[column.dataField]);
                        }
                    },
                }
            ])
        )
    };

}

const GeneTableColumnFilter = ({columns, onColumnToggle, toggles}) => {
    // https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/basic-column-toggle.html
    // https://react-select.com/home
    return (
        <React.Fragment>
            <Select
                placeholder={"Hide Columns..."}
                defaultValue={[]}
                isMulti
                name="columns"
                options={ columns.map(gtc => {return {value: gtc.dataField, label: formatAbbreviations(properCase(gtc.text))}}) }  // done
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