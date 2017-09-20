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
  let states = download(STATES).then((data) => {

  });
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
