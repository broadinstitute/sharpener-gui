import React, {useCallback, useEffect, useRef, useState} from "react"
import * as d3 from "d3";
import "./CollapsibleHeatMap.css"
import {CollapsibleHeatMap} from "./CollapsibleHeatMap";
import {useDispatch} from "react-redux";

function ReactCollapsibleHeatMapFunction ({nodes, links, size}) {
    const dispatch = useDispatch();

    const [heatmap, setHeatmap] = useState(null);

    const [svg, setSvg] = useState(null);
    const measuredSVGRef = useCallback(node => {
        if (node !== null) {
            setSvg(d3.select(node));
        }
    }, []);

    useEffect(() => {
        if (svg) {
            const margin = { top: 80, bottom: 20, left: 80, right: 20 };
            const data = { nodes, links }
            const onClick = (d) => {
                dispatch({ type: "TEST", payload: d })
            };
            setHeatmap(new CollapsibleHeatMap(size.height, size.width, margin, svg, data, onClick));
        }
    }, []);

    useEffect(() => {
        if (heatmap) {
            heatmap.init();
            heatmap.load();

            const heatmapControl = document.getElementById("controls")

            const sortByGene = document.getElementById("sortGene");
            sortByGene.onclick = () => {
                heatmap.sortRows();
            };
            const sortByGeneFrequency = document.getElementById("sortGeneFrequency");
            sortByGeneFrequency.onclick = () => {
                heatmap.sortRowsFrequency();
            };

            const sortByProcedure = document.getElementById("sortProcedure");
            sortByProcedure.onclick = () => {
                heatmap.sortColumns();
            };

            const sortByProcedureFrequency = document.getElementById("sortProcedureFrequency");
            sortByProcedureFrequency.onclick = () => {
                heatmap.sortColumnsFrequency();
            };

            const filterByRowsInput = document.getElementsByName("rowFilter")[0];
            filterByRowsInput.addEventListener("input", e =>
                heatmap.filter("rows", filterByRowsInput.value)
            );
        }
    }, [heatmap]);

    useEffect(() => {
        console.log(nodes, links)
        if (nodes && links && svg) {
            const margin = { top: 80, bottom: 20, left: 80, right: 20 };
            const data = { nodes, links }
            const onClick = (d) => {
                dispatch({ type: "TEST", payload: d })
            };

            setHeatmap(new CollapsibleHeatMap(size.height, size.width, margin, svg, data, onClick));
        }
    }, [links]);

    return (
        <div ref={measuredSVGRef}></div>
    )
}

export default ReactCollapsibleHeatMapFunction;