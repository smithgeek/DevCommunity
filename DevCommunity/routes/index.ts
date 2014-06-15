/*
 * GET home page.
 */
import express = require('express');
var config = require('../config.js');

export function index(req: express.Request, res: express.Response) {
    res.render('index', { pathToAssets: 'public', config: config.nav });
};