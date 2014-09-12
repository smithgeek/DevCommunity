interface IUserSvc {
    getUser(): string;

    isLoggedIn(): boolean;

    logOut(): void;
}

export = IUserSvc;