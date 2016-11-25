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
// const firebase = require('firebase-admin');
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
} catch (e) {}

_init();

// Routing logic
router
  .get('/status', status)
  .post('/add', add);

function _init() {
  const databaseURL = process.env.DATABASE_URL || serviceAccount.DATABASE_URL || 'DATABASE_URL';
  const apiKey = process.env.API_KEY || serviceAccount.API_KEY || 'API_KEY';
  const authDomain = process.env.AUTH_DOMAIN || serviceAccount.AUTH_DOMAIN || 'AUTH_DOMAIN';
  const email = process.env.EMAIL || serviceAccount.EMAIL || 'EMAIL';
  const password = process.env.PASSWORD || serviceAccount.PASSWORD || 'PASSWORD';
  // const projectId = process.env.PROJECT_ID || serviceAccount.PROJECT_ID || 'PROJECT_ID';
  // const clientEmail = process.env.CLIENT_EMAIL || serviceAccount.CLIENT_EMAIL || 'CLIENT_EMAIL';
  // const privateKey = process.env.PRIVATE_KEY || serviceAccount.PRIVATE_KEY || 'PRIVATE_KEY';

  let errorCode;
  let errorMessage;

  // firebase.initializeApp({
  //   credential: firebase.credential.cert({
  //     projectId: projectId,
  //     clientEmail: databaseURL,
  //     privateKey: privateKey
  //   }),
  //   databaseURL: databaseURL,
  //   databaseAuthVariableOverride: {
  //     uid: 'my-service-worker'
  //   }
  // });

  firebase.initializeApp({
    apiKey: apiKey,
    authDomain: authDomain,
    databaseURL: databaseURL
  });

  db = firebase.database();
  ref = db.ref('/quotes');

  firebase.auth()
          .signInWithEmailAndPassword(email, password)
          .catch(function(error) {
            errorCode = error.code;
            errorMessage = error.message;
          });

  if (debug) {
    console.log('start debug');
    console.log('databaseURL', databaseURL);
    if (errorCode) {
      console.log('Error during Firebase authentication:', errorCode, errorMessage);
      console.log('Current user', firebase.auth().currentUser);
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
    console.log('Current user', firebase.auth().currentUser.uid);
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
