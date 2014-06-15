var config = require('../config.js');

function home(req, res) {
    res.render('partials/home', {
        title: 'Test',
        pathToAssets: 'public',
        lastMeetingTitle: 'Demanding Professionalism in Software Development',
        description: 'Robert C. Martin explains in his own unique style why professionalism is so important for software development teams and their managers.',
        preview: 'iframe width="280" height="158" src="//www.youtube-nocookie.com/embed/p0O1VVqRSK0" frameborder="0" allowfullscreen'
    });
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
//# sourceMappingURL=partials.js.map
