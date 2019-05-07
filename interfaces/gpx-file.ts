import { Trk } from "./trk";
import { Wpt } from "./wpt";

/*
* Interface representing the entire GPX file
*/
export interface GpxFile {
    creator: string;
    version: string;
    schemaLocation: string;
    wpt: Wpt;
    trk: Trk;
}