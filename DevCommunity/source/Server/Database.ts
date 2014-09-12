///ts:import=Query
import Query = require('./Query'); ///ts:import:generated

interface Database {
    count(query, callback: (count: number) => void): void;

    find(query: Query.Select, callback: (err: any, results: Array<any>) => void): void;

    insert(obj, callback: (err: any, inserted: any) => void): void;

    update(query: Query.Update, callback: (err: any, updatedCount: number) => void): void;

    remove(query: Query.Remove, callback: (err: any, removedCount: number) => void): void;

    addIndex(condition, callback: (err: any) => void): void;
}

export = Database;