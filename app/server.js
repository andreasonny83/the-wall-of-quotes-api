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

const environment = process.env.NODE_ENV || 'DEV';
const serverPort = process.env.PORT || 3012;
const debug = process.env.DEBUG === 'true' || environment === 'DEV';

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

app.use(function (req, res, next) {
  /** 
   * urls should be semicolumn separated
   * eg. http://my.website.com;https://my.website.com;http://wwww.another.website.com
   */
  const whitelistUrl = (serviceAccount.CLIENT_URL || process.env.CLIENT_URL || 'CLIENT_URL').split(';');
  const origin = req.headers.origin;

  if (debug) {
    console.log('Request coming from:', origin);
    console.log('Access-Control-Allow-Origin:', whitelistUrl);
  }

  // Website you wish to allow to connect
  if (whitelistUrl.indexOf(origin) > -1) {
    console.log('Whitelisting ' + origin + ' domain');
    res.header('Access-Control-Allow-Origin', origin);
  }
  // Request headers you wish to allow
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin');
  // Request methods you wish to allow
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');

  next();
});

app.use('/', require('./routes').routes);

console.log('About to crank up node');
console.log('PORT=' + serverPort);
console.log('NODE_ENV=' + environment);

server = app.listen(serverPort, function() {
  const host = server.address().address === '::' ? 'localhost' : server.address().address;
  const port = server.address().port;
  console.log(server.address());
  console.log('Express server listening at http://%s:%s', host, serverPort);

  console.log([
    'env = ' + app.get('env'),
    '__dirname = ' + __dirname,
    'process.cwd = ' + process.cwd()
  ].join('\n'));
});
