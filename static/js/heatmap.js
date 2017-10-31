const width = window.innerWidth - 349;
const height = window.innerHeight;
let centered;

const CURRENT = "2017";
const OVERALL = "Overall";
const DONATION_AMOUNT = "Donation amount";
const DONATION_AMOUNT_BY_PARTY = "Donation amount by party";
const GRADIENT_BY_PARTY = "Gradient by party";

const stateNames =         ["", "Alabama", "Alaska", "?", "Arizona", "Arkansas", "California", "?", "Colorado", "Connecticut", "Delaware", "?", "Florida", "Georgia", "?", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "?", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "?", "Washington", "West Virginia", "Wisconsin", "Wyoming"];
const stateAbbreviations = ["", "AL",      "AK",     "?", "AZ",      "AR",       "CA",         "?", "CO",       "CT",          "DE",       "?", "FL",      "GA",      "?", "HI",     "ID",    "IL",       "IN",      "IA",   "KS",     "KY",       "LA",        "ME",    "MD",       "MA",            "MI",       "MN",        "MS",          "MO",       "MT",      "NE",       "NV",     "NH",            "NJ",         "NM",         "NY",       "NC",             "ND",           "OH",   "OK",       "OR",     "PA",           "?", "RI",           "SC",             "SD",           "TN",        "TX",    "UT",   "VT",      "VA",       "?", "WA",         "WV",            "WI",        "WY"];

const statePaths = {};
const mode = {year: CURRENT, mode: DONATION_AMOUNT};
const donations = {};

/* Create the projection of the US map. */
let projection = d3.geo.albersUsa().scale(1080).translate([width / 2, height / 2]);
let path = d3.geo.path().projection(projection);

/* Create a new SVG. */
let svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

/* Create the background to support zoom click-out. */
let background = svg.append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on("click", clicked);

/* Create the actual SVG context. */
let g = svg.append("g");

/* Queue assets. */
queue()
  .defer(d3.json, "/static/data/heatmap/us.json")
  .defer(d3.json, "/static/data/heatmap/congress.json")
  .await(ready);


/** Called when the shapefile download is ready. */
function ready(error, us, congress) {
  if (error) throw error;

  g.append("path")
    .datum(topojson.feature(us, us.objects.land))
    .attr("id", "land")
    .attr("d", path);

  /* Draw the border between stateNames. */
  let stateBorder = g.append("path");
  stateBorder.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("id", "state-borders")
    .attr("d", path);

  /* Draw each individual stateNames. */
  let states = g.append("g").attr("id", "states");
  states.selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .attr("id", function(d, i) { return d.id; })
      .on("click", clicked)
      .call(function() {
        let statesObject = document.getElementById("states");
        for (let i = 1; i < stateNames.length; i++) {
          for (let state of statesObject.children) {
            if (+state.id === i) {
              statePaths[i] = state;
              break;
            }
          }
        }
      })


  /* Draw the border between districts.
  g.append("path")
    .datum(topojson.mesh(congress, congress.objects.districts, function(a, b) { return a !== b }))
    .attr("id", "district-borders")
    .attr("d", path)*/

}

d3.tsv("/static/data/treemap.tsv", function(error, data) {
  data.forEach(function(d) {
    let id = stateAbbreviations.indexOf(d.STATE);
    if (typeof donations[id] !== "object") donations[id] = [];
    donations[id].push({
      amount: +d.AMT,
      party: d.PARTY,
      year: +d.YEAR
    });
  });
});


function fillStates() {
  if (mode.mode === DONATION_AMOUNT) {
    let totals = {};
    let min = null;
    let max = null;
    for (let i in donations) {
      let total = 0;
      for (let j = 0; j < donations[i].length; j++) {
        if (mode.year === OVERALL || donations[i][j].year === 2017) {
          total += donations[i][j].amount;
        }
      }
      totals[i] = total;
      if (min === null || total < min) min = total;
      if (max === null || total > max) max = total;
    }
    for (let i in totals) {
      if (i == -1) continue;
      statePaths[i].style.fill = "rgba(0, 0, 255, " + (totals[i] - min) / max + ")";
    }

  }
}


/* Gather HTML elements. */
const $ = function(id) { return document.getElementById(id); };
const country = $("sidebar-country");
const state = $("sidebar-state");
const e = {
  name: $("state-name")
};

/* Load sidebar information. */
function loadSidebar(id) {
  country.style.display = "none";
  state.style.display = "block";

  const name = stateNames[id];
  e.name.innerHTML = name;
}

function clearSidebar() {
  state.style.display = "none";
  country.style.display = "block";
}

/* Display state sidebar. */
country.style.display = "block";


function clicked(d) {
  let x, y, w, h, k;

  if (d !== undefined && d.hasOwnProperty("id") && d !== centered) {
    loadSidebar(d.id);
  } else {
    clearSidebar();
  }

  /* Find the center and zoom for the state. */
  if (d && centered !== d) {
    let centroid = path.centroid(d);
    let bounds = path.bounds(d);
    x = centroid[0];
    y = centroid[1];
    w = bounds[1][0] - bounds[0][0];
    h = bounds[1][1] - bounds[0][1];
    k = 1 / (3 * Math.max(w/width, h/height));
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  /* Set the path as active and zoom. */
  g.selectAll("path")
    .classed("active", centered && function(d) { return d === centered; });
  g.transition()
    .duration(750)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .style("stroke-width", 1.5 / k + "px");

}
