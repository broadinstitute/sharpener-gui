import React, {Fragment} from 'react';
import _ from "underscore";
import BootstrapTable from "react-bootstrap-table-next"
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
const { ExportCSVButton } = CSVExport;
import Card from "react-bootstrap/Card"
import {MyLoader} from "./ListItem";
import Collapse from "react-bootstrap/Collapse";

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

// practically speaking all this component does or should do is showcase gene tables in chronological order (soonest to farthest)
export default class GeneFeed extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            geneListIDs: props.geneListIDs,
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
            <div>
                {this.state.geneListIDs.length > 0 ? this.state.geneListIDs.slice(0).reverse().map((geneListID) =>
                        <GeneTable
                            key={ geneListID }
                            geneListID={ geneListID }
                            clearGeneListHandler={ this.props.clearGeneListHandler }
                            handleGeneListSelection={ this.props.handleGeneListSelection }
                            handleGeneSelection={ this.props.handleGeneSelection }
                        />
                    ) : <MyLoader active={true}/>
                }
            </div>
        )
    }
}

export class GeneTable extends React.Component {
    /* LIFECYCLE METHODS */
    constructor(props) {
        super(props);
        this.keyField = 'gene_id';
        this.geneListID = props.geneListID;
        this.clearGeneList = props.clearGeneListHandler;

        this.state = {
            geneList: null,
            geneTableColumns: [{dataName: ""}],
            geneTableData: [],
        }
    }

    render() {
        // TODO replace with different more flexible table library
        return (
            <Card>
                <Card.Header as={"h6"}>
                    <button style={{ border: "none", background:"none",}} onClick={this.handleOnClick}>{this.geneListID}</button>
                    <span>has {this.state.geneTableData.length} gene{this.state.geneTableData.length > 1 ? "s" : this.state.geneTableData.length <= 0 ? "s" : ''}</span>
                    <div style={{float:"right", marginRight:"-.7em", display: "inline-block"}}>
                        <button
                            title={"Toggle selecting this Gene Set for Expander inputs"}
                            value={ this.geneListID }
                            onClick={ this.handleOnClick }
                            style={{ border: "none", background:"none", fontSize: "large"}}>
                            +
                        </button>
                        <button
                            title={"Clear this Gene Set from the Gene Feed"}
                            value={ this.geneListID }
                            onClick={ this.clearGeneList }
                            style={{border: "none", background:"none", fontSize: "large"}}>
                            &times;
                        </button>
                    </div>
                </Card.Header>
                <Collapse>
                    <BootstrapTable
                        keyField={this.keyField}
                        name={this.geneListID}
                        data={this.state.geneTableData}
                        columns={this.state.geneTableColumns}
                    />
                </Collapse>
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
                .map(gene => gene.attributes.concat([{ name: "gene_id", value: gene["gene_id"] }]))
                .map((geneAttributesList) => {
                    let geneAttributesObject = {};
                    for (let i = 0 ; i < geneAttributesList.length; i++) {
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
            gene_list_ids:  [ geneListID ],
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
            this.setState({ geneList: data.genes },
                () => {
                this.populateGeneTable();
            })
        });
    };

    makeTableColumns = (attributeList) => {
        let formatHeader = (gla) => {
            return gla.replace(/_/g, " ").replace(/Id/gi, "ID");
        };
        return (
            attributeList
                .map(gla => {
                    return {
                        dataField: gla,
                        text: formatHeader(gla),
                        headerStyle: {  textTransform: "capitalize" },
                        // TODO: for now we're enabling all input to be placed in the search field
                        // THIS IS TO ENABLE INTERACTION WITH PRODUCERS; BUT SHOULD BE FLAGGED FOR CHANGE
                        events: {
                            onClick: (e, column, columnIndex, row, rowIndex) => {
                                console.log("clicking gene_id ", row[column.dataField]);
                                this.props.handleGeneSelection(row[column.dataField]);
                            }
                        },
                        headerEvents: {
                            events: {
                                onClick: (e, column, columnIndex, row, rowIndex) => {
                                    console.log("clicking gene_id ", row[column.dataField]);
                                    this.props.handleGeneSelection(row[column.dataField]);
                                }
                            }
                        }
                    }
            }).concat([
                {
                    dataField: "gene_id",
                    text: formatHeader("gene_id"),
                    headerStyle: {  textTransform: "capitalize" },
                    events: {
                        onClick: (e, column, columnIndex, row, rowIndex) => {
                            console.log("clicking gene_id ", row[column.dataField]);
                            this.props.handleGeneSelection(row[column.dataField]);
                        }
                    },
                    headerEvents: {
                        events: {
                            onClick: (e, column, columnIndex, row) => {
                                console.log("clicking gene_id ", row[column.dataField]);
                                this.props.handleGeneSelection(row[column.dataField]);
                            }
                        }
                    }
                }
            ])
        )
    };

}