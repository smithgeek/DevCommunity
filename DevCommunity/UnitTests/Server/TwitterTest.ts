/// <reference path="../../typings/mocha/mocha.d.ts" />

import assert = require('assert');
import Twitter = require('../../server/Twitter');
import db = require('../../server/Database');

describe('TwitterTests', function () {
    var db;
    var twitter: Twitter;

    beforeEach(function () {
        db = <db.Database>{ count: function (d, callback) { callback(1); }, find: function (q, callback) { callback(null, [{ html: 'html' }]); } };
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
        db = <db.Database>{ count: function (d, callback) { callback(0); }, find: function (q, callback) { callback(null, []); } };
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