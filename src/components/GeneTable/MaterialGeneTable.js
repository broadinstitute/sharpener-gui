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

    function setTable (geneList) {
        setColumns(
            computeColumns(geneList) //.map(entry => entry.accessor)
        );
        setData(
            computeData(geneList) //.map(entry => Object.values(entry))
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
// TODO
const mapping = {
    "gene_symbol": 1,
    "gene_name": 2,
    "synonyms": 3,
    "gene set": 4,
};
const ordering = (a, b) => {
    return (mapping[a] > mapping[b]) - (mapping[b] > mapping[a])
};

const computeColumns = geneList => (geneList ? [
        ..._.uniq(geneList.genes.reduce((acc, gene) => acc.concat(...Object.keys(gene.identifiers ? gene.identifiers : [])), []))
            .map(identifierType => ({ name: identifierType, label: identifierType}))
            .map(attribute => Object.assign(attribute, {
                options: {
                    filter: true,
                    sort: true,
                    display: 'false'
                }
            })),
        ..._.uniq(geneList.genes.reduce((acc, gene) => acc.concat(...gene.attributes), [])
            .map(attribute => attribute.name)).filter(attributeName => !(attributeName === "myGene.info id")).sort(ordering)
            .map(attributeName => ({ name: attributeName, label: attributeName  }))
            .map(attribute => Object.assign(attribute, {
                options: {
                    filter: true,
                    sort: true,
                    show: !(attribute.name === "myGene.info id") ? 'true' : 'false'
                }
            }))

    ]
    : null);

const computeData = geneList => (geneList ? geneList.genes.reduce( (data, gene) => {
    // merge gene list attributes with gene list identifiers
    return data.concat({
        ...gene.attributes.reduce((geneProps, attribute) => Object.assign(geneProps, {[attribute.name]: attribute.value}), {}),
        ...(gene.identifiers ? gene.identifiers : [])
    })
}, []) : null);

const computeTitle = (geneList) => {
    const { source, attributes } = geneList;
    // let values = '';
    // attributes.forEach((attribute, index) => {
    //     console.log(attribute.name, attribute.value)
    //     values += attribute.name + ' as ' + attribute.value;
    //     if (index > 0 && index < attributes.length - 1) {
    //         values += ', and';
    //     }
    //     console.log(values)
    //
    // })
    // return source + ' with ' + values
    return attributes.reduce((title, attribute, index) => title + attribute.name + ": " + attribute.value + index > 0 && index < attributes.length - 1 ? ', and' : '', '')
}

export default GeneTableMUI