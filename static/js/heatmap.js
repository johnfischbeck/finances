/** Heat map page scripts. */
const ROOT = "/static/data/heatmap";
const STATES = ROOT + "/states.json";
const DISTRICTS = ROOT + "/cds.json";

window.states = {};
window.districts = {};

window.center = [0, 0];


function drawPolygon(c, points) {
  let first = points[0];
  c.beginPath();
  c.moveTo(first[0], first[1]);
  for (let i = 1; i < points.length; i++)
    c.lineTo(points[i][0], points[i][1]);
  c.lineTo(first[0], first[1]);
  c.stroke();
}


function center(areas) {
  let min, max;
  for (let area of areas) {
    for (let i = 0; i < state.coordinates.length; i++) {
      drawPolygon(c, state.coordinates[i]);
      // TODO: just edit shapefiles?
    }
  }
}



/** Download a file. */
function download(url) {
  return new Promise((resolve, reject) => {
    let request = new XMLHttpRequest();
    request.addEventListener("load", () => { resolve(JSON.parse(request.responseText)); });
    request.open("GET", url);
    request.send();
  });
}


function downloadStates() {
  return new Promise((resolve, reject) => {
    download(STATES).then((data) => {
      let promises = [];
      for (let state of Object.keys(data)) {
        promises.push(new Promise((resolve, reject) => {
          download(data[state]).then((data) => { data.name = state; resolve(data); })
        }));
      }
      Promise.all(promises).then((results) => {
        window.states = results;
        center(results);
        resolve(results);
      });
    });
  });
}


function downloadDistricts() {
  return new Promise((resolve, reject) => {
    download(DISTRICTS).then((data) => {
      let promises = [];
      for (let district of Object.keys(data["2016"])) {
        promises.push(new Promise((resolve, reject) => {
          download(data["2016"][district]).then((data) => { data.name = district; resolve(data); })
        }));
      }
      Promise.all(promises).then((results) => {
        window.districts = results;
        resolve(results);
      });
    })
  })
}


const STATE = 0;
const DISTRICT = 1;


/** Heat map canvas controller */
class HeatMapController {

  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.setup();

    this.mode = STATE;

    downloadStates().then(() => { this.main(); });
    downloadDistricts()

  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setup() {
    window.onresize = this.resize.bind(this);
    this.resize();
  }

  drawStates() {
    let c = this.context;
    for (let state of states) {
      for (let i = 0; i < state.coordinates.length; i++) {
        drawPolygon(c, state.coordinates[i]);
      }
    }
  }

  draw() {
    switch (this.mode) {
      case (STATE): this.drawStates(); break;
      case (DISTRICT): this.drawDistricts(); break;
    }
  }

  main() {
    //this.draw();
  }

}


/* Access document elements */
const canvas = document.getElementById("map");
const controller = new HeatMapController(canvas);
