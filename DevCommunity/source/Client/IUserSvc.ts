interface IUserSvc {
    getUser(): string;

    isLoggedIn(): boolean;

    logOut(): void;

    isAdmin(): boolean;
}

export = IUserSvc;