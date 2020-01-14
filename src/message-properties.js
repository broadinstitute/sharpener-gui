let header={}
header.create="Create Gene List"
header.transform="Transformer Draft"
header.graph="Graph View"
header.datatable="Gene List Details"
header.pivot="Gene Pivot Table"

let tooltip={}
tooltip.create="Create a Gene List by submitting gene symbols through the input box, or by uploading a table in CSV/TSV/TXT format."
tooltip.transform="Query the Sharpener by staging Transformers before submitting them."
tooltip.pivot="Shows which gene lists different genes are part of (including single genes in multiple gene sets.)"
tooltip.graph="Displays the relationships between successfully executed transformations. Provides information about the resulting Gene Lists, including inputs, list size, and a preview of newly added genes."
tooltip.graph_export="Download a JSON file containing the sequence of transformer queries populating the graph."
tooltip.datatable="Show the contents of a gene list from a transformer selected in Transformer Graph"

let select={}
select.create="Add genes"
select.transform="Choose a transformer"

const messages = {
    header,
    tooltip,
    select
}

export default messages;