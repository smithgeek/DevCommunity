/**
 * Module dependencies.
 */

import express = require('express');
import routes = require('./routes/partials');

import path = require('path');
import fs = require('fs');
///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
///ts:import=NeDb
import NeDb = require('./NeDb'); ///ts:import:generated
///ts:import=Twitter
import Twitter = require('./Twitter'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=DevCommunityEmailer
import DevCommunityEmailer = require('./DevCommunityEmailer'); ///ts:import:generated
///ts:import=Mailer
import Mailer = require('./Mailer'); ///ts:import:generated
///ts:import=PublicApi
import PublicApi = require('./PublicApi'); ///ts:import:generated
///ts:import=UserSettingsRepository
import UserSettingsRepository = require('./UserSettingsRepository'); ///ts:import:generated
///ts:import=RestrictedApi
import RestrictedApi = require('./RestrictedApi'); ///ts:import:generated
///ts:import=Api
import Api = require('./Api'); ///ts:import:generated
///ts:import=Security
import Security = require('./Security'); ///ts:import:generated
///ts:import=WebsiteVisitorFactory
import WebsiteVisitorFactory = require('./WebsiteVisitorFactory'); ///ts:import:generated
///ts:import=Site
import Site = require('../Common/Site'); ///ts:import:generated
///ts:import=SmtpConverter
import SmtpConverter = require('./SmtpConverter'); ///ts:import:generated
///ts:import=CommentTransports
import CommentTransports = require('../Common/CommentTransports'); ///ts:import:generated
///ts:import=CommentRepository
import CommentRepository = require('./CommentRepository'); ///ts:import:generated
///ts:import=PrizeManager
import PrizeManager = require('./PrizeManager'); ///ts:import:generated
///ts:import=PrizeTransport
import PrizeTransport = require('../Common/PrizeTransport'); ///ts:import:generated

var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var nodemailer:Nodemailer = require ('nodemailer'); // https://github.com/andris9/nodemailer
var io;

var configFilePath = 'Config/config.json';
var config: Site.Config = new Site.Config();

if (fs.existsSync(configFilePath)) {
    var input: any = fs.readFileSync(configFilePath);
    config = JSON.parse(input);
}
else {
    fs.writeFileSync(configFilePath, JSON.stringify(config));
}

var carouselPath: string = 'site/views/partials/HomeCarousel.jade';
if(!fs.existsSync(carouselPath)) {
    if (config.server.isServerConfigured) {
        fs.writeFileSync(carouselPath, '.item.active\n  .row\n    .col-md-12\n      h3 Nothing to see here.\n');
    }
    else {
        fs.writeFileSync(carouselPath, '.item.active\n  .row\n    .col-md-12\n      h3 Site needs configuration!\n      p.jumbotron-small-text(style="white-space:pre;")\n        | Login using "admin@admin.com"\n        | A blank verification code.');
    }
}

var app = express();

// all environments
var rootPath: string = path.join(__dirname, '..');
app.set('port', config.server.port.toString());
app.set('views', path.join(rootPath, 'views'));
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

var publicPath: string = path.join(rootPath, 'public');
app.use(require('stylus').middleware(publicPath));
app.use("/public", express.static(publicPath));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var DatabaseDir: string = "Data/";
var randomTweetsDb: Database = new NeDb(path.join(DatabaseDir, 'random_tweets.db.json'));
var twitter: Twitter = new Twitter(randomTweetsDb);

routes.setConfig(config);
app.get('/', routes.index);
app.get('/partials/home', routes.home);
app.get('/partials/about', routes.about);
app.get('/partials/register', routes.register);
app.get('/win', routes.win);
app.get('/winner', routes.winnerRedirect);
app.get('/partials/winner', routes.winner);
app.get('/partials/contact', routes.contact);
app.get('/partials/brainstorming', routes.brainstorming);
app.get('/partials/pastMeetings', routes.pastMeetings);
app.get('/partials/stories', routes.stories);
app.get('/partials/UserSettings', routes.UserSettings);
app.get('/partials/meeting', routes.meeting);
app.get('/partials/story', routes.story);
app.get('/partials/admin', routes.admin);
app.get('/partials/CommentSystem.html', routes.commentSystem);
app.get('/partials/Comment.html', routes.comment);
app.get('/partials/CommentForm.html', routes.commentForm);

class ConsoleAndFileLogger implements Logger {
    log(message: string): void {
        console.log(message);
        logFile.write(message + '\r\n');
    }
    error(message: string): void {
        this.log(message);
    }
    verbose(message: string): void {
        logFile.write(message + '\r\n');
    }
}

var oneDayInMilliseconds = 86400000;

var meetingIdeasDb: Database = new NeDb(path.join(DatabaseDir, 'meeting_ideas.db.json'));
var userVerificationDb: Database = new NeDb(path.join(DatabaseDir, 'user_verification.db.json'));
var storyDb: Database = new NeDb(path.join(DatabaseDir, 'stories.db.json'));
var userSettingsDb: Database = new NeDb(path.join(DatabaseDir, 'user_settings.db.json'));
var commentsDb: Database = new NeDb(path.join(DatabaseDir, 'comments.db.json'));

var logger: Logger = new ConsoleAndFileLogger();
var smtpConverter: SmtpConverter = new SmtpConverter(config.mail.smtp);
var emailer: DevCommunityEmailer = new DevCommunityEmailer(new Mailer(config.mail.from, smtpConverter, logger), userSettingsDb, config.server.domain, config.server.sendEmails, logger);
var commentRepo: CommentRepository = new CommentRepository(commentsDb, logger, emailer);

var publicApi: PublicApi = new PublicApi(twitter, storyDb, meetingIdeasDb, logger, commentRepo);
var userSettingsRepo: UserSettingsRepository = new UserSettingsRepository(userSettingsDb, logger);
var prizeManager: PrizeManager = new PrizeManager(userSettingsRepo);
var restrictedApi: RestrictedApi = new RestrictedApi(randomTweetsDb, twitter, userSettingsRepo, storyDb, meetingIdeasDb, emailer, logger, commentRepo, prizeManager);
var security: Security = new Security(config.server.restrictedLoginDomain, config.server.jwtSecret, userVerificationDb, userSettingsDb, emailer, logger, config);
var api: Api = new Api(publicApi, restrictedApi, security);

var visitorFactory: WebsiteVisitorFactory = new WebsiteVisitorFactory(security, config.server.admin, logger);
routes.setVisitorFactory(visitorFactory);

userSettingsDb.addIndex({ fieldName: 'email', unique: true }, function (err) {
    if (err != null) {
        logger.log('User settings index error: ' + err.toString());
    }
});

app.post('/verify', function (req: express.Request, res: express.Response) {
    api.security.verify(visitorFactory.getByEmail(req.body.email), req.body.verificationCode, res);
});

app.post('/identify', (req: express.Request, res: express.Response) => {
    api.security.identify(visitorFactory.getByEmail(req.body.email), res);
});

app.post('/api/restricted/AddMeeting', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.addMeeting(visitor, req.body.meeting, res);
        if (req.body.sendEmail) {
            api.restricted.emailUsersMeetingScheduled(visitor, req.body.message, req.body.meeting);
        }
    });
});

