///ts:import=Twitter
import Twitter = require('../../Server/Twitter'); ///ts:import:generated
///ts:import=Database
import Database = require('../../Server/Database'); ///ts:import:generated
import assert = require('assert');

describe('TwitterTests', function () {
    var db;
    var twitter: Twitter;

    beforeEach(function () {
        db = <Database>{ count: function (d, callback) { callback(1); }, find: function (q, callback) { callback(null, [{ html: 'html' }]); } };
        twitter = new Twitter(db);
    });

    it("CanGetRandomTweet", function () {
        twitter.getRandomTweet(function (html) {
            assert.equal(html, 'html');
        });
    });

    it("DatabaseErrorWhenTryingToGetRandomTweet", function () {
        db.find = function (q, callback) { callback('error', null) };
        twitter.getRandomTweet(function (html) {
            assert.equal(html, '');
        });
    });

    it("NoTweetsInDatabase", function () {
        db = <Database>{ count: function (d, callback) { callback(0); }, find: function (q, callback) { callback(null, []); } };
        twitter = new Twitter(db);
        twitter.getRandomTweet(function (html) {
            assert.equal(html, '');
        });
    });

    it("ForceRandomRegeneration", function () {
        twitter.getRandomTweet(function (html) {
            assert.equal(html, 'html');
        });
        twitter.getRandomTweet(function (html) {
            assert.equal(html, 'html');
        });
    });

    it("TweetAdded", function () {
        twitter.tweetAdded();       
    });
});