import React from 'react';
import _ from "underscore";
import BootstrapTable from "react-bootstrap-table-next"

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

export default class GeneTable extends React.Component {

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

    componentWillMount() {
        this.getGeneListAndSetupGeneTable(this.geneListID);
    }

    populateGeneTable = () => {
        // convert all gene attributes into columns. geneset could be heterogeneous so we need to check all of them
        const geneListAttributes =
            _.uniq(this.state.geneList.map((current_gene) => current_gene.attributes, [])
                .reduce((attributes_list, current_gene_attributes) => attributes_list.concat(current_gene_attributes), [])  // flatten list of depth one
                .map(attribute => attribute.name)).concat(["gene_id"]);  // interpret gene_id as a column

        let geneTableColumns = this.makeTableColumns(geneListAttributes);
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
        let aggregationQuery = {
            geneListIDs: [geneListID],
            operation: "union"
        };
        fetch(SERVICE_URL.concat('/agggregate'), {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(aggregationQuery)
        })
        .then(response => {
            return response.json().then((data) => {
                console.log(data);
                this.setState({geneList: data});
                this.populateGeneTable();
            });
        });
    };

    makeTableColumns = (attributeList) => {
        return (
            attributeList
                .map(gla => { return { dataField: gla, text: gla.toUpperCase() } }))
    };

    render() {
        // TODO replace with different more flexible table library
        return (
            <BootstrapTable
                keyField={this.keyField}
                name={this.geneListID}
                data={this.state.geneTableData}
                columns={this.state.geneTableColumns}
            />
        )
    }
}