# Gene Sharpener UI - STAR Informatics Prototype 
# (Pre-Alpha)

## Getting Started

### Configuring the Application

In the root project directory, copy  `template.env` to `.env` :
 
     cp template.env .env
 
 then customize (as necessary).
 
 Run ```npm install``` to install the project library dependencies and apply the `.env`.

### Running the Application

In the project root, run this command: 

```npm start``` 

This should bring up the application in your web browser.
The React Development Server should now be running, and you should be able to see the main page.

The project is configured for the app to be deployed to `localhost:3000` 
and pointing to the gene sharpener at `https://indigo.ncats.io/sharpener/` by default.

### How to use the Gene Sharpener

#### TODO: illustrations pending

1. Create your starting Gene Lists using the "Producer" selector and search box at the top. 
For example, enter a Gene Symbol (e.g. BRCA1) when selecting "Gene Symbols" from the drop-down.

2. You should now see a table of genes. Click on the Gene List ID or the plus sign on the side of the table's header, to add the gene list to the list of current genes. 

Continue this until all the gene lists that you'd like to transform are selected.
    
3. Before running an *Expander*, you can aggregate them into one gene list by pressing "Union" or "Intersection". 
This step is optional, but it also consolidates all of your results from a given expander into one table.

4. To run an *Expander*, in the panel on the far right you can put values into its input boxes. If you click on the Expander's name, it becomes selected. It also then fills those boxes with default values if they are available (but it doesn't override your own).

5. If all is well,  a little button saying "Transform Gene Lists" appears under **Expanders**. If all is not well, it tells you what you're missing. If you can transform your gene lists, click that button.

6. Tables giving you your transformed gene lists (one per selected gene list ID) should appear shortly, hopefully with relevant results.

If you want to continue transforming your gene lists, start again, from step (2) or the beginning.
