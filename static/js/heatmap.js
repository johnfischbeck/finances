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
const settings = {year: CURRENT, mode: GROSS_DONATIONS, party: ""};
const data = {donations: {}, population: {}, parties: {current: {}, overall: {}}};
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

function values(object, keys) {
  let values = [];
  for (let key of keys || Object.keys(object))
    if (object.hasOwnProperty(key))
      values.push(object[key] || 0);
  return values;
}


const ready = semaphore(["shapes", "data"], () => {
  fillStates();
});


/* Create the projection of the US map. */
let projection = d3.geo.albersUsa().scale(1480).translate([width / 2, height / 2]);
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
  .defer(d3.tsv, "/static/data/treemap/treemap.tsv")
  .defer(d3.json, "/static/data/heatmap/population.json")
  .await(onData);

function onData(error, donations, population) {

  for (let s in population) {
    data.population[state.names.indexOf(s)] = population[s];
  }

  data.donations.raw = {};
  donations.forEach(function(d) {
    let id = state.abbreviations.indexOf(d.STATE);
    if (typeof data.donations.raw[id] !== "object") data.donations.raw[id] = [];
    data.donations.raw[id].push({
      amount: +d.AMT,
      party: d.PARTY.toUpperCase(),
      year: +d.YEAR
    });
  });

  data.donations.current = {pc: {}};
  data.donations.overall = {pc: {}};

  data.donations.parties = {current: {}, overall: {}};

  for (let stateId of state.ids) {

    let currentTotal = 0;
    let overallTotal = 0;
    let populationTotal = data.population[stateId];
    for (let donation of data.donations.raw[stateId]) {

      if (!data.donations.parties.current.hasOwnProperty(donation.party))
        data.donations.parties.current[donation.party] = {};
      if (!data.donations.parties.overall.hasOwnProperty(donation.party))
        data.donations.parties.overall[donation.party] = {};

      if (!data.parties.overall.hasOwnProperty(donation.party))
        data.parties.overall[donation.party] = 0;

      if (donation.year === 2017) {
        if (!data.parties.current.hasOwnProperty(donation.party))
          data.parties.current[donation.party] = 0;

        currentTotal += donation.amount;
        if (!data.donations.parties.current[donation.party].hasOwnProperty(stateId))
          data.donations.parties.current[donation.party][stateId] = 0;
        data.donations.parties.current[donation.party][stateId] += donation.amount;
        data.parties.current[donation.party] += donation.amount;
      }

      overallTotal += donation.amount;
      if (!data.donations.parties.overall[donation.party].hasOwnProperty(stateId))
        data.donations.parties.overall[donation.party][stateId] = 0;
      data.donations.parties.overall[donation.party][stateId] += donation.amount;
      data.parties.overall[donation.party] += donation.amount;

    }

    data.donations.current[stateId] = currentTotal;
    data.donations.overall[stateId] = overallTotal;
    data.donations.current.pc[stateId] = currentTotal / populationTotal;
    data.donations.overall.pc[stateId] = overallTotal / populationTotal;

  }

  ready.done("data");

}


function fillStates() {
  if (settings.mode === GROSS_DONATIONS || settings.mode === DONATIONS_PER || settings.mode === GROSS_DONATIONS_PARTY) {
    let frame = null;
    if (settings.mode === GROSS_DONATIONS && settings.year === CURRENT) frame = data.donations.current;
    else if (settings.mode === GROSS_DONATIONS && settings.year === OVERALL) frame = data.donations.overall;
    else if (settings.mode === DONATIONS_PER && settings.year === CURRENT) frame = data.donations.current.pc;
    else if (settings.mode === DONATIONS_PER && settings.year === OVERALL) frame = data.donations.overall.pc;
    else if (settings.mode === GROSS_DONATIONS_PARTY && settings.year === CURRENT) frame = data.donations.parties.current[settings.party];
    else if (settings.mode === GROSS_DONATIONS_PARTY && settings.year === OVERALL) frame = data.donations.parties.overall[settings.party];

    if (frame !== null) {
      let v = values(frame, state.ids);
      let max = Math.max(...v);
      let min = Math.min(...v);
      for (let stateId of state.ids) {
        let total = frame[stateId];
        let value = (total - min) / max || 0;
        state.paths[stateId].style.fill = "rgba(0, 0, 255, " + value + ")";
      }
    } else {
      console.log("No frame!");
    }

  }
}

function clearStates() {
  for (let stateId of state.ids) {
    state.paths[stateId].style.fill = "transparent";
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
    clearStates();
  } else {
    clearSidebar();
    fillStates();
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


function updatePartySelector() {
  let frame;
  if (settings.year === CURRENT) frame = data.parties.current;
  else if (settings.year === OVERALL) frame = data.parties.overall;
  let parties = Object.keys(frame);
  parties.sort((a, b) => { frame[a] - frame[b]; });
  e.partySelect.innerHTML = "";
  for (let party of parties)
    e.partySelect.innerHTML += "<option>" + party + "</option>";
  settings.party = parties[0];
}


e.yearSelect.addEventListener("change", () => {
  settings.year = e.yearSelect.value;
  updatePartySelector();
  fillStates();
});

e.partySelect.addEventListener("change", () => {
  settings.party = e.partySelect.value;
  fillStates();
});

e.modeSelect.addEventListener("change", () => {
  settings.mode = e.modeSelect.value;
  if (settings.mode === GROSS_DONATIONS_PARTY || settings.mode === DONATIONS_PARTY_PER) {
    e.partyControl.style.display = "inline";
    updatePartySelector();
  } else {
    e.partyControl.style.display = "none";
  }
  fillStates();
});
