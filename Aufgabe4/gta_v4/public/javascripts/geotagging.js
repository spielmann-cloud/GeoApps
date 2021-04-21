/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.



GEOLOCATIONAPI = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function(onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function(error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function(position) {
        return position.coords.latitude;
    };

    var getMaximumZoomLevel = function(min_lat, max_lat, min_lon, max_lon, numPoints){
        /*
        * int mapdisplay = 322; //min of height and width of element which contains the map
double dist = (6371 * Math.acos(Math.sin(min_lat / 57.2958) * Math.sin(max_lat / 57.2958) +
            (Math.cos(min_lat / 57.2958) * Math.cos(max_lat / 57.2958) * Math.cos((max_lon / 57.2958) - (min_lon / 57.2958)))));

double zoom = Math.floor(8 - Math.log(1.6446 * dist / Math.sqrt(2 * (mapdisplay * mapdisplay))) / Math.log (2));

if(numPoints == 1 || ((min_lat == max_lat)&&(min_lon == max_lon))){
    zoom = 11;
}
        * */

        var mapdisplay = 400;
        var dist = (6371 * Math.acos(Math.sin(min_lat / 57.2958) * Math.sin(max_lat / 57.2958) +
            (Math.cos(min_lat / 57.2958) * Math.cos(max_lat / 57.2958) * Math.cos((max_lon / 57.2958) - (min_lon / 57.2958)))));
        var zoom = Math.floor(8 - Math.log(1.6446 * dist / Math.sqrt(2 * (mapdisplay * mapdisplay))) / Math.log (2));
        if(numPoints == 1 || ((min_lat == max_lat)&&(min_lon == max_lon))){
            zoom = 15;
        }
        return zoom;
    }

    // Auslesen Längengrad aus Position
    var getLongitude = function(position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "zLwXP9muq0z1JhA390niHHxWGEdUUPBF";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function(lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;


        return urlString;
    };

    var getCLatitude = 0;
    var getCLongitude = 0;

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        successCallback: (position) => {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;

            getCLatitude = latitude;
            getCLongitude = longitude;

            $("#data-latitude").val(latitude);
            $("#data-longitude").val(longitude);
            $("#longID").val(longitude);
            $("#latID").val(latitude);
            $("#data-latitude2").val(latitude);
            $("#data-longitude2").val(longitude);
            var data_tags = JSON.parse($(".tagmap img").attr("data-tags"));

            var clear_data = [];
            data_tags.forEach(function(elem){
                if(elem != null && elem != undefined){
                    clear_data.push(elem);
                }
            } );

            var locUrl = getLocationMapSrc(latitude, longitude, clear_data);
            $(".tagmap img").attr("src", locUrl);

            document.cookie = "iplat=" + getCLatitude;
            document.cookie = "iplon=" + getCLongitude;

        },

        failCallback : function(error) {
            var amount = $("#data-amount").val();
            var amount2 = $("#data-amount2").val();

            if(amount == '0' || amount2 == '0')
                window.alert(error);
        },

        newLocationUpdateArray: function(lat, long, arr){
            var clear_tags = [];
            arr.forEach(function(elem){
                if(elem != null && elem != undefined){
                    clear_tags.push(elem);
                }
            } );
            var locUrl = getLocationMapSrc(lat, long, clear_tags, 14);
            $(".tagmap img").attr("src", locUrl);
        },
        newLocationUpdate: function(lat, long){
            var locUrl = getLocationMapSrc(lat, long, undefined, 14);
            $(".tagmap img").attr("src", locUrl);
        },

        updateLocation: function() {
            // TODO Hier Inhalt der Funktion "update" ergänzen

            if ($("#longID").val() === "" && $("#latID").val() === "") {
                tryLocate(this.successCallback, this.failCallback);

            } else {
                var tags = JSON.parse($(".tagmap img").attr("data-tags"));

                var clear_tags = [];
                tags.forEach(function(elem){
                    if(elem != null && elem != undefined){
                        clear_tags.push(elem);
                    }
                } );
               // var tags = [];
               // tags = $("#results").toArray();
               // console.log(tags);
                //var chosenZoom = getMaximumZoomLevel(this.getMinimumLat(tags), this.getMaximumLat(tags), this.getMinimumLon(tags), this.getMaximumLon(tags), tags.length) - 1;
                var locUrl = getLocationMapSrc(clear_tags[clear_tags.length - 1].latitude, clear_tags[clear_tags.length - 1].longitude, clear_tags, 14);
                $(".tagmap img").attr("src", locUrl);

            }




        },


    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function() {
    //alert("Please change the script 'geotagging.js'");
    // TODO Hier den Aufruf für updateLocation einfügen
    var locator = gtaLocator.updateLocation();
});

