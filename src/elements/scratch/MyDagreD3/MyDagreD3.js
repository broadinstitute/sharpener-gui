import React from "react"
import DagreD3 from 'react-directed-graph/'
import * as d3 from "d3"
import reactToCSS from 'react-style-object-to-css'
import { renderToStaticMarkup } from 'react-dom/server'

export default class MyDagreD3 extends DagreD3 {
    constructor(props) {
        super(props);
    }

    addNodes() {
        // filter by Node object before continuing
        // todo: refactor to include concrete nodes
        this.props.children.filter((el) => el.props.type === "BaseNode").forEach((node) => {
            this.g.setNode(node.props.id, {
                label: renderToStaticMarkup(node),
                labelType: "html",
                style: reactToCSS(node.props.style),
                padding: 0
            })
        })
    }

    addLines() {
        // filter by Line object before continuing
        // todo: refactor to include concrete edges
        this.props.children.filter((el) => el.props.type === "BaseEdge").forEach((edge) => {
            this.g.setEdge(edge.props.source, edge.props.target, {
                labelType: 'html',
                label: edge.label,
                style: reactToCSS(edge.lineStyle),
                curve: d3.curveBasis,
                // style: "stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;",
                arrowheadStyle: reactToCSS(edge.arrowheadStyle)
            })
        })
    }

}