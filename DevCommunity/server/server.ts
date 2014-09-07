/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/nodemailer/nodemailer.d.ts" />
/// <reference path="public/assets/js/Story.ts" />
/// <reference path="public/assets/js/UserSettings.ts" />
/// <reference path="public/assets/js/Services.ts" />
/// <reference path="Twitter.ts" />
/// <reference path="Database.ts" />

/**
 * Module dependencies.
 */

import express = require('express');
import routes = require('./routes/partials');
import http = require('http');
import path = require('path');
import fs = require('fs');
import Twitter = require('./Twitter');
import db = require('./Database');
import API = require('./Api');
import Visitor = require('./Visitor');
import DevCommunityEmailer = require('./DevCommunityEmailer');
import Mailer = require('./Mailer');
import PublicApi = require('./PublicApi');
import RestrictedApi = require('./RestrictedApi');
import Security = require('./Security');
import WebsiteVisitorFactory = require('./WebsiteVisitorFactory');

var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var nodemailer:Nodemailer = require ('nodemailer'); // https://github.com/andris9/nodemailer
var config = require('./config/config.js');

var app = express();

// all environments
app.set('port', process.env.PORT || config.server.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/api/restricted', expressJwt({ secret: config.server.jwtSecret }));
app.use('/partials/admin', expressJwt({ secret: config.server.jwtSecret }));
app.use(express.favicon());
var logFile: fs.WriteStream = fs.createWriteStream('./server.log', { flags: 'a' });
app.use(express.logger({
    stream: logFile, format: function (tokens, req, res) {
        var status = res.statusCode
            , len = parseInt(res.getHeader('Content-Length'), 10)
            , color = 32;

        if (status >= 500) color = 31
        else if (status >= 400) color = 33
        else if (status >= 300) color = 36;

        var lenStr = isNaN(len) ? '' : ' - ' + len;

        var now = Date.now();
        var d = new Date();
        var userEmail = req.headers.authorization ? ' (' + jwt.decode(req.headers.authorization.substr(7)).email + ')' : '';
        console.log( '\x1b[90m' + d.toLocaleTimeString() + ": " + req.connection.remoteAddress + userEmail + " - " + req.method
            + ' ' + req.originalUrl + ' '
            + '\x1b[' + color + 'm' + res.statusCode
            + ' \x1b[90m'
            + (now - req._startTime)
            + 'ms' + lenStr
            + '\x1b[0m' );
        return d.toLocaleTimeString() + ": " + req.connection.remoteAddress + userEmail + " - " + req.method
            + ' ' + req.originalUrl + ' '
            + res.statusCode
            + ' ' + (now - req._startTime)
            + 'ms' + lenStr;
    }
}));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

var publicPath: string = path.join(__dirname, 'public');
app.use(require('stylus').middleware(publicPath));
app.use("/public", express.static(publicPath));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var randomTweetsDb: db.Database = new db.NeDb('Data/random_tweets.db.json');
var twitter: Twitter = new Twitter(randomTweetsDb);

routes.setTwitterInstance(twitter);
app.get('/', routes.index);
app.get('/partials/home', routes.home);
app.get('/partials/about', routes.about);
app.get('/partials/contact', routes.contact);
app.get('/partials/brainstorming', routes.brainstorming);
app.get('/partials/pastMeetings', routes.pastMeetings);
app.get('/partials/stories', routes.stories);
app.get('/partials/UserSettings', routes.UserSettings);
app.get('/partials/meeting', routes.meeting);
app.get('/partials/story', routes.story);
app.get('/partials/admin', routes.admin);

import Logger = require('./Logger');
class ConsoleAndFileLogger implements Logger {
    log(message?: any, ...optionalParams: any[]): void {
        console.log(message);
        logFile.write(message + '\r\n');
    }
}

var oneDayInMilliseconds = 86400000;

var meetingIdeasDb: db.Database = new db.NeDb('Data/meeting_ideas.db.json');
var userVerificationDb: db.Database = new db.NeDb('Data/user_verification.db.json');
var storyDb: db.Database = new db.NeDb('Data/stories.db.json');
var userSettingsDb: db.Database = new db.NeDb('Data/user_settings.db.json');

var logger: Logger = new ConsoleAndFileLogger();
var emailer: DevCommunityEmailer = new DevCommunityEmailer(new Mailer(config.mail.from, config.mail.smtp, logger), userSettingsDb, config.server.domain, config.server.sendEmails, logger);

var publicApi: PublicApi = new PublicApi(twitter, storyDb, meetingIdeasDb);
var restrictedApi: RestrictedApi = new RestrictedApi(randomTweetsDb, twitter, userSettingsDb, storyDb, meetingIdeasDb, emailer, logger);
var security: Security = new Security(config.server.restrictedLoginDomain, config.server.jwtSecret, userVerificationDb, userSettingsDb, emailer, logger);
var api: API = new API(publicApi, restrictedApi, security);

var visitorFactory: WebsiteVisitorFactory = new WebsiteVisitorFactory(security, config.server.admin);
userSettingsDb.addIndex({ fieldName: 'email', unique: true }, function (err) {
    if (err != null) {
        logger.log('User settings index error: ' + err.toString());
    }
});

app.post('/verify', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        api.security.verify(visitor, req.body.verificationCode, res);
    });
});

app.post('/identify', (req, res) => {
    visitorFactory.get(req, (visitor) => {
        api.security.identify(visitor, res);
    });
});

app.post('/api/restricted/AddMeeting', function (req: any, res) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.addMeeting(visitor, req.body, res);
    });
});

app.get('/api/GetSuggestions', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        api.public.getMeetingSuggestions(visitor, res);
    });
});

app.get('/api/GetArchivedMeetings', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        api.public.getArhivedMeetings(visitor, res);
    });
});

app.get('/api/GetMeetingById/:id', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        api.public.getMeetingById(req.params.id, visitor, res);
    });
});

app.get('/api/GetStoryById/:id', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        api.public.getStoryById(req.params.id, visitor, res);
    });
});

app.get('/api/url', function (req, res) {
    var redirect: string = api.public.redirectUrl(req.query.url, res);
    logger.log(req.connection.remoteAddress + " is going to " + redirect);
});

app.post('/api/restricted/Vote', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.vote(visitor, req.body._id, res);
    });
});

app.get('/api/GetStories', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        api.public.getStories(visitor, res);
    });
});

app.post('/api/restricted/AddStory', function (req: any, res) {
    visitorFactory.get(res, (visitor) => {
        api.restricted.addStory(visitor, req.body, res);
    });
});

app.get('/api/restricted/GetUserSettings', function (req, res) {
    visitorFactory.get(req, (visitor) => {
        logger.log("Get user settings" + visitor.getEmail());
        api.restricted.getUserSettings(visitor, res);
    });
});

app.post('/api/restricted/SetUserSettings', function (req: any, res) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.setUserSettings(visitor, req.body, res);
    });
});

app.post('/api/restricted/AddUser', function (req: any, res) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.addUser(visitor, req.body.user, res);
    });
});

app.post('/api/restricted/AddTweet', function (req: any, res) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.addTweet(visitor, req.body.embedCode, res);
    });
});

app.get('/api/GetRandomTweet', function (req, res) {
    api.public.getRandomTweet(res);
});

http.createServer(app).listen(app.get('port'), function () {
    logger.log('Express server listening on port ' + app.get('port'));
});