var config = require('../config.js');

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
//# sourceMappingURL=partials.js.map
