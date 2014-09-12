///ts:import=UserSettings
import UserSettings = require('../Common/UserSettings'); ///ts:import:generated

interface UserSettingsControllerScope extends ng.IScope {
    settings: UserSettings;
    errorMessage: string;
    successMessage: string;
}

export = UserSettingsControllerScope;