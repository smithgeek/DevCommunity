import express = require('express');
var config = require('./config.js');
var nedb = require('nedb');

export class store {
    private indexes: Array<number>
    private count: number;

    constructor(private randomTweetsDb) {
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
        this.randomTweetsDb.find({}).sort({ _id: 1 }).skip(skipCount).limit(1).exec(function (err, html) {
            if (err == null) {
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