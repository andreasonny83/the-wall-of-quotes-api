/**
 * the-wall-of-quotes-api
 *
 * @license
 * Copyright (c) 2016-2017 by andreasonny83. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at
 * https://raw.githubusercontent.com/Azurasky1/DragonArena/develop/LICENSE
 */
'use strict';

const express = require('express');
const router = require('express').Router();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const pkginfo = require('pkginfo')(module);

const environment = process.env.NODE_ENV || 'DEV';
const serverPort = process.env.PORT || 3012;
const debug = process.env.DEBUG === 'true' || environment === 'DEV';
const appName = module.exports.name;
const appVersion = module.exports.version;

let serviceAccount = {};

const app = express();
let server;

try {
  serviceAccount = require('../serviceAccount.json');
} catch (e) {}

app.disable('x-powered-by');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/', require('./routes'));
app.get('/status', _status);

function _status(req, res) {
  const data = {
    app: appName,
    version: appVersion,
    status: 200,
    message: 'OK - ' + Math.random().toString(36).substr(3, 8)
  };

  res.status(200).send(data);
}

console.log('About to crank up node');
console.log('PORT=' + serverPort);
console.log('NODE_ENV=' + environment);

server = app.listen(serverPort, function() {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Express server listening at http://%s:%s', host, serverPort);

  console.log([
    'env = ' + app.get('env'),
    '__dirname = ' + __dirname,
    'process.cwd = ' + process.cwd()
  ].join('\n'));
});
