import { GpxMetaData } from "./gpx-meta-data";
import { GpxTrack } from './gpx-track';
import { GpxWaypoint } from "./gpx-waypoint";

/*
* Class representing the entire GPX file
*/
export class GpxFile {
	metadata: GpxMetaData;
	waypoints: GpxWaypoint[];
	//routes: GpxRoute[];
	tracks: GpxTrack[];	
}