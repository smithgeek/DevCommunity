
/*
 * GET partials page.
 */
import express = require('express');
var config = require('../config.js');
var jwt = require('jsonwebtoken');

function getUserEmail(req): string {
    return jwt.decode(req.headers.authorization.substr(7)).email;
}
export function home(req: express.Request, res: express.Response) {
    res.render('partials/home');
};

export function about(req: express.Request, res: express.Response) {
  res.render('partials/about');
};

export function contact(req: express.Request, res: express.Response) {
  res.render('partials/contact', { contact: config.contact });
};

export function brainstorming(req: express.Request, res: express.Response) {
    res.render('partials/brainstorming');
};

export function pastMeetings(req: express.Request, res: express.Response) {
    res.render('partials/pastMeetings');
};

export function stories(req: express.Request, res: express.Response) {
    res.render('partials/stories');
};

export function UserSettings(req: express.Request, res: express.Response) {
    res.render('partials/UserSettings');
};

export function meeting(req: express.Request, res: express.Response) {
    res.render('partials/meeting');
};

export function admin(req: express.Request, res: express.Response) {
    res.render('partials/admin', { admin: config.server.admin == getUserEmail(req) });
};