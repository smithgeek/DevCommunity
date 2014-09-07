/// <reference path="../../typings/mocha/mocha.d.ts" />

import assert = require('assert');
import WebsiteVisitorFactory = require('../../server/WebsiteVisitorFactory');
import Visitor = require('../../server/Visitor');

describe('WebsiteVisitorTests', function () {
    var factory: WebsiteVisitorFactory;
    var security;

    it("CreateAdminVisitor", () => {
        security = { decodeEmail: function (request, callback: (email: string) => void) { callback('admin@domain.com'); } };
        factory = new WebsiteVisitorFactory(security, 'admin@domain.com');
        factory.get({}, (visitor) => {
            assert.equal(visitor.getEmail(), 'admin@domain.com');
            assert(visitor.isAdmin());
        });
    });

    it("CreateNormalVisitor", () => {
        security = { decodeEmail: function (request, callback: (email: string) => void) { callback('user@domain.com'); } };
        factory = new WebsiteVisitorFactory(security, 'admin@domain.com');
        factory.get({}, (visitor) => {
            assert.equal(visitor.getEmail(), 'user@domain.com');
            assert(!visitor.isAdmin());
        });
    });
});