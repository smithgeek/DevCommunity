
var nedb = require('nedb');

export interface SelectQuery {
    Condition: any;
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
    count(query, callback): void;

    find(query: SelectQuery, callback): void;

    insert(obj, callback): void;

    update(query: UpdateQuery, callback): void;

    remove(query: RemoveQuery, callback): void;

    addIndex(condition, callback): void;
}

export class NeDb implements Database {
    private db;

    constructor(path: string) {
        var oneDayInMilliseconds = 86400000;
        this.db = new nedb({ filename: path, autoload: true });
        this.db.persistence.setAutocompactionInterval(oneDayInMilliseconds);
    }

    public count(query, callback): void{
        this.db.count(query, (err, count) => {
            if (err == null) {
                callback(count);
            }
            else {
                callback(0);
            }
        });
    }

    public find(query: SelectQuery, callback): void {
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

    public insert(obj, callback): void {
        this.db.insert(obj, callback);
    }

    public update(query: UpdateQuery, callback): void {
        this.db.update(query.Query, query.Update, query.Options, callback);
    }

    public remove(query: RemoveQuery, callback): void {
        this.db.remove(query.Condition, query.Options, callback);
    }

    public addIndex(condition, callback): void {
        this.db.ensureIndex(condition, callback);
    }
}