/// <reference path="../../typings/mocha/mocha.d.ts" />
/// <reference path="../../typings/expect.js/expect.js.d.ts" />
/// <reference path="../../server.ts" />
var expect = require('expect.js');
var server = require('../../server.js');

describe('test', function () {
    var val = 3;
    expect(val).to.be(3);
    expect(server.app.get('view engine')).to.be('jade');
});
//# sourceMappingURL=ConfigTest.js.map
