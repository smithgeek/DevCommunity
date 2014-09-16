///ts:import=Site
import Site = require('../Common/Site'); ///ts:import:generated

class SmtpConverter {
    private options: NodemailerSMTPTransportOptions;

    constructor(private smtpOptions: Site.SmtpOptions) {
        this.options = {};
        this.options.host = smtpOptions.host;
        if (typeof smtpOptions.password != 'undefined' && smtpOptions.password != "") {
            this.options.auth = {};
            this.options.auth.pass = smtpOptions.password;
            this.options.auth.user = smtpOptions.username;
        }
        if (typeof smtpOptions.port != 'undefined' && smtpOptions.port != "") {
            this.options.port = +smtpOptions.port;
        }
        if (smtpOptions.secureConnection) {
            this.options.secureConnection = smtpOptions.secureConnection;
        }
    }

    public getNodemailerSmtpOptions(): NodemailerSMTPTransportOptions {
        return this.options;
    }
}
export = SmtpConverter;