import React, {Fragment, useState} from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';
import "./GeneListTabs.css"
import SharpenerInfo from "../SharpenerInfo/SharpenerInfo";

import Papa from "papaparse"
import fileDownload from "js-file-download";
import JSZip from 'jszip'
import GeneTableMUI from "../GeneTable/MaterialGeneTable";

import messages from "../../message-properties";

const GeneListTabsFunction = ({selectedGeneListIds, transformerName, normalizedGeneLists}) => {
    const [ tabIndex, setTabIndex ] = useState(0);
    return (
        <div style={{paddingRight: "6px"}}>

            <div style={{
                display: "flex",
                justifyContent: "space-between"
            }}>
                <span>
                    <h5 className={"info-header"}>{ messages.header.datatable }</h5>
                    <SharpenerInfo description={messages.tooltip.datatable }/>
                </span>
                <span>
                {selectedGeneListIds.length > 0 ?
                    <>
                        {/*<button onClick={(e) => {*/}
                        {/*    console.group("export current table functionality");*/}

                        {/*    console.log("normalized gene lists", normalizedGeneLists);*/}
                        {/*    console.log("selected gene list with active tab", selectedGeneListIds[tabIndex]);*/}
                        {/*    const exportedGeneList = normalizedGeneLists[selectedGeneListIds[tabIndex]].genes*/}
                        {/*            .map(gene_info => {*/}
                        {/*                return gene_info.attributes.map(attribute => ({*/}
                        {/*                    [attribute.name]: attribute.value,*/}
                        {/*                })).reduce((acc, item) => Object.assign(acc, item), gene_info.identifiers)*/}
                        {/*            });*/}

                        {/*    console.log("exported gene list", exportedGeneList);*/}
                        {/*    const csvExportedGeneList = new Blob(*/}
                        {/*        [Papa.unparse(exportedGeneList)],*/}
                        {/*        {*/}
                        {/*            type: 'text/csv'*/}
                        {/*        });*/}

                        {/*    console.log("exported file result", csvExportedGeneList);*/}
                        {/*    console.log("filename will be", transformerName[selectedGeneListIds[tabIndex]].replace(' ', '_')+'.csv');*/}
                        {/*    fileDownload(csvExportedGeneList, transformerName[selectedGeneListIds[tabIndex]].replace(/ /g, '_')+'.csv');*/}

                        {/*    console.groupEnd();*/}

                        {/*}}>*/}
                        {/*    Export Current Table*/}
                        {/*</button>*/}
                        <button onClick={(e) => {
                            const zip = new JSZip();
                            selectedGeneListIds.map(selected_gene_list_id => {

                                const exportedGeneList = normalizedGeneLists[selected_gene_list_id].genes
                                    .map(gene_info => {
                                        return gene_info.attributes.map(attribute => ({
                                            [attribute.name]: attribute.value,
                                        })).reduce((acc, item) => Object.assign(acc, item), gene_info.identifiers)});

                                const csvExportedGeneList = new Blob(
                                    [Papa.unparse(exportedGeneList)],
                                    {
                                        type: 'text/csv'
                                    });

                                zip.file(transformerName[selected_gene_list_id].replace(/ /g, '_')+'.csv', csvExportedGeneList);

                            })
                            zip.generateAsync({type: 'blob'})
                                .then(blob => {
                                    fileDownload(blob, 'gene_lists.zip')
                                })
                        }}>
                            Export All Tables
                        </button>
                    </>
                    : null }
                    {/*<PivotNav />*/}
                </span>
            </div>


            { selectedGeneListIds.length > 0 ?
                <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
                    <TabList>
                        {selectedGeneListIds.map(geneListId => (
                            <Tab>
                                <h8>{transformerName[geneListId]}</h8>
                            </Tab>
                        ))}
                    </TabList>
                    {selectedGeneListIds.map(geneListId => (
                        <TabPanel>
                            <GeneTableMUI
                                key={geneListId}
                                geneListId={geneListId}
                                nameMap={transformerName}
                            />
                        </TabPanel>
                    ))}
                </Tabs>

            : <></> }

        </div>
)
};

export default GeneListTabsFunction;
