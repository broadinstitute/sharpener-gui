# Gene Sharpener UI - STAR Informatics Prototype (Pre-Alpha)

## Getting Started

### Configuring the Application

Run ```npm install``` to install the project library dependencies.

In the root project directory, copy  `template.env` to `.env` :
 
     cp template.env .env
 
 then customize (as necessary).

### Running the Application

Type 

```npm start``` 

This should bring up the web application in your web browser.
The React Deployment Server should now be running, and you should be able to see the main page.

The project is configured for the app to be deployed to `localhost:3000` 
and pointing to the gene sharpener at `https://indigo.ncats.io/sharpener/` by default.

### How to use the Gene Sharpener

#### TODO: illustrations pending

1. Create your starting Gene Sets using the "Producer" selector and search box at the top. 
For example, enter a Gene Symbol (e.g. BRCA1) when selecting "Gene Symbols" from the drop-down.

2. You should now see a table of genes. Click on the header to add the gene set to the list of current genes. 
Continue this until you have a bunch of gene sets that you like selected.
    
3. Before running an *Expander*, you can aggregate them into one gene set by pressing "Union" or "Intersection". 
This step is optional, but it also consolidates the expander results into one table.

4. To run an *Expander*, in the panel on the far right you can put values into its input boxes