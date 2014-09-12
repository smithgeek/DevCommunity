///ts:import=Mailer
import Mailer = require('./Mailer'); ///ts:import:generated
///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated

class DevCommunityEmailer {
    constructor(private mailer: Mailer, private userSettingsDb: Database, private domain: string, private allowSendMail: boolean, private logger: Logger) {
    } 

    public sendVerificationEmail(verificationCode, emailAddress) {
        var subject: string = "Developer Community: Verification Code";
        var body: string = "Someone has attempted to log into the developer community website with this email address.  If you did not do this no action is required. To finish logging in enter the verification code. <br/><br/>Verification Code: " + verificationCode;
        this.sendMail(emailAddress, subject, body );
    }

    public sendNewMeetingTopicEmails(meeting: MeetingData) {
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

    public sendMeetingScheduledEmail(specialMessage: string, meeting: MeetingData, users: Array<UserSettings>) {
        var subject = "Developer Community: Meeting Scheduled";
        var body = "";
        if (specialMessage != "") {
            body = "<b><ul>Special Message:</ul></b><br/>";
            body += specialMessage + "<br/>";
        }
        body += "The voters have spoken and the next topic has been determined.<br/>"
        body += "<a href='" + this.domain + "/#!/meeting/" + meeting._id + "'><h3>" + meeting.description + "</h3></a>" + meeting.details;
        body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + this.domain + "/#!/UserSettings'>here</a>.";
        for (var i = 0; i < users.length; i++) {
            this.sendMail(users[i].email, subject, body);
        }
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
