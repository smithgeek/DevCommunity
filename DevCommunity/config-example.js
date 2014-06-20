exports.contact = {
    email: 'put_contact_email_address_here',
    name: 'Not Configured'
};

exports.nav = {
    name: 'Developer Community',
    // Bootstrap glyphicon
    glyph: 'glyphicon-none'
};

exports.mail = {
    smtp: {
        host: "smtp.gmail.com",
        secureConnection: true,
        port: 465,
        auth: {
            user: "user_name",
            pass: "password"
        }
    },
    from: "from_email_address",
    sendVerificationEmail: false
};