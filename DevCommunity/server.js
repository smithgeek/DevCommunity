/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/nodemailer/nodemailer.d.ts" />
/// <reference path="public/assets/js/Story.ts" />
/**
* Module dependencies.
*/
var express = require('express');
var routes = require('./routes/index');
var partials = require('./routes/partials');
var http = require('http');
var path = require('path');
var nedb = require('nedb');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var config = require('./config.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/api/restricted', expressJwt({ secret: 'mySuperSecret' }));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use("/public", express.static(__dirname + '/public'));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/partials/home', partials.home);
app.get('/partials/about', partials.about);
app.get('/partials/contact', partials.contact);
app.get('/partials/brainstorming', partials.brainstorming);
app.get('/partials/pastMeetings', partials.pastMeetings);
app.get('/partials/stories', partials.stories);

var oneDayInMilliseconds = 86400000;

var meetingIdeasDb = new nedb({ filename: 'meeting_ideas.db.json', autoload: true });
meetingIdeasDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var userVerificationDb = new nedb({ filename: 'user_verification.db.json', autoload: true });
userVerificationDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var storyDb = new nedb({ filename: 'stories.db.json', autoload: true });
storyDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var userSettingsDb = new nedb({ filename: 'user_settings.db.json', autoload: true });
userSettingsDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

function generateVerificationCode() {
    return Math.floor(Math.random() * 900000) + 100000;
}

function sendVerificationEmail(verificationCode, emailAddress) {
    var smtpTransport = nodemailer.createTransport("SMTP", config.mail.smtp);

    var message = {
        from: config.mail.from,
        to: emailAddress,
        subject: "Developer Community Verification Code",
        text: "Someone has attempted to log into the developer community website with this email address.  If you did not do this no action is required. To finish logging in enter the verification code. \n\nVerification Code: " + verificationCode
    };

    smtpTransport.sendMail(message, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: to " + emailAddress);
        }
        smtpTransport.close();
    });
}

function clearVerificationCodes(email) {
    userVerificationDb.remove({ email: email }, { multi: true }, function (err, numRemoved) {
    });
}

function getUserEmail(req) {
    return jwt.decode(req.headers.authorization.substr(7)).email;
}

app.post('/verify', function (req, res) {
    userVerificationDb.find({ email: req.body.email }, function (err, docs) {
        if (docs.length == 1) {
            var storedCode = docs[0];
            var timeout = storedCode.timestamp + 10 * 60 * 1000;
            if (req.body.verificationCode == storedCode.verificationCode && Date.now() <= timeout) {
                var profile = { email: req.body.email };
                var token = jwt.sign(profile, 'mySuperSecret');
                res.json({ token: token });
                clearVerificationCodes(req.body.email);
                return;
            }
        }
        res.send(401, "Invalid verification code.");
    });
});

app.post('/identify', function (req, res) {
    clearVerificationCodes(req.body.email);

    var verificationCode = generateVerificationCode();
    userVerificationDb.insert({ email: req.body.email, verificationCode: verificationCode, timestamp: Date.now() }, function (err, newDoc) {
    });
    if (config.mail.sendVerificationEmail) {
        sendVerificationEmail(verificationCode, req.body.email);
    }
    console.log("Verification code: " + verificationCode);
    res.send(200, "Success");
});

app.post('/api/restricted/AddMeeting', function (req, res) {
    var meeting = req.body;
    meeting.email = getUserEmail(req);
    if (meeting._id == "") {
        meetingIdeasDb.insert(meeting, function (err, newDoc) {
            if (err != null)
                res.send(404, "Failure");
            else
                res.send(200, { action: "Added", meeting: newDoc });
        });
    } else {
        meetingIdeasDb.update({ _id: meeting._id, email: getUserEmail(req) }, { $set: { description: meeting.description, details: meeting.details } }, {}, function (err, numReplaced) {
            if (err != null)
                res.send(404, "Could not update");
            else if (numReplaced > 0)
                res.send(200, { action: "Updated", meeting: meeting });
            else
                res.send(404, "Could not update");
        });
    }
});

app.get('/api/GetSuggestions', function (req, res) {
    meetingIdeasDb.find({}).sort({ vote_count: -1 }).exec(function (err, suggestions) {
        if (err == null)
            res.send(200, suggestions);
        else
            res.send(404, err);
    });
});

app.post('/api/restricted/Vote', function (req, res) {
    req.user.email = getUserEmail(req);
    console.log('user ' + req.user.email + ' is calling /api/restricted/Vote');
    meetingIdeasDb.update({ _id: req.body._id }, req.body, {}, function (err, newDoc) {
        if (err != null)
            res.send(404, "Failure");
        else
            res.send(200, "Success");
    });
});

app.get('/api/GetStories', function (req, res) {
    storyDb.find({}).sort({ timestamp: -1 }).exec(function (err, stories) {
        if (err == null)
            res.send(200, stories);
        else
            res.send(404, err);
    });
});

app.post('/api/restricted/AddStory', function (req, res) {
    var story = req.body;
    story.submittor = getUserEmail(req);
    story.timestamp = Date.now();
    if (story._id == null || story._id == "") {
        storyDb.insert(story, function (err, newDoc) {
            if (err != null)
                res.send(404, "Failure");
            else
                res.send(200, { action: "Added", story: newDoc });
        });
    } else {
        storyDb.update({ _id: story._id, submittor: getUserEmail(req) }, { $set: { description: story.description, title: story.title, url: story.url } }, {}, function (err, numReplaced) {
            if (err != null || numReplaced < 1)
                res.send(404, "Could not update");
            else
                res.send(200, { action: "Updated", story: story });
        });
    }
});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
//# sourceMappingURL=server.js.map
