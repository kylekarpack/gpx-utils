const { GpxUtils } = require("./dist/index"),
	fs = require("fs");

let file = fs.readFileSync("./beckler-peak.gpx").toString();


(async function go() {
	let gpx = await GpxUtils.fromFile(file);
	console.log("name", gpx.name);
	console.log("total time", gpx.getTotalTime());
	console.log("moving time", gpx.getMovingTime());
	console.log("distance", gpx.getTotalDistance());
	console.log("center", gpx.getCenter());
	console.log("elevation", gpx.getTotalElevation());
})();
