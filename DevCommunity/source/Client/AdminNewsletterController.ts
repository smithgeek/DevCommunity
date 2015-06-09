///ts:import=app
import app = require('./app'); ///ts:import:generated
///ts:import=NewsletterTransport
import NewsletterTransport = require('../Common/NewsletterTransport'); ///ts:import:generated
///ts:import=AdminNewsletterControllerScope
import AdminNewsletterControllerScope = require('./AdminNewsletterControllerScope'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=IMeetingSvc
import IMeetingSvc = require('./IMeetingSvc'); ///ts:import:generated
///ts:import=Story
import Story = require('../Common/Story'); ///ts:import:generated

class AdminNewsletterController {
    constructor(private $scope: AdminNewsletterControllerScope, private $http: ng.IHttpService, private meetingSvc: IMeetingSvc) {
        $scope.meetings = [];
        $scope.stories = [];
        $scope.date = "";
        $scope.hasPreview = false;

        $http.get('/api/GetSuggestions').success((data: Array<MeetingData>) => {
            for (var i = 0; i < data.length; ++i) {
                var m: any = meetingSvc.createMeeting(data[i]);
                m.checked = false;
                $scope.meetings.push(m);
            }
        });

        $http.get('/api/GetStories').success((data: Array<Story>) => {
            data.sort((a, b) => {
                if (a.timestamp < b.timestamp) return 1;
                else if (a.timestamp == b.timestamp) return 0;
                return -1;
            });
            for (var i = 0; i < data.length && i < 10; ++i) {
                var s: any = data[i];
                s.checked = false;
                $scope.stories.push(s);
            }
        });

        $http.get('/api/GetArchivedMeetings').success((data: Array<MeetingData>) => {
            if (data.length > 0) {
                data.sort((a: any, b: any) => {
                    var aDate = Date.parse(a.date);
                    var bDate = Date.parse(b.date);
                    if (aDate < bDate) return 1;
                    else if (aDate == bDate) return 0;
                    return -1;
                });
                $scope.lastMeeting = meetingSvc.createMeeting(data[0])
            }
        });
    }

    public Submit(): void {
        var data: NewsletterTransport.Get = {
            lastMeeting: this.$scope.lastMeeting,
            meetings: [],
            stories: [],
            server: "",
            date: this.$scope.date,
            file_name: this.$scope.date.replace(" ", "_")
        };

        this.$scope.meetings.forEach((meeting: any) => {
            if (meeting.checked) {
                data.meetings.push(meeting);
            }
        });

        this.$scope.stories.forEach((story: any) => {
            if (story.checked) {
                data.stories.push(story);
            }
        });
        this.$scope.newsletter = data;

        this.$http.post('/api/restricted/RenderNewsletter', { newsletter: data })
            .success((data: any) => {
                $("#NewsletterPreview")[0].innerHTML = data;
                this.$scope.hasPreview = true;
            }).error((data: any) => {
                console.log("error: " + data);
            });
    }

    public Send(): void {
        this.$http.post('/api/restricted/SendNewsletter', { newsletter: this.$scope.newsletter })
            .success((data: any) => {
                this.$scope.NewsletterSuccessMessage = data;
            }).error((data: any) => {
                this.$scope.NewsletterErrorMessage = data;
            });
    }
}

angular.module(app.getModuleName()).controller('AdminNewsletterController', ['$scope', '$http', 'meetingSvc', AdminNewsletterController]);

export = AdminNewsletterController;
