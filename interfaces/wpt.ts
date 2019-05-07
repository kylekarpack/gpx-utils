/*
* Interface representing a waypoint in a track
*/
export interface Wpt {
    lat: number;
    lon: number;
    time: Date;
    name: string;
}