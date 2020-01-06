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

    useEffect(() => {
        setTable(geneList[geneListId]);
    }, [geneListId])

    const [columns, setColumns] = useState([]);
    const [data, setData] = useState([]);
    const [urlIndex, setUrlIndex] = useState({});

    function setTable (geneList) {
        setColumns(
            computeColumns(geneList) //.map(entry => entry.accessor)
        );
        setData(
            computeData(geneList) //.map(entry => Object.values(entry))
        );
        setUrlIndex(
            computerUrlIndex(geneList)
        );
    }

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

    // assume heterogeneity of attributes of gene data?
        // TODO: a lot of this would be resolved by an API refactoring that loaded on attributes of a gene list total
            // wouldn't have to assume i needed to look over every gene (lazily or not) due to aggregators blowing
            // up the cases
    const computeColumns = geneList => (geneList ?
        [
            ...Object.keys(geneList.genes[0].identifiers ? geneList.genes[0].identifiers : [])
                .map(identifierType => ({ name: identifierType, label: identifierType }))
                .map(attributeProperties => Object.assign(attributeProperties, {
                    options: {
                        filter: true,
                        sort: true,
                        display: 'false',
                        customBodyRender: (value, tableMeta, updateValue) => {
                            return (
                                <GeneDataColumn data={value}/>
                            );
                        }
                    }
                })),
            ...geneList.genes[0].attributes
                // .reduce((acc, gene) => acc.concat(...gene.attributes), [])
                .filter(attribute => !(attribute.name === "myGene.info id")).sort(ordering)
                .map(attribute => ({
                    name: attribute.name+".label",
                    label: attribute.name,
                    has_url: attribute.url && true
                }))
                .map(columnProperties => Object.assign(columnProperties, {
                    options: {
                        filter: true,
                        sort: true,
                        customBodyRender: (value, tableMeta, updateValue) => renderCellElement(columnProperties.has_url)(value, tableMeta, updateValue),
                        show: !(columnProperties.name === "myGene.info id") ? 'true' : 'false'
                    }
                }))
        ]
        : null);


    // TODO
    // function is responsible for reformatting literal values (like floats for sigfig) based on datatype
    // also responsible for ellipses/overflow?
    const renderCellContent = value => value;

    // function is responsible for managing element structure based on input genes
    // right now only case is that there is a url or not
    const renderCellElement = (has_url) => (value, tableMeta, updateValue) => {
        // get rowData element matching HGNC id
        // get current label
        // use HGNC id against URL map (if index is not undefined, then get url)
        // * takes advantage of gene_id being known as hgnc (guaranteed unique)
        // * takes advantage of columns being known at point of render
        // * completely hedges against unguaranteed row and column order
        // given the table's sorting functions

        if (typeof value !== "undefined" && typeof tableMeta.rowData !== "undefined" && tableMeta.rowData.length > 0) {
            return (
                <div>
                    {has_url ?
                        <a href={"http://google.com"} target="_blank" rel="noopener noreferrer">
                            {renderCellContent(value)}
                        </a>
                        : <span>
                            {renderCellContent(value)}
                        </span>}
                </div>
            );
        } else {
            return null;
        }
    }

    const computeData = geneList => (geneList ? geneList.genes.reduce( (data, gene) => {
        // merge gene list attributes with gene list identifiers
        return data.concat({
            ...gene.attributes.reduce((geneProps, attribute) => {
                return Object.assign(geneProps, {
                    [attribute.name]: { label: attribute.value, url: attribute.url }
                })
            }, {}),
            ...(gene.identifiers ? gene.identifiers : [])
        })
    }, []) : null);

    const computeTitle = (geneList) => {
        const { source, attributes } = geneList;
        return attributes.reduce((title, attribute, index) => title + attribute.name + ": " + attribute.value + index > 0 && index < attributes.length - 1 ? ', and' : '', '')
    }

    const computerUrlIndex = (geneList) => {
        return geneList.genes.reduce((urlIndexByGeneId, gene) => {
            urlIndexByGeneId[gene.gene_id] = {
                ...gene.attributes.reduce((attributes, attribute) => Object.assign(attributes, {
                    [attribute.name]: attribute.url === null ? undefined : attribute.url
                }), {})
            };
            return urlIndexByGeneId;
        }, {})
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

const GeneDataColumn = ({ data }) => {
    if (typeof data !== "undefined") {
        let label = !Number.isNaN(+data.label) ?
            Number(+data.label).toPrecision(3) // TODO minimal of precisions
            : data.label;
        return (
            <div>
                { data.url ?
                    <a href={data.url} target="_blank" rel="noopener noreferrer">
                        {data.value}
                    </a>
                :   <span>
                        {data.value}
                    </span> }
            </div>
        )
    } else {
        return null;
    }
}

function getSignificantDigitCount(n) {
    const log10 = Math.log(10);
    n = Math.abs(String(n).replace(".","")); //remove decimal and make positive
    if (n == 0) return 0;
    while (n != 0 && n % 10 == 0) n /= 10; //kill the 0s at the end of n
    return Math.floor(Math.log(n) / log10) + 1; //get number of digits
}

export default GeneTableMUI