///ts:import=SmtpConverter
import SmtpConverter = require('../../Server/SmtpConverter'); ///ts:import:generated
///ts:import=Site
import Site = require('../../Common/Site'); ///ts:import:generated
import util = require('util');

import assert = require('assert');

describe("SmtpConverter", () => {
    var host = "smtp.domain.com";
    var port = '355';
    var secureConnection = true;
    var user = 'user';
    var pass = 'pass';

    // This test is necessary for backwards compatability
    it("ProvideOnlyHost", () => {
        isEqual(getOptions({ host: host }), { host: host });
    });

    it("ProviderAndPort", () => {
        isEqual(getOptions({ host: host, port: port }), { host: host, port: port });
    });

    it("ProvideEverything", () => {
        isEqual(getOptions({ host: host, port: port, secureConnection: secureConnection, username: user, password: pass }),
            { host: host, port: port, secureConnection: secureConnection, auth: { user: user, pass: pass } });
    });

    it("ProvideEmptyString", () => {
        isEqual(getOptions({ host: host, port: '', secureConnection: false, username: '', password: '' }),
            { host: host });
    });

    function isEqual(actual: NodemailerSMTPTransportOptions, expected) {
        assert.equal(actual.host, expected.host, "host");
        assert.equal(typeof actual.auth, typeof expected.auth);
        if(typeof actual.auth != 'undefined') {
            assert.equal(actual.auth.pass, expected.auth.pass, 'password');
            assert.equal(actual.auth.user, expected.auth.user, 'user');
        }
        assert.equal(actual.secureConnection, expected.secureConnection, 'secure connection');
        assert.equal(actual.port, expected.port, 'port');
    }

    function getOptions(data: Site.SmtpOptions): NodemailerSMTPTransportOptions {
        var converter = new SmtpConverter(data);
        return converter.getNodemailerSmtpOptions(); 
    }
});