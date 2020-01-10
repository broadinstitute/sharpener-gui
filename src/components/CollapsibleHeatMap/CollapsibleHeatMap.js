import * as d3 from "d3"
import _ from "lodash"


const SCALE_HEIGHT = 1
export class CollapsibleHeatMap {
    constructor(height, width, margin, rootElement, data=null, onClick=null) {
        this.height = height;
        this.width = width;
        this.margin = margin;
        this.rootElement = rootElement;
        this.data = data;
        this.onClick = onClick;
    }

    init() {
        this.rootElement.selectAll("*").remove();

        this.svg = (this.rootElement)
            .append("svg")
            .attr("height", this.height)
            .attr("width", this.width)
            .attr("viewBox", [0, 0, this.width, this.height]);

        let clips = this.svg.append("defs");
        clips
            .append("clipPath")
            .attr("id", "mainClip")
            .append("rect")
            .attr("x", this.margin.left + 2)
            .attr("y", this.margin.top + 2)
            .attr("width", this.width - this.margin.right)
            .attr("height", this.height - this.margin.bottom);

        clips
            .append("clipPath")
            .attr("id", "xClip")
            .append("rect")
            .attr("x", this.margin.left + 2)
            .attr("y", 0)
            .attr("width", this.width - this.margin.right)
            .attr("height", this.margin.top + 2);

        clips
            .append("clipPath")
            .attr("id", "yClip")
            .append("rect")
            .attr("x", 0)
            .attr("y", this.margin.top + 2)
            .attr("width", this.margin.left + 2)
            .attr("height", this.height - this.margin.bottom);

        this.chartBody = this.svg
            .append("g")
            .attr("y", 20)
            .attr("class", "chartBody")
            .attr("clip-path", "url(#mainClip)");

        this.main = this.chartBody.append("g").attr("class", "main");

        this.title = this.svg
            .append("text")
            .attr("class", "title")
            .attr("x", this.width / 2)
            .attr("y", 16)
            .style("text-anchor", "middle");

        this.gY = this.svg
            .append("g")
            .attr("clip-path", "url(#yClip)")
            .append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${this.margin.left}, 0)`);

        this.gX = this.svg
            .append("g")
            .attr("clip-path", "url(#xClip)")
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.margin.top})`);

        this.reds = d3
            .scaleOrdinal()
            .domain([-1, 1])
            .range(["#dedede8f", "#ed7b25c4", "#15a2b88f"]);

        this.x = d3
            .scaleBand()
            .range([this.margin.left, this.width - this.margin.right])
            .padding(0.05);

        this.y = d3
            .scaleBand()
            .range([this.height - this.margin.bottom, this.margin.top + 2])
            .padding(0.05);

        this.xAxis = d3.axisTop(this.x);
        this.yAxis = d3.axisLeft(this.y);
        this.zoom = d3
            .zoom()
            .scaleExtent([1, 10])
            .translateExtent([
                [this.margin.left, this.margin.top + 2],
                [this.width, this.height]
            ])
            .extent([
                [this.margin.left, this.margin.top + 2],
                [this.width, this.height]
            ])
            .on("zoom", () => this.zoomed());
        this.svg.call(this.zoom);
    }

    load() {
        if (!(this.data === null)) {
            this.genes = this.data.nodes
                .filter(item => item.type === "gene")
                .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
            this.procedures = this.data.nodes
                .filter(item => item.type === "procedure")
                .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
            this.parameters = this.data.nodes
                .filter(item => item.type === "parameter")
                .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
            this.rows = this.genes.reverse();
            this.columns = this.procedures;
            this.render();
        }
    }

    render(sortBy) {
        const transition = this.svg.transition().duration(750);
        if (this.selectedProcedure) {
            this.svg
                .select(".title")
                .attr("class", "title clickable-text")
                .on("click", () => {
                    this.selectedProcedure = false;
                    this.columns = this.procedures;
                    this.resetted();
                    this.render();
                })
                .html(`← Genes vs ${this.selectedProcedure} gene lists`);
        } else {
            this.svg
                .select(".title")
                .attr("class", "title")
                .on("click", null)
                .text("Genes vs Sources");
        }

        const pairing = d3.cross(this.rows, this.columns);
        const matrix = pairing.reduce((acc, cur) => {
            if (acc[cur[0].id] === undefined) {
                acc[cur[0].id] = {};
            }
            const link = this.data.links.find(
                link => link.source === cur[0].id && link.target === cur[1].id
            );
            let color = link ? link.weight : -1;
            color = color > 0 ? 1 : color;
            acc[cur[0].id][cur[1].id] = color;
            return acc;
        }, {});

        const columnNames = this.columns.map(g => g.name);
        const rowNames = this.rows.map(p => p.name);

        this.x.domain(columnNames);
        this.y.domain(rowNames);

        const delay = label => {
            const domain = sortBy == "columns" ? columnNames : rowNames;
            const value = domain.indexOf(label);
            const distanceToCenter =
                domain.length - Math.abs(domain.length / 2 - value);
            return distanceToCenter * 20;
        };

        const delayCell = d => delay(d[sortBy == "columns" ? 1 : 0].name);

        this.main
            .selectAll("rect")
            .data(pairing, ([gene, procedure]) => gene.id + "_" + procedure.id)
            .join(
                enter =>
                    enter
                        .append("rect")
                        .attr("transform", ([gene, procedure]) => {
                            return `translate(${this.x(procedure.name)},${this.y(
                                gene.name
                            )})`;
                        })
                        .style("opacity", 0.5)
                        .attr("fill", ([gene, procedure]) =>
                            this.reds(matrix[gene.id][procedure.id])
                        )
                        .attr("width", Math.round(this.x.bandwidth()))
                        .attr("height", Math.round(this.y.bandwidth()))
                        .on("mouseover", p => this.mouseover(p))
                        .on("mouseout", this.mouseout)
                        .on("click", d => {
                            // window.open(
                            //     `https://www.mousephenotype.org/data/genes/${d[0].id}`,
                            //     "_blank"
                            // );
                            this.onClick(d);
                        }),
                update => {
                    update
                        .transition(transition)
                        .delay(sortBy ? delayCell : 0)
                        .attr("width", Math.round(this.x.bandwidth()))
                        .attr("height", Math.round(this.y.bandwidth()))
                        .attr("transform", ([row, column], index) => {
                            return `translate(${this.x(column.name)},${this.y(row.name)})`;
                        });
                    return update;
                },
                exit => {
                    return exit
                        .transition(transition)
                        .style("opacity", 0)
                        .remove();
                }
            )
            .transition(transition)
            .style("opacity", 1);

        let suffix = !this.selectedProcedure ? " +" : "";

        this.gX
            .transition(this.svg.transition().duration(750))
            .delay(sortBy ? delay : null)
            .call(
                this.xAxis.tickFormat(d => this.truncate.apply(d, [25, true]) + suffix)
            )
            .on("end", () => {
                if (this.selectedProcedure) {
                    xLabels.on("click", null).attr("class", "");
                } else {
                    xLabels
                        .on("click", procedureName => {
                            this.selectedProcedure = procedureName;
                            this.columns = this.parameters.filter(parameter =>
                                parameter.id.startsWith(
                                    this.procedures.find(p => p.name === this.selectedProcedure)
                                        .id + "|"
                                )
                            );
                            this.resetted();
                            this.render();
                        })
                        .attr("class", "clickable-text");
                }
            });
        this.gY
            .transition(this.svg.transition().duration(750))
            .delay(sortBy ? delay : null)
            .call(this.yAxis);

        const xLabels = this.gX
            .selectAll("text")
            .attr("x", 5)
            .attr("dy", ".35em")
            .attr("transform", (d, i, n) =>
                n[i].getAttribute("transform")
                    ? n[i].getAttribute("transform")
                    : "rotate(-45)"
            )
            .style("text-anchor", "start");
    }

    sortRows() {
        this.rows.reverse();
        this.render("rows");
    }

    sortColumns() {
        this.columns.reverse();
        this.render("columns");
    }

    sortRowsFrequency() {
        this.rows = _.sortBy(this.rows, ['frequency'])
        this.render("rows");
    }

    sortColumnsFrequency() {
        this.columns = _.sortBy(this.columns, ['frequency']).reverse();
        this.render("columnsFrequency");
    }

    // this shapes the data for us
    /*
    dataAsNetwork(data) {
        const pivot =
            "marker_accession_id,marker_symbol,procedure_stable_id,procedure_name,parameter_stable_id,parameter_name,significant";
        data = data.facet_counts.facet_pivot[pivot];
        const nodes = [];
        const links = [];
        const nodeIds = new Set();
        data.forEach(mgiPivot => {
            const genePivot = mgiPivot.pivot[0];
            const geneId = mgiPivot.value;
            const gene = genePivot.value;
            if (!nodeIds.has(geneId))
                nodes.push({ id: geneId, name: gene, type: "gene" }) &&
                nodeIds.add(geneId);

            genePivot.pivot.forEach(procedureIdPivot => {
                const procedurePivot = procedureIdPivot.pivot[0];
                const procedureId = procedureIdPivot.value;
                const procedure = procedurePivot.value;

                if (!nodeIds.has(procedureId))
                    nodes.push({ id: procedureId, name: procedure, type: "procedure" }) &&
                    nodeIds.add(procedureId);
                const geneProcedureLink = {
                    id: ` `,
                    source: geneId,
                    target: procedureId,
                    weight: 0
                };

                procedurePivot.pivot.forEach(parameterIdPivot => {
                    const parameterPivot = parameterIdPivot.pivot[0];
                    const parameterId = `${procedureId}|${parameterIdPivot.value}`;
                    const parameter = parameterPivot.value;
                    if (!nodeIds.has(parameterId))
                        nodes.push({
                            id: parameterId,
                            name: parameter,
                            type: "parameter"
                        }) && nodeIds.add(parameterId);
                    const procedureParameterLink = {
                        id: `${geneId}_${parameterId}`,
                        source: geneId,
                        target: parameterId,
                        weight: 0
                    };
                    parameterPivot.pivot.forEach(significantPivot => {
                        if (significantPivot.value) {
                            geneProcedureLink.weight++;
                            procedureParameterLink.weight++;
                        }
                    });
                    links.push(procedureParameterLink);
                });
                links.push(geneProcedureLink);
            });
        });
        console.log({ nodes: nodes, links: links });
        return { nodes: nodes, links: links };
    }
    */
    truncate(n, useWordBoundary) {
        if (this.length <= n) {
            return this;
        }
        var subString = this.substr(0, n - 1);
        return (
            (useWordBoundary
                ? subString.substr(0, subString.lastIndexOf(" "))
                : subString) + "..."
        );
    }

    mouseover(p) {
        this.gX.selectAll("text").classed("active", function(d, i) {
            return d === p[1].name;
        });
        this.gY.selectAll("text").classed("active", function(d, i) {
            return d === p[0].name;
        });

        this.main
            .append("rect")
            .attr("x", 0)
            .attr("y", this.y(p[0].name))
            .attr("class", "highlight-bar")
            .attr("width", this.x(p[1].name) - this.x.padding() * this.x.bandwidth())
            .attr("height", this.y.bandwidth());

        this.main
            .append("rect")
            .attr("x", this.x(p[1].name))
            .attr("y", 0)
            .attr("class", "highlight-bar")
            .attr("width", this.x.bandwidth())
            .attr(
                "height",
                this.y(p[0].name) - this.y.padding() * this.y.bandwidth()
            );
    }

    mouseout() {
        d3.selectAll("text").classed("active", false);
        d3.selectAll(".highlight-bar").remove();
    }

    zoomed() {
        let transform = d3.event.transform;
        this.main.attr("transform", transform);
        this.gX.attr(
            "transform",
            d3.zoomIdentity.translate(transform.x, this.margin.top).scale(transform.k)
        );

        const xLabels = this.gX
            .selectAll("text")
            .attr(
                "transform",
                d3.zoomIdentity.scale(1 / transform.k) + " rotate(-45)"
            );

        this.gX
            .selectAll("line")
            .attr("transform", d3.zoomIdentity.scale(1 / transform.k));

        this.gY.attr(
            "transform",
            d3.zoomIdentity
                .translate(this.margin.left, transform.y)
                .scale(transform.k)
        );
        this.gY
            .selectAll("text")
            .attr("transform", d3.zoomIdentity.scale(1 / transform.k));
        this.gY
            .selectAll("line")
            .attr("transform", d3.zoomIdentity.scale(1 / transform.k));
    }
    resetted() {
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
    }

    filter(filterBy, text) {
        // make case insensitive
        const filter = d => (text !== "" ? d.name.toLowerCase().indexOf(text.toLowerCase()) >= 0 : true);
        if (filterBy == "rows") {
            this.rows = this.genes.filter(filter);
        } else if (!this.selectedProcedure) {
            this.columns = this.procedures.filter(filter);
        } else {
            this.columns = this.parameters
                .filter(parameter =>
                    parameter.id.startsWith(
                        this.procedures.find(p => p.name === this.selectedProcedure).id +
                        "|"
                    )
                )
                .filter(filter);
        }
        this.render();
    }

    resize(size) {
        this.render();
    }

}