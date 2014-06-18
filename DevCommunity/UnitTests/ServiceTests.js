/// <reference path="../typings/qunit/qunit.d.ts" />
/// <reference path="../public/assets/js/Services.ts" />
QUnit.module("UserSvc");

function getUserSvc(storage) {
    return new UserSvc(storage);
}

function getUserSvcWithoutKey() {
    return getUserSvc({ get: function (key) {
            return null;
        } });
}

function getUserSvcWithKey() {
    return getUserSvc({ get: function (key) {
            return { email: 'me@someplace.com' };
        } });
}

test("EmailNotInLocalStorage", function (assert) {
    equal(getUserSvcWithoutKey().getUser(), '');
});

test("EmailInLocalStorage", function () {
    equal(getUserSvcWithKey().getUser(), 'me@someplace.com');
});

test("UserLoggedIn", function (assert) {
    equal(getUserSvcWithKey().isLoggedIn(), true);
});

test("UserNotLoggedIn", function (assert) {
    equal(getUserSvcWithoutKey().isLoggedIn(), false);
});

test("UserLogsOut", function (assert) {
    var count = 0;
    var localStorage = {
        clearAll: function () {
            count++;
        }
    };
    getUserSvc(localStorage).logOut();
    equal(count, 1);
});
//# sourceMappingURL=ServiceTests.js.map
