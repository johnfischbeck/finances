/* Link to state and district levels  */
const HMROOT = "/static/data/heatmap";
const STATES = HMROOT + "/states.json";
const DISTRICTS = HMROOT + "/cds.json";

var visualisation = d3plus.viz()
    .container("#tmap")
    .type("tree_map")
    .id(["party","state","district",])
    .size("value")
    .draw()

