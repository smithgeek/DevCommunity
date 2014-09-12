class SiteConfig {
    constructor(localStorageServiceProvider, $locationProvider: ng.ILocationProvider, $httpProvider: ng.IHttpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
        localStorageServiceProvider.setPrefix('PndDevCommunity');
        $locationProvider.hashPrefix('!');
    }
}
export = SiteConfig;