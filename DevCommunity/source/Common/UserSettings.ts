class UserSettings {
    constructor(email: string = "", NewMeetingEmailNotification: boolean = true, NewStoryEmailNotification: boolean = true, NewMeetingScheduledNotification: boolean = NewMeetingEmailNotification, _id: string = "") {
        this.email = email;
        this.NewMeetingEmailNotification = NewMeetingEmailNotification;
        this.NewStoryEmailNotification = NewStoryEmailNotification;
        this.NewMeetingScheduledNotification = NewMeetingScheduledNotification;
        this._id = _id;
    }

    email: string;
    NewMeetingEmailNotification: boolean;
    NewStoryEmailNotification: boolean;
    NewMeetingScheduledNotification: boolean;
    _id: string;
}
export = UserSettings;