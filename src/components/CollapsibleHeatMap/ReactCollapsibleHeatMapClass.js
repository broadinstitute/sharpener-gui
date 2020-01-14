import React, {useCallback, useEffect, useRef, useState} from "react"
import * as d3 from "d3";
import "./CollapsibleHeatMap.css"
import {CollapsibleHeatMap} from "./CollapsibleHeatMap";
import {useDispatch} from "react-redux";
import useStateWithCallback from 'use-state-with-callback';

class ReactCollapsibleHeatMapClass extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    componentDidMount() {
        const {nodes, links, size} = this.props;
        this.initializeHeatMap(nodes, links, size);
        this.forceUpdate();
    }

    componentWillReceiveProps(nextProps) {
        const {nodes, links, size} = nextProps;
        this.initializeHeatMap(nodes, links, size);
    }

    // const measuredSVGRef = useCallback(node => {
    //     if (node !== null) {
    //         setSvg(d3.select(node));
    //     }
    // }, []);

    initializeHeatMap = (nodes, links, size) => {
        const margin = { top: 80, bottom: 0, left: 80, right: 0 };
        const data = { nodes, links }
        const heatmap = new CollapsibleHeatMap(size.height, size.width, margin, this.svg, data);
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
    };
    render() {
        return (
            <div ref={element => {
                     if (element != null) {
                        this.svg = d3.select(element)
                    }
                 }}>
            </div>
        )
    }
}

export default ReactCollapsibleHeatMapClass;