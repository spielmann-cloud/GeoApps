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
        var dist = getDistanceFromLatLonInKm(element.latitude, element.longitude, latitude, longitude);
        if(dist <= radius){
            results.push(element);
        }
    });
    return results;
}

var search = function(searchTerm){
    var results = [];
    geoObjArray.forEach(function(element){

        var compareName = element.name.search(searchTerm);
        var compareHashTags = element.hashtag.search(searchTerm);


        if(compareHashTags != -1 || compareName != -1){
            results.push(element);
        }


        console.log(element.name);
        console.log(element.hashtag);
        console.log(typeof element.name);
    });
    return results;
}

var add = function(geoObj){
    if(geoObj !== null && geoObj !== undefined){
        var addOrNot = true;
        geoObjArray.forEach(function (element){
            if(element.name === geoObj.name){
                addOrNot = false;
            } else if(element.longitude == geoObj.longitude && element.latitude == geoObj.latitude)
                addOrNot = false;
        });
        if(addOrNot) {
            geoObjArray.push(geoObj);
            console.log(geoObj);
            return 1;
        }
    }
    console.log(geoObj);
    return -1;
}

var deleteGeo = function(geoObj){
    if(geoObj !== null && geoObj !== undefined){
        geoObjArray.pop(geoObj);
        return 1;
    }
    return -1;
}

exports.deleteGeo = deleteGeo;
exports.add = add;
exports.search = search;
exports.searchByRadiusAndCoordinate = searchByRadiusAndCoordinate;
exports.geoObjArray = geoObjArray;