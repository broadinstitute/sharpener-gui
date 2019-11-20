import React, {useEffect, useState} from "react"
import VegaLite from 'react-vega-lite';
import {SizeMe} from "react-sizeme";
import {Vega} from "react-vega";

const spec = {
    "description": "A simple bar chart with embedded data.",
    "mark": "rect",
    "encoding": {
        "y": {"field": "a", "type": "nominal"},
        "x": {"field": "b", "type": "nominal"}
    }
};

export const GenePivotLite = ({geneListIds}) => {
    const [data, setData] = useState({ values: [] });
    useEffect( () => {

        const gene_list_ids = geneListIds;
        /*
        {"gene_list_id":"vSkUb1YKwJ","source":"user input","attributes":[],"genes":[{"gene_id":"HGNC:17646","identifiers":{"entrez":"NCBIGene:55768","hgnc":"HGNC:17646","mim":"MIM:610661","ensembl":["ENSEMBL:ENSG00000151092"],"mygene_info":"55768"},"attributes":[{"name":"myGene.info id","value":"55768","source":"myGene.info"},{"name":"gene_symbol","value":"NGLY1","source":"myGene.info"},{"name":"synonyms","value":"CDDG;CDG1V;PNG1;PNGase","source":"myGene.info"},{"name":"gene_name","value":"N-glycanase 1","source":"myGene.info"},{"name":"source","value":"user input","source":"user input"}]}]}
        */
        async function fetchGeneLists() {
            const geneLists = await Promise.all(gene_list_ids.map(gene_list_id => fetch("https://sharpener.ncats.io/api/gene_list/" + gene_list_id, {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(geneList => {

                        const dataValues = geneList.genes.map(
                            gene => ({
                                a: gene.gene_id,
                                b: geneList.gene_list_id
                            })
                        );

                        setData(
                            { values: data.values.concat(dataValues) }
                        );

                    })
                    .catch(error => {
                        console.error(error)
                    })
            ))
        }
        fetchGeneLists();
    }, [geneListIds]);

    return (
        <SizeMe>
            {({size}) =>
                <VegaLite
                    width={size.width}
                    height={size.height}
                    spec={spec}
                    data={data}/>}
        </SizeMe>
    )
};

const bigSpec = {
    "$schema": "https://vega.github.io/schema/vega/v5.json",
    "padding": 2,
    "data": [{
        "name": "values"
    }],
    "scales": [
        {
            "name": "x",
            "type": "nominal",
            "domain": {
                "data": "values",
                "field": "gene_id"
            }
        },
        {
            "name": "y",
            "type": "nominal",
            "domain": {
                "data": "values",
                "field": "gene_list_id"
            }
        }
    ],
    "marks": [
        {
            "type": "rect",
            "from": {"data": "values"},
            "encode": {
                "enter": {
                    "x": { "scale": "x", "field": "gene_id"},
                    "y": { "scale": "x", "field": "gene_list_id"},
                    "fill": {"value": "#333"}
                },
                "update": {
                    "fill": {"value": "#333"}
                }
            }
        }
    ]
}



export const GenePivotFull = ({geneListIds}) => {

    const [data, setData] = useState({ values: [] });
    useEffect( () => {

        const gene_list_ids = geneListIds;
        /*
        {"gene_list_id":"vSkUb1YKwJ","source":"user input","attributes":[],"genes":[{"gene_id":"HGNC:17646","identifiers":{"entrez":"NCBIGene:55768","hgnc":"HGNC:17646","mim":"MIM:610661","ensembl":["ENSEMBL:ENSG00000151092"],"mygene_info":"55768"},"attributes":[{"name":"myGene.info id","value":"55768","source":"myGene.info"},{"name":"gene_symbol","value":"NGLY1","source":"myGene.info"},{"name":"synonyms","value":"CDDG;CDG1V;PNG1;PNGase","source":"myGene.info"},{"name":"gene_name","value":"N-glycanase 1","source":"myGene.info"},{"name":"source","value":"user input","source":"user input"}]}]}
        */
        async function fetchGeneLists() {
            const geneLists = await Promise.all(gene_list_ids.map(gene_list_id => fetch("https://sharpener.ncats.io/api/gene_list/" + gene_list_id, {
                    method: "GET",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => response.json())
                    .then(geneList => {

                        const dataValues = geneList.genes.map(
                            gene => ({
                                gene_id: gene.gene_id,
                                gene_list_id: geneList.gene_list_id
                            })
                        );

                        setData(
                            { values: data.values.concat(dataValues) }
                        );

                    })
                    .catch(error => {
                        console.error(error)
                    })
            ))
        }
        fetchGeneLists();
    }, [geneListIds]);

    return (
        <Vega
            spec={bigSpec}
            data={data}
        />
    )
}
