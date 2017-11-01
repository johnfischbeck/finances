/* Treemap Script */

/* Load data from static files  */
d3.tsv("/static/data/treemap.tsv", function(error, alldat) {
    if (error) return console.error(error);
    alldat.forEach(function(d) {
              d3.keys(d).forEach(function(k){
                        if(k == "AMT" || k == "YEAR"){
                                   d[k] = +d[k]
                        }
                        if(k == "STATE"){
                          d[k] = abbrRegion(d[k], 'name')
                        }
                        if(k == "PARTY"){
                          d[k] = abbrParty(d[k], 'name')
                        }
              })
    });
        draw(alldat, "[STATE,PARTY]");
});

/* Function to draw the d3plus window*/
function draw(data, id_arr){
      var visualisation = d3plus.viz()
          .container("#tmap")
          .type("tree_map")
          .data(data)
          .aggs("sum")
          .id(["STATE", "PARTY"])
          .size("AMT")
          .messages({"branding": true})
          .title({"value": "Donations by State", "font": {"size": 32}})
          .format(
              {
                  "text": function (text, params) {
                      if (text === "AMT") {
                          return "Donation Amount"
                      }
                      else {
                          return d3plus.string.title(text, params)
                      }
                  },
                  "number": function (number, params) {
                      var formatted = d3plus.number.format(number, params);
                      if (params.key === "AMT") {
                          return "$" + formatted + " USD"
                      }
                      else {
                          return formatted;
                      }
                  }
              }
          )
          .time({
              "value": "YEAR",
              "solo": 2017
          })
          .draw();
}

function download(url) {
    return new Promise(function (resolve, reject) {
        let request = new XMLHttpRequest();
        request.addEventListener("load", function () {
            resolve(JSON.parse(request.responseText));
        });
        request.open("GET", url);
        request.send();
    });
}

/* Converts party abbreviations to names */
function abbrParty(input, to){
  var parties = [
    ['Democratic', 'DEM'],
    ['Republican', 'REP'],
    ['Independent', 'IND'],
    ['Democratic-Free-Labour', 'DFL'],
    ['Green', 'GRE'],
    ['Libertarian', 'LIB'],
    ['No Party Affiliation', 'NPA'],
    ['Other', 'OTH'],
    ['Unknown', 'UNK']
  ]
  var i; // Reusable loop variable
  if (to == 'abbr') {
      input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
      for (i = 0; i < parties.length; i++) {
          if (parties[i][0] == input) {
              return (parties[i][1]);
          }
      }
  } else if (to == 'name') {
      input = input.toUpperCase();
      for (i = 0; i < parties.length; i++) {
          if (parties[i][1] == input) {
              return (parties[i][0]);
          }
      }
  }
  return input;
}

/* Same, but for states */
function abbrRegion(input, to) {
    var states = [
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['American Samoa', 'AS'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['Armed Forces Americas', 'AA'],
        ['Armed Forces Europe', 'AE'],
        ['Armed Forces Pacific', 'AP'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['District Of Columbia', 'DC'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Guam', 'GU'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Marshall Islands', 'MH'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Northern Mariana Islands', 'NP'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Puerto Rico', 'PR'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['US Virgin Islands', 'VI'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    // So happy that Canada and the US have distinct abbreviations
    var provinces = [
        ['Alberta', 'AB'],
        ['British Columbia', 'BC'],
        ['Manitoba', 'MB'],
        ['New Brunswick', 'NB'],
        ['Newfoundland', 'NF'],
        ['Northwest Territory', 'NT'],
        ['Nova Scotia', 'NS'],
        ['Nunavut', 'NU'],
        ['Ontario', 'ON'],
        ['Prince Edward Island', 'PE'],
        ['Quebec', 'QC'],
        ['Saskatchewan', 'SK'],
        ['Yukon', 'YT'],
    ];

    var regions = states.concat(provinces);

    var i; // Reusable loop variable
    if (to == 'abbr') {
        input = input.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
        for (i = 0; i < regions.length; i++) {
            if (regions[i][0] == input) {
                return (regions[i][1]);
            }
        }
    } else if (to == 'name') {
        input = input.toUpperCase();
        for (i = 0; i < regions.length; i++) {
            if (regions[i][1] == input) {
                return (regions[i][0]);
            }
        }
    }
}
