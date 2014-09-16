///ts:import=Site
import Site = require('../Common/Site'); ///ts:import:generated

interface SiteConfigControllerScope extends ng.IScope {
    ErrorMessage: string;
    SuccessMessage: string;
    config: Site.Config;
}
export = SiteConfigControllerScope;