///ts:import=UserSettings
import UserSettings = require('../../Common/UserSettings'); ///ts:import:generated

import assert = require('assert');

describe("UserSettings", function () {
    it("ConstructedWithDefaults", function () {
        var settings: UserSettings = new UserSettings();
        assert.equal("", settings.email, "email");
        assert.equal("", settings._id, "_id");
        assert.equal(true, settings.NewMeetingEmailNotification, "NewMeetingEmail");
        assert.equal(true, settings.NewStoryEmailNotification, "NewStoryEmail");
        assert.equal(true, settings.NewMeetingScheduledNotification, "New Meeting Scheduled");
        assert.equal(true, settings.AdminEmails, "Admin emails");
    });

    it("NonDefaultConstructed", () => {
        var settings: UserSettings = new UserSettings("email", false, false, false, false, "id");
        assert.equal("email", settings.email, "email");
        assert.equal("id", settings._id, "_id");
        assert.equal(false, settings.NewMeetingEmailNotification, "NewMeetingEmail");
        assert.equal(false, settings.NewStoryEmailNotification, "NewStoryEmail");
        assert.equal(false, settings.NewMeetingScheduledNotification, "New Meeting Scheduled");
        assert.equal(false, settings.AdminEmails, "Admin emails");
    });
});