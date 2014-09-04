DevCommunity
============
[![Build Status](https://travis-ci.org/brentosmith/DevCommunity.svg?branch=master)](https://travis-ci.org/brentosmith/DevCommunity)
[![Coverage Status](https://img.shields.io/coveralls/brentosmith/DevCommunity.svg)](https://coveralls.io/r/brentosmith/DevCommunity?branch=master)
Prerequisites
============
[Node](http://nodejs.org/) must be installed

Installation and Configuration for development
============
Once you have project cloned open a command prompt at the DevCommunity directory.   Then install of the dependencies using npm. 
```javascript
npm install
```

The next thing you need to do is set up the configuration file.  A config-example.js file exists in the repo and you just need to rename that to config.js.  Then adjust all of the options to suit your needs.

Once you get through all that it should be ready to go and you can start the node server by going back to the command prompt and running
```javascript
node server.js
```

If you later want to deploy to a production server you can run
```
deploy.bat DEPLOY_DESTINATION
```
this will handle copying all the necessary files, but won't include the typescript files since they aren't really necessary.

Installation for production server
============
```javascript
npm install --production
npm start
```