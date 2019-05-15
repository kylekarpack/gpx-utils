const { GpxUtils } = require("./index"),
	fs = require("fs");

let file = fs.readFileSync("./beckler-peak.gpx").toString();

let gpx = GpxUtils.fromFile(file);

console.log(gpx.getTotalTime());