var nedb = require('nedb');

var NeDb = (function () {
    function NeDb(path) {
        var oneDayInMilliseconds = 86400000;
        this.db = new nedb({ filename: path, autoload: true });
        this.db.persistence.setAutocompactionInterval(oneDayInMilliseconds);
    }
    NeDb.prototype.count = function (query, callback) {
        this.db.count(query, function (err, count) {
            if (err == null) {
                callback(count);
            } else {
                callback(0);
            }
        });
    };

    NeDb.prototype.find = function (query, callback) {
        var cursor = this.db.find(query.Condition);
        if (query.Sort != null) {
            cursor.sort(query.Sort);
        }
        if (query.Skip != null) {
            cursor.skip(query.Skip);
        }
        if (query.Limit != null) {
            cursor.limit(query.Limit);
        }
        cursor.exec(callback);
    };

    NeDb.prototype.insert = function (obj, callback) {
        this.db.insert(obj, callback);
    };

    NeDb.prototype.update = function (query, callback) {
        this.db.update(query.Query, query.Update, query.Options, callback);
    };

    NeDb.prototype.remove = function (query, callback) {
        this.db.remove(query.Condition, query.Options, callback);
    };

    NeDb.prototype.addIndex = function (condition, callback) {
        this.db.ensureIndex(condition, callback);
    };
    return NeDb;
})();
exports.NeDb = NeDb;
//# sourceMappingURL=Database.js.map
