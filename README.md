# Gene Sharpener UI
## STAR Informatics Prototype (Pre-Alpha)
### Configuration & Deployment
 Copy out `template.env` to `.env` in the root project directory:
 
     mv template.env .env
 
 It's configured for the app to be deployed to `localhost:3000` and point to the gene sharpener at `https://indigo.ncats.io/sharpener/` by default.
 
 Now:
 
     npm install
     npm start
     
The React Deployment Server should be running, and you should be able to see

### How to use the Gene Sharpener

#### TODO: illustrations pending

1. Produce Gene Sets using the input at the top. For example, enter Gene Symbols when selecting "Gene Symbols" from the drop-down.

2. You should now see a table of genes. Click on the header to add the gene set to the list of current genes. Continue this until you have a bunch of gene sets that you like selected.
    
3. Before running an expander, you can aggregate them into one gene set by pressing "Union" or "Intersection". This step is optional, but it also consolidates the expander results into one table.

4. To run expanders, in the panel on the far right you can put values into its input boxes