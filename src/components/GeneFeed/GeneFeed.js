import React, {Fragment} from 'react';
import {Tabs, Tab, TabList, PanelList, AsyncPanel} from "react-tabtab"
import {arrayMove} from 'react-sortable-hoc';
import * as customStyle from 'react-tabtab/lib/themes/bootstrap';
import Spinner from "../../elements/Spinner/Spinner";

import ReactTable from "react-table"
import GeneTable from "../GeneTable/GeneTable"
import {geneListTitleOf} from "../../helpers";
import {computeGeneListName} from "../../actions";

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

    handleEdit = ({type, index}) => {
        console.log(type, index);
        let { geneListIDs } = this.state;
        if (type === 'delete') {
            // if we're here we can assume that the geneListID is, in fact, selected, so toggling it should unselect it
            // what will this do to active index?
            this.props.handleGeneListSelection(geneListIDs[index]);
        }
    };

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
        const { geneListIDs } = this.state;
        const tabsTemplate = [];
        const panelTemplate = [];
        geneListIDs.forEach((geneListID, index) => {
            const closable = geneListIDs.length > 0;  // we're allowed to have no gene lists, so we can close with at least one gene list
            // const closable = geneListIDs.length > 1;  // bugs out the modal if we let all tabs to be closable from that component! so we will need to do this for now...
            tabsTemplate.push(
                <Tab key={index} closable={closable}>
                    {this.props.computeGeneListName(geneListID).payload}
                </Tab>);
            panelTemplate.push(
                    <AsyncPanel
                        key={index}
                        loadContent={ this.getGenesForGeneListID(geneListID) }
                        render={content =>
                            <Fragment>
                                {content ?
                                    <GeneTable
                                        key={ content.gene_list_id }
                                        geneListID={ content.gene_list_id }
                                        clearGeneList={ this.props.clearGeneList }
                                        handleGeneListSelection={ this.props.handleGeneListSelection }/>
                                : <Spinner/>}
                            </Fragment>
                        }
                        renderLoading={() => <Spinner/>}
                        cache={true}/>
            );
        });
        return (
            <div className={"col-sm-12"}>
                <Tabs customStyle={customStyle}
                      onTabEdit={this.handleEdit}
                      onTabChange={this.handleTabChange}
                      // onTabSequenceChange={this.handleTabSequenceChange}
                      showModalButton={3}>
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
                            ) : <Spinner/>
                        }
                    </div>
            </Fragment>
        )
    }
}