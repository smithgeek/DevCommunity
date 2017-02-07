class UserSettings {
    constructor(email: string = "", NewMeetingEmailNotification: boolean = true, NewStoryEmailNotification: boolean = false, NewMeetingScheduledNotification: boolean = NewMeetingEmailNotification, AdminEmails: boolean = NewMeetingEmailNotification, _id: string = "", NewsletterEmails: boolean = true) {
        this.email = email;
        this.NewMeetingEmailNotification = NewMeetingEmailNotification;
        this.NewStoryEmailNotification = NewStoryEmailNotification;
        this.NewMeetingScheduledNotification = NewMeetingScheduledNotification;
        this.AdminEmails = AdminEmails;
        this.NewsletterEmails = NewsletterEmails;
        this._id = _id;
    }

    email: string;
    NewMeetingEmailNotification: boolean;
    NewStoryEmailNotification: boolean;
    NewMeetingScheduledNotification: boolean;
    AdminEmails: boolean;
    NewsletterEmails: boolean;
    _id: string;
}
export = UserSettings;