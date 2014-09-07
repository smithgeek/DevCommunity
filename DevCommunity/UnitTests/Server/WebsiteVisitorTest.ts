/// <reference path="../../typings/mocha/mocha.d.ts" />

import assert = require('assert');
import WebsiteVisitor = require('../../server/WebsiteVisitor');

describe('WebsiteVisitorTests', function () {
    var visitor: WebsiteVisitor;

    beforeEach(function () {
        visitor = new WebsiteVisitor('email', true);
    });

    it("CanGetEmail", () => {
        assert.equal(visitor.getEmail(), 'email');
    });

    it('CanGetAdmin', () => {
        assert(visitor.isAdmin());
    });
});