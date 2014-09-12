
interface HttpResponse {
    send(code: number, response: any): void;

    redirect(url: string): void;

    json(data: any): void;
}
export = HttpResponse;