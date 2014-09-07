/// <reference path="../../typings/mocha/mocha.d.ts" />
var DB = require('../../server/Database');
var assert = require('assert');

describe('DatabaseTests', function () {
    var db;

    describe('EmtyDatabase', function () {
        beforeEach(function () {
            db = new DB.NeDb('');
        });

        it('CountOfZero', function () {
            db.count({}, function (count) {
                assert.equal(count, 0);
            });
        });

        it("Can't find anything", function () {
            db.find({}, function (err, results) {
                assert.equal(results.length, 0);
            });
        });

        it('CanAddIndex', function () {
            db.addIndex({ fieldName: 'email', unique: true }, function (err) {
                assert.equal(err, null);
            });
        });

        it('Insert', function () {
            var doc = { foo: 'bar' };
            db.insert(doc, function (err, newDoc) {
                assert.equal(err, null);
                assert.deepEqual(doc, newDoc);
            });
        });
    });

    describe('DatabaseWithData', function () {
        var data = [{ info: 'foo' }, { info: 'bar' }];
        beforeEach(function () {
            db = new DB.NeDb('');
            for (var i = 0; i < data.length; ++i) {
                db.insert(data[i], function (err, inserted) {
                });
            }
        });

        it('CanGetCount', function () {
            db.count({}, function (count) {
                assert.equal(count, 2);
            });
        });

        it('CanGetFilteredCount', function () {
            db.count({ info: 'foo' }, function (count) {
                assert.equal(count, 1);
            });
        });

        it('CanFindObj', function () {
            db.find({ Condition: { info: 'bar' } }, function (err, results) {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 1);
                assert.deepEqual(results[0], data[1]);
            });
        });

        it('CanUpdateObj', function () {
            db.update({ Query: { info: 'bar' }, Update: { info: 'baz' }, Options: {} }, function (err, count) {
                assert.equal(err, null);
                assert.equal(count, 1);
            });
        });

        it('CanRemoveObj', function () {
            db.remove({ Condition: { info: 'bar' }, Options: {} }, function (err, count) {
                assert.equal(err, null);
                assert.equal(count, 1);
            });
        });

        it('CanSkipWhenFinding', function () {
            db.find({ Skip: 1 }, function (err, results) {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 1);
            });
        });

        it('CanLimit', function () {
            db.find({ Limit: 1 }, function (err, results) {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 1);
            });
        });

        it('SortAscending', function () {
            db.find({ Sort: { info: 1 } }, function (err, results) {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 2);
                assert.deepEqual(results[0], data[1]);
                assert.deepEqual(results[1], data[0]);
            });
        });

        it('SortDescending', function () {
            db.find({ Sort: { info: -1 } }, function (err, results) {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 2);
                assert.deepEqual(results[0], data[0]);
                assert.deepEqual(results[1], data[1]);
            });
        });
    });
});
//# sourceMappingURL=DatabaseTests.js.map
