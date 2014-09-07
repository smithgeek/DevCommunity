/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />

var sinon: SinonStatic = require('sinon');
import assert = require('assert');
import DevCommunityEmailer = require('../../server/DevCommunityEmailer');
import DB = require('../../server/Database');
import Mailer = require('../../server/Mailer');
import Logger = require('../../server/Logger');

describe('DevCommunityEmailerTests', function () {
    var userSettingsDb;
    var emailer: DevCommunityEmailer;
    var mailer;
    var logger;
    var spy: SinonSpy;

    describe('EmailSendingAllowed', () => {
        var fakeSettings;

        beforeEach(function () {
            fakeSettings = [{ email: 'email1' }, { email: 'email2' }];
            userSettingsDb = <DB.Database>{ find: function (q, callback) { callback(null, fakeSettings); } };
            mailer = <Mailer>{ sendEmail: function (to: string, subject: string, body: string) { } };
            logger = <Logger>{ log: function (message: string) { } };
            emailer = new DevCommunityEmailer(mailer, userSettingsDb, "domain.com", true, logger);
            spy = sinon.spy(mailer, "sendEmail");
        });

        afterEach(() => {
            mailer.sendEmail.restore();
        });

        it("SendVerificationEmail", function () {
            emailer.sendVerificationEmail("8675309", "fake_email@domain.com");
            assert(spy.calledOnce, "Called " + spy.callCount + " times");
            var args: Array<string> = mailer.sendEmail.getCall(0).args;
            assert.equal(args[0], "fake_email@domain.com");
            assert.ok(args[1], "should not be null");
            assert(args[2].indexOf("8675309") != -1, args[2]);
        });

        it("SendNewMeetingTopicEmails", () => {
            var meeting = { _id: 'id', description: 'description', details: 'details', votes: [], vote_count: 0, email: '', date: null };
            emailer.sendNewMeetingTopicEmails(meeting);
            assert(spy.calledTwice, "Called " + spy.callCount + " times");
            for (var i = 0; i < 2; ++i) {
                var args: Array<string> = mailer.sendEmail.getCall(i).args;
                assert.equal(args[0], fakeSettings[i].email);
                assert.ok(args[1], "should not be null");
                assert(args[2].indexOf(meeting._id) != -1, args[2]);
                assert(args[2].indexOf(meeting.description) != -1, args[2]);
                assert(args[2].indexOf(meeting.details) != -1, args[2]);
            }
        });

        it("SendNewStoryEmails", () => {
            var story: Story = { submittor: '', title: 'title', description: 'description', url: '', _id: 'id', timestamp: 0 };
            emailer.sendNewStoryEmails(story);
            assert(spy.calledTwice, "Called " + spy.callCount + " times");
            for (var i = 0; i < 2; ++i) {
                var args: Array<string> = mailer.sendEmail.getCall(i).args;
                assert.equal(args[0], fakeSettings[i].email);
                assert.ok(args[1], "should not be null");
                assert(args[2].indexOf(story._id) != -1, args[2]);
                assert(args[2].indexOf(story.description) != -1, args[2]);
                assert(args[2].indexOf(story.title) != -1, args[2]);
            }
        });
    });

    describe("EmailsNotAllowed", () => {
        var fakeSettings;

        beforeEach(function () {
            fakeSettings = [{ email: 'email1' }, { email: 'email2' }];
            userSettingsDb = <DB.Database>{ find: function (q, callback) { callback(null, fakeSettings); } };
            mailer = <Mailer>{ sendEmail: function (to: string, subject: string, body: string) { } };
            logger = <Logger>{ log: function (message: string) { } };
            emailer = new DevCommunityEmailer(mailer, userSettingsDb, "domain.com", false, logger);
            sinon.spy(mailer, "sendEmail");
            spy = mailer.sendEmail;
        });

        afterEach(() => {
            mailer.sendEmail.restore();
        });

        it("SendVerificationEmail", function () {
            emailer.sendVerificationEmail("8675309", "fake_email@domain.com");
            assert(spy.notCalled, "Called " + spy.callCount + " times");
        });

        it("SendNewMeetingTopicEmails", () => {
            var meeting = { _id: 'id', description: 'description', details: 'details', votes: [], vote_count: 0, email: '', date: null };
            emailer.sendNewMeetingTopicEmails(meeting);
            assert(spy.notCalled, "Called " + spy.callCount + " times");
        });

        it("SendNewStoryEmails", () => {
            var story: Story = { submittor: '', title: 'title', description: 'description', url: '', _id: 'id', timestamp: 0 };
            emailer.sendNewStoryEmails(story);
            assert(spy.notCalled, "Called " + spy.callCount + " times");
        });
    });

    describe("DatabseError", () => {
        var fakeSettings;
        var logSpy: SinonSpy;

        beforeEach(function () {
            fakeSettings = [{ email: 'email1' }, { email: 'email2' }];
            userSettingsDb = <DB.Database>{ find: function (q, callback) { callback('error', fakeSettings); } };
            mailer = <Mailer>{ sendEmail: function (to: string, subject: string, body: string) { } };
            logger = <Logger>{ log: function (message: string) { } };
            emailer = new DevCommunityEmailer(mailer, userSettingsDb, "domain.com", false, logger);
            sinon.spy(mailer, "sendEmail");
            spy = mailer.sendEmail;
            sinon.spy(logger, 'log');
            logSpy = logger.log;
        });

        afterEach(() => {
            mailer.sendEmail.restore();
            logger.log.restore();
        });

        it("SendNewMeetingTopicEmails", () => {
            var meeting = { _id: 'id', description: 'description', details: 'details', votes: [], vote_count: 0, email: '', date: null };
            emailer.sendNewMeetingTopicEmails(meeting);
            assert(spy.notCalled, "Called " + spy.callCount + " times");
            assert(logSpy.calledOnce);
            assert.equal(logSpy.getCall(0).args[0], "error");
        });

        it("SendNewStoryEmails", () => {
            var story: Story = { submittor: '', title: 'title', description: 'description', url: '', _id: 'id', timestamp: 0 };
            emailer.sendNewStoryEmails(story);
            assert(spy.notCalled, "Called " + spy.callCount + " times");
            assert(logSpy.calledOnce);
            assert.equal(logSpy.getCall(0).args[0], "error");
        });
    });

});