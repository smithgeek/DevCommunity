///ts:import=Security
import Security = require('./Security'); ///ts:import:generated
///ts:import=WebsiteVisitor
import WebsiteVisitor = require('./WebsiteVisitor'); ///ts:import:generated
///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
import express = require('express');

class WebsiteVisitorFactory{
    constructor(private security: Security, private adminEmail: string, private logger: Logger) {
    }

    public get(request: express.Request, callback: (visitor: WebsiteVisitor) => void): void {
        this.security.decodeEmail(request, (email) => {
            var visitor = new WebsiteVisitor(email, this.isAdmin(email));
            callback(visitor);
        });
    }

    public getByEmail(email: string): WebsiteVisitor {
        return new WebsiteVisitor(email, this.isAdmin(email));
    }

    private isAdmin(email: string): boolean {
        return this.adminEmail == '' || this.adminEmail == email;
    }
}
export = WebsiteVisitorFactory;