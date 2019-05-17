import { AllGeoJSON } from '@turf/helpers';
import { GpxFile } from './gpx-file';

export class GeoJson {

	public geoJson: AllGeoJSON;

	constructor(private gpx: GpxFile) {

		const features: any = this.gpx.tracks.map(track => {
			return {
				type: "Feature",
				geometry: {
					type: "LineString",
					coordinates: track.segments[0].map(point => {
						return [point.lon, point.lat, point.elevation]
					})
				},
				properties: {
					name: track.name
				}
			};

		});
		
		this.geoJson = {
			type: "FeatureCollection",
			features: features
		}

	}

}