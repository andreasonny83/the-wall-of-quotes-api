/**
 * the-wall-of-quotes-api
 *
 * @license
 * Copyright (c) 2016 by andreasonny83. All Rights Reserved.
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
const admin = require('firebase-admin');

const environment = process.env.NODE_ENV || 'DEV';
const serverPort = process.env.PORT || 3012;

const app = express();
let server;

app.disable('x-powered-by');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use('/', require('./routes'));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  next();
});

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
