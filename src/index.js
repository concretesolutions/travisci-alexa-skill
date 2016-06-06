/**
 * App ID for the skill
 */
var APP_ID = undefined; 

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');
var http = require('https');
var urlPrefixBuilds = "api.travis-ci.org";

var Travis = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Travis.prototype = Object.create(AlexaSkill.prototype);
Travis.prototype.constructor = Travis;

Travis.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Travis onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

Travis.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Travis onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to Travis C I, you can say check my build status";
    var repromptText = "You can say check my build status";
    response.ask(speechOutput, repromptText);
};

Travis.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Travis onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
};

Travis.prototype.intentHandlers = {

    "TravisIntent": function (intent, session, response) {
        var speechOut = "Travis is Working"; 
        var cardTitle = "Travis C I Builder";
        var cardSpeech = speechOut;

        fetchTravisBuild( response );
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can say check my build status", "You can say check my build status");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var travis = new Travis();
    travis.execute(event, context);
};

function fetchTravisBuild( response )
{
    var url = urlPrefixBuilds;
    var options = {
        host: url,
        path: "/repos/CoderKingdom/swiftExtensions/builds",
        headers: {
        'User-Agent': 'MyClient/1.0.0',
        'Accept': 'application/vnd.travis-ci.2+json'
        }
    };

    http.get(options, function(res) {
        var body = '';

        // console.log(res);

        res.on('data', function (chunk) {
            body += chunk;
        });

        res.on('end', function () {
            console.log(body);
            var json = JSON.parse(body);
            var build = json.builds[0];
            var commit = json.commits[0];
            response.tell("Your last build status is " + build.state + " and lasted for " + build.duration + " seconds. The last commit was from " + commit.author_name + " and the message was" + commit.message );
        });
    }).on('error', function (e) {
        response.tell("I am sorry, but I couldn't reach Travis C I. Try again later. " + e.message );
    });
}
