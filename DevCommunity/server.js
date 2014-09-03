/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/nodemailer/nodemailer.d.ts" />
/// <reference path="public/assets/js/Story.ts" />
/// <reference path="public/assets/js/UserSettings.ts" />
/**
* Module dependencies.
*/
var express = require('express');
var routes = require('./routes/partials');
var http = require('http');
var path = require('path');
var fs = require('fs');
var nedb = require('nedb');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var config = require('./config.js');

var app = express();

// all environments
app.set('port', process.env.PORT || config.server.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/api/restricted', expressJwt({ secret: config.server.jwtSecret }));
app.use('/partials/admin', expressJwt({ secret: config.server.jwtSecret }));
app.use(express.favicon());
var logFile = fs.createWriteStream('./server.log', { flags: 'a' });
app.use(express.logger({
    stream: logFile, format: function (tokens, req, res) {
        var status = res.statusCode, len = parseInt(res.getHeader('Content-Length'), 10), color = 32;

        if (status >= 500)
            color = 31;
        else if (status >= 400)
            color = 33;
        else if (status >= 300)
            color = 36;

        var lenStr = isNaN(len) ? '' : ' - ' + len;

        var now = Date.now();
        var d = new Date();
        var userEmail = req.headers.authorization ? ' (' + jwt.decode(req.headers.authorization.substr(7)).email + ')' : '';
        console.log('\x1b[90m' + d.toLocaleTimeString() + ": " + req.connection.remoteAddress + userEmail + " - " + req.method + ' ' + req.originalUrl + ' ' + '\x1b[' + color + 'm' + res.statusCode + ' \x1b[90m' + (now - req._startTime) + 'ms' + lenStr + '\x1b[0m');
        return d.toLocaleTimeString() + ": " + req.connection.remoteAddress + userEmail + " - " + req.method + ' ' + req.originalUrl + ' ' + res.statusCode + ' ' + (now - req._startTime) + 'ms' + lenStr;
    }
}));
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

function LOG(value) {
    console.log(value);
    logFile.write(value + '\r\n');
}

var oneDayInMilliseconds = 86400000;

var meetingIdeasDb = new nedb({ filename: 'meeting_ideas.db.json', autoload: true });
meetingIdeasDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var userVerificationDb = new nedb({ filename: 'user_verification.db.json', autoload: true });
userVerificationDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var storyDb = new nedb({ filename: 'stories.db.json', autoload: true });
storyDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var randomTweetsDb = new nedb({ filename: 'random_tweets.db.json', autoload: true });
randomTweetsDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var userSettingsDb = new nedb({ filename: 'user_settings.db.json', autoload: true });
userSettingsDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);
userSettingsDb.ensureIndex({ fieldName: 'email', unique: true }, function (err) {
    if (err != null) {
        LOG('User settings index error: ' + err.toString());
    }
});

function generateVerificationCode() {
    return Math.floor(Math.random() * 900000) + 100000;
}

function sendEmail(toEmailAddress, subject, body) {
    if (config.server.sendEmails) {
        var smtpTransport = nodemailer.createTransport("SMTP", config.mail.smtp);

        var message = {
            from: config.mail.from,
            to: toEmailAddress,
            subject: subject,
            html: body
        };

        smtpTransport.sendMail(message, function (error) {
            if (error) {
                LOG(error.message);
            } else {
                LOG("Sent email to " + toEmailAddress + ": " + subject);
            }
            smtpTransport.close();
        });
    } else {
        LOG("Emailing " + subject + " to " + toEmailAddress);
        LOG(body);
    }
}

function sendVerificationEmail(verificationCode, emailAddress) {
    sendEmail(emailAddress, "Developer Community: Verification Code", "Someone has attempted to log into the developer community website with this email address.  If you did not do this no action is required. To finish logging in enter the verification code. <br/><br/>Verification Code: " + verificationCode);
}

function clearVerificationCodes(email) {
    userVerificationDb.remove({ email: email }, { multi: true }, function (err, numRemoved) {
    });
}

function isAdmin(email) {
    return config.server.admin == email;
}

function getUserEmail(req) {
    if (req.user && req.user.email)
        return req.user.email;
    else
        return "";
}

function decodeEmail(req, func) {
    if (req.headers && req.headers.authorization) {
        jwt.verify(req.headers.authorization.substr(7), config.server.jwtSecret, function (err, decoded) {
            if (err == null) {
                func(decoded.email);
            } else {
                func("");
            }
        });
    } else
        func("");
}

function sendNewMeetingTopicEmails(meeting) {
    userSettingsDb.find({ NewMeetingEmailNotification: true }).exec(function (err, settings) {
        if (err == null) {
            var subject = "Developer Community: New Meeting Idea";
            var body = "<a href='" + config.server.domain + "/#!/meeting/" + meeting._id + "'><h3>" + meeting.description + "</h3></a>" + meeting.details;
            body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + config.server.domain + "/#!/UserSettings'>here</a>.";
            for (var i = 0; i < settings.length; i++) {
                var user = settings[i].email;
                if (config.server.sendEmailToAuthor || user != meeting.email) {
                    sendEmail(user, subject, body);
                }
            }
        } else {
            LOG(err);
        }
    });
}

