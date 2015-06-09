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
        this.sendMail(emailAddress, "", subject, body );
    }

    public sendNewMeetingTopicEmails(meeting: MeetingData) {
        this.userSettingsDb.find({ Condition: { NewMeetingEmailNotification: true } }, (err, settings: Array<UserSettings>) => {
            if (err == null) {
                var subject = "Developer Community: New Meeting Idea";
                var body = "<a href='" + this.domain + "/#!/meeting/" + meeting._id + "'><h3>" + meeting.description + "</h3></a>" + meeting.details;
                body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + this.domain + "/#!/UserSettings'>here</a>.";
                this.sendMailToUsers(settings, subject, body);
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
                this.sendMailToUsers(settings, subject, body);
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
            body = "<b><u>Special Message:</u></b><br/>";
            body += specialMessage + "<br/><br/>";
        }
        body += "The voters have spoken and a new topic has been selected for " + meeting.date + ".<br/ >";
        body += "<a href='" + this.domain + "/#!/meeting/" + meeting._id + "'><h3>" + meeting.description + "</h3></a>" + meeting.details;
        body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + this.domain + "/#!/UserSettings'>here</a>.";
        this.sendMailToUsers(users, subject, body);
    }

    public sendNewsletter(newsletter: string, users: Array<UserSettings>) {
        var subject = "Developer Community: Newsletter";
        var body = newsletter;
        body += "<br/>To unsubscribe from email notifications, update your settings <a href='" + this.domain + "/#!/UserSettings'>here</a>.";
        this.sendMailToUsers(users, subject, body);
    }


    public sendAdminEmail(subject: string, body: string, users: Array<UserSettings>) {
        body += "<br/><br/>To unsubscribe from email notifications, update your settings <a href='" + this.domain + "/#!/UserSettings'>here</a>.";
        this.sendMailToUsers(users, subject, body);
    }

    public sendCommentEmail(users: Array<string>, url: string, commentText: string, commentFrom: string): void {
        var subject = "Developer Community: New Comment Posted";
        var body = "";
        body += "Comment by " + commentFrom + "<br/><br/>";
        if (commentText.length > 200) {
            body += commentText.substr(0, 200) + " ...";
        }
        else {
            body += commentText;
        }
        body += "<br/><br/>View full comment or reply on <a href='" + this.domain + "/#!/" + url + "'>site</a>.";
        body += "<br/><br/><br/><br/>To <a href='" + this.domain + "/#!/" + url + "'>unsubscribe</a>, click the subscription button below all of the comments.";
        this.sendMailToAddresses(users, subject, body);
    }

    private sendMailToAddresses(users: Array<string>, subject: string, body: string): void {
        var bccAddresses: string = "";
        for (var i = 0; i < users.length; i++) {
            bccAddresses += users[i] + ",";
        }
        this.sendMail("", bccAddresses, subject, body);
        if (!this.allowSendMail) {
            this.logger.verbose(body);
        }
    }

    private sendMailToUsers(users: Array<UserSettings>, subject: string, body: string): void {
        var bccAddresses: string = "";
        for (var i = 0; i < users.length; i++) {
            bccAddresses += users[i].email + ",";
        }
        this.sendMail("", bccAddresses, subject, body);
        if (!this.allowSendMail) {
            this.logger.verbose(body);
        }
    }

    private sendMail(toEmailAddress: string, bccAddresses: string, subject: string, body: string): void {
        if (this.allowSendMail) {
            this.mailer.sendEmail(toEmailAddress, bccAddresses, subject, body);
        }
        else {
            this.logger.log("Not Emailing \"" + subject + "\" to " + toEmailAddress);
        }
    }
}
export = DevCommunityEmailer;
