import React, {Fragment} from 'react';
import _ from "underscore";
import BootstrapTable from "react-bootstrap-table-next"
import Card from "react-bootstrap/Card"

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

export default class GeneTable extends React.Component {
    /* LIFECYCLE METHODS */
    constructor(props) {
        super(props);
        this.keyField = 'gene_id';
        this.geneListID = props.geneListID;

        this.state = {
            geneList: null,
            geneTableColumns: [{dataName: ""}],
            geneTableData: []
        }
    }

    render() {
        // TODO replace with different more flexible table library
        return (
            <Card>
                <Card.Header as={"h6"} onClick={this.handleOnClick}>{this.geneListID}</Card.Header>
                <BootstrapTable
                    keyField={this.keyField}
                    name={this.geneListID}
                    data={this.state.geneTableData}
                    columns={this.state.geneTableColumns}
                />
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
                .map(attribute => attribute.name)).concat(["gene_id"]);  // interpret gene_id as a column

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
        return (
            attributeList
                .map(gla => { return { dataField: gla, text: gla.toUpperCase() } }))
    };

}