import * as d3 from 'd3';

export const node = document.createElement('div');

const width = 960,
    height = 500;

const svg = d3.select(node).append("svg")
    .attr("width", width)
    .attr("height", height);

const defs = svg.append("defs");

defs.append("clipPath")
    .attr("id", "circle1")
    .append("circle")
    .attr("cx", 350)
    .attr("cy", 200)
    .attr("r", 180);

defs.append("clipPath")
    .attr("id", "circle2")
    .append("circle")
    .attr("cx", 550)
    .attr("cy", 200)
    .attr("r", 180);

// put all functionality that should occur on load inside an on mount function
svg.on("mount", function(){
    applyTransition()
});

function applyTransition() {
    //reselect dom elements that functionality will be applied to
    d3.selectAll("circle")
        .transition()
        .duration(500)
        .delay(function(d) { return d * 40; })
        .each(slide);

    function slide() {
        let circle = d3.select(this);
        (function repeat() {
            circle = circle.transition()
                .attr("cx", width)
                .transition()
                .attr("cx", 0)
                .each("end", repeat);
        })();

    }
}
