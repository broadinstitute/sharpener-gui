import React, {useEffect, useState} from "react"
import {ResponsiveHeatMap, ResponsiveHeatMapCanvas} from '@nivo/heatmap'
import {useSelector} from "react-redux";
import {createSelector} from "reselect"
import _ from "lodash"
// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
export const GenePivotNivo = ({ size, geneListIds, geneListsById /* see data tab */ }) => {

    const [data, setData] = useState(null);

    useEffect(() => {
        const combineGeneLists = (geneListIds, geneListsById) => geneListIds.map(geneListId => {
            const { gene_list_id, genes } = geneListsById[geneListId];
            return { gene_list_id, genes }
        });
        const combineGenes = genesAndGeneListId => _.flatten(genesAndGeneListId.map(item => item.genes))
        const makeDataIndexedByGeneList = (genesAndGeneListId, genes) => genesAndGeneListId.map(item =>
            ({
                gene_list_id: item.gene_list_id,
                ...genes.reduce((acc, gene) => Object.assign(acc, {
                    [gene.gene_id]: item.genes.map(itemGene => itemGene.gene_id).includes(gene.gene_id) ? 1 : 0,
                    [gene.gene_id+"Color"]: item.genes.map(itemGene => itemGene.gene_id).includes(gene.gene_id) ? "hsl(315, 70%, 50%)" : "hsl(51, 70%, 50%)"
                }), {})
            })
        );

        const makeDataIndexedByGene = (genesAndGeneListId, genes) =>
            genes.map(gene => gene.gene_id)
                .map(geneId => genesAndGeneListId.reduce((acc, item) =>
                    Object.assign(acc, {
                        [item.gene_list_id]: item.genes.map(gene => gene.gene_id).includes(geneId) ? 1 : 0,
                        [item.gene_list_id+"Color"]: item.genes.map(gene => gene.gene_id).includes(geneId) ? "hsl(315, 70%, 50%)" : "hsl(51, 70%, 50%)"
                    }), { "gene_id": geneId }))

        const genesAndGeneListId = combineGeneLists(geneListIds, geneListsById);
        const data = makeDataIndexedByGene(genesAndGeneListId, combineGenes(genesAndGeneListId));
        setData(data)
    }, [geneListIds]);

    return (
        <>
        <ResponsiveHeatMapCanvas
            data={ data }
            keys={ _.flatten(geneListIds.map(geneListId => geneListsById[geneListId])).map(geneList => geneList.gene_list_id) }
            indexBy="gene_id"
            // margin={{ top: 100, right: 60, bottom: 60, left: 60 }}
            forceSquare={false}
            width={size.width}
            height={size.height}
            axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: -90, legend: 'gene_id', legendOffset: 36 }}
            axisRight={null}
            axisBottom={null}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: '',
                legendPosition: 'middle',
                legendOffset: -40
            }}
            cellOpacity={1}
            cellBorderColor={{ from: 'color', modifiers: [ [ 'darker', 0.4 ] ] }}
            labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.8 ] ] }}
            defs={[
                {
                    id: 'lines',
                    type: 'patternLines',
                    background: 'inherit',
                    color: 'rgba(0, 0, 0, 0.1)',
                    rotation: -45,
                    lineWidth: 4,
                    spacing: 7
                }
            ]}
            fill={[ { id: 'lines' } ]}
            animate={false}
            motionStiffness={80}
            motionDamping={9}
            hoverTarget="cell"
            cellHoverOthersOpacity={0.25}
        />
        </>
    )
}
