import React, {useCallback, useEffect, useRef, useState} from "react"
import * as d3 from "d3";
import "./CollapsibleHeatMap.css"
import {CollapsibleHeatMap} from "./CollapsibleHeatMap";
import * as Space from "react-spaces"
import {useDispatch} from "react-redux";

function ReactCollapsibleHeatMapFunction ({nodes, links, size}) {
    const dispatch = useDispatch();

    const [svg, setSvg] = useState(null);
    const measuredSVGRef = useCallback(node => {
        if (node !== null) {
            setSvg(d3.select(node));
        }
    }, []);

    useEffect(() => {
        console.log(nodes, links)
        if (nodes && links && svg) {
            const url =
                "https://gist.githubusercontent.com/ficolo/ec9f88861ef417d05830765680ba0d76/raw/2d9969a81a12efff491234836a381de9374591fe/late-adult-data.json";
            const margin = { top: 80, bottom: 20, left: 80, right: 20 };
            const data = { nodes, links }
            const onClick = (d) => {
                dispatch({ type: "TEST", payload: d })
            }

            const heatmap = new CollapsibleHeatMap(size.height, size.width, margin, url, svg, data, onClick);
            heatmap.init();
            heatmap.load();

            const heatmapControl = document.getElementById("controls")
            const sortByGene = document.getElementById("sortGene");
            sortByGene.textContent = "Sort rows";
            sortByGene.onclick = () => {
                heatmap.sortRows();
            };

            // heatmapControl.appendChild(sortByGene);

            const sortByProcedure = document.getElementById("sortProcedure");
            sortByProcedure.textContent = "Sort columns";
            sortByProcedure.onclick = () => {
                heatmap.sortColumns();
            };

            // heatmapControl.appendChild(sortByProcedure);

            // const filterByRowsLabel = heatmapControl.appendChild(document.createElement("label"));
            // filterByRowsLabel.setAttribute("for", "rowFilter");
            // filterByRowsLabel.textContent = "Filter by row: ";

            const filterByRowsInput = document.getElementsByName("rowFilter")[0];
            filterByRowsInput.addEventListener("input", e =>
                heatmap.filter("rows", filterByRowsInput.value)
            );

            // heatmapControl.appendChild(filterByRowsInput);

            // const filterByColumnsLabel = heatmapControl.appendChild(document.createElement("label"));
            // filterByColumnsLabel.setAttribute("for", "columnFilter");
            // filterByColumnsLabel.textContent = "Filter by column: ";
            //
            // const filterByColumnsInput = document.createElement("input");
            // filterByColumnsInput.addEventListener("input", e =>
            //     heatmap.filter("columns", filterByColumnsInput.value)
            // );
            // filterByColumnsInput.name = "columnFilter";
            // heatmapControl.appendChild(filterByColumnsInput);


        }
    }, [links])

    return (
        <div ref={measuredSVGRef}></div>
    )
}

export default ReactCollapsibleHeatMapFunction;