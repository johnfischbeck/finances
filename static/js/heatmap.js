var width = window.innerWidth - 349;
var height = window.innerHeight;
var centered;

var states = ["Alabama", "Alaska", "?", "Arizona", "Arkansas", "California", "?", "Colorado", "?", "Connecticut", "Delaware", "Florida", "Georgia", "?", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "?", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "?", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

/* Create the projection of the US map. */
var projection = d3.geo.albersUsa().scale(1070).translate([width / 2, height / 2]);
var path = d3.geo.path().projection(projection);

/* Create a new SVG. */
var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

/* Create the background to support zoom click-out. */
var background = svg.append("rect")
  .attr("class", "background")
  .attr("width", width)
  .attr("height", height)
  .on("click", clicked);

/* Create the actual SVG context. */
var g = svg.append("g");

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

  /* Draw the border between states. */
  var stateBorder = g.append("path");
  stateBorder.datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr("id", "state-borders")
    .attr("d", path);

  /* Draw each individual states. */
  var states = g.append("g").attr("id", "states");
  states.selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("d", path)
      .attr("id", function(d, i) { return d.id; })
      .attr("centroid", function(d, i) { })
      .on("click", clicked);

  /* Draw the border between districts.
  g.append("path")
    .datum(topojson.mesh(congress, congress.objects.districts, function(a, b) { return a !== b }))
    .attr("id", "district-borders")
    .attr("d", path)*/

}


/* Gather HTML elements. */
var $ = function(id) { return document.getElementById(id); };
var country = $("sidebar-country");
var state = $("sidebar-state");
var e = {
  name: $("state-name")
};

/* Load sidebar information. */
function loadSidebar(id) {
  country.style.display = "none";
  state.style.display = "block";

  var name = states[id - 1];
  e.name.innerHTML = name;
}

function clearSidebar() {
  state.style.display = "none";
  country.style.display = "block";
}

/* Display state sidebar. */
country.style.display = "block";


function clicked(d) {
  var x, y, w, h, k;

  if (d !== undefined && d.hasOwnProperty("id") && d !== centered) {
    loadSidebar(d.id);
  } else {
    clearSidebar();
  }

  /* Find the center and zoom for the state. */
  if (d && centered !== d) {
    var centroid = path.centroid(d);
    var bounds = path.bounds(d);
    x = centroid[0];
    y = centroid[1];
    w = bounds[1][0] - bounds[0][0];
    h = bounds[1][1] - bounds[0][1];
    k = 1 / (2 * Math.max(w/width, h/height));
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
