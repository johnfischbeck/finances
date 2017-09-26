/** Heat map page scripts. */
const STATES = "https://api.github.com/repos/unitedstates/districts/contents/states";
const DISTRICTS = "https://api.github.com/repos/unitedstates/districts/contents/cds/2016";

window.states = {};
window.distritcs = {};


/** Download a file. */
function download(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.addEventListener("load", () => { resolve(JSON.parse(request.responseText)); });
    request.open("GET", url);
    request.send();
  });
}

/** Load all shape files. */
function load() {
  return Promise.all([
    new Promise((resolve, reject) => {
      download(STATES).then((data) => {
        let promises = [];
        for (let state of data) {
          if (state.name === "kml") continue;
          promises.push(new Promise((resolve, reject) => {
            download(state.url).then((data) => { resolve(data); })
          }));
        }
        Promise.all(promises).then((results) => resolve(results));
      });
    }),
    new Promise((resolve, reject) => {
      download(DISTRICTS).then((data) => {
        let promises = [];
        for (let district of data) {
          if (district.name === "kml") continue;
          promises.push(new Promise((resolve, reject) => {
            download(district.url).then((data) => { resolve(data); })
          }));
        }
        Promise.all(promises).then((results) => resolve(results));
      })
    })
  ]);
}


/** Heat map canvas controller */
class HeatMapController {

  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.setup();
    load().then(this.main.bind(this));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setup() {
    window.onresize = this.resize.bind(this);
    this.resize();
  }

  main() {

  }

}


/* Access document elements */
const canvas = document.getElementById("map");
const controller = new HeatMapController(canvas);

/*
d3.tsv("state_crime.tsv", function(error, state_crime) {
    if (error) return console.error(error);

    // Coerce data values to be numeric
    state_crime.forEach(function(d) {
        d3.keys(d).forEach(function(k){
            if(k != "State"){
                d[k] = +d[k]
            }
        })
    });
    // Filter out US total values
    state_crime = state_crime.filter(function(d){
        return d.State != "United States-Total"
    })
    make_viz(state_crime);
});
function make_viz(data){
    var visualization = d3plus.viz()
    .container("#viz1")
    .messages({branding: true})
    .data(data)
    .type("tree_map")
    .id("State")
    .size("Assault")
    .time("Year")
    .background("#556270")
    .draw()
}
*/
