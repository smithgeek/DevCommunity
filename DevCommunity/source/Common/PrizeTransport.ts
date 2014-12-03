export interface Register {
    Email: string;
    Prizes: Array<string>
}

export interface RegisterReply {
    Message: string;
}

export interface IsRegistrationOpen {
    Open: boolean;
}

export interface PickWinner {
    Prize: string
}

export interface WinnerResponse {
    Winner: string;
    Prize: string;
}

export interface SaveWinner {
    Prize: string;
    Email: string;
}

export interface ClearPastWinner {
    Email: string;
}

export interface Entry {
    Email: string;
    PrizeId: string;
}

export interface GetEntriesResponse {
    Entries: Array<Entry>;
}

export interface GetPastWinnersResponse {
    Winners: Array<string>;
}