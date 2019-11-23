import React, {Component, useEffect, useState} from 'react';
import Clustergrammer from 'react-clustergrammer';
import hash from "js-hash-code";
import "./ClusterGram.css"

export default class ClusterGram extends Component {
        constructor(props) {
            super(props);

            const nRow = 10;
            const nCol = 10;
            const nGroupDepth = 10;
            const nLink = 1000;

            const row_nodes = Array(nRow).fill(0).map((_, i) => ({
                name: `ROW-${i}`,
                clust: i,
                group: Array(nGroupDepth).fill(0).map((_, d) => parseInt(i / 2 ** d)),
            }))

            const col_nodes = Array(nCol).fill(0).map((_, i) => ({
                name: `COL-${i}`,
                clust: i,
                group: Array(nGroupDepth).fill(0).map((_, d) => parseInt(i / 2 ** d)),
            }))

            const links = Array(nLink).fill(0).map(_ => ({
                source: parseInt(Math.random() * nRow),
                target: parseInt(Math.random() * nCol),
                value: Math.random() * 2 - 1,
            }))

            this.state = {
                row_nodes: row_nodes,
                col_nodes: col_nodes,
                links: links
            }
        }

        componentDidMount() {
            console.log("mounting");
            this.setState({
                row_nodes: this.props.row_nodes,
                col_nodes: this.props.col_nodes,
                links: this.props.links
            })
        }

        static getDerivedStateFromProps(nextProps, prevState) {
            console.log("checking")
            console.log(nextProps.geneListIds)
            // the length checks protect the clustergrammer from failing, as it doesn't handle the empty case
            if (nextProps.col_nodes !== prevState.col_nodes && nextProps.col_nodes.length > 0 &&
                nextProps.row_nodes !== prevState.row_nodes && nextProps.row_nodes.length > 0 &&
                nextProps.links !== prevState.links && nextProps.links.length > 0) {
                console.log("deriving")
                console.log({
                    row_nodes: nextProps.row_nodes,
                    col_nodes: nextProps.col_nodes,
                    links: nextProps.links
                })
                return {
                    row_nodes: nextProps.row_nodes,
                    col_nodes: nextProps.col_nodes,
                    links: nextProps.links
                }
            }
        }

        render () {

            return (
                <>
                    {this.props.geneListIds.length > 0 ?
                        <Clustergrammer
                            key={hash(this.props.geneListIds)}
                            network_data={this.state}
                            about={""}
                            width={this.props.size.width}
                            height={this.props.size.height}
                        />
                    : <></>}
                </>
            )
        }
}
