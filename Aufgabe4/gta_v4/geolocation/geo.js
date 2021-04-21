/**
 * var geoObj = function(latitude, longitude, name, hashtag){
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}

 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

var geoObjArray = [];
var amount = 0;

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

var searchByRadiusAndCoordinate = function(radius, latitude, longitude){
    var results = [];
    geoObjArray.forEach(function(element){
        if(element != undefined && element != null) {
            var dist = getDistanceFromLatLonInKm(element.latitude, element.longitude, latitude, longitude);
            console.log("DISTANE = " + dist);
            if (dist <= radius) {
                results.push(element);
            }
        }
    });
    return results;
}

var search = function(searchTerm){
    var results = [];


    geoObjArray.forEach(function(element){

        if(element != null && element != undefined) {
            var compareName = element.name.toLowerCase().search(searchTerm.toLowerCase());
            var compareHashTags = element.hashtag.toLowerCase().search(searchTerm.toLowerCase());


            if (compareHashTags != -1 || compareName != -1) {
                results.push(element);
            }
        }

    });
    return results;
}
var setter = function(obj){
    if(obj != undefined && obj != null)
        geoObjArray = obj;

}

var add = function(geoObj){
    if(geoObj !== null && geoObj !== undefined){
        var addOrNot = true;
        /*
        geoObjArray.forEach(function (element){
            if(element.name.toLowerCase() === geoObj.name.toLowerCase()){
                addOrNot = false;
            } else if(element.longitude == geoObj.longitude && element.latitude == geoObj.latitude)
                addOrNot = false;
        });
         */
        if(addOrNot) {
            geoObjArray.push(geoObj);
            return 1;
        }
    }
    return 0;
}

var deleteGeo = function(geoObj){
    if(geoObj !== null && geoObj !== undefined){
        geoObjArray.pop(geoObj);
        return 1;
    }
    return 0;
}

var myip;

exports.setter= setter;
exports.deleteGeo = deleteGeo;
exports.add = add;
exports.search = search;
exports.searchByRadiusAndCoordinate = searchByRadiusAndCoordinate;
exports.geoObjArray = geoObjArray;
exports.amount = amount;
exports.myip = myip;