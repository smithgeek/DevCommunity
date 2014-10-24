interface CommentData {
    time: Date;
    author: string;
    replies: Array<CommentData>;
    votesUp: Array<string>;
    votesDown: Array<string>;
    data: string;
    id: string;
    hierarchy: number;
}
export = CommentData;