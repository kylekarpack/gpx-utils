import center from "@turf/center";
import { AllGeoJSON, Units, point, Point, Feature } from "@turf/helpers";
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

	//#region Initialization functions
	
	/**
	 * Create a GpxUtils class from the string representation of a GPX file
	 * @param  {string} fileData string contents of a GPX file
	 * @returns {Promise<GpxUtils>} instance of this class
	 */
	public static async fromFile(fileData: string): Promise<GpxUtils> {
		const parsedFile = await this.parseFile(fileData);
		return new GpxUtils(parsedFile);
	}

	/**
	 * Create a GpxUtils class from the path to the file
	 * @param  {string} filePath 
	 * @returns {Promise<GpxUtils>} instance of this class
	 */
	public static async fromFilePath(filePath: string): Promise<GpxUtils> {
		return await this.fromFile(fs.readFileSync(filePath).toString());
	}
	
	/**
	 * Parse GPX file text content to JSON
	 * @param  {string} fileData
	 * @returns {Promise<GpxFile>} a GPX file in JSON format
	 */
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

	//#endregion

	//#region Private helper functions
	
	/**
	 * Convert a GPX Waypoint to a GeoJSON Point object
	 * @param  {GpxWaypoint} waypoint
	 * @returns {Feature} output point
	 */
	private waypointToPoint(waypoint: GpxWaypoint): Feature<Point, { [name: string]: any }> {
		return point([waypoint.lon, waypoint.lat]);
	}
	
	/**
	 * Run an aggregation function (metricFn) over a set of matching points (compareFn)
	 * @param  {(a:GpxWaypoint,b:GpxWaypoint)=>boolean} compareFn used to filter for matching points
	 * @param  {(a:GpxWaypoint,b:GpxWaypoint)=>any} metricFn used to calculate the metric
	 * @returns {T} the output metric
	 */
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

	/**
	 * Aggregate points based on the distance between them
	 * @param  {GpxWaypoint} currentWaypoint
	 * @param  {GpxWaypoint} nextWaypoint
	 * @returns {number} the distance between the waypoints
	 */
	private distanceMetric = (currentWaypoint: GpxWaypoint, nextWaypoint: GpxWaypoint): number => {
		return distance(
			this.waypointToPoint(currentWaypoint), 
			this.waypointToPoint(nextWaypoint), 
			{ units: "miles" }
		);
	}

	/**
	 * Aggregate points based on the time between them
	 * @param  {GpxWaypoint} currentWaypoint
	 * @param  {GpxWaypoint} nextWaypoint
	 * @returns number
	 */
	private timeMetric = (currentWaypoint: GpxWaypoint, nextWaypoint: GpxWaypoint): number => {
		return nextWaypoint.time.getTime() - currentWaypoint.time.getTime();
	}

	//#endregion

	//#region Public API Surface
	
	/**
	 * Get the total time elapsed during the track
	 * @returns {number} the time of the track in milliseconds
	 */
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

	//#endregion

}