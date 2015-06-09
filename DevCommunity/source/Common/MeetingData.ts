class MeetingData {
    constructor(votes?: Array<string>, _id?: string, vote_count?: number, email?: string,
        description?: string, details?: string, date?: Date, rsvp?: Array<string>) {
        this.votes = votes && votes || [];
        this._id = _id && _id || '';
        this.vote_count = vote_count && vote_count || 0;
        this.email = email && email || '';
        this.description = description && description || '';
        this.details = details && details || '';
        this.date = date && date || null;
        this.rsvp = rsvp && rsvp || [];
    }

    votes: Array<string>;
    _id: string;
    vote_count: number;
    email: string;
    description: string;
    details: string;
    date: Date;
    rsvp: Array<string>;
}
export = MeetingData;