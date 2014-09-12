///ts:import=SingleStoryController
import SingleStoryController = require('../../Client/SingleStoryController'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../../Common/MeetingData'); ///ts:import:generated

describe("SingleStoryController", function () {
    var $httpBackend: ng.IHttpBackendService;
    var $http: ng.IHttpService;
    var $routeParams;
    var $scope;
    var controller: SingleStoryController;

    beforeEach(inject(function (_$httpBackend_, _$http_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        $http = _$http_;
        $routeParams = { id: 3 };
        $scope = _$rootScope_.$new();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("CannotGetMeetings", function () {
        $httpBackend.expectGET('/api/GetStoryById/3').respond(401);
        controller = new SingleStoryController($scope, $http, $routeParams);
        $httpBackend.flush();
        expect($scope.contentLoaded).to.equal(false);
    });

    it("GetMeetings", function () {
        $httpBackend.expectGET('/api/GetStoryById/3').respond(200, new MeetingData());
        controller = new SingleStoryController($scope, $http, $routeParams);
        $httpBackend.flush();
        expect($scope.contentLoaded).to.equal(true);
    });
});