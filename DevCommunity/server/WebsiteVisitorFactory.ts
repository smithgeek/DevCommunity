import WebsiteVisitor = require('./WebsiteVisitor');
import Security = require('./Security');

class WebsiteVisitorFactory{
    constructor(private security: Security, private adminEmail: string) {
    }

    public get(request, callback: (visitor: WebsiteVisitor) => void): void {
        this.security.decodeEmail(request, (email) => {
            callback(new WebsiteVisitor(email, this.isAdmin(email)));
        });
    }

    private isAdmin(email: string): boolean {
        return this.adminEmail == email;
    }
}
export = WebsiteVisitorFactory;