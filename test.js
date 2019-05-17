const { GpxUtils } = require("./dist/index"),
	fs = require("fs");

let file = fs.readFileSync("./beckler-peak.gpx").toString();


(async function go() {
	let gpx = await GpxUtils.fromFile(file);
	console.log("total time", gpx.getTotalTime());
	console.log("moving time", gpx.getMovingTime());
})();
