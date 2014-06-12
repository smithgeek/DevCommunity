
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var partials = require('./routes/partials');
var http = require('http');
var path = require('path');
var nedb = require('nedb');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/api/restricted', expressJwt({secret: 'mySuperSecret'}));
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
app.get('/users', user.list);
app.get('/partials/home', partials.home);
app.get('/partials/about', partials.about);
app.get('/partials/contact', partials.contact);
app.get('/partials/brainstorming', partials.brainstorming);
app.get('/partials/pastMeetings', partials.pastMeetings);


var db = new nedb({ filename: 'devcommunity.db.json', autoload: true });
db.persistence.setAutocompactionInterval(86400000);

app.post('/authenticate', function(req, res) {
    var profile = { email: req.body.email };

    var token = jwt.sign(profile, 'mySuperSecret');
    res.json({ token: token });
});

app.post('/api/restricted/AddMeeting', function(req, res) {
    db.insert( req.body, function(err, newDoc) {
        if(err != null)
            res.send( 404, "Failure" );
        else
            res.send( 200, "Success" );
    });
});

app.get('/api/GetSuggestions', function(req, res) {
    db.find({}).sort( {vote_count: -1}).exec( function(err, suggestions) {
        if( err == null && suggestions.length > 0 )
            res.send(200, suggestions );
        else
            res.send(404, err);
    });
});

app.post('/api/restricted/Vote', function(req, res) {
    console.log('user ' + req.user.email + ' is calling /api/restricted/Vote');
    db.update( { _id: req.body._id }, req.body, {}, function(err, newDoc) {
        if(err != null)
            res.send( 404, "Failure" );
        else
            res.send( 200, "Success" );
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
