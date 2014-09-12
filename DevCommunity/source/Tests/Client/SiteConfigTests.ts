///ts:import=SiteConfig
import SiteConfig = require('../../Client/SiteConfig'); ///ts:import:generated

describe("SiteConfig", function () {

    var $httpProvider: ng.IHttpProvider = <ng.IHttpProvider>{ interceptors: [] };
    var localStorageProvider = {
        setPrefix: function (prefix) { }
    };
    var $locationProvider: ng.ILocationProvider = <ng.ILocationProvider> {
        hashPrefix: function (prefix) { }
    };

    it("AuthInterceptorAdded", function () {
        var config: SiteConfig = new SiteConfig(localStorageProvider, $locationProvider, $httpProvider);
        expect($httpProvider.interceptors[0]).to.be('authInterceptor');
    });

    it("LocationProviderHashPrefixSet", function () {
        var mockLocationProvider = sinon.mock($locationProvider);
        mockLocationProvider.expects("hashPrefix").once().withExactArgs("!");
        var config: SiteConfig = new SiteConfig(localStorageProvider, $locationProvider, $httpProvider);
        mockLocationProvider.verify();
        
    });

    it("LocalStoragePrefixSet", function () {
        var mock = sinon.mock(localStorageProvider);
        mock.expects("setPrefix").once().withExactArgs("PndDevCommunity");
        var config: SiteConfig = new SiteConfig(localStorageProvider, $locationProvider, $httpProvider);
        mock.verify();
    });
});