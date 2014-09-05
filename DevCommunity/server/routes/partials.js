var config = require('../config/config.js');
var jwt = require('jsonwebtoken');
var twitter;

function setTwitterInstance(t) {
    twitter = t;
}
exports.setTwitterInstance = setTwitterInstance;

function isAdmin(req) {
    if (req.headers.authorization)
        return config.server.admin == jwt.decode(req.headers.authorization.substr(7)).email;
    else
        return false;
}

function index(req, res) {
    res.render('index', { pathToAssets: 'public', config: config.nav });
}
exports.index = index;
;

function home(req, res) {
    if (config.nav.showRandomTweets) {
        twitter.getRandomTweet(function (html) {
            if (html == '') {
                res.render('partials/home', { admin: isAdmin(req), showTweet: false, tweetHtml: '' });
            } else {
                res.render('partials/home', { admin: isAdmin(req), showTweet: true, tweetHtml: html });
            }
        });
    } else {
        res.render('partials/home', { admin: isAdmin(req), showTweet: false, tweetHtml: '' });
    }
}
exports.home = home;
;

function about(req, res) {
    res.render('partials/about');
}
exports.about = about;
;

function contact(req, res) {
    res.render('partials/contact', { contact: config.contact });
}
exports.contact = contact;
;

function brainstorming(req, res) {
    res.render('partials/brainstorming');
}
exports.brainstorming = brainstorming;
;

function pastMeetings(req, res) {
    res.render('partials/pastMeetings');
}
exports.pastMeetings = pastMeetings;
;

function stories(req, res) {
    res.render('partials/stories', { disqus: config.disqus });
}
exports.stories = stories;
;

function UserSettings(req, res) {
    res.render('partials/UserSettings');
}
exports.UserSettings = UserSettings;
;

function meeting(req, res) {
    res.render('partials/meeting', { disqus: config.disqus });
}
exports.meeting = meeting;
;

function story(req, res) {
    res.render('partials/story', { disqus: config.disqus });
}
exports.story = story;
;

function admin(req, res) {
    res.render('partials/admin', { admin: isAdmin(req) });
}
exports.admin = admin;
;
//# sourceMappingURL=partials.js.map
