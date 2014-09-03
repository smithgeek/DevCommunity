var config = require('./config.js');

function getRandomTweet(callback) {
    var nedb = require('nedb');
    var randomTweetsDb = new nedb({ filename: 'random_tweets.db.json', autoload: true });
    randomTweetsDb.count({}, function (err, count) {
        if (err == null && count > 0) {
            var skipCount = Math.floor((Math.random() * count));
            randomTweetsDb.find({}).sort({ _id: 1 }).skip(skipCount).limit(1).exec(function (err, html) {
                if (err == null) {
                    callback(html[0].html);
                } else {
                    callback('');
                }
            });
        } else {
            callback('');
        }
    });
}
exports.getRandomTweet = getRandomTweet;
;
//# sourceMappingURL=Twitter.js.map
