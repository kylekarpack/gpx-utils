"use strict";
exports.__esModule = true;
var toGeoJson = require("@mapbox/togeojson");
var length_1 = require("@turf/length");
var xmldom_1 = require("xmldom");
var GpxUtils = /** @class */ (function () {
    function GpxUtils(gpxFile) {
        this.gpxFile = gpxFile;
    }
    Object.defineProperty(GpxUtils.prototype, "points", {
        get: function () {
            console.log(this.gpxFile);
            return this.gpxFile.trk.trkseg.trkpt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GpxUtils.prototype, "geoJson", {
        get: function () {
            return toGeoJson(this.gpxFile);
        },
        enumerable: true,
        configurable: true
    });
    GpxUtils.fromFile = function (fileData) {
        var parsedFile = this.parseFile(fileData);
        return new GpxUtils(parsedFile);
    };
    GpxUtils.parseFile = function (fileData) {
        return new xmldom_1.DOMParser().parseFromString(fileData, "text/xml");
    };
    GpxUtils.prototype.getTotalTime = function () {
        return this.points[this.points.length - 1].time.getTime() - this.points[0].time.getTime();
    };
    GpxUtils.prototype.getTotalDistance = function (options) {
        if (options === void 0) { options = { units: "miles" }; }
        return length_1["default"](this.geoJson, options);
    };
    return GpxUtils;
}());
exports.GpxUtils = GpxUtils;
