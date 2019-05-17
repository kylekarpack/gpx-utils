import { Units, AllGeoJSON } from "@turf/helpers";
import length from "@turf/length";
import { GpxWaypoint } from "classes/gpx-waypoint";
import * as fs from "fs";
import * as gpxParse from "gpx-parse";
import { GeoJson } from "./classes/geo-json";
import { GpxFile } from "./classes/gpx-file";

export class GpxUtils {

	get points(): GpxWaypoint[] {
		return this.gpxFile.tracks[0].segments[0];
	}

	public geoJson: AllGeoJSON;

	constructor(public gpxFile: GpxFile) { 
		this.geoJson = new GeoJson(gpxFile).geoJson;
	}

	public static async fromFile(fileData: string): Promise<GpxUtils> {
		const parsedFile = await this.parseFile(fileData);
		return new GpxUtils(parsedFile);
	}

	public static async fromFilePath(filePath: string): Promise<GpxUtils> {
		return await this.fromFile(fs.readFileSync(filePath).toString());
	}

	public static async parseFile(fileData: string): Promise<GpxFile> {
		return new Promise((resolve, reject) => {
			gpxParse.parseGpx(fileData, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}

	public getTotalTime(): number {
		return this.points[this.points.length - 1].time.getTime() - this.points[0].time.getTime();
	}

	public getMovingTime(): number {
		let time: number = 0,
			prevPoint: GpxWaypoint = this.points[0];
		for (let point of this.points) {
			if (point.lat !== prevPoint.lat || point.lon !== prevPoint.lon || point.elevation !== prevPoint.elevation) {
				time = time + (point.time.getTime() - prevPoint.time.getTime());
			}
			prevPoint = point;
		}
		return time;
	}

	public getTotalDistance(options: { units: Units } = { units: "miles" }): number {
		return length(this.geoJson, options);
	}

}