app.get('/api/GetSuggestions', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.public.getMeetingSuggestions(visitor, res);
    });
});

app.get('/api/GetArchivedMeetings', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.public.getArhivedMeetings(visitor, res);
    });
});

app.get('/api/GetMeetingById/:id', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.public.getMeetingById(req.params.id, visitor, res);
    });
});

app.get('/api/GetStoryById/:id', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.public.getStoryById(req.params.id, visitor, res);
    });
});

app.get('/api/url', function (req: express.Request, res: express.Response) {
    var redirect: string = api.public.redirectUrl(req.query.url, res);
    logger.log(req.connection.remoteAddress + " is going to " + redirect);
});

app.post('/api/restricted/Vote', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.vote(visitor, req.body._id, res);
    });
});

app.get('/api/GetStories', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.public.getStories(visitor, res);
    });
});

app.post('/api/restricted/AddStory', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.addStory(visitor, req.body, res);
    });
});

app.get('/api/restricted/GetUserSettings', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        logger.log("Get user settings " + visitor.getEmail());
        api.restricted.getUserSettings(visitor, res);
    });
});

app.post('/api/restricted/SetUserSettings', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.setUserSettings(visitor, req.body, res);
    });
});

app.post('/api/restricted/AddUser', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.addUser(visitor, req.body.user, res);
    });
});

