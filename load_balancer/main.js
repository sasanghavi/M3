//var nr = require('newrelic')
var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var http      = require('http');
var httpProxy = require('http-proxy');
var HashMap = require('hashmap');
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})


var options = {};
var proxy   = httpProxy.createProxyServer(options);

var map = new HashMap();
map.set(1, '/');
map.set(2, '/small_file');
map.set(3, '/large_pdf');
map.set(4, '/recent');
map.set(5, '/listservers');


var proxyServer  = http.createServer(function(req, res)
{
    console.log("Got Request for: " + req.url);

    client.select(0, function(err){
        console.log("selected 0");
        client.lrange("servers", 0, -1, function(err,value){

            var rand =  Math.floor(Math.random()*value.length);
            var i = 0;
            value.forEach(function (server)
            {
                if (i == rand) {
                    console.log('Using server at ' + server + " ... ");
                    proxy.web( req, res, {target: server} );
                }
                i++;
            });
        });

        var dateNow = Date.now()
        var dbNum = 0
        if(req.url == '/'){
          dbNum = 1
        }
        else if(req.url == '/set'){
          dbNum = 2
        }
        else if(req.url == '/get'){
          dbNum = 3
        }
        else if(req.url == '/recent'){
          dbNum = 4
        }
        else if(req.url == '/listservers'){
          dbNum = 5
        }

        client.select(dbNum, function(err){
          
          console.log("dbNum : "+dbNum);
          if(err) return console.log("Error select: "+err);
          
          client.set(dateNow,0)
          client.expire(dateNow, 70)
          
          client.keys('*', function (err, keys) {
          if (err) return console.log("Error keys: "+err);
          if (keys.length>3) {
            console.log("Trigger slack message. Possible ddos attack at "+map.get(dbNum)+ " endpoint")
            client.del(dateNow)
          };
          // for(var i = 0, len = keys.length; i < len; i++) {
          // console.log(keys[i]);
          // }
        }
        )
        });
    });


});
proxyServer.listen(8080);