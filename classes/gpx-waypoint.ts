export class GpxWaypoint {

	lat: number	// The latitude of the waypoint.
	lon: number	// The longtitude of the waypoint.
	elevation: number	// of the waypoint.
	time: Date	// The time at the waypoint.
	magvar: number	// The magnetic variation at the waypoint.
	geoidheight: number	// The geoid height at the waypoint.
	name: string	// The name of the waypoint.
	cmt: string	// A comment regarding the waypoint.
	desc: string	// A description of the waypoint.
	src: string	// The source of the waypoint.
	links: string[]	// An array of links for the waypoint.
	sym: string	// The symbol of the waypoint.
	type: string	// The type of waypoint.

}