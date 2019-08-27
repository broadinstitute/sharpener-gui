import React, {Fragment} from 'react';
import _ from "underscore";
import BootstrapTable from "react-bootstrap-table-next"
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
const { ExportCSVButton } = CSVExport;
import Card from "react-bootstrap/Card"
import {MyLoader} from "./ListItem";
import {Collapse} from "react-collapse"

import {FEATURE_FLAG} from "../parameters/FeatureFlags";

import Select from 'react-select';
import {pluralize, properCase} from "../helpers";

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

// practically speaking all this component does or should do is showcase gene tables in chronological order (soonest to farthest)
export default class GeneFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            geneListIDs: props.geneListIDs,
            transactionHistory: props.transactionHistory
        }
    }

    // https://medium.com/p/387720c3cff8/responses/show
    static getDerivedStateFromProps(props, state) {
        let feedOrder = (geneIDs) => {
            // TODO:
            // return geneIDs.slice(0).reverse();
            return geneIDs;
        };

        if (props.geneListIDs !== state.geneListIDs) {
            return { geneListIDs: feedOrder(props.geneListIDs) };
        }
        return null;
    }

    render () {
        // feed order is going to be run each render
        return (
            <Fragment>
                    <div className={"col-sm-12"}>
                        {this.state.geneListIDs.length > 0 ? this.state.geneListIDs.slice(0).reverse().map((geneListID) =>
                            <Fragment>
                                <GeneTable
                                    key={ geneListID }
                                    geneListID={ geneListID }
                                    clearGeneList={ this.props.clearGeneList }
                                    handleGeneListSelection={ this.props.handleGeneListSelection }
                                    handleGeneSelection={ this.props.handleGeneSelection }
                                /><br/>
                            </Fragment>
                            ) : <MyLoader active={true}/>
                        }
                    </div>
            </Fragment>
        )
    }
}

const GeneTableColumnFilter = ({columns, onColumnToggle, toggles}) => {
    // https://react-bootstrap-table.github.io/react-bootstrap-table2/docs/basic-column-toggle.html
    // https://react-select.com/home
    return (
        <Fragment>
            <Select
                placeholder={"Filtered Columns..."}
                defaultValue={[]}
                isMulti
                name="columns"
                options={ columns.map(gtc => {return {value: gtc.dataField, label: formatHeader(properCase(gtc.text))}}) }  // done
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
                    // TODO:
                    else if (action.action === "clear") {
                        Object.keys(toggles).forEach((toggleKey) => {
                           toggles[toggleKey] = true;
                        });
                        console.log(toggles);
                    }
                } }
            />
        </Fragment>
    )
};

export class GeneTable extends React.Component {
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
                {/* Header Segment */}
                <Card.Header as={"h6"}
                             id={"table-header-".concat(this.props.geneListID)}
                             key={this.props.geneListID}  // collision unlikely
                             onClick={this.handleOnClickTableHeader}>
                    <button style={{border: "none", background: "none", margin:"-0.8em"}}
                            onClick={this.handleOnClick}>{this.geneListID}</button>
                    <div style={{float: "right", marginRight: "-.7em", display: "inline-block"}}>
                        {'\u00A0'}{'\u00A0'}{'\u00A0'}
                        <button
                            title={"Toggle selecting this Gene List for Expander inputs"}
                            value={this.geneListID}
                            onClick={this.handleOnClick}
                            style={{border: "none", background: "none", fontSize: "large"}}>
                            +
                        </button>
                        <button
                            title={"Clear this Gene List from the Gene Feed"}
                            value={ this.geneListID }
                            onClick={ (e) => { return this.props.clearGeneList(e.target.value) } }
                            style={{border: "none", background: "none", fontSize: "large"}}>
                            &times;
                        </button>
                    </div>
                </Card.Header>

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
                                    <div>
                                        <span className={"btn"}>{pluralize(this.state.geneTableData.length, "gene")}</span>
                                        {/*TODO: Refactor -> https://stackoverflow.com/a/53558566 */}
                                        <ExportCSVButton style={{border: "none", textDecoration: "underline", float: "right"}} {...props.csvProps}>Export</ExportCSVButton>
                                    </div>
                                    <BootstrapTable
                                        wrapperClasses="table-responsive"
                                        {...props.baseProps} />

                                    { !(Object.values(props.columnToggleProps.toggles).every((value => value))) ?
                                        <span style={{fontSize:"small", marginLeft:"0.75em"}}>Filtered Columns</span>
                                    :   <span style={{fontSize:"small", marginLeft:"0.75em"}}>Select columns below to filter them</span> }
                                    <GeneTableColumnFilter
                                        {...props.columnToggleProps}
                                    />
                                </Fragment>}
                        </ToolkitProvider>
                    </Collapse> : <Fragment/>}
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
        console.dir("setting up gene table");

        let aggregationQuery = {
            gene_list_ids: [geneListID],
            operation: "intersection"  // self-intersection ~~~ identity
        };

        // TODO: update with identity transformer
        fetch(SERVICE_URL.concat('/aggregate'), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(aggregationQuery)
        })
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
                console.log(cell, "is a  list");
                const cellList = potentialList;
                return <div>{cellList[0]}...</div>
            } else {
                return cell;
            }
        }
    };

    makeTableColumns = (attributeList) => {

        return (
            attributeList
                .map(gla => {
                    return {
                        dataField: gla,
                        text: formatHeader(properCase(gla)),
                        headerStyle: {  textTransform: "capitalize" },
                        // TODO: for now we're enabling all input to be placed in the search field
                        // THIS IS TO ENABLE INTERACTION WITH PRODUCERS; BUT SHOULD BE FLAGGED FOR CHANGE
                        formatter: this.listAbbrevation,
                        events: {
                            onClick: (e, column, columnIndex, row, rowIndex) => {
                                console.log("clicking gene_id ", row[column.dataField]);
                                // TODO:
                                // this.props.handleGeneSelection(row[column.dataField]);
                            }
                        },
                    }
            }).concat([
                {
                    dataField: "gene_id",
                    text: formatHeader(properCase("gene_id")),
                    headerStyle: {  textTransform: "capitalize" },
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

let formatHeader = (gla) => {
    return gla.replace(/_/g, " ")
        .replace(/Id/gi, "ID")
        .replace(/Hgnc/gi, "HGNC")
        .replace(/Mygene/gi, "MyGene")
        .replace(/Mim/gi, "MIM");
};