function sendNewStoryEmails(story) {
    userSettingsDb.find({ NewStoryEmailNotification: true }).exec(function (err, settings) {
        if (err == null) {
            var subject = "Developer Community: New Story Posted";
            var body = "<h3><a href='" + config.server.domain + "/#!/story/" + story._id + "'>" + story.title + "</a></h3><br/>" + story.description;
            body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + config.server.domain + "/#!/UserSettings'>here</a>.";
            for (var i = 0; i < settings.length; i++) {
                var user = settings[i].email;
                if (config.server.sendEmailToAuthor || user != story.submittor) {
                    sendEmail(user, subject, body);
                }
            }
        } else {
            LOG(err);
        }
    });
}

app.post('/verify', function (req, res) {
    userVerificationDb.find({ email: req.body.email }, function (err, docs) {
        if (docs.length == 1) {
            var storedCode = docs[0];
            var timeout = storedCode.timestamp + 10 * 60 * 1000;
            if (req.body.verificationCode == storedCode.verificationCode && Date.now() <= timeout) {
                var profile = { email: req.body.email, admin: isAdmin(req.body.email) };
                var token = jwt.sign(profile, config.server.jwtSecret);
                res.json({ token: token });
                clearVerificationCodes(req.body.email);
                var emailAddressString = req.body.email;
                var settings = { email: emailAddressString, NewMeetingEmailNotification: true, NewStoryEmailNotification: true };
                userSettingsDb.insert(settings, function (err, newDoc) {
                    if (err != null)
                        LOG("Could not add user " + emailAddressString);
                    else
                        LOG("Added user settings for " + emailAddressString);
                });
                return;
            }
        }
        res.send(401, "Invalid verification code.");
    });
});

app.post('/identify', function (req, res) {
    var email = req.body.email;
    if (config.server.restrictedLoginDomain == "" || email.indexOf(config.server.restrictedLoginDomain) != -1) {
        clearVerificationCodes(req.body.email);

        var verificationCode = generateVerificationCode();
        userVerificationDb.insert({ email: req.body.email, verificationCode: verificationCode, timestamp: Date.now() }, function (err, newDoc) {
        });
        sendVerificationEmail(verificationCode, req.body.email);
        LOG("Verification code: " + verificationCode);
        res.send(200, "Success");
    } else {
        res.send(401, "Invalid, you must use a " + config.server.restrictedLoginDomain + " address.");
    }
});

app.post('/api/restricted/AddMeeting', function (req, res) {
    var meeting = req.body;
    meeting.email = getUserEmail(req);
    if (meeting._id == "") {
        meetingIdeasDb.insert(meeting, function (err, newDoc) {
            if (err != null)
                res.send(404, "Failure");
            else {
                res.send(200, { action: "Added", meeting: newDoc });
                if (newDoc.date == null) {
                    sendNewMeetingTopicEmails(newDoc);
                }
            }
        });
    } else {
        var condition = { _id: meeting._id };
        if (!isAdmin(getUserEmail(req))) {
            condition = { _id: meeting._id, email: getUserEmail(req) };
        }
        meetingIdeasDb.update(condition, { $set: { description: meeting.description, details: meeting.details, date: meeting.date } }, {}, function (err, numReplaced) {
            if (err != null)
                res.send(404, "Could not update");
            else if (numReplaced > 0)
                res.send(200, { action: "Updated", meeting: meeting });
            else
                res.send(404, "Could not update");
        });
    }
});

function anonymizeMeeting(meeting, user) {
    if (meeting.email != user) {
        meeting.email = "";
    }
    meeting.votes = meeting.votes.filter(function (value, index, array) {
        return value == user;
    });
    return meeting;
}
app.get('/api/GetSuggestions', function (req, res) {
    meetingIdeasDb.find({ $or: [{ date: { $exists: false } }, { date: null }] }).sort({ vote_count: -1 }).exec(function (err, suggestions) {
        if (err == null) {
            decodeEmail(req, function (email) {
                suggestions.forEach(function (value, index, array) {
                    anonymizeMeeting(value, email);
                });
                res.send(200, suggestions);
            });
        } else {
            res.send(404, err);
        }
    });
});

app.get('/api/GetArchivedMeetings', function (req, res) {
    meetingIdeasDb.find({ $and: [{ date: { $exists: true } }, { $not: { date: null } }] }).sort({ date: -1 }).exec(function (err, suggestions) {
        if (err == null) {
            decodeEmail(req, function (email) {
                suggestions.forEach(function (value, index, array) {
                    anonymizeMeeting(value, email);
                });
                res.send(200, suggestions);
            });
        } else {
            res.send(404, err);
        }
    });
});

