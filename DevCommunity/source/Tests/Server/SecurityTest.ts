///ts:import=Security
import Security = require('../../Server/Security'); ///ts:import:generated
///ts:import=Database
import Database = require('../../Server/Database'); ///ts:import:generated
///ts:import=DevCommunityEmailer
import DevCommunityEmailer = require('../../Server/DevCommunityEmailer'); ///ts:import:generated
///ts:import=Logger
import Logger = require('../../Server/Logger'); ///ts:import:generated
///ts:import=WebsiteVisitor
import WebsiteVisitor = require('../../Server/WebsiteVisitor'); ///ts:import:generated

import assert = require('assert');
var sinon: SinonStatic = require('sinon');

describe('SecurityTests', function () {
    var security: Security;
    var userVerificationDb: Database;
    var userSettingsDb: Database;
    var emailer: DevCommunityEmailer;
    var logger: Logger;
    var response;
    var sendSpy: SinonSpy;
    var jsonSpy: SinonSpy;
    var spies: Array<SinonSpy>;

    beforeEach(function () {
        spies = [];
        response = { send: sinon.spy(), json: sinon.spy() };
        sendSpy = response.send;
        jsonSpy = response.json;
        userSettingsDb = <Database>{ insert: function (q, callback) { callback(null, q); } };
        userVerificationDb = <Database>{ insert: function (q, callback) { callback(null, q); }, find: function (q, callback) { callback(null, [{ timestamp: Date.now(), verificationCode: 8675309}]); }, remove: function (q, o) { } };
        emailer = <DevCommunityEmailer>{ sendVerificationEmail: function (code: number, email: string) { } };
        logger = <Logger>{ log: function (message: string) { }, verbose: function (s) { } };
        security = new Security("domain.com", "secret", userVerificationDb, userSettingsDb, emailer, logger);
    });

    afterEach(() => {
        for (var i = 0; i < spies.length; ++i) {
            spies[i].restore();
        }
    });

    it("IdentifyInvalidDomain", () => {
        security.identify(new WebsiteVisitor('email@invalid.com', true), response);
        assert(sendSpy.calledOnce);
        assert.equal(sendSpy.getCall(0).args[0], 401, sendSpy.getCall(0).args[0]);
    });

    function getSpy(obj: any, func: string): SinonSpy{
        var spy = sinon.spy(obj, func);
        spies.push(spy);
        return spy;
    }

    function identifyAllowedEmail(email: string) {
        var clearCodeSpy = getSpy(userVerificationDb, 'remove');
        var insertCodeSpy = getSpy(userVerificationDb, 'insert');
        var emailerSpy = getSpy(emailer, 'sendVerificationEmail');
        security.identify(new WebsiteVisitor(email, true), response);

        assert(sendSpy.calledOnce);
        assert.equal(sendSpy.getCall(0).args[0], 200, sendSpy.getCall(0).args[0]);

        assert(clearCodeSpy.calledOnce);
        var clearCodeArg = clearCodeSpy.getCall(0).args[0];
        assert.equal(clearCodeArg.Condition.email, email, clearCodeArg.Condition.email);
        assert(clearCodeArg.Options.multi);

        assert(insertCodeSpy.calledOnce);
        assert.equal(insertCodeSpy.getCall(0).args[0].email, email);

        assert(emailerSpy.calledOnce);
        assert.equal(emailerSpy.getCall(0).args[1], email);
    }

    it("IdentifyValidDomain", () => {
        identifyAllowedEmail('email@domain.com');
    });

    it("IdentifyNoDomainRestriction", () => {
        security = new Security("", "secret", userVerificationDb, userSettingsDb, emailer, logger);
        identifyAllowedEmail('email@invalid.com');
    });

    function verify(admin: boolean) {
        var clearCodeSpy = getSpy(userVerificationDb, 'remove');
        var verifyCodeSpy = getSpy(userVerificationDb, 'find');
        var addUserSpy = getSpy(userSettingsDb, 'insert');
        security.verify(new WebsiteVisitor('email@domain.com', admin), '8675309', response);

        assert(sendSpy.notCalled);
        assert(jsonSpy.calledOnce);
        assert.equal(jsonSpy.getCall(0).args[0].admin, admin);

        assert(verifyCodeSpy.calledOnce);
        assert.equal(verifyCodeSpy.getCall(0).args[0].Condition.email, 'email@domain.com');

        assert(clearCodeSpy.calledOnce);
        var clearCodeArg = clearCodeSpy.getCall(0).args[0];
        assert.equal(clearCodeArg.Condition.email, 'email@domain.com', clearCodeArg.Condition.email);
        assert(clearCodeArg.Options.multi);

        assert(addUserSpy.calledOnce);
        var addUserArg = addUserSpy.getCall(0).args[0];
        assert.equal(addUserArg.email, 'email@domain.com');
        assert(addUserArg.NewMeetingEmailNotification);
        assert(addUserArg.NewStoryEmailNotification);
    }

    it("VerifyUser", () => {
        verify(false);
    });

    it("VerifyAdmin", () => {
        verify(true);
    });

    it("FailToVerify", () => {
        userVerificationDb.find = function (q, callback) { callback(null, []) };
        security.verify(new WebsiteVisitor('email@domain.com', false), '8675309', response);
        assert(jsonSpy.notCalled);
        assert(sendSpy.calledOnce);
        assert.equal(sendSpy.getCall(0).args[0], 401);
    });

    it("VerifyAfterTimeout", () => {
        userVerificationDb.find = function (q, callback) { callback(null, [{ timestamp: 0, verificationCode: 8675309 }]) };
        security.verify(new WebsiteVisitor('email@domain.com', false), '8675309', response);
        assert(jsonSpy.notCalled);
        assert(sendSpy.calledOnce);
        assert.equal(sendSpy.getCall(0).args[0], 401);
    });

    it("VerifyWithInvalidCode", () => {
        security.verify(new WebsiteVisitor('email@domain.com', false), '1', response);
        assert(jsonSpy.notCalled);
        assert(sendSpy.calledOnce);
        assert.equal(sendSpy.getCall(0).args[0], 401);
    });
});