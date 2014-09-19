///ts:import=Logger
import Logger = require('./Logger'); ///ts:import:generated
///ts:import=SmtpConverter
import SmtpConverter = require('./SmtpConverter'); ///ts:import:generated

var nodemailer: Nodemailer = require('nodemailer'); // https://github.com/andris9/nodemailer

class Mailer {

    constructor(private fromEmail: string, private smtpOptions: SmtpConverter, private logger: Logger) {
    }

    public sendEmail(toEmailAddress: string, bccAddresses: string, subject: string, body: string) {
        var smtpTransport: Transport = nodemailer.createTransport("SMTP", this.smtpOptions.getNodemailerSmtpOptions());

        var message: MailComposer = {
            from: this.fromEmail,
            to: toEmailAddress,
            bcc: bccAddresses,
            subject: subject,
            html: body
        };

        smtpTransport.sendMail(message, (error) => {
            if (error) {
                this.logger.log("Mail error: " + error.message);
            }
            else {
                this.logger.log("Sent email to " + toEmailAddress + " bcc: " + bccAddresses + ": " + subject);
            }
            smtpTransport.close();
        });
    }
}
export = Mailer;