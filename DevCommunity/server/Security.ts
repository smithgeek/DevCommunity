import DB = require('./Database');
import Visitor = require('./Visitor');
import Logger = require('./Logger');
import HttpResponse = require('./HttpResponse');
import DevCommunityEmailer = require('./DevCommunityEmailer');
var jwt = require('jsonwebtoken');

class Security{

    constructor(private restrictedDomain: string, private jwtSecret: string, private userVerificationDb: DB.Database, private userSettingsDb: DB.Database, private emailer: DevCommunityEmailer, private logger: Logger) {
    }

    public verify(visitor: Visitor, verificationCode: string, res: HttpResponse): void {
        this.userVerificationDb.find({ Condition: { email: visitor.getEmail() } }, (err, docs) => {
            if (docs.length == 1) {
                var storedCode = docs[0];
                var timeout = storedCode.timestamp + 10 * 60 * 1000;
                if (verificationCode == storedCode.verificationCode && Date.now() <= timeout) {
                    var profile = { email: visitor.getEmail(), admin: visitor.isAdmin() };
                    var token = jwt.sign(profile, this.jwtSecret);
                    res.json({ token: token });
                    this.clearVerificationCodes(visitor.getEmail());
                    var emailAddressString: string = visitor.getEmail();
                    var settings = { email: emailAddressString, NewMeetingEmailNotification: true, NewStoryEmailNotification: true };
                    this.userSettingsDb.insert(settings, (err, newDoc) => {
                        if (err != null)
                            this.logger.log("Could not add user " + emailAddressString);
                        else
                            this.logger.log("Added user settings for " + emailAddressString);
                    });
                    return;
                }
            }
            res.send(401, "Invalid verification code.");
        });
    }

    public identify(visitor: Visitor, res: HttpResponse): void {
        var email: string = visitor.getEmail();
        if (this.restrictedDomain == "" || email.indexOf(this.restrictedDomain) != -1) {
            this.clearVerificationCodes(email);

            var verificationCode = this.generateVerificationCode();
            this.userVerificationDb.insert({ email: email, verificationCode: verificationCode, timestamp: Date.now() }, function (err, newDoc) { });
            this.emailer.sendVerificationEmail(verificationCode, email);
            this.logger.log("Verification code: " + verificationCode);
            res.send(200, "Success");
        }
        else {
            res.send(401, "Invalid, you must use a " + this.restrictedDomain + " address.");
        }
    }

    public decodeEmail(req, func: (email: string) => void) {
        if (req.headers && req.headers.authorization) {
            jwt.verify(req.headers.authorization.substr(7), this.jwtSecret, function (err, decoded) {
                if (err == null) {
                    func(decoded.email);
                }
                else {
                    func("");
                }
            });
        }
        else
            func("");
    }

    private generateVerificationCode(): number {
        return Math.floor(Math.random() * 900000) + 100000;
    }


    private clearVerificationCodes(email: string): void {
        this.userVerificationDb.remove({ Condition: { email: email }, Options: { multi: true } }, function (err, numRemoved) { });
    }

}
export = Security;