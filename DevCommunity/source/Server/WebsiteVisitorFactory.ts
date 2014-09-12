///ts:import=Security
import Security = require('./Security'); ///ts:import:generated
///ts:import=WebsiteVisitor
import WebsiteVisitor = require('./WebsiteVisitor'); ///ts:import:generated

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