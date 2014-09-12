///ts:import=RestrictedApi
import RestrictedApi = require('./RestrictedApi'); ///ts:import:generated
///ts:import=PublicApi
import PublicApi = require('./PublicApi'); ///ts:import:generated
///ts:import=Security
import Security = require('./Security'); ///ts:import:generated

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