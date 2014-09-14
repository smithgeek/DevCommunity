///ts:import=WebsiteVisitorFactory
import WebsiteVisitorFactory = require('../../Server/WebsiteVisitorFactory'); ///ts:import:generated
import assert = require('assert');

describe('WebsiteVisitorTests', function () {
    var factory: WebsiteVisitorFactory;
    var security;
    var logger = { log: function (s) { }, error: function (s) { }, verbose: function (s) { } };

    it("CreateAdminVisitor", () => {
        security = { decodeEmail: function (request, callback: (email: string) => void) { callback('admin@domain.com'); } };
        factory = new WebsiteVisitorFactory(security, 'admin@domain.com', logger);
        factory.get({}, (visitor) => {
            assert.equal(visitor.getEmail(), 'admin@domain.com');
            assert(visitor.isAdmin());
        });
    });

    it("CreateNormalVisitor", () => {
        security = { decodeEmail: function (request, callback: (email: string) => void) { callback('user@domain.com'); } };
        factory = new WebsiteVisitorFactory(security, 'admin@domain.com', logger);
        factory.get({}, (visitor) => {
            assert.equal(visitor.getEmail(), 'user@domain.com');
            assert(!visitor.isAdmin());
        });
    });

    it("CreateAdminVisitorByEmail", () => {
        factory = new WebsiteVisitorFactory(security, 'admin@domain.com', logger);
        var visitor = factory.getByEmail('admin@domain.com');
        assert.equal(visitor.getEmail(), 'admin@domain.com');
        assert(visitor.isAdmin());
    });

    it("CreateUserVisitorByEmail", () => {
        factory = new WebsiteVisitorFactory(security, 'admin@domain.com', logger);
        var visitor = factory.getByEmail('user@domain.com');
        assert.equal(visitor.getEmail(), 'user@domain.com');
        assert(!visitor.isAdmin());
    });
});