interface Visitor {
    isAdmin(): boolean;

    getEmail(): string;
}

export = Visitor;