app.post('/api/restricted/AddTweet', function (req: express.Request, res: express.Response) {
    visitorFactory.get(req, (visitor) => {
        api.restricted.addTweet(visitor, req.body.embedCode, res);
    });
});

app.get('/api/GetRandomTweet', function (req: express.Request, res: express.Response) {
    api.public.getRandomTweet(res);
});

app.get('/api/restricted/GetSiteConfig', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.getSiteConfig(visitor, config, res);
    });
});

app.post('/api/restricted/UpdateSiteConfig', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.updateSiteConfig(visitor, req.body, configFilePath, res);
    });
});

app.get('/api/restricted/GetCarousel', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.getCarousel(visitor, res);
    });
});

app.post('/api/restricted/RenderJade', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.renderJade(visitor, req.body.jade, res);
    });
});

app.post('/api/restricted/SaveCarousel', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.saveHomeCarousel(visitor, req.body.jade, res);
    });
});

app.get('/api/restricted/GetUsers', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.getUsers(visitor, res);
    });
});

app.post('/api/restricted/DeleteUser', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.deleteUser(visitor, req.body.user, res);
    });
});

app.post('/api/restricted/sendAdminEmail', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.sendAdminEmail(visitor, req.body.subject, req.body.body, res);
    });
});

app.get('/api/GetComments/:id', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        var input: CommentTransports.Get = {
            GroupId: req.params.id
        };
        api.public.getComments(visitor, input, res);
    });
});

app.post('/api/restricted/PostComment', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.postComment(visitor, <CommentTransports.Post>req.body, res);
    });
});

app.post('/api/restricted/EditComment', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.editComment(visitor, <CommentTransports.Post>req.body, res);
    });
});

app.post('/api/restricted/PostCommentReply', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.postCommentReply(visitor, <CommentTransports.PostReply>req.body, res);
    });
});

app.post('/api/restricted/ChangeSubscription', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.changeSubscription(visitor, <CommentTransports.Subscription>req.body, res);
    });
});

app.post('/api/restricted/VisitComment', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.visitComment(visitor, <CommentTransports.VisitComment>req.body, res);
    });
});

app.post('/api/RegisterForPrizes', (req: express.Request, res: express.Response) => {
    var data: PrizeTransport.Register = req.body;
    prizeManager.register(data.Email, data.Prizes, (success, msg) => {
        res.send(success ? 200 : 404, <PrizeTransport.RegisterReply>{ Message: msg });
        if (success) {
            io.emit('Prize:NewEntry', {});
        }
    });
});

app.get('/api/IsPrizeRegistrationOpen', (req: express.Request, res: express.Response) => {
    res.send(200, <PrizeTransport.IsRegistrationOpen>{ Open: prizeManager.isRegistrationOpen() });
});

app.post('/api/restricted/OpenRegistration', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.openPrizeRegistration(visitor, res, io);
    });
});

app.post('/api/restricted/CloseRegistration', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.closePrizeRegistration(visitor, res, io);
    });
});

app.post('/api/restricted/PickWinner', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        var data: PrizeTransport.PickWinner = req.body;
        api.restricted.pickWinner(visitor, data.Prize, res, io);
    });
});

app.post('/api/restricted/SaveWinner', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        var data: PrizeTransport.SaveWinner = req.body;
        api.restricted.saveWinner(visitor, data.Email, data.Prize, res, io);
    });
});

app.post('/api/restricted/ClearPastWinner', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        var data: PrizeTransport.ClearPastWinner = req.body;
        api.restricted.clearPastWinner(visitor, data.Email, res);
    });
});

app.post('/api/restricted/ClearPrizeEntries', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.clearPrizeEntries(visitor, res);
    });
});

app.get('/api/restricted/GetPrizeEntries', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.getPrizeEntries(visitor, res);
    });
});

app.get('/api/restricted/GetPastWinners', (req: express.Request, res: express.Response) => {
    visitorFactory.get(req, (visitor) => {
        api.restricted.getPastWinners(visitor, res);
    });
});

var http = require('http').Server(app);
io = require('socket.io')(http);

io.on('connection', (socket) => {
    logger.log('a user connected');
    socket.on('disconnect', () => {
        logger.log('user disconnected');
    });
});

http.listen(app.get('port'), function () {
    logger.log('Express server listening on port ' + app.get('port'));
});
