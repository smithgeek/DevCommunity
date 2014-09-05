/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../server/Twitter.ts" />
/// <reference path="../../server/Database.ts" />


var expect = require('expect.js');
import Twitter = require('../../server/Twitter');
import db = require('../../server/Database');

describe('test', function () {
    var db = <db.Database>{ count: function (d, callback) { callback(null, 1); }, find: function (q, callback) { callback(null, ''); } };
    var twitter: Twitter.store = new Twitter.store(db);

    it("CanGetRandomTweet", function () {
        twitter.getRandomTweet(function (html) {

        });
    });
});