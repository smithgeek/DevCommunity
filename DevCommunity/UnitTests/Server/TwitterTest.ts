/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../server/Twitter.ts" />

//import e = require('expect');
var expect = require('expect.js');

describe('test', function () {
    var val = 3;
    expect(val).to.be(3);
});