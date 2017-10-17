///ts:import=IMeetingControllerScope
import IMeetingControllerScope = require('./IMeetingControllerScope'); ///ts:import:generated
///ts:import=IMeetingSvc
import IMeetingSvc = require('./IMeetingSvc'); ///ts:import:generated
///ts:import=IUserSvc
import IUserSvc = require('./IUserSvc'); ///ts:import:generated
///ts:import=Meeting
import Meeting = require('./Meeting'); ///ts:import:generated
///ts:import=MeetingData
import MeetingData = require('../Common/MeetingData'); ///ts:import:generated
///ts:import=Browser
import Browser = require('./Impl/Browser'); ///ts:import:generated
///ts:import=app
import app = require('./app'); ///ts:import:generated

class AddMeetingController {
    private newIdeaRtb: Browser.IRichTextEditor;
    private schedMeetingMessageRtb: Browser.IRichTextEditor;

    constructor(private $scope: IMeetingControllerScope, private $http: ng.IHttpService, private meetingSvc: IMeetingSvc, private userSvc: IUserSvc, private rtbFactory: Browser.IRichTextEditorFactory) {
        this.newIdeaRtb = rtbFactory.create('newIdeaDetails');
        $scope.meeting = meetingSvc.createMeeting();
        $scope.errorMessage = "";
        $scope.sendEmail = false;
        $scope.schedMeetingMessage = "";
        $scope.$on('editMeeting', (event, meeting: Meeting) => {
            $scope.meeting = meeting;
            this.newIdeaRtb.setText(meeting.details);
            $('#AddTopicModal').modal('show');
            $scope.canEdit = userSvc.isAdmin() || meeting.vote_count == 0;
            $scope.errorMessage = $scope.canEdit ? "" : "Only an admin can edit a meeting once it has received votes.";
        });
        $scope.$on('addMeeting', (event) => {
            $scope.meeting = meetingSvc.createMeeting();
            $('#AddTopicModal').modal('show');
            $scope.errorMessage = "";
            $scope.canEdit = true;
        });
    }

    public AddMeeting(): void {
        $('.add-modal-button').prop('disabled', true);
        this.$scope.meeting.SetUser(this.userSvc.getUser());
        this.$scope.meeting.details = this.newIdeaRtb.getText();
        var mtgData: MeetingData = this.$scope.meeting.GetData();
        this.$http.post('/api/restricted/AddMeeting', { meeting: mtgData, sendEmail: this.$scope.sendEmail, message: this.$scope.schedMeetingMessage }).success((data: any) => {
            $('#AddTopicModal').modal('hide');
            $('.add-modal-button').prop('disabled', false);
            if (data.action == "Added") {
                this.meetingSvc.notifyMeetingAdded(data.meeting);
            }
            this.$scope.meeting = this.meetingSvc.createMeeting();
        }).error((data) => {
                $('.add-modal-button').prop('disabled', false);
                this.$scope.errorMessage = data.toString();
            });
    }
}

angular.module(app.getModuleName()).controller('AddMeetingController', ['$scope', '$http', 'meetingSvc', 'userSvc', 'richTextFactory', AddMeetingController]);

export = AddMeetingController;