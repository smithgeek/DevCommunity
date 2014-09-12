///ts:import=IUserVerifier
import IUserVerifier = require('./IUserVerifier'); ///ts:import:generated

interface ILoginControllerScope extends ng.IScope {
    user: IUserVerifier;
    message: string;
    step: string;
}
export = ILoginControllerScope;