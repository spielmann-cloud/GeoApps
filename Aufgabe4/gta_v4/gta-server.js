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

app.use(bodyParser.json());
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
var GeoClass = function (latitude, longitude, name, hashtag, id) {
    this.id = id;
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
var fs = require("fs");
let unparsed_data = fs.readFileSync("geotags.json");
let data_tags = JSON.parse(unparsed_data);

//TODO: Idee - Code verändern so, dass nach Delete jedes Objekt neue id bekommt, z.B. ind + 1

app.get('/', function (req, res) {


    res.render('gta', {
        taglist: data_tags.tags,
       // tagobj: unparsed_data
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
/*
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

});
*/
app.post('/tagging', function (req, res){
    var data = req.body;
    var geoObj = new GeoClass(req.body["latitude"], req.body["longitude"], req.body["name"], req.body["hashtag"], findFreeIndex() + 1);


    data_tags.tags[geoObj.id - 1] = geoObj;
    var data_tags_str = JSON.stringify(data_tags);
    fs.writeFile("geotags.json", data_tags_str, () => console.log("Writing file done"));

    res.json({
        "msg":"Done",
        "our_tags": data_tags.tags,
    });
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
app.get('/discovery', function(req, res){

    // console.log(req.body);

    var url_parts = new URL(req.url, `http://${req.headers.host}`);
    var query = url_parts.searchParams;

    if(query.has("searchInput")){
        var toFind = query.get("searchInput");
        geo.setter(data_tags.tags);
        //TODO: Code optimization and add Array attribute to geo.search()

        var results = geo.search(toFind);

        if(toFind !== ""){

                res.json({
                    "results" : results,
                });

                //TODO: done
                //Add searchByRadius method if latitude and longitude are not zero through cookie
        } else {

                var loc_data = req.cookies;
                console.log("COOKIES ARE ");
                console.log(req.cookies);

                if(loc_data.iplat != null && loc_data.iplon != null)
                    results = geo.searchByRadiusAndCoordinate(10, loc_data.iplat, loc_data.iplon);
                else
                    results = geo.geoObjArray;

                console.log(loc_data);
                res.json({
                    loc_data: loc_data,
                    "results":results
                });
        }

    }

    //res.json({"msg" : "Success transfer data"});
});
// TODO: CODE ERGÄNZEN
app.post('/discovery', function (req, res) {


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
 * RestFull API
 */

const Joi = require("joi"); // Version 13
const schema = {
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    name: Joi.string().max(10).required().regex(new RegExp("[a-zA-Z]+")),
    hashtag: Joi.string().max(11).required().regex(new RegExp("#[a-zA-Z]+"))
}

function findFreeIndex(){
    var tags = data_tags.tags;
    if(tags.length == 0)
        return 0;
    else{
        let i = 0;
        while(true){
            if(tags[i] == undefined){
                return i;
            } else{
                i++;
            }
        }
    }
}
//Second get to implement
//TODO: Adding search
app.get("/geotags", (req, res) => {
    var tags = []
    var url_parts = new URL(req.url, `http://${req.headers.host}`);
    var query = url_parts.searchParams;

    if(query.has("searchterm")) {
        geo.setter(data_tags.tags);
        tags = geo.search(query.get("searchterm"));
        res.json(tags);
    } else if(query.has("latitude") && query.has("longitude")){
        lat = query.get("latitude");
        long = query.get("longitude");
        geo.setter(data_tags.tags);
        console.log("LAT = " + lat);
        console.log("LONG = " + long);
        tags = geo.searchByRadiusAndCoordinate(10,Number(lat), Number(long));
        res.json(tags);
    }
    else{
        data_tags.tags.forEach(function (elem) {
            if (elem != undefined)
                tags.push(elem);
        });
        res.json(tags);
    }
});

app.get("/geotags/:id", (req, res) => {
    var searchTag = null;
    data_tags.tags.forEach(function (elem){
        if(elem!= undefined && elem.id === Number(req.params.id)){
            searchTag = elem;
            return; // Can cause problem ?
        }
    });
    if(searchTag){
        res.json(searchTag);
    } else {
        res.status(404).send("No tags found with given id");
    }
});
app.post("/geotags", function( req, res){
    var result = Joi.validate(req.body, schema);
    if(result.error){
        return res.status(404).send("Validation error, can not add json file");
    }

    let ind = findFreeIndex()
    let tag = {
        "id" : ind + 1, // Not sure if +1 needed
        "latitude" : req.body.latitude,
        "longitude" : req.body.longitude,
        "name" : req.body.name,
        "hashtag" : req.body.hashtag
    };
    //data_tags.tags.push(tag);
    data_tags.tags[ind] = tag;
    var data_tags_str = JSON.stringify(data_tags);
    fs.writeFile("geotags.json", data_tags_str, () => console.log("Writing file done"));
    res.setHeader('Location', JSON.stringify(tag));
    res.status(201).json(tag);
});

app.put("/geotags/:id", function(req, res){
    //Validation check
    var result = Joi.validate(req.body, schema);
    if(result.error){
        return res.status(404).send("Validation error, can not add json file");
    }

    // Find element
    var searchTag = null;
    data_tags.tags.forEach(function (elem){
        if(elem != undefined && elem.id === Number(req.params.id)){
            searchTag = elem;
            return; // Can cause problem ?
        }
    });

    var oldSearchTag = {};
    if(searchTag){
        oldSearchTag.id = searchTag.id;
        oldSearchTag.latitude = searchTag.latitude;
        oldSearchTag.longitude = searchTag.longitude;
        oldSearchTag.name = searchTag.name;
        oldSearchTag.hashtag = searchTag.hashtag;

        searchTag.latitude = req.body.latitude;
        searchTag.longitude = req.body.longitude;
        searchTag.name = req.body.name;
        searchTag.hashtag = req.body.hashtag;

        var data_tags_str = JSON.stringify(data_tags);
        fs.writeFile("geotags.json", data_tags_str, () => console.log("Rewriting file done"));
        res.json(oldSearchTag);
    } else {
        return res.status(404).send("No tag with this ID found");
    }
});

app.delete("/geotags/:id", (req, res) =>{
    var index = Number(req.params.id) - 1;
    var tags = data_tags.tags;

    if(index <= -1 || tags[index] == undefined){
       return res.status(404).send("Inavlid id ");
    } else {
        res.json(tags[index]);
        data_tags.tags[index] = undefined;
        var data_tags_str = JSON.stringify(data_tags);
        fs.writeFile("geotags.json", data_tags_str, () => console.log("Deleting file done"));
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
