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
const firebase = require('firebase');
const appName = module.exports.name;
const appVersion = module.exports.version;
const environment = process.env.NODE_ENV || 'DEV';
const debug = process.env.DEBUG === 'true' || environment === 'DEV';

let serviceAccount;
let db;
let ref;

// serviceAccount stores the firebase serviceAccount configuration
try {
  serviceAccount = require('../serviceAccount.json');
} catch (e) {
  serviceAccount = {};
  serviceAccount.DATABASE_URL = process.env.DATABASE_URL || 'DATABASE_URL';
  serviceAccount.API_KEY = process.env.API_KEY || 'API_KEY';
  serviceAccount.AUTH_DOMAIN = process.env.AUTH_DOMAIN || 'AUTH_DOMAIN';
  serviceAccount.USER_EMAIL = process.env.USER_EMAIL || 'USER_EMAIL';
  serviceAccount.USER_PASSWORD = process.env.USER_PASSWORD || 'USER_PASSWORD';
  serviceAccount.PROJECT_ID = process.env.PROJECT_ID || 'PROJECT_ID';
  serviceAccount.CLIENT_EMAIL = process.env.CLIENT_EMAIL || 'CLIENT_EMAIL';
  serviceAccount.PRIVATE_KEY = process.env.PRIVATE_KEY || 'PRIVATE_KEY';
}

_init();

// Routing logic
router
  .get('/status', status)
  .post('/add', add);

function _init() {
  let errorCode;
  let errorMessage;

  firebase.initializeApp({
    apiKey: serviceAccount.API_KEY,
    authDomain: serviceAccount.AUTH_DOMAIN,
    databaseURL: serviceAccount.DATABASE_URL
  });

  db = firebase.database();
  ref = db.ref('/quotes');

  firebase.auth()
          .signInWithEmailAndPassword(serviceAccount.USER_EMAIL,
                                      serviceAccount.USER_PASSWORD)
          .catch(function(error) {
            errorCode = error.code;
            errorMessage = error.message;
          });

  if (debug) {
    console.log('start debug');
    console.log('databaseURL', serviceAccount.DATABASE_URL);
    if (errorCode) {
      console.log('Error during Firebase authentication:', errorCode, errorMessage);
    }
  }
}

// Private functions
function status(req, res) {
  const data = {
    app: appName,
    version: appVersion,
    status: 200,
    message: 'OK - ' + Math.random().toString(36).substr(3, 8)
  };

  if (debug) {
    console.log('User Email', serviceAccount.USER_EMAIL);
    console.log('Current user', firebase.auth().currentUser);
  }

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
    console.log('model:', model);
  }

  if (!model.quote || !model.author || !model.creator || !captcha) {
    return res.status(400).send();
  }

  ref.push(model);
  res.status(200).send();
}

module.exports = router;
