/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../typings/angularjs/angular-mocks.d.ts" />
/// <reference path="../../typings/sinon/sinon.d.ts" />
/// <reference path="../../public/assets/js/app.ts" />
describe("SiteConfig", function () {
    var $httpProvider = { interceptors: [] };
    var localStorageProvider = {
        setPrefix: function (prefix) {
        }
    };
    var $locationProvider = {
        hashPrefix: function (prefix) {
        }
    };

    it("AuthInterceptorAdded", function () {
        var config = new SiteConfig(localStorageProvider, $locationProvider, $httpProvider);
        expect($httpProvider.interceptors[0]).to.be('authInterceptor');
    });

    it("LocationProviderHashPrefixSet", function () {
        var mockLocationProvider = sinon.mock($locationProvider);
        mockLocationProvider.expects("hashPrefix").once().withExactArgs("!");
        var config = new SiteConfig(localStorageProvider, $locationProvider, $httpProvider);
        mockLocationProvider.verify();
    });

    it("LocalStoragePrefixSet", function () {
        var mock = sinon.mock(localStorageProvider);
        mock.expects("setPrefix").once().withExactArgs("PndDevCommunity");
        var config = new SiteConfig(localStorageProvider, $locationProvider, $httpProvider);
        mock.verify();
    });
});
//# sourceMappingURL=SiteConfigTests.js.map
