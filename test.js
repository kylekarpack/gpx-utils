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
	console.log("climbing distance", gpx.getClimbingDistance());
	console.log("climbing time", gpx.getClimbingTime());
	console.log("climbing speed", gpx.getClimbingSpeed());
	console.log("descent distance", gpx.getDescentDistance());
	console.log("descent time", gpx.getDescentTime());
	console.log("descent speed", gpx.getDescentSpeed());
	console.log("flat distance", gpx.getFlatDistance());
	console.log("flat time", gpx.getFlatTime());
	console.log("flat speed", gpx.getFlatSpeed());

})();
