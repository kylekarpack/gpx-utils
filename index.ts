import { Units, AllGeoJSON } from "@turf/helpers";
import length from "@turf/length";
import center from "@turf/center";
import { GpxWaypoint } from "classes/gpx-waypoint";
import * as fs from "fs";
import * as gpxParse from "gpx-parse";
import { GeoJson } from "./classes/geo-json";
import { GpxFile } from "./classes/gpx-file";
import { memoize } from "decko";

export class GpxUtils {

	get points(): GpxWaypoint[] {
		return this.gpxFile.tracks[0].segments[0];
	}

	get name(): string {
		return this.gpxFile.tracks[0].name;
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

	@memoize()
	public getTotalTime(): number {
		return this.points[this.points.length - 1].time.getTime() - this.points[0].time.getTime();
	}

	@memoize()
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

	@memoize()
	public getTotalElevation(): number {
		return this.points.reduce((total, currentItem, index) => {
			const nextItem = this.points[index + 1];
			if (nextItem && nextItem.elevation > currentItem.elevation) {
				return total + (nextItem.elevation - currentItem.elevation);
			}
			return total;
		}, 0);
	}

	@memoize()
	public getNetTotalElevation(): number {
		
		return this.points.reduce((total, currentItem, index) => {
			const nextItem = this.points[index + 1];
			if (nextItem && nextItem.elevation > currentItem.elevation) {
				return total + (nextItem.elevation - currentItem.elevation);
			}
			return total;
		}, 0);
	}

	@memoize()
	public getTotalDistance(options: { units: Units } = { units: "miles" }): number {
		return length(this.geoJson, options);
	}

	@memoize()
	public getCenter(): number[] {
		return center(this.geoJson).geometry.coordinates;
	}

}