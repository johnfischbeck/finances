/** Heat map page scripts. */
const ROOT = "/static/data/heatmap";
const STATES = ROOT + "/states.json";
const DISTRICTS = ROOT + "/cds.json";

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
