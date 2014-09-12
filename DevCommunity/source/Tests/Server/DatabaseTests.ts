///ts:import=Database
import Database = require('../../Server/Database'); ///ts:import:generated
///ts:import=NeDb
import NeDb = require('../../Server/NeDb'); ///ts:import:generated

import assert = require('assert');

describe('DatabaseTests', function () {
    var db: Database;

    describe('EmtyDatabase', function () {
        beforeEach(function () {
            db = new NeDb('');
        });

        it('CountOfZero', function () {
            db.count({}, function (count) {
                assert.equal(count, 0);
            });
        });

        it("Can't find anything", function () {
            db.find({}, (err, results) => {
                assert.equal(results.length, 0);
            });
        });

        it('CanAddIndex', () => {
            db.addIndex({ fieldName: 'email', unique: true }, function (err) {
                assert.equal(err, null);
            });
        });

        it('Insert', () => {
            var doc = { foo: 'bar' };
            db.insert(doc, (err, newDoc) => {
                assert.equal(err, null);
                assert.deepEqual(doc, newDoc);
            });
        });
    });

    describe('DatabaseWithData', function () {
        var data = [{ info: 'foo' }, { info: 'bar' }];
        beforeEach(function () {
            db = new NeDb('');
            for (var i = 0; i < data.length; ++i) {
                db.insert(data[i], (err, inserted) => { });
            }
        });

        it('CanGetCount', () => {
            db.count({}, (count) => {
                assert.equal(count, 2);
            });
        });

        it('CanGetFilteredCount', () => {
            db.count({ info: 'foo' }, (count) => {
                assert.equal(count, 1);
            });
        });

        it('CanFindObj', () => {
            db.find({ Condition: { info: 'bar' } }, (err, results) => {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 1);
                assert.deepEqual(results[0], data[1]);
            });
        });

        it('CanUpdateObj', () => {
            db.update({ Query: { info: 'bar' }, Update: { info: 'baz' }, Options: {} }, (err, count) => {
                assert.equal(err, null);
                assert.equal(count, 1);
            });
        });

        it('CanRemoveObj', () => {
            db.remove({Condition: { info: 'bar' }, Options: {} }, (err, count) => {
                assert.equal(err, null);
                assert.equal(count, 1);
            });
        });

        it('CanSkipWhenFinding', () => {
            db.find({ Skip: 1 }, (err, results) => {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 1);
            });
        });

        it('CanLimit', () => {
            db.find({ Limit: 1 }, (err, results) => {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 1);
            });
        });

        it('SortAscending', () => {
            db.find({ Sort: { info: 1 } }, (err, results) => {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 2);
                assert.deepEqual(results[0], data[1]);
                assert.deepEqual(results[1], data[0]);
            });
        });

        it('SortDescending', () => {
            db.find({ Sort: { info: -1 } }, (err, results) => {
                assert.equal(err, null);
                assert.ok(results);
                assert.equal(results.length, 2);
                assert.deepEqual(results[0], data[0]);
                assert.deepEqual(results[1], data[1]);
            });
        });
    });
});