import React, { Component } from 'react';
import Clustergrammer from 'react-clustergrammer';
import "@fortawesome/fontawesome-free/css/fontawesome.min.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import './ClusterGram.css';

export default class ClusterGram extends Component {
    constructor(props) {
        super(props);
        console.log(props);
    }
    render () {
        const nRow = 10;
        const nCol = 10;
        const nGroupDepth = 10;
        const nLink = 1000;

        const row_nodes = Array(nRow).fill(0).map((_, i) => ({
            name: `ROW-${i}`,
            clust: i,
            group: Array(nGroupDepth).fill(0).map((_, d) => parseInt(i / 2**d)),
        }))

        const col_nodes =  Array(nCol).fill(0).map((_, i) => ({
            name: `COL-${i}`,
            clust: i,
            group: Array(nGroupDepth).fill(0).map((_, d) => parseInt(i / 2**d)),
        }))

        const links = Array(nLink).fill(0).map(_ => ({
            source: parseInt(Math.random()*nRow),
            target: parseInt(Math.random()*nCol),
            value: Math.random() * 2 - 1,
        }))

        console.log(this.props.rows, this.props.cols, this.props.links);
        console.log(row_nodes, col_nodes, links);

        return (
            <>
            { this.props.links.length > 0 ?
                <Clustergrammer
                    key={"clustergrammer"}
                    gene_list_ids={this.props.geneListIds}
                    network_data={{
                        row_nodes: this.props.rows, //row_nodes,
                        col_nodes: this.props.cols, //col_nodes,
                        links: this.props.links, //links,
                    }}
                    width={this.props.size.width}
                    height={this.props.size.height}
                />
            : <></>}
            </>
        )
    }
}
