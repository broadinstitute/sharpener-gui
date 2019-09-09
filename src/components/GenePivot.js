import React from "react"
import {getGeneListByID} from "../actions"
import {SERVICE_URL} from "../parameters/EndpointURLs";

class GenePivot extends React.Component {
    constructor(props) {
        super(props);
        // we use a map because it lets us keep a flat record of genes-gene list pairs by indexing coordinates as keys
        // thus there is no need for double loop iteration to find an incident

        let incidenceMap = new Map();
        let testIncidence = ({coordinate: {gene, geneListID}}) => {

        };

        // TODO: hierarchical by transformer THEN gene list
        /*
            {
                Header: 'Name',
                columns: [
                    {
                        Header: 'First Name',
                        accessor: 'firstName',
                    },
                    {
                        Header: 'Last Name',
                        accessor: 'lastName',
                    },
                ],
            },
         */

        // TODO: data mapping:
        /*
        Input:
        {gene_list_id, genes}
        Output:
        [{geneName: name, [gene_list_id]: True}
         */

        this.geneListIDs = ["EtPEiLtPq1", "KOtnt9W3DT"];
        console.log("geneListID", this.geneListIDs);

        this.state = {
            geneLists: [],
            columns: [],
            data: []
        };
    }

    componentDidMount(): void {
        this.geneListIDs.map(gene_list_id => {
            fetch(SERVICE_URL.concat('/gene_list').concat("/"+gene_list_id))
                .then(response => response.json())
                .then(data => {
                    console.log("data", data);
                    return data;
                });
        })
    }

    // componentWillUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void {
    // }

    render() {
        return <GenePivotTable geneLists={this.state.geneLists} columns={this.state.columns} data={this.state.data}/>
    }

}

function GenePivotTable ({geneLists, columns, data}) {
    const {getTableProps, headerGroups, rows, prepareRow} = useTable({
        columns,
        data
    });
    return (
        <React.Fragment>
            {JSON.stringify(geneLists)}
            {/*<table {...getTableProps()}>*/}
            {/*    <thead>*/}
            {/*    {headerGroups.map(headerGroup => (*/}
            {/*            <tr>*/}
            {/*                {headerGroup.headers.map(column => (*/}
            {/*                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>*/}
            {/*                ))}*/}
            {/*            </tr>*/}
            {/*        ))}*/}
            {/*    </thead>*/}
            {/*    <tbody>*/}
            {/*    {rows.map(*/}
            {/*        (row, i) => prepareRow(row) || (*/}
            {/*            <tr {...rows}>*/}
            {/*                {row.cells.map(cell => {*/}
            {/*                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>*/}
            {/*                })}*/}
            {/*            </tr>*/}
            {/*        )*/}
            {/*    )}*/}
            {/*    </tbody>*/}
            {/*</table>*/}
        </React.Fragment>
    )
}

export default GenePivot;