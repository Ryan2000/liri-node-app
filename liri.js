
var fs = require("fs");

var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var request = require('request');

var keys = require('./keys.js');


var twitter = new Twitter(keys.twitterKeys);
var spotify = new Spotify(keys.spotifyKeys);


//log file - output file
var LOGFILE = 'log.txt';


//Constants
var commands = {
    tweets: 'my-tweets',
    spotify: 'spotify-this-song',
    movie: 'movie-this',
    doIt: 'do-what-it-says'
};

var COMMANDS_STR = [commands.tweets, commands.spotify, commands.movie, commands.doIt].join(', ');


if (process.argv.length < 3) {
    log('Command Required: ' + COMMANDS_STR, LOGFILE);
    process.exit(-1); //Kill the application
}


//any of our command line arguments
var inputString = process.argv[2];


//Get the query from the user
//spotify

if (process.argv.length === 4) {
    var query = process.argv[3];
} else {
    query = "The Sign";
}
var type = "track";

//twitter
if (process.argv.length === 5) {
    var user = process.argv[3];
    var numTweets = process.argv[4];
} else {
    user = "ryanhoyda";
    numTweets = 20;
}

//OMDB
if (process.argv.length === 4) {
    var movieName = process.argv[3];
} else {
    movieName = "Mr. Nobody";
}


if (inputString === commands.tweets) {
    myTweets();
} else if (inputString === commands.spotify) {
    spotifyThisSong();
} else if (inputString === commands.movie) {
    movieThis();
} else if (inputString === commands.doIt) {
    doWhatItSays();
} else {
    log('Pay attention! You have to use: ' + COMMANDS_STR, LOGFILE);
}
//process.exit(0);


function myTweets() {
    twitter.get('statuses/user_timeline', {screen_name: user, count: numTweets})
        .then(function (tweet) {
            for (var i = 0; i < tweet.length; i++) {
                log(tweet[i]['created_at'], LOGFILE);
                log(tweet[i]['text'], LOGFILE);
            }
        })
        .catch(function (error) {
            throw error;
        });
}


function spotifyThisSong() {
    spotify.search({type: type, query: query})
        .then(function (songInfo) {

            //Store the artist, song, preview link, and album in the results array
            songInfo.tracks.items.forEach(function (songtrack) {
                log(songtrack.artists[0].name, LOGFILE);
                log(songtrack.name, LOGFILE);
                log(songtrack.external_urls.spotify, LOGFILE);
                log(songtrack.album.name, LOGFILE);
            });

        })
        .catch(function (err) {
            log(err, LOGFILE);
            throw err;
        });
}


function movieThis() {
    var queryURL = 'http://www.omdbapi.com/?apikey=40e9cece&t=' + movieName + '&y=&plot=short&r=json';
    request(queryURL, function (error, response, body) {
        if (response.statusCode === 200) {
            //HTTP.OK = 200
            var json = JSON.parse(body);
            if(json.Error) {
                log(json.Error, LOGFILE);
            } else {
                log(json.Title, LOGFILE);
                log(json.Year, LOGFILE);
                log(json.Ratings[0].Value, LOGFILE);
                log(json.Ratings[1].Value, LOGFILE);
                log(json.Country, LOGFILE);
                log(json.Plot, LOGFILE);
                log(json.Actors, LOGFILE);
            }

        } else if (response.statusCode === 404) {
            //HTTP.NOT_FOUND = 404
            log('Not found', LOGFILE);
        } else if (error) {
            log(error, LOGFILE);
        }
    });
}


function doWhatItSays() {
    fs.readFile("random.txt", "utf8", function(err, data) {
        if (err) {
            return log(err, LOGFILE);
        }

        // Break the string down by comma separation and store the contents into the output array.
        var output = data.split(",");
        var inputString = output[0];//references first part of the string in txt file
        if (inputString === commands.tweets) {
            user = output[1];
            myTweets();
        } else if (inputString === commands.spotify) {
            query = output[1];
            spotifyThisSong();
        } else if (inputString === commands.movie) {
            movieName = output[1];
            movieThis();
        } else if (inputString === commands.doIt) {
            doWhatItSays();
        } else {
            log('Pay attention! You have to use: ' + COMMANDS_STR, LOGFILE);
        }

        // Print each element (item) of the array/
        //console.log(output[0]);
        //console.log(output[1]);

    });

}

function log(str, filename){
    if(filename){
        fs.appendFile(filename, str + '\n', function(err){
            if(err) {
                console.log(err);
            }
        });
    }
    console.log(str);
}
