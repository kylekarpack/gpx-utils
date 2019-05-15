import * as toGeoJson from "@mapbox/togeojson";
import { Units } from "@turf/helpers";
import length from "@turf/length";
import { GpxFile } from "./interfaces/gpx-file";
import { Trkpt } from "./interfaces/trkpt";
import { DOMParser } from "xmldom";

import { TIME_SELECTOR, TRACK_NAME_SELECTOR, TRACK_POINTS_SELECTOR } from "./constants/selectors";

export class GpxUtils {

	get points(): Trkpt[] {
		console.log(this.gpxFile)
		return this.gpxFile.trk.trkseg.trkpt;
	}

	get geoJson() {
		return toGeoJson(this.gpxFile);
	}

	constructor(private gpxFile: GpxFile) { }

	public static fromFile(fileData: string): GpxUtils {
		const parsedFile = this.parseFile(fileData);
		return new GpxUtils(parsedFile);
	}

	public static parseFile(fileData: string): GpxFile {
		return new DOMParser().parseFromString(fileData, "text/xml");
	}


	public getTotalTime(): number {
		return this.points[this.points.length - 1].time.getTime() - this.points[0].time.getTime();
	}

	public getTotalDistance(options: { units: Units } = { units: "miles" }): number {
		return length(this.geoJson, options);
	}

}