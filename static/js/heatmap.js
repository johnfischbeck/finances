const width = window.innerWidth - 349;
const height = window.innerHeight;
let centered;




const CURRENT = "2017";
const OVERALL = "Overall";
const GROSS_DONATIONS = "Gross donations";
const DONATIONS_PER = "Donations per capita";
const GROSS_DONATIONS_PARTY = "Gross donations by party";
const DONATIONS_PARTY_PER = "Donations by party per capita";
const GRADIENT_BY_PARTY = "Gradient by party";

const state = {
  names:         ["?", "Alabama", "Alaska", "?", "Arizona", "Arkansas", "California", "?", "Colorado", "Connecticut", "Delaware", "?", "Florida", "Georgia", "?", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "?", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "?", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
  abbreviations: ["?", "AL",      "AK",     "?", "AZ",      "AR",       "CA",         "?", "CO",       "CT",          "DE",       "?", "FL",      "GA",      "?", "HI",     "ID",    "IL",       "IN",      "IA",   "KS",     "KY",       "LA",        "ME",    "MD",       "MA",            "MI",       "MN",        "MS",          "MO",       "MT",      "NE",       "NV",     "NH",            "NJ",         "NM",         "NY",       "NC",             "ND",           "OH",   "OK",       "OR",     "PA",           "?", "RI",           "SC",             "SD",           "TN",        "TX",    "UT",   "VT",      "VA",       "?", "WA",         "WV",            "WI",        "WY"],
  ids: [],
  paths: {},
};
const settings = {year: CURRENT, mode: GROSS_DONATIONS};
const data = {donations: {}, population: {}};
for (let i = 0; i < state.names.length; i++) { if (state.names[i] !== "?") state.ids.push(i); }

function semaphore(waiting, callback) {
  return {
    waiting: waiting,
    callback: callback,
    done: function(waiting) {
      this.waiting.splice(this.waiting.indexOf(waiting), 1);
      if (this.waiting.length === 0) this.callback();
    },
  };
}


const ready = semaphore(["shapes", "data"], () => {
  fillStates();
});


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
  .await(onShapes);

/** Called when the shapefile download is ready. */
function onShapes(error, us, congress) {
  if (error) throw error;

  g.append("path")
    .datum(topojson.feature(us, us.objects.land))
    .attr("id", "land")
    .attr("d", path);

  /* Draw the border between state.names. */
  let stateBorder = g.append("path");
  stateBorder.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("id", "state-borders")
    .attr("d", path);

  /* Draw each individual state.names. */
  let states = g.append("g").attr("id", "states");
  states.selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .attr("id", function(d, i) { return d.id; })
      .on("click", clicked)
      .call(function() {
        let statesObject = document.getElementById("states");
        for (let stateId of state.ids) {
          for (let statePath of statesObject.children) {
            if (+statePath.id === stateId) {
              state.paths[stateId] = statePath;
              break;
            }
          }
        }
        ready.done("shapes");
      })


  /* Draw the border between districts.
  g.append("path")
    .datum(topojson.mesh(congress, congress.objects.districts, function(a, b) { return a !== b }))
    .attr("id", "district-borders")
    .attr("d", path)*/

}


queue()
  .defer(d3.tsv, "/static/data/treemap.tsv")
  .defer(d3.json, "/static/data/heatmap/population.json")
  .await(onData);

function onData(error, donations, population) {

  data.population = population;

  data.donations.raw = {};
  donations.forEach(function(d) {
    let id = state.abbreviations.indexOf(d.STATE);
    if (typeof data.donations.raw[id] !== "object") data.donations.raw[id] = [];
    data.donations.raw[id].push({
      amount: +d.AMT,
      party: d.PARTY,
      year: +d.YEAR
    });
  });

  data.donations.current = {min: null, max: null, pc: {min: null, max: null}};
  data.donations.overall = {min: null, max: null, pc: {min: null, max: null}};

  for (let stateId of state.ids) {
    let currentTotal = 0;
    let overallTotal = 0;
    let pop = data.population[stateId];
    for (let donation of data.donations.raw[stateId]) {
      if (donation.year === 2017) currentTotal += donation.amount;
      overallTotal += donation.amount;
    }

    if (data.donations.current.min === null || currentTotal < data.donations.current.min)
      data.donations.current.min = currentTotal;
    if (data.donations.current.max === null || currentTotal > data.donations.current.max)
      data.donations.current.max = currentTotal;
    if (data.donations.overall.min === null || overallTotal < data.donations.overall.min)
      data.donations.overall.min = overallTotal;
    if (data.donations.overall.max === null || overallTotal > data.donations.overall.max)
      data.donations.overall.max = overallTotal;

    let currentTotalPC = currentTotal / pop;
    let overallTotalPC = overallTotal / pop;
    if (data.donations.current.pc.min === null || currentTotalPC < data.donations.current.pc.min)
      data.donations.current.pc.min = currentTotalPC;
    if (data.donations.current.pc.max === null || currentTotalPC > data.donations.current.pc.max)
      data.donations.current.pc.max = currentTotalPC;
    if (data.donations.overall.pc.min === null || overallTotalPC < data.donations.overall.pc.min)
      data.donations.overall.pc.min = overallTotalPC;
    if (data.donations.overall.pc.max === null || overallTotalPC > data.donations.overall.pc.max)
      data.donations.overall.pc.max = overallTotalPC;

    data.donations.current[stateId] = currentTotal;
    data.donations.overall[stateId] = overallTotal;
    data.donations.current.pc[stateId] = currentTotalPC;
    data.donations.overall.pc[stateId] = overallTotalPC;
  }

  ready.done("data");

}


function fillStates() {
  if (settings.mode === GROSS_DONATIONS || settings.mode === DONATIONS_PER) {
    let frame = null;
    if (settings.mode === GROSS_DONATIONS && settings.year === CURRENT) frame = data.donations.current;
    else if (settings.mode === GROSS_DONATIONS && settings.year === OVERALL) frame = data.donations.overall;
    else if (settings.mode === DONATIONS_PER && settings.year === CURRENT) frame = data.donations.current.pc;
    else if (settings.mode === DONATIONS_PER && settings.year === OVERALL) frame = data.donations.overall.pc;
    if (frame) {
      let min = frame.min, max = frame.max;
      for (let stateId of state.ids) {
        let total = frame[stateId];
        let value = (total - min) / max;
        state.paths[stateId].style.fill = "rgba(0, 0, 255, " + value + ")";
      }
    }

  }
}


/* Gather HTML elements. */
const $ = function(id) { return document.getElementById(id); };
const countrySidebar = $("sidebar-country");
const stateSidebar = $("sidebar-state");
const e = {
  name: $("state-name"),
  yearSelect: $("year-select"),
  modeSelect: $("mode-select"),
  partyControl: $("party-control"),
  partySelect: $("party-select"),
};

/* Load sidebar information. */
function loadSidebar(id) {
  countrySidebar.style.display = "none";
  stateSidebar.style.display = "block";

  let name = state.names[id];
  e.name.innerHTML = name;
}

function clearSidebar() {
  stateSidebar.style.display = "none";
  countrySidebar.style.display = "block";
}

/* Display state sidebar. */
countrySidebar.style.display = "block";


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


e.yearSelect.addEventListener("change", () => {
  settings.year = e.yearSelect.value;
  fillStates();
});

e.modeSelect.addEventListener("change", () => {
  settings.mode = e.modeSelect.value;
  if (settings.mode === GROSS_DONATIONS_PARTY || settings.mode === DONATIONS_PARTY_PER || settings.mode === GRADIENT_BY_PARTY) {
    e.partyControl.style.display = "inline";
  } else {
    e.partyControl.style.display = "none";
  }
  fillStates();
});
