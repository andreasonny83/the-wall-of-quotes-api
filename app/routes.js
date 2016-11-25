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
const appName = module.exports.name;
const appVersion = module.exports.version;
const environment = process.env.NODE_ENV || 'DEV';
const debug = process.env.DEBUG === true || environment === 'DEV';

let serviceAccount;
let db;
let ref;

// serviceAccount stores the firebase serviceAccount configuration
try {
  serviceAccount = require('../serviceAccount.json');
} catch (e) {}

_init();

// Routing logic
router
  .get('/status', status)
  .post('/add', add);

function _init() {
  const databaseURL = process.env.DATABASE_URL || serviceAccount.DATABASE_URL || 'DATABASE_URL';

  firebase.initializeApp({
    credential: firebase.credential.cert({
      projectId: process.env.PROJECT_ID || serviceAccount.PROJECT_ID || 'PROJECT_ID',
      clientEmail: process.env.CLIENT_EMAIL || serviceAccount.CLIENT_EMAIL || 'CLIENT_EMAIL',
      privateKey: process.env.PRIVATE_KEY || serviceAccount.PRIVATE_KEY || 'PRIVATE_KEY'
    }),
    databaseURL: databaseURL,
    databaseAuthVariableOverride: {
      uid: "my-service-worker"
    }
  });

  db = firebase.database();
  ref = db.ref('/quotes');

  if (debug) {
    console.log('start debug');
    console.log('databaseURL', databaseURL);
    console.log('PROJECT_ID', process.env.PROJECT_ID);
    console.log('CLIENT_EMAIL', process.env.CLIENT_EMAIL);
    console.log('PRIVATE_KEY', process.env.PRIVATE_KEY);
  }
}

// Private functions
function status(req, res) {
  console.log(process.env);

  const data = {
    app: appName,
    version: appVersion,
    status: 200,
    message: 'OK - ' + Math.random().toString(36).substr(3, 8)
  };

  res.status(200).send(data);
}

function add(req, res) {
  let captcha = req.body.captcha || null;
  let model = {
    quote: req.body.quote || null,
    author: req.body.author || null,
    creator: req.body.creator || null
  };

  if (debug) {
    console.log('captcha:', captcha);
    console.log('model:');
    console.log(model);
  }

  if (!model.quote || !model.author || !model.creator || !captcha) {
    return res.status(400).send();
  }

  ref.push(model);
  res.status(200).send();
}

module.exports = router;
