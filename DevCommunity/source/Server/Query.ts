
export interface Select {
    Condition?: any;
    Sort?: any;
    Skip?: number;
    Limit?: number;
}

export interface Update {
    Query: any;
    Update: any;
    Options: any;
}

export interface Remove {
    Condition: any;
    Options: any;
}
