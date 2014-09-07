import RestrictedApi = require('./RestrictedApi');
import PublicApi = require('./PublicApi');
import Security = require('./Security');

class Api {
    public restricted: RestrictedApi;
    public public: PublicApi;
    public security: Security;

    constructor(publicApi: PublicApi, restrictedApi: RestrictedApi, security: Security) {
        this.restricted = restrictedApi;
        this.public = publicApi;
        this.security = security;
    }
}

export = Api;