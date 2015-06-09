///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated

class UserSettingsRepository{
    constructor(private db: Database, private logger: Logger) {
    }

    public getMeetingScheduledSubscribers(callback: (users: Array<UserSettings>) => void): void {
        this.db.find({
            Condition: { $or: [{ NewMeetingScheduledNotification: true }, { $and: [{ NewMeetingScheduledNotification: { $exists: false } }, { NewMeetingEmailNotification: true }] }] }
        }, (err, results: Array<UserSettings>) => {
            if (err == null) {
                callback(results);
            }
            else {
                this.logger.error("Error in UserSettingsRepo.getMeetingScheduledSubscribers " + err);
                callback([]);
            }
        });
    }

    public getAdminEmailSubscribers(callback: (users: Array<UserSettings>) => void): void {
        this.db.find({
            Condition: { $or: [{ AdminEmails: true }, { AdminEmails: { $exists: false } }] }
        }, (err, results: Array<UserSettings>) => {
            if (err == null) {
                callback(results);
            }
            else {
                this.logger.error("Error in UserSettingsRepo.getAdminEmailSubscribers " + err);
                callback([]);
            }
        });
    }

    public addUser(user: UserSettings, callback: (success: boolean) => void): void {
        this.db.insert(user, (err, newDoc) => {
            if (err != null) {
                this.logger.error("Error in UserSettingsRepo.addUser " + err);
            }
            callback(err == null);
        });
    }

    public getUserSettings(email: string, callback: (success: boolean, settings: UserSettings) => void): void {
        this.db.find({ Condition: { email: email } }, function (err, settings: Array<UserSettings>) {
            if (err == null && settings.length > 0) {
                var user: UserSettings = settings[0];
                callback(true, new UserSettings(user.email, user.NewMeetingEmailNotification, user.NewStoryEmailNotification, user.NewMeetingScheduledNotification, user.AdminEmails, user._id, user.NewsletterEmails));
            }
            else {
                callback(false, null);
            }
        });
    }

    public updateUserSettings(email: string, settings: UserSettings, callback: (success: boolean) => void): void {
        this.db.update({
            Query: { email: email },
            Update: {
                $set: {
                    NewMeetingEmailNotification: settings.NewMeetingEmailNotification,
                    NewStoryEmailNotification: settings.NewStoryEmailNotification,
                    NewMeetingScheduledNotification: settings.NewMeetingScheduledNotification,
                    AdminEmails: settings.AdminEmails,
                    NewsletterEmails: settings.NewsletterEmails
                }
            },
            Options: { upsert: true }
        }, (err, numReplaced) => {
            if (err != null || numReplaced < 1)
                callback(false);
            else
                callback(true);
        });
    }

    public getUsers(callback: (users: Array<UserSettings>) => void): void {
        this.db.find({ Condition: {} }, (err, settings: Array<UserSettings>) => {
            if (err == null) {
                callback(settings);
            }
            else {
                callback([]);
            }
        });
    }

    public deleteUser(user: UserSettings, callback: (success: boolean) => void): void {
        this.db.remove({ Condition: { _id: user._id }, Options: {} }, (err, count: number) => {
            callback(err == null && count > 0);
        });
    }

    public getNewsletterSubscribers(callback: (users: Array<UserSettings>) => void): void {
        this.db.find({
            Condition: { $or: [{ NewsletterEmails: true }, { NewsletterEmails: { $exists: false } }] }
        }, (err, results: Array<UserSettings>) => {
                if (err == null) {
                    callback(results);
                }
                else {
                    this.logger.error("Error in UserSettingsRepo.getNewsletterSubscribers " + err);
                    callback([]);
                }
        });
    }
}
export = UserSettingsRepository;
