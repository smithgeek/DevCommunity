
var nedb = require('nedb');

export interface SelectQuery {
    Condition?: any;
    Sort?: any;
    Skip?: number;
    Limit?: number;
}

export interface UpdateQuery {
    Query: any;
    Update: any;
    Options: any;
}

export interface RemoveQuery {
    Condition: any;
    Options: any;
}

export interface Database {
    count(query, callback: (count: number) => void): void;

    find(query: SelectQuery, callback: (err: any, results: Array<any>) => void): void;

    insert(obj, callback: (err: any, inserted: any) => void): void;

    update(query: UpdateQuery, callback: (err: any, updatedCount: number) => void): void;

    remove(query: RemoveQuery, callback: (err: any, removedCount: number) => void): void;

    addIndex(condition, callback: (err: any) => void): void;
}

export class NeDb implements Database {
    private db;

    constructor(path: string) {
        var oneDayInMilliseconds = 86400000;
        this.db = new nedb({ filename: path, autoload: true });
        this.db.persistence.setAutocompactionInterval(oneDayInMilliseconds);
    }

    public count(query, callback: (count: number) => void): void{
        this.db.count(query, (err, count) => {
            if (err == null) {
                callback(count);
            }
            else {
                callback(0);
            }
        });
    }

    public find(query: SelectQuery, callback: (err: any, results: Array<any>) => void): void {
        if (query.Condition == null) {
            query.Condition = {};
        }
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
    }

    public insert(obj, callback: (err: any, inserted: any) => void): void {
        this.db.insert(obj, callback);
    }

    public update(query: UpdateQuery, callback: (err: any, updatedCount: number) => void): void {
        this.db.update(query.Query, query.Update, query.Options, callback);
    }

    public remove(query: RemoveQuery, callback: (err: any, removedCount: number) => void): void {
        this.db.remove(query.Condition, query.Options, callback);
    }

    public addIndex(condition, callback: (err: any) => void): void {
        this.db.ensureIndex(condition, callback);
    }
}