import center from "@turf/center";
import { AllGeoJSON, Units, point, Point } from "@turf/helpers";
import length from "@turf/length";
import distance from "@turf/distance";
import { GpxWaypoint } from "classes/gpx-waypoint";
import { memoize } from "decko";
import * as fs from "fs";
import * as gpxParse from "gpx-parse";
import { GeoJson } from "./classes/geo-json";
import { GpxFile } from "./classes/gpx-file";

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

	private waypointToPoint(waypoint: GpxWaypoint): any {
		return point([waypoint.lon, waypoint.lat]);
	}

	private getClimbingParts(): GpxWaypoint[] {
		return this.points.filter((waypoint, i) => {
			return this.points[i] && this.points[i + 1] && this.points[i].elevation < this.points[i + 1].elevation;
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

	private getMetricOverMatchingPoints<T>(
		compareFn: (a: GpxWaypoint, b: GpxWaypoint) => boolean,
		metricFn: (a: GpxWaypoint, b: GpxWaypoint) => any
	): T {
		let metric = 0;

		for (let i = 0; i < this.points.length; i++) {
			if (this.points[i] && this.points[i + 1]) {
				if (compareFn(this.points[i], this.points[i + 1])) {
					metric += metricFn(this.points[i], this.points[i + 1]);
				}
			}			
		}

		return metric as any;
	}

	private distanceMetric = (a: GpxWaypoint, b: GpxWaypoint): number => {
		return distance(this.waypointToPoint(a), this.waypointToPoint(b), { units: "miles" });
	}

	private timeMetric = (a: GpxWaypoint, b: GpxWaypoint): number => {
		return b.time.getTime() - a.time.getTime()
	}

	@memoize()
	public getClimbingDistance(): number {
		const matchingFunction = (a: GpxWaypoint, b: GpxWaypoint) => a.elevation < b.elevation;
		return this.getMetricOverMatchingPoints<number>(matchingFunction, this.distanceMetric);
	}
	 
	@memoize()
	public getDescentDistance(): number {
		const matchingFunction = (a: GpxWaypoint, b: GpxWaypoint) => a.elevation > b.elevation;
		return this.getMetricOverMatchingPoints<number>(matchingFunction, this.distanceMetric);
 	}

	 @memoize()
	 public getFlatDistance(): number {
		 const matchingFunction = (a: GpxWaypoint, b: GpxWaypoint) => a.elevation === b.elevation;
		 return this.getMetricOverMatchingPoints<number>(matchingFunction, this.distanceMetric);
	}

	@memoize()
	public getClimbingTime(): number {
		const matchingFunction = (a: GpxWaypoint, b: GpxWaypoint) => a.elevation < b.elevation;
		return this.getMetricOverMatchingPoints<number>(matchingFunction, this.timeMetric);
	}

	@memoize()
	public getDescentTime(): number {
		const matchingFunction = (a: GpxWaypoint, b: GpxWaypoint) => a.elevation > b.elevation;
		return this.getMetricOverMatchingPoints<number>(matchingFunction, this.timeMetric);
	}

	@memoize()
	public getFlatTime(): number {
		const matchingFunction = (a: GpxWaypoint, b: GpxWaypoint) => a.elevation === b.elevation;
		return this.getMetricOverMatchingPoints<number>(matchingFunction, this.timeMetric);
	}

	@memoize()
	public getClimbingSpeed(): number {
		return this.getClimbingDistance() / (this.getClimbingTime() / 1000 / 60 / 60);
	}

	@memoize()
	public getDescentSpeed(): number {
		return this.getDescentDistance() / (this.getDescentTime() / 1000 / 60 / 60);
	}

	@memoize()
	public getFlatSpeed(): number {
		return this.getFlatDistance() / (this.getFlatTime() / 1000 / 60 / 60);
	}

}