app.get('/api/GetMeetingById/:id', function (req, res) {
    meetingIdeasDb.find({ _id: req.params.id }).exec(function (err, meeting) {
        if (err == null) {
            decodeEmail(req, function (email) {
                res.send(200, anonymizeMeeting(meeting[0], email));
            });
        } else {
            res.send(404, err);
        }
    });
});

function anonymizeStory(story, user) {
    if (story.submittor != user) {
        story.submittor = "";
    }
    return story;
}

app.get('/api/GetStoryById/:id', function (req, res) {
    storyDb.find({ _id: req.params.id }).exec(function (err, stories) {
        if (err == null) {
            decodeEmail(req, function (email) {
                res.send(200, anonymizeStory(stories[0], email));
            });
        } else {
            res.send(404, err);
        }
    });
});

app.get('/api/url', function (req, res) {
    var redirect = req.query.url;
    if (redirect.substr(0, 4) != 'http') {
        redirect = 'http://' + redirect;
    }
    LOG(req.connection.remoteAddress + " is going to " + redirect);
    res.redirect(redirect);
});

app.post('/api/restricted/Vote', function (req, res) {
    req.user.email = getUserEmail(req);
    meetingIdeasDb.find({ _id: req.body._id }).exec(function (err, meetings) {
        if (err == null) {
            var meeting = meetings[0];
            if (-1 == meeting.votes.indexOf(req.user.email)) {
                meeting.vote_count++;
                meeting.votes.push(req.user.email);
                LOG('user ' + req.user.email + ' voted for ' + meeting.description);
            } else {
                meeting.vote_count--;
                meeting.votes.splice(meeting.votes.indexOf(req.user.email), 1);
                LOG('user ' + req.user.email + ' removed vote for ' + meeting.description);
            }
            meetingIdeasDb.update({ _id: req.body._id }, meeting, {}, function (err, newDoc) {
                if (err != null)
                    res.send(404, "Failure");
                else
                    res.send(200, "Success");
            });
        } else {
            res.send(404, "Failure");
        }
    });
});

app.get('/api/GetStories', function (req, res) {
    storyDb.find({}).sort({ timestamp: -1 }).exec(function (err, stories) {
        if (err == null) {
            decodeEmail(req, function (email) {
                var sendStories = new Array();
                for (var i = 0; i < stories.length; ++i) {
                    sendStories.push(anonymizeStory(stories[i], email));
                }
                res.send(200, sendStories);
            });
        } else {
            res.send(404, err);
        }
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
            else {
                res.send(200, { action: "Added", story: newDoc });
                sendNewStoryEmails(newDoc);
            }
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

app.get('/api/restricted/GetUserSettings', function (req, res) {
    LOG(getUserEmail(req));
    userSettingsDb.find({ email: getUserEmail(req) }).exec(function (err, settings) {
        if (err == null)
            res.send(200, settings[0]);
        else
            res.send(404, err);
    });
});

app.post('/api/restricted/SetUserSettings', function (req, res) {
    var settings = req.body;
    settings.email = getUserEmail(req);
    userSettingsDb.update({ email: settings.email }, { $set: { NewMeetingEmailNotification: settings.NewMeetingEmailNotification, NewStoryEmailNotification: settings.NewStoryEmailNotification } }, { upsert: true }, function (err, numReplaced) {
        if (err != null || numReplaced < 1)
            res.send(404, "Could not update");
        else
            res.send(200, { action: "Updated", settings: settings });
    });
});

app.post('/api/restricted/AddUser', function (req, res) {
    if (isAdmin(getUserEmail(req))) {
        var email = req.body.user;
        var settings = { email: email, NewMeetingEmailNotification: true, NewStoryEmailNotification: true };
        userSettingsDb.insert(settings, function (err, newDoc) {
            if (err != null)
                res.send(404, "Could not add user " + email);
            else
                res.send(200, "Added user " + email);
        });
    } else {
        res.send(404, "Who do you think you are?  You have to be an administrator to add a user.");
    }
});

app.post('/api/restricted/AddTweet', function (req, res) {
    if (isAdmin(getUserEmail(req))) {
        var embedCode = req.body.embedCode.replace(/"/g, "'");

        randomTweetsDb.insert({ html: embedCode }, function (err, newDoc) {
            if (err != null)
                res.send(404, "Could not add tweet.");
            else
                res.send(200, "Added tweet. " + newDoc._id);
        });
    } else {
        res.send(404, "Who do you think you are?  You have to be an administrator to add a tweet.");
    }
});

app.get('/api/GetRandomTweet', function (req, res) {
    var twitter = require('./Twitter.js');
    twitter.getRandomTweet(function (html) {
        if (html == '') {
            res.send(401, '');
        } else {
            res.send(200, html);
        }
    });
});

http.createServer(app).listen(app.get('port'), function () {
    LOG('Express server listening on port ' + app.get('port'));
});
//# sourceMappingURL=server.js.map
