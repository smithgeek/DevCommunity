
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
var nodemailer = require('nodemailer');  // https://github.com/andris9/nodemailer
var config = require('./config.js');

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

var oneDayInMilliseconds = 86400000;

var meetingIdeasDb = new nedb({ filename: 'meeting_ideas.db.json', autoload: true });
meetingIdeasDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);

var userVerificationDb = new nedb({ filename: 'user_verification.db.json', autoload: true });
userVerificationDb.persistence.setAutocompactionInterval(oneDayInMilliseconds);


function generateVerificationCode() {
    return Math.floor(Math.random()*900000) + 100000;
}

function sendVerificationEmail(verificationCode, emailAddress) {
    var smtpTransport = nodemailer.createTransport("SMTP", config.mail.smtp);

    var mailOptions = {
        from: config.mail.from,
        to: emailAddress,
        subject: "Developer Community Verification Code",
        text: "Someone has attempted to log into the developer community website with this email address.  If you did not do this no action is required. To finish logging in enter the verification code. \n\n Verification Code: " + verificationCode
    };

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: to " + emailAddress + " " + response.message);
        }
        smtpTransport.close();
    });
}

function clearVerificationCodes(email){
    userVerificationDb.remove({ email: email }, { multi: true }, function (err, numRemoved) {});
}

app.post('/verify', function(req, res) {
    userVerificationDb.find( { email: req.body.email }, function(err, docs) {
        if(docs.length == 1){
            var storedCode = docs[0];
            var timeout = storedCode.timestamp + 10 * 60 * 1000;
            if(req.body.verificationCode == storedCode.verificationCode && Date.now() <= timeout){
                var profile = { email: req.body.email };
                var token = jwt.sign(profile, 'mySuperSecret');
                res.json({ token: token });
                clearVerificationCodes( req.body.email );
                return;
            }
        }
        res.send(401, "Invalid verification code.");
    });
});

app.post('/identify', function(req, res) {
    clearVerificationCodes( req.body.email );

    var verificationCode = generateVerificationCode();
    userVerificationDb.insert( { email: req.body.email, verificationCode: verificationCode, timestamp: Date.now() }, function (err, newDoc) { });
    sendVerificationEmail(verificationCode, req.body.email);
    res.send( 200, "Success" );
});

app.post('/api/restricted/AddMeeting', function(req, res) {
    meetingIdeasDb.insert( req.body, function(err, newDoc) {
        if(err != null)
            res.send( 404, "Failure" );
        else
            res.send( 200, "Success" );
    });
});

app.get('/api/GetSuggestions', function(req, res) {
    meetingIdeasDb.find({}).sort( {vote_count: -1}).exec( function(err, suggestions) {
        if( err == null && suggestions.length > 0 )
            res.send(200, suggestions );
        else
            res.send(404, err);
    });
});

app.post('/api/restricted/Vote', function(req, res) {
    console.log('user ' + req.user.email + ' is calling /api/restricted/Vote');
    meetingIdeasDb.update( { _id: req.body._id }, req.body, {}, function(err, newDoc) {
        if(err != null)
            res.send( 404, "Failure" );
        else
            res.send( 200, "Success" );
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
