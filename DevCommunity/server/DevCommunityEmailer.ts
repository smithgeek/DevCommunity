import Mailer = require('./Mailer');
import DB = require('./Database');
import Logger = require('./Logger');

class DevCommunityEmailer {
    constructor(private mailer: Mailer, private userSettingsDb: DB.Database, private domain: string, private allowSendMail: boolean, private logger: Logger) {
    } 

    public sendVerificationEmail(verificationCode, emailAddress) {
        var subject: string = "Developer Community: Verification Code";
        var body: string = "Someone has attempted to log into the developer community website with this email address.  If you did not do this no action is required. To finish logging in enter the verification code. <br/><br/>Verification Code: " + verificationCode;
        this.sendMail(emailAddress, subject, body );
    }

    public sendNewMeetingTopicEmails(meeting: Meeting) {
        this.userSettingsDb.find({ Condition: { NewMeetingEmailNotification: true } }, (err, settings: Array<UserSettings>) => {
            if (err == null) {
                var subject = "Developer Community: New Meeting Idea";
                var body = "<a href='" + this.domain + "/#!/meeting/" + meeting._id + "'><h3>" + meeting.description + "</h3></a>" + meeting.details;
                body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + this.domain + "/#!/UserSettings'>here</a>.";
                for (var i = 0; i < settings.length; i++) {
                    this.sendMail(settings[i].email, subject, body);
                }
            }
            else {
                this.logger.log(err);
            }
        });
    }

    public sendNewStoryEmails(story: Story) {
        this.userSettingsDb.find({ Condition: { NewStoryEmailNotification: true } }, (err, settings: Array<UserSettings>) => {
            if (err == null) {
                var subject = "Developer Community: New Story Posted";
                var body = "<h3><a href='" + this.domain + "/#!/story/" + story._id + "'>" + story.title + "</a></h3><br/>" + story.description;
                body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + this.domain + "/#!/UserSettings'>here</a>.";
                for (var i = 0; i < settings.length; i++) {
                    this.sendMail(settings[i].email, subject, body);
                }
            }
            else {
                this.logger.log(err);
            }
        });
    }

    private sendMail(toEmailAddress: string, subject: string, body: string): void {
        if (this.allowSendMail) {
            this.mailer.sendEmail(toEmailAddress, subject, body);
        }
        else {
            this.logger.log("Emailing " + subject + " to " + toEmailAddress);
            this.logger.log(body);
        }
    }
}
export = DevCommunityEmailer;