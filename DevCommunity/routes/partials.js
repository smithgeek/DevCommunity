var config = require('../config.js');
var jwt = require('jsonwebtoken');

function getUserEmail(req) {
    return jwt.decode(req.headers.authorization.substr(7)).email;
}
function home(req, res) {
    res.render('partials/home');
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
    res.render('partials/stories');
}
exports.stories = stories;
;

function UserSettings(req, res) {
    res.render('partials/UserSettings');
}
exports.UserSettings = UserSettings;
;

function meeting(req, res) {
    res.render('partials/meeting');
}
exports.meeting = meeting;
;

function admin(req, res) {
    res.render('partials/admin', { admin: config.server.admin == getUserEmail(req) });
}
exports.admin = admin;
;
//# sourceMappingURL=partials.js.map
