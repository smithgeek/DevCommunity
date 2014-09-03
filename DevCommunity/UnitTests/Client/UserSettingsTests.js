/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../public/assets/js/UserSettings.ts" />
describe("UserSettings", function () {
    it("ConstructedWithDefaults", function () {
        var settings = new UserSettings();
        expect(settings.email).to.equal("");
        expect(settings._id).to.equal("");
        expect(settings.NewMeetingEmailNotification).to.be(false);
        expect(settings.NewStoryEmailNotification).to.be(false);
    });
});
//# sourceMappingURL=UserSettingsTests.js.map
