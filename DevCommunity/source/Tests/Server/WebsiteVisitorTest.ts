///ts:import=WebsiteVisitor
import WebsiteVisitor = require('../../Server/WebsiteVisitor'); ///ts:import:generated

import assert = require('assert');

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