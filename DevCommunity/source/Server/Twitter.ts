///ts:import=Database
import Database = require('./Database'); ///ts:import:generated
var nedb = require('nedb');

class Twitter {
    private indexes: Array<number>
    private count: number;
    private randomTweetsDb: Database;

    constructor(database: Database) {
        this.randomTweetsDb = database;
        this.indexes = new Array<number>();
        this.count = 0;
        this.randomTweetsDb.count({}, (c) => {
            if (c > 0) {
                this.generateIndexArray(c);
            }
        });
    }

    public getRandomTweet(callback) {
        if (this.indexes.length == 0) {
            this.generateIndexArray(this.count);
        }
        var skipCount = this.indexes.pop();
        this.randomTweetsDb.find({ Condition: {}, Sort: { _id: 1 }, Skip: skipCount, Limit: 1 }, function (err, html) {
            if (err == null && html.length > 0) {
                callback(html[0].html);
            }
            else {
                callback('');
            }
        });
    }

    private shuffle(array: Array<number>): void {
        var currentIndex: number = array.length, temporaryValue, randomIndex;
        while (0 != currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    }

    private generateIndexArray(count: number): void {
        this.count = count;
        this.indexes = new Array<number>();
        for (var i = 0; i < count; ++i) {
            this.indexes.push(i);
        }
        this.shuffle(this.indexes);
    }

    public tweetAdded(): void {
        this.generateIndexArray(this.count + 1);
    }
}
export = Twitter;
