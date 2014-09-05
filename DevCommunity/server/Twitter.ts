/// <reference path="Database.ts" />

var nedb = require('nedb');
import db = require('./Database');

export class store {
    private indexes: Array<number>
    private count: number;

    constructor(private randomTweetsDb: db.Database) {
        this.indexes = new Array<number>();
        this.count = 0;
        this.randomTweetsDb.count({}, (err, c) => {
            if (err == null && c > 0) {
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

            // And sap it with the current element
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