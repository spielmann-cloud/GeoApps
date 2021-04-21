/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var cookies = require("cookie-parser");
var credentials = require("./credentials.js");

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookies(credentials.cookieSecret));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

// TODO: CODE ERGÄNZEN
app.use(express.static(__dirname + "/public"));
/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

// TODO: CODE ERGÄNZEN
var GeoClass = function (latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
};

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN

var geo = require("./geolocation/geo.js");
/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function (req, res) {
    res.render('gta', {
        taglist: []
    });
    geo.amount++;
    geo.myip = new GeoClass();
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START
var url = require("url");
app.post('/tagging', function (req, res) {


    var geoObj = new GeoClass(req.body["latitude"], req.body["longitude"], req.body["name"], req.body["hashtag"]);

    geo.add(geoObj);

    geo.myip.latitude = req.body["latitude2"];
    geo.myip.longitude = req.body["longitude2"];

    res.render("gta", {
        latitude: geoObj.latitude,
        longitude: geoObj.longitude,
        name: geoObj.name,
        hashtag: geoObj.hashtag,
        taglist: geo.geoObjArray,
        iplat: geo.myip.latitude,
        iplong : geo.myip.longitude,
    });
    //}
});
/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN
app.post('/discovery', function (req, res) {

    console.log("Here are our cookies !");
    console.log(req.cookies);

    geo.myip.latitude = req.body["latitude"];
    geo.myip.longitude = req.body["longitude"];

    var searchItem = req.body["searchBox"];
    var result = geo.search(searchItem.toString());
    if (searchItem !== "") {
        if (result.length > 0) {
            res.render("gta", {
                latitude: result[0].latitude,
                longitude: result[0].longitude,
                name: result[0].name,
                hashtag: result[0].hashtag,
                taglist: result,
                amount: geo.amount,
                iplat: geo.myip.latitude,
                iplong: geo.myip.longitude,
            });
        } else {
            res.render("gta", {
                taglist: result,
                amount: geo.amount,
                iplat: geo.myip.latitude,
                iplong: geo.myip.longitude,
            });
        }
    } else {
        result = geo.searchByRadiusAndCoordinate(10, geo.myip.latitude, geo.myip.longitude);

        if(result.length > 0 && req.body["latitude"] !== "undefined") {
            res.render("gta", {
                taglist: result,
                latitude: result[0].latitude,
                longitude: result[0].longitude,
                name: result[0].name,
                hashtag: result[0].hashtag,
                amount: geo.amount,
                iplat: geo.myip.latitude,
                iplong: geo.myip.longitude,
            });
        }
        else {
            res.render("gta", {
                taglist: [],
                amount: geo.amount,
                iplat: geo.myip.latitude,
                iplong: geo.myip.longitude,
            });
        }
    }

});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
