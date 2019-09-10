import React, {Fragment} from 'react';
import _ from "underscore";
import BootstrapTable from "react-bootstrap-table-next"
import ToolkitProvider, { CSVExport } from 'react-bootstrap-table2-toolkit';
const { ExportCSVButton } = CSVExport;
import Card from "react-bootstrap/Card"
import {MyLoader} from "../ListItem";
import {Collapse} from "react-collapse"

import {FEATURE_FLAG} from "../../parameters/FeatureFlags";

import Select from 'react-select';
import {pluralize, properCase, formatAbbreviations, underscoreToSpaces, tap} from "../../helpers";

import {Tabs, Tab, TabList, DragTabList, PanelList, Panel, DragTab, AsyncPanel} from "react-tabtab"
import {arrayMove} from 'react-sortable-hoc';
import * as customStyle from 'react-tabtab/lib/themes/bootstrap';
import Spinner from "../../elements/Spinner/Spinner";

import ReactTable from "react-table"
import GeneTable from "../GeneTable/GeneTable"

const SERVICE_URL =  process.env.REACT_APP_SERVICE_URL;

// TODO: refactor into higher order component?
export default class GeneTabs extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.handleTabSequenceChange = this.handleTabSequenceChange.bind(this);
        this.state = {
            activeIndex: 0,
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

    handleTabChange(index) {
        this.setState({activeIndex: index});
    }

    handleTabSequenceChange({oldIndex, newIndex}) {
        const {geneListIDs} = this.state;
        const updateGeneListIDs = arrayMove(geneListIDs, oldIndex, newIndex);
        this.setState({ geneListIDs: updateGeneListIDs, activeIndex: newIndex });
    }

    getGenesForGeneListID = (geneListID) => {
        return () =>
            fetch(SERVICE_URL.concat("gene_list/").concat(geneListID))
                .then(response => response.json())
    };

    render(){
        const {geneListIDs, activeIndex} = this.state;
        const tabsTemplate = [];
        const panelTemplate = [];
        geneListIDs.forEach((geneListID, index) => {
            tabsTemplate.push(
                <Tab>
                    {this.props.computeGeneListName(geneListID).payload}
                </Tab>);
            panelTemplate.push(
                    <AsyncPanel
                        loadContent={ this.getGenesForGeneListID(geneListID) }
                        render={content =>
                            <Fragment>
                                {content ?
                                    <GeneTable
                                        key={ content.gene_list_id }
                                        geneListID={ content.gene_list_id }
                                        clearGeneList={ this.props.clearGeneList }
                                        handleGeneListSelection={ this.props.handleGeneListSelection }
                                        handleGeneSelection={ this.props.handleGeneSelection }/>
                                : <Spinner/>}
                            </Fragment>
                        }
                        renderLoading={() => <Spinner/>}
                        cache={false}/>
            );
        });
        return (
            <div className={"col-sm-12"}>
                <Tabs customStyle={customStyle}>
                    <TabList>
                        {tabsTemplate}
                    </TabList>
                    <PanelList>
                        {panelTemplate}
                    </PanelList>
                </Tabs>
            </div>
        )
    }
};

// function GeneTable({ columns, data }) {
//
//     // // Use the state and functions returned from useTable to build your UI
//     // const { getTableProps, headerGroups, rows, prepareRow } = useTable({
//     //     columns,
//     //     data,
//     // });
//
//     return (
//         <Fragment>
//             <ReactTable></ReactTable>
//         {/*<table {...getTableProps()}>*/}
//         {/*    <thead>*/}
//         {/*    {headerGroups.map(headerGroup => (*/}
//         {/*        <tr {...headerGroup.getHeaderGroupProps()}>*/}
//         {/*            {headerGroup.headers.map(column => (*/}
//         {/*                <th {...column.getHeaderProps()}>{column.render('Header')}</th>*/}
//         {/*            ))}*/}
//         {/*        </tr>*/}
//         {/*    ))}*/}
//         {/*    </thead>*/}
//         {/*    <tbody>*/}
//         {/*    {rows.map(*/}
//         {/*        (row, i) =>*/}
//         {/*            prepareRow(row) || (*/}
//         {/*                <tr {...row.getRowProps()}>*/}
//         {/*                    {row.cells.map(cell => {*/}
//         {/*                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>*/}
//         {/*                    })}*/}
//         {/*                </tr>*/}
//         {/*            )*/}
//         {/*    )}*/}
//         {/*    </tbody>*/}
//         {/*</table>*/}
//         </Fragment>
//     );
// }

// practically speaking all this component does or should do is showcase gene tables in chronological order (soonest to farthest)
export class GeneFeed extends React.Component {
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
                                {/* TODO https://dbushell.com/demos/tables/rt_05-01-12.html */}
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