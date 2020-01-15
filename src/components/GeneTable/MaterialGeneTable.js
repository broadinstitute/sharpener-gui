import React, {useEffect, useMemo, useState} from "react"
import {useSelector} from "react-redux";
import Parallel from "paralleljs"
import {Spinner} from "reactstrap"
import MUIDataTables from "mui-datatables"
import {
    createMuiTheme,
    MuiThemeProvider
} from "@material-ui/core/styles";
import "./GeneTable.css";
import * as RD from "ramda-decimal"

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

const GeneTableMUI = ({ geneListId, nameMap }) => {
    const geneList = useSelector(state => state.geneLists.byId[geneListId]);
    const [urlIndex, setUrlIndex] = useState(null);
    const [columns, setColumns] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        computeUrlIndex(geneList);
    }, [geneListId])

    useEffect(() => {
        if (urlIndex) {
            setColumns(computeColumns(geneList));
        }
    }, [urlIndex]);

    useEffect(() => {
        if (urlIndex) {
            let para = new Parallel(geneList.genes);
            para.spawn(function (data) {
                return data.map(gene => {
                    let tmpObj = {};

                    // for of = property values
                    for (let attribute of gene.attributes) {
                        // console.log(attribute, gene.attributes)
                        tmpObj = Object.assign(tmpObj, {
                            [attribute.name]: attribute.value
                        })
                    }
                    // for in = property names
                    for (let identifier in gene.identifiers) {
                        // console.log(identifier, gene.identifiers)
                        tmpObj = Object.assign(tmpObj, {
                            [identifier]: gene.identifiers[identifier]
                        })
                    }
                    tmpObj = Object.assign(tmpObj, {
                        "gene_id": gene.gene_id
                    });
                    tmpObj = Object.assign(tmpObj, {
                        "source": gene.source
                    });

                    return tmpObj;
                })
            })
            .then(result => {
                setData(result)
            });
        }
    }, [urlIndex]);

    const options = {
        filterType: "textField",
        pagination: true,
        selectableRows: 'none',
        searchOpen: true,
        print: false,
        downloadOptions: {filename: nameMap[geneListId]+'.csv', separator: ','},
        rowsPerPageOptions: [10, 15, 20, 50, 100, geneList.genes.length].filter(option => option <= geneList.genes.length)
    };

    const computeColumns = geneList => {
        // TODO: ASSUMING ATTRIBUTES ARE HETEROGENUOUS ON GENES
        const columns = [
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
            },
            {
                name: "source",
                options: {
                    display: true,
                    filter: true,
                    sort: true,
                    viewColumns: true,
                }
            }
        ];
        return columns;
    };

    // TODO
    // function is responsible for reformatting literal values (like floats for sigfig) based on datatype
    // also responsible for ellipses/overflow?
    const renderCellContent = value =>
        value &&!isNaN(value) ?
            isExponential(value) ? Number.parseFloat(+value).toPrecision(3)
            : RD.toFixed(Math.min(getSignificantDigitCount(+value), 3))(+value)
        : value ;

    // function is responsible for managing element structure based on input genes
    // right now only case is that there is a url or not
    const renderCellElement = (has_url) => (value, tableMeta, updateValue) => {
        if (typeof value !== "undefined" && typeof tableMeta.rowData !== "undefined" && tableMeta.rowData.length > 0) {
            if (has_url) {
                // get rowData element matching HGNC id
                // get current label
                // FALSE: use HGNC id against URL map (if index is not undefined, then get url) -> not ever gene has an HGNC ID?!?
                    // Actual: gene_id can be IDs other than HGNC
                // SOLUTION: append gene_id as a column since it's the sole consistent arbitrator of identity in the client AFAICT
                // * takes advantage of gene_id being known as hgnc (guaranteed unique)
                // * takes advantage of columns being known at point of render
                // * completely hedges against unguaranteed row and column order
                // given the table's sorting functions

                let columnId = tableMeta.columnData.name;
                // TODO: NOTE: the final entry is reserved for gene_id which us used internally!
                let geneId = tableMeta.rowData[tableMeta.rowData.length - 1];
                let url = geneId && urlIndex[geneId] && urlIndex[geneId][columnId] ? urlIndex[geneId][columnId] : null;

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
    };

    const computeTitle = (geneList) => {
        const { source, attributes } = geneList;
        return attributes.reduce((title, attribute, index) => title + attribute.name + ": " + attribute.value + index > 0 && index < attributes.length - 1 ? ', and' : '', '')
    };

    const computeUrlIndex = (geneList) => {
        let para = new Parallel(geneList.genes);
        para.spawn(function (data) {
            const reducer = (acc, gene) => {
                let urlAttributePredicateTable = {};
                for (let attribute of gene.attributes) {
                    urlAttributePredicateTable = Object.assign(
                        urlAttributePredicateTable,
                        {
                            [attribute.name]: attribute.url
                        }
                    )
                }
                acc[gene.gene_id] = urlAttributePredicateTable;
                return acc;
            };
            const paraReducer = (d) => reducer(d[0], d[1]);

            return data.reduce(reducer)
        })
        .then(result => {
            setUrlIndex(result);
        });
    };

    return (
        <>
            { columns && data ?
                <MuiThemeProvider theme={getMuiTheme()}>
                    {(computeTitle(geneList))}
                    <MUIDataTables
                        title={''}
                        columns={ columns }
                        data={ data }
                        options={ options }
                    />
                </MuiThemeProvider>
            :   <div style={{paddingTop: "50%", paddingLeft: "50%", height: "1vh"}}>
                    <Spinner size={"lg"}/>
                </div> }
        </>
    )
};

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

function isExponential(n) {
    return /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)/.test(n);
}

export default GeneTableMUI