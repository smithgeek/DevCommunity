export interface Contact {
    email: string;
    name: string;
}

export interface Nav {
    name: string
    glyph: string;
}

export interface SmtpOptions {
    secureConnection?: boolean;
    port?: string;
    username?: string;
    password?: string;
    host: string;
}

export interface Mail {
    from: string;
    smtp: SmtpOptions;
}

export interface Server {
    port: number;
    sendEmails: boolean;
    domain: string;
    admin: string;
    jwtSecret: string;
    restrictedLoginDomain: string;
    isServerConfigured: boolean;
}

export interface Disqus {
    enabled: boolean;
    shortname: string;
}

export interface WebHook{
    host: string;
    port: string;
    path: string;
    enabled: boolean;
}

export class Config {
    constructor() {
        this.contact = { email: "", name: "" };

        this.nav = { glyph: "glyphicon-none", name: "Developer Community" };

        this.mail = { from: "", smtp: { host: "" } };

        this.server = { admin: "admin@admin.com", domain: "", jwtSecret: "MySuperSecret", port: 3000, restrictedLoginDomain: "", sendEmails: false, isServerConfigured: false }

        this.disqus = { enabled: false, shortname: "" };

        this.webHook = {host: "", port: "", path: "", enabled: false};
    }

    public contact: Contact;
    public nav: Nav;
    public mail: Mail;
    public server: Server;
    public disqus: Disqus;
    public webHook: WebHook;
}