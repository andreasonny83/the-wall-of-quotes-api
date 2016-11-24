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

const router = require('express').Router();
const pkginfo = require('pkginfo')(module);
const firebase = require('firebase-admin');
let serviceAccount;

// serviceAccount stores the firebase serviceAccount configuration
try {
  serviceAccount = require('./serviceAccount.json');
} catch (e) {}

var appName = module.exports.name;
var appVersion = module.exports.version;

const quote = {
  quote: '',
  author: '',
  creator: ''
};

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: process.env.PROJECT_ID || serviceAccount.PROJECT_ID || 'PROJECT_ID',
    clientEmail: process.env.CLIENT_EMAIL || serviceAccount.CLIENT_EMAIL || 'CLIENT_EMAIL',
    privateKey: process.env.PRIVATE_KEY || serviceAccount.PRIVATE_KEY || 'PRIVATE_KEY'
  }),
  databaseURL: process.env.DATABASE_URL || serviceAccount.DATABASE_URL || 'DATABASE_URL'
});

// Routing logic
router.get('/status', status)
.post('/add', add);

// Private functions
function status(req, res) {
  const data = {
    app: appName,
    version: appVersion,
    status: 200,
    message: 'OK - ' + Math.random().toString(36).substr(3, 8)
  };

  res.status(200).send(data);
}

function add(req, res) {
  let quote = req.body.req || null;
  let author = req.body.author || null;
  let creator = req.body.creator || null;
  let captcha = req.body.captcha || null;

  console.log(req.body);

  if (!quote || !author || !creator || !captcha) {
    return res.status(401).send();
  }

  // firebase.database().ref('/quotes').push(model);
  console.log('Timestamp', firebase.database.ServerValue.TIMESTAMP);
  res.status(200).send();
}

module.exports = router;
