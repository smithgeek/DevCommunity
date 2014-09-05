/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../server/Twitter.ts" />
/// <reference path="../../server/Database.ts" />
var expect = require('expect.js');
var Twitter = require('../../server/Twitter');

describe('test', function () {
    var db = { count: function (d, callback) {
            callback(null, 1);
        }, find: function (q, callback) {
            callback(null, '');
        } };
    var twitter = new Twitter.store(db);

    it("CanGetRandomTweet", function () {
        twitter.getRandomTweet(function (html) {
        });
    });
});
//# sourceMappingURL=TwitterTest.js.map
