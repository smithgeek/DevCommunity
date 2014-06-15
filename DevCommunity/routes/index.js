var config = require('../config.js');

function index(req, res) {
    res.render('index', { pathToAssets: 'public', config: config.nav });
}
exports.index = index;
;
//# sourceMappingURL=index.js.map
