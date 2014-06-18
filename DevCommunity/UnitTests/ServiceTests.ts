/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../public/assets/js/Services.ts" />

QUnit.module("UserSvc");

test("1", function ( assert ) {
    assert.equal(true, true);
});

test("fail", function () {
    equal(true, false);
});