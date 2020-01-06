import React, {useEffect, useMemo, useState} from "react"
import {useSelector} from "react-redux";

import MUIDataTables from "mui-datatables"
import {
    createMuiTheme,
    MuiThemeProvider
} from "@material-ui/core/styles";

import _ from "lodash";


const GeneTableMUI = ({ geneListId, nameMap }) => {
    const geneList = useSelector(state => state.geneLists.byId);
    // const data = useMemo(() => computeData(geneList[geneListId]), [geneListId]);

    const getMuiTheme = () =>
        createMuiTheme({
            overrides: {
                MUIDataTable: {
                    paper: {
                        boxShadow: "none"
                    }
                }
            }
        });

    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [urlIndex, setUrlIndex] = useState({});

    function setTable (geneList) {
        if (geneList) {
            setColumns(
                computeColumns(geneList) //.map(entry => entry.accessor)
            );
            setData(
                computeData(geneList) //.map(entry => Object.values(entry))
            );
        }
    }

    useEffect(() => {
        setUrlIndex(
            computerUrlIndex(geneList[geneListId])
        );
    }, [geneListId])

    useEffect(() => {
        setTable(geneList[geneListId]);
    }, [urlIndex])

    const options = {
        filterType: "textField",
        responsive: "scrollMaxHeight",
        pagination: true,
        selectableRows: 'none',
        searchOpen: true,
        print: false,
        downloadOptions: {filename: nameMap[geneListId]+'.csv', separator: ','},
        rowsPerPageOptions: [10, 15, 20, 50, 100, geneList[geneListId].genes.length].filter(option => option <= geneList[geneListId].genes.length)
    };

    const computeColumns = geneList =>
        [
            ...Object.keys(geneList.genes[0].identifiers ? geneList.genes[0].identifiers : [])
                .map(identifierType => ({ name: identifierType, label: identifierType }))
                .map(columnProperties => Object.assign(columnProperties, {
                    options: {
                        filter: true,
                        sort: true,
                        display: 'false',
                        customBodyRender: (value, tableMeta, updateValue) => renderCellElement(false)(value, tableMeta, updateValue),
                    }
                })),
            ...geneList.genes[0].attributes
                // .reduce((acc, gene) => acc.concat(...gene.attributes), [])
                .filter(attribute => !(attribute.name === "myGene.info id")).sort(ordering)
                .map(attribute => ({
                    name: attribute.name,
                    label: attribute.name,
                    has_url: attribute.url && true
                }))
                .map(columnProperties => Object.assign(columnProperties, {
                    options: {
                        filter: true,
                        sort: true,
                        show: !(columnProperties.name === "myGene.info id") ? 'true' : 'false',
                        customBodyRender: (value, tableMeta, updateValue) => renderCellElement(columnProperties.has_url)(value, tableMeta, updateValue),
                    }
                })),
            {
                name: "gene_id",
                options: {
                    display: 'false',
                    filter: false,
                    sort: false,
                    viewColumns: false,
                }
            }
        ];


    // TODO
    // function is responsible for reformatting literal values (like floats for sigfig) based on datatype
    // also responsible for ellipses/overflow?
    const renderCellContent = value => value;

    // function is responsible for managing element structure based on input genes
    // right now only case is that there is a url or not
    const renderCellElement = (has_url) => (value, tableMeta, updateValue) => {
        if (typeof value !== "undefined" && typeof tableMeta.rowData !== "undefined" && tableMeta.rowData.length > 0) {
            if (has_url) {
                // get rowData element matching HGNC id
                // get current label
                // FALSE: use HGNC id against URL map (if index is not undefined, then get url)
                // * takes advantage of gene_id being known as hgnc (guaranteed unique)
                // * takes advantage of columns being known at point of render
                // * completely hedges against unguaranteed row and column order
                // given the table's sorting functions

                let columnId = tableMeta.columnData.name;

                // TODO: NOTE: the final entry is reserved for gene_id which us used internally!
                let geneId = tableMeta.rowData[tableMeta.rowData.length - 1];
                let url = geneId && urlIndex[geneId] && urlIndex[geneId][columnId] ? urlIndex[geneId][columnId] : null;

                console.log(columnId, geneId, url)

                return (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        {renderCellContent(value)}
                    </a>
                )
            } else {
                return (
                    <span>
                        {renderCellContent(value)}
                    </span>
                )
            }
        } else {
            return null;
        }
    }

    const computeData = geneList => (geneList ? geneList.genes.reduce( (data, gene) => {
        // merge gene list attributes with gene list identifiers
        return data.concat({
            ...gene.attributes.reduce((geneProps, attribute) => {
                return Object.assign(geneProps, {
                    [attribute.name]: attribute.value
                })
            }, {}),
            ...(gene.identifiers ? gene.identifiers : []),
            "gene_id": gene.gene_id
        })
    }, []) : null);

    const computeTitle = (geneList) => {
        const { source, attributes } = geneList;
        return attributes.reduce((title, attribute, index) => title + attribute.name + ": " + attribute.value + index > 0 && index < attributes.length - 1 ? ', and' : '', '')
    }

    const computerUrlIndex = (geneList) => {
        console.group("compute URL index")
        const newUrlIndex = geneList.genes.reduce((urlIndexByGeneId, gene) => {
            urlIndexByGeneId[gene.gene_id] = {
                ...gene.attributes.reduce((attributes, attribute) => Object.assign(attributes, {
                    [attribute.name]: attribute.url === null ? undefined : attribute.url
                }), {})
            };
            console.log("outcome for "+ gene.gene_id, urlIndexByGeneId[gene.gene_id])
            return urlIndexByGeneId;
        }, {})
        console.log(newUrlIndex)
        console.groupEnd()
        return newUrlIndex;
    }

    return (
        <MuiThemeProvider theme={getMuiTheme()}>
            {(computeTitle(geneList[geneListId]))}
            <MUIDataTables
                title={''}
                columns={ columns }
                data={ data }
                options={ options }
            />
        </MuiThemeProvider>
    )
}

// column order
// DONE
const mapping = {
    "gene_symbol": 1,
    "gene_name": 2,
    "synonyms": 3,
    "gene set": 4,
};
const ordering = (a, b) => {
    return (mapping[a] > mapping[b]) - (mapping[b] > mapping[a])
};

function getSignificantDigitCount(n) {
    const log10 = Math.log(10);
    n = Math.abs(String(n).replace(".","")); //remove decimal and make positive
    if (n == 0) return 0;
    while (n != 0 && n % 10 == 0) n /= 10; //kill the 0s at the end of n
    return Math.floor(Math.log(n) / log10) + 1; //get number of digits
}

export default GeneTableMUI