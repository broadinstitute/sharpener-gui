import React, {useEffect, useMemo, useState} from "react"
import ReactTable from "react-table";
import {useSelector} from "react-redux";
import _ from "lodash";

import "react-table/react-table.css"
import "./GeneTable.css"
import "./Pagination.css"

import Select, {components} from "react-select";
import Pagination from "./Pagination";

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
        // TODO: assumes all genes are valid! (Gene List Creator can introduce invalid or incomplete genes!)
                                                                                // this check is here because custom gene lists may not always have genes the sharpener will identify (which results in `null`)
        ..._.uniq(geneList.genes.reduce((acc, gene) => acc.concat(...Object.keys(gene.identifiers ? gene.identifiers : [])), []))
                .map(identifierType => ({ Header: identifierType, accessor: identifierType, show: false })),
        ..._.uniq(geneList.genes.reduce((acc, gene) => acc.concat(...gene.attributes), [])
                .map(attribute => attribute.name)).filter(attributeName => !(attributeName === "myGene.info id")).sort(ordering)
                .map(attributeName => ({ Header: attributeName, accessor: attributeName, show: !(attributeName === "myGene.info id")  }))
    ]
    : null);

const computeData = geneList => (geneList ? geneList.genes.reduce( (data, gene) => {
    // merge gene list attributes with gene list identifiers
    return data.concat({
        ...gene.attributes.reduce((geneProps, attribute) => Object.assign(geneProps, {[attribute.name]: attribute.value}), {}),
        ...(gene.identifiers ? gene.identifiers : []) // this check is here because custom gene lists may not always have genes the sharpener will identify (which results in `null`)

    })
}, []) : null);

const GeneTable = ({ geneListId }) => {

    const geneList = useSelector(state => state.geneLists.byId);
    const data = useMemo(() => computeData(geneList[geneListId]), [geneListId]);

    const initialColumns = computeColumns(geneList[geneListId]);
    const [myColumns, setColumns] = useState(initialColumns);

    const toggleColumn = changeEvent => {
        const { name } = changeEvent.target;
        const columns = myColumns.map(column => {
            if (column.Header === name) {
                column.show = !column.show;
                return column;
            } else {
                return column;
            }
        });
        setColumns(columns);
    };

    // TODO: Do text overflow instead of text wrap for selected columns
    // https://stackoverflow.com/a/54011607/1991892
    const customStyles = {
        multiValueContainer: base => ({
            ...base,
            display: "inline-block",
            overflowX: "hidden"
        }),
        input: base => ({
            ...base,
            display: "inline-block"
        })
    };

    return (
        <>
            {/*TODO: overflow https://codesandbox.io/s/v638kx67w7*/}
            { myColumns ?
            <Select
                name={"columns"}
                className="basic-multi-select"
                classNamePrefix="select"

                styles={{
                    placeholder: base => ({
                        ...base,
                        fontSize: 14
                    }),
                    option: base => ({
                        ...base,
                        height: '100%',
                        fontSize: 16
                    }),
                }}

                // custom components
                styles={customStyles}
                components={{
                    MultiValueRemove
                }}

                onFocus={() => console.log("focus")}
                onBlur={() => console.log("blur")}

                // data and callbacks
                options={[ ...myColumns.map(column => ({label: column.Header, value: column.Header})) ]}
                defaultValue={[ ...myColumns.filter(column => !column.show).map(column => ({label: column.Header, value: column.Header})) ]}
                onChange={
                    (args, action) => {
                        if (action.action === "select-option") {
                            toggleColumn(
                                {target: { name: action.option.value}}
                            )
                        } else if (action.action === "remove-value" || action.action === "pop-value" ) {
                            toggleColumn(
                            {target: { name: action.removedValue.value}}
                            )
                        }
                    }
                }

                isMulti
                isClearable={false}
            />
            : null }

            <ReactTable
                key={"table"}
                // PaginationComponent={Pagination}
                // parameters
                columns={ myColumns }
                data={ data }

                // pagination
                defaultPageSize={10}
            />
        </>
    )
};

const MultiValueRemove = props => {
    return (
        <components.MultiValueRemove
            {...props}>
            +
        </components.MultiValueRemove>
    );
};

export default GeneTable;
