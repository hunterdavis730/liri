require("dotenv").config();

var fs = require('fs');
var Spotify = require("node-spotify-api");

var axios = require("axios");

var inquirer = require('inquirer');

var moment = require("moment");

var keys = require("./keys.js");

var weather = require("weather-js");


var spotify = new Spotify(keys.spotify);

var searchType = process.argv[2];
var searchParams = process.argv.slice(3).join(" ");


function logSearch() {
    fs.appendFile("log.txt", `\nSearch Command: ${searchType}`, function (err) {
        if (err) {
            console.log(err)
        }
    });
    fs.appendFile("log.txt", "\nUser Input: " + searchParams + " \n", function (err) {
        if (err) {
            console.log(err)
        }
    })
}

function logError(event) {
    fs.appendFile('error.txt', `\nNew Error: ${event}`, function (err) {
        if (err) {
            console.log(err)
        }
    })
}


function spotifySearch(event) {
    spotify.search({
        type: "track",
        query: event
    }, function (err, data) {

        if (err) {

            logError(err)
        }

        if (data.tracks.total === 0) {
            console.log("That search returned 0 results. Here is The Sign by Ace of Base instead.")
            spotifySearch("The Sign Ace of Base");
        }
        var results = data.tracks.items;

        for (var i = 0; i < results.length; i++) {
            console.log('================');
            console.log(`Artist: ${results[i].album.artists[0].name}`)
            console.log(`Song Name: ${results[i].name}`)
            console.log(`Song Preview: ${results[i].preview_url}`)
            console.log(`Album Name: ${results[i].album.name}`)


            fs.appendFile("log.txt", `\nArtist: ${results[i].album.artists[0].name} \nSong Name: ${results[i].name} \nSong Preview: ${results[i].preview_url} \nAlbum Name: ${results[i].album.name} \n`, function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
    })
}

function concertSearch(event) {
    var concertUrl = `https://rest.bandsintown.com/artists/${event}/events?app_id=codingbootcamp`;
    axios.get(concertUrl).then(function (response) {
        var results = response.data;

        for (var i = 0; i < results.length; i++) {

            console.log('================');
            console.log(`Venue Name: ${results[i].venue.name}`)
            console.log(`Venue Location: ${results[i].venue.city}, ${results[i].venue.country}`)
            var date = moment(results[i].datetime).format('MMMM Do YYYY');
            console.log(`Event Date: ${date}`);

            fs.appendFile('log.txt', `\nVenue Name: ${results[i].venue.name} \nVenue Location: ${results[i].venue.city}, ${results[i].venue.country} \nEvent Date: ${date} \n`, function (err) {
                if (err) {
                    console.log(err)
                }
            })
        }
    }).catch(function (error) {
        logError(error)
    })
}

function movieSearch(event) {
    var queryUrl = `http://www.omdbapi.com/?apikey=trilogy&t=${event}`;
    axios.get(queryUrl).then(function (response) {

        var res = response.data;



        console.log('================');
        console.log(`Title: ${res.Title}`)
        console.log(`Released: ${res.Released}`)
        console.log(`IMDB Rating: ${res.Ratings[0].Value}`)
        console.log(`Produced in: ${res.Country}`)
        console.log(`Movie Language: ${res.Language}`)
        console.log(`Movie plot: ${res.Plot}`)
        console.log(`Actors: ${res.Actors}`)
        console.log('================');

        fs.appendFile("log.txt", `\nTitle: ${res.Title} \nReleased: ${res.Released} \nIMDB Rating: ${res.Ratings[0].Value} \nProduced in: ${res.Country} \nMovie Language: ${res.Language} \nMovie plot: ${res.Plot} \nActors: ${res.Actors} \n`, function (err) {
            if (err) {
                console.log(err)
            }
        })


    }).catch(function (error) {
        logError(error)
    })
}

function backStreet() {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            console.log(error)

        }

        var res = data.split(',');
        switch (res[0]) {
            case "concert-this":

                concertSearch(res[1])
                logSearch()
                break;
            case "spotify-this-song":

                spotifySearch(res[1])
                logSearch()
                break;
            case "movie-this":

                movieSearch(res[1])
                logSearch()
                break;

            default:
                console.log("Please use a proper Liri command");
                console.log("Commands: movie-this, spotify-this-song, concert-this")
        }

    });

}

if (searchParams) {



    switch (searchType) {
        case "concert-this":

            concertSearch(searchParams)
            logSearch()
            break;
        case "spotify-this-song":
            if (!searchParams) {
                console.log("Please enter a song to search for")
            }
            spotifySearch(searchParams)
            logSearch()
            break;
        case "movie-this":

            movieSearch(searchParams)
            logSearch()
            break;
        case "do-what-it-says":

            backStreet();
            logSearch()
            break;
        default:
            console.log("Please use a proper Liri command");
            console.log("Commands: movie-this, spotify-this-song, concert-this")
    }
} else {
    console.log('working')
    inquirer.prompt([{
            type: "input",
            message: "Welcome to liri search, what is your name?",
            name: "name"
        },
        {
            type: "list",
            message: "What would you like to search for?",
            choices: ["Songs", "Concerts", "Movies"],
            name: "searchType"
        },
        {
            type: "input",
            message: "Enter the text you want to search.",
            name: "searchData"
        }
    ]).then(function (answers) {

        var searchType = answers.searchType;
        var searchParams = answers.searchData;


        switch (searchType) {
            case "Songs":
                spotifySearch(searchParams);
                setTimeout(function () {
                    console.log(`Thanks for using liri search ${answers.name}. Try searching for movies or concerts!`)
                }, 2000)
                break;
            case "Concerts":
                concertSearch(searchParams)
                setTimeout(function () {
                    console.log(`Thanks for using liri search ${answers.name}. Try searching for movies or songs!`)
                }, 2000)
                break;
            case "Movies":
                movieSearch(searchParams)
                setTimeout(function () {
                    console.log(`Thanks for using liri search ${answers.name}. Try searching for concerts or songs!`)
                }, 2000)
                break;
            default:
                backStreet();
        }



    })

}