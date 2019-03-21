# [BrAPI](https://github.com/plantbreeding/API) Graphical Filtering [![GitHub release](https://img.shields.io/github/release/solgenomics/brapi-graphical-filtering.svg)](https://github.com/solgenomics/BrAPI-Graphical-Filtering/releases) [![GitHub (Pre-)Release Date](https://img.shields.io/github/release-date-pre/solgenomics/brapi-graphical-filtering.svg)](https://github.com/solgenomics/BrAPI-Graphical-Filtering/releases)

- Try it out [here](https://solgenomics.github.io/BrAPI-Graphical-Filtering/example)
- Include-ready version can be found under [releases](https://github.com/solgenomics/BrAPI-Pedigree-Viewer/releases).
- Also available via npm: `npm install @solgenomics/brapi-graphical-filtering`

![GIF of Example Implementation](example.gif)

## Usage

The graphical filter exposes a minimal API for initializing and populating the table. It is designed to rely on BrAPI. 

### Initializing the graphical filter

Use the following snippets (in order) to fully set up a tree.

1. Create a new GraphicalFilter object 
    ```js
    var gf = GraphicalFilter(
        // BrAPI search of observationUnits to be displayed
        BrAPI("https://brapi.myserver.org/brapi/v1").phenotypes_search(myparams),
        // Accessor describing traits for each observationUnit (returns object)
        function(d) {
            var traits = {}
            d.observations.forEach(function(obs){
                traits[obs.observationVariableName] = obs.value;
            });
            return traits;
        },
        // Accessor describing extra columns to display in the table (returns object)
        function(d) {
            return {
                'Accession':d.germplasmName
            }
        },
        // Order to display the above columns in (array)
        ["Accession"],
        // key to group observationUnits by in the table (key value or undefined for no grouping)
        function(d) { // groupBy function
            return d.germplasmDbId
        }
    );
    ```
2. Then, draw the filter and table.
    ```js
    gf.draw(
        // div to draw the filter in
        "#filter_div",
        // table to output filtered data to
        "#filtered_results"
    );
    ```


## Requirements
- [Bootstrap](https://github.com/twbs/bootstrap) (3.3) (CSS & JS)
- [D3.js](https://github.com/d3/d3) (4)
- [DataTables](https://github.com/DataTables/DataTables) (1) (JS)
- [jQuery](https://github.com/jquery/jquery) (3)

#### Requirements for the Example
- [@solgenomics/brapp-wrapper](https://github.com/solgenomics/BrApp-Wrapper) (For building the example.)
