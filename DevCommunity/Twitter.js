var config = require('./config.js');
var nedb = require('nedb');

var store = (function () {
    function store(randomTweetsDb) {
        var _this = this;
        this.randomTweetsDb = randomTweetsDb;
        this.indexes = new Array();
        this.count = 0;
        this.randomTweetsDb.count({}, function (err, c) {
            if (err == null && c > 0) {
                _this.generateIndexArray(c);
            }
        });
    }
    store.prototype.getRandomTweet = function (callback) {
        if (this.indexes.length == 0) {
            this.generateIndexArray(this.count);
        }
        var skipCount = this.indexes.pop();
        this.randomTweetsDb.find({}).sort({ _id: 1 }).skip(skipCount).limit(1).exec(function (err, html) {
            if (err == null) {
                callback(html[0].html);
            } else {
                callback('');
            }
        });
    };

    store.prototype.shuffle = function (array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 != currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And sap it with the current element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    };

    store.prototype.generateIndexArray = function (count) {
        this.count = count;
        this.indexes = new Array();
        for (var i = 0; i < count; ++i) {
            this.indexes.push(i);
        }
        this.shuffle(this.indexes);
    };

    store.prototype.tweetAdded = function () {
        this.generateIndexArray(this.count + 1);
    };
    return store;
})();
exports.store = store;
//# sourceMappingURL=Twitter.js.map
