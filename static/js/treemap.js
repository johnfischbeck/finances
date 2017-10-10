/* Link to state and district levels  */
const HMROOT = "/static/data/heatmap";
const STATES = HMROOT + "/states.json";
const DISTRICTS = HMROOT + "/cds.json";

/*var donation_data = download("eastwatch.mbhs.edu/data/aggregate/district");*/

donation_data = [
    {"value": 100, "state": "Al", "party": "Republican", "district": "d1"},
    {"value": 70, "state": "Al", "party": "Democratic", "district": "d2"},
    {"value": 40, "state": "Ga", "party": "Democratic", "district": "d1"},
    {"value": 15, "state": "Ga", "party": "Democratic", "district": "d3"},
    {"value": 5, "state": "Fl", "party": "Republican", "district": "d9"},
    {"value": 1, "state": "Fl", "party": "Republican", "district": "d2"}
];

var visualisation = d3plus.viz()
    .container("#tmap")
    .type("tree_map")
    .data(donation_data)
    .aggs("sum")
    .id(["party", "state", "district"])
    .size("value")
    .messages({"branding": true})
    .title("Donations by Party")
    .format(
        {
            "text": function (text, params) {
                if (text === "value") {
                    return "Donation Amount, USD"
                }
                else {
                    return d3plus.string.title(text, params)
                }
            },
            "number": {

            }
        }
    )
    /*.time({
        "value": "Year",
        "solo": 2012
    })*/
    .draw();

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

