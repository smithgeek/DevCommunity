
/*
 * GET partials page.
 */
import express = require('express');
var config = require('../config.js');

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