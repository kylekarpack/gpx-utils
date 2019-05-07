import { Trkseg } from "./trkseg";

/*
* Interface representing a track
*/
export interface Trk {
    name: string;
    desc?: any;
    trkseg: Trkseg;
}