///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated

interface AdminControllerScope extends ng.IScope {
    emailAddress: string;
    errorMessage: string;
    successMessage: string;
    tweetErrorMessage: string;
    tweetSuccessMessage: string;
    tweetEmbedCode: string;
    users: Array<UserSettings>;
    selectedUser: UserSettings;
    deleteUserErrorMessage: string;
    deleteUserSuccessMessage: string;
    emailSubject: string;
    emailBody: string;
    sendEmailErrorMessage: string;
    sendEmailSuccessMessage: string;
}
export = AdminControllerScope;