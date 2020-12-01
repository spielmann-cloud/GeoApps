"use strict"
var http = require("http");
var server;
var count = 0;

server = http.createServer(function(req, res){

    var url_parts = new URL(req.url, `https://${req.headers.host}`);

    if(url_parts.pathname == "/greetme"){
        var params = url_parts.searchParams;
        res.writeHead(200, {"Content-Type" : "text/plain"});
        if(params.has("name")){
            res.end("Hi " + params.get("name"));
        } else{
            res.end("Hello friend !");
        }
    } else {
            res.writeHead(404,{"Content-Type" : "text/plain"});
            res.end("Page not found babe !");
    }
});

server.listen(process.argv[2], function(){
   console.log("Listening port " + process.argv[2] + "...");